import { React, PropTypes, ExportableGrid, connect, redux, elements, axios, GenericForm, ComponentManager, GridManager, createHashHistory, utils } from 'perun-core'
const { labelsManager } = utils
const { ReactBootstrap, alertUserResponse } = elements;
const { store } = redux;
const { Modal } = ReactBootstrap;
const { useState } = React

const DoubleGrid = (props, context) => {
    let hashHistory = createHashHistory();
    const [show, setShow] = useState(false)
    const handleRowClick = (_id, _rowIdx, row, grid) => {
        if (grid.customRowClick) {
            switch (grid.customRowClick?.type) {
                case "route": {
                    store.dispatch({ type: 'SAVE', payload: { "person-registry": { "objectId": props.farmObjId, "route": hashHistory.location.pathname } } })
                    let route = grid.customRowClick?.route?.replace("{rowObjectId}", row[`${props.tableName}.OBJECT_ID`]);
                    hashHistory.push(route)
                    break;
                }
                default:
                    break;
            }
        }
    }
    const generateGrid = (grid) => {
        const buttonsArray = []
        return (
            <ExportableGrid
                gridType={"READ_URL"}
                key={grid.ID}
                id={grid.ID}
                heightRatio={0.8}
                configTableName={grid.configuration.onSubmit}
                dataTableName={grid.data.onSubmit}
                onRowClickFunct={(id, rowIdx, row) => handleRowClick(id, rowIdx, row, grid)}
                className='animals-search-grid'
                buttonsArray={buttonsArray}
                toggleCustomButton={grid.additionalBtns ? true : false}
                customButton={() => { setShow(true) }}
                customButtonLabel={labelsManager('add', context, 'farm_registry')}
            />
        )
    }
    const generateForm = () => {
        const addFormConfig = props.configuration?.addForm

        return (
            <GenericForm
                className={`form-test custom-farm-registry-form`}
                params={'FORM_DATA'}
                key={props.configuration.leftGrid.ID + '_FORM'}
                id={props.configuration.leftGrid.ID + '_FORM'}
                method={addFormConfig?.configuration?.onSubmit}
                uiSchemaConfigMethod={addFormConfig?.uischema?.onSubmit}
                tableFormDataMethod={addFormConfig?.data?.onSubmit}
                addSaveFunction={(e) => onSubmit(e)}
                customSaveButtonName={labelsManager('save', context, 'person-registry')}
                hideBtns={'closeAndDelete'}
            />
        )
    }
    const onSubmit = (e) => {
        const resetFormSaveState = () => ComponentManager.setStateForComponent(props.configuration.leftGrid.ID + '_FORM', null, { saveExecuted: false })
        const url = props.configuration?.addForm?.save?.onSave
        const reqConfig = { method: 'post', url: `${window.server}${url}`, data: encodeURIComponent(JSON.stringify(e.formData)) }
        axios(reqConfig).then(res => {
            if (res?.data) {
                const resType = res?.data?.type?.toLowerCase() || 'info'
                alertUserResponse({
                    response: res, onConfirm: () => {
                        if (resType === 'success') {
                            setShow(false)
                            GridManager.reloadAllGrids()
                        }
                        resetFormSaveState()
                    }
                })
                if (resType === 'success') {
                    if (props.configuration.refreshSummary) store.dispatch({ type: 'SAVE', payload: { key: 'refreshSummary', value: false } })
                }
            }
        }).catch(err => {
            console.error(err)
            alertUserResponse({ response: err, onConfirm: resetFormSaveState })
        })
    }

    return (
        <>
            <div className='double-grid-container'>
                <div className='double-grid-grid'>
                    {generateGrid(props.configuration.leftGrid)}
                </div>
                <div className='double-grid-grid'>
                    {generateGrid(props.configuration.rightGrid)}
                </div>
            </div>
            {show && (
                <Modal className={"farm-registry-modal"} show={show} onHide={() => setShow(false)}>
                    <Modal.Header className={"farm-registry-modal-header"} closeButton>
                        <Modal.Title>{props.configuration.label}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={"farm-registry-modal-body"}>
                        {generateForm()}
                    </Modal.Body>
                    <Modal.Footer className={"farm-registry-modal-footer"} />
                </Modal>
            )}
        </>
    )
}

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
})

DoubleGrid.contextTypes = {
    intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps)(DoubleGrid)
