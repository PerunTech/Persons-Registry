import { React, PropTypes, ExportableGrid, connect, elements, axios, GenericForm, ComponentManager, GridManager, redux, utils } from 'perun-core'
const { useState } = React
const { labelsManager, getDynamicKey, replaceFunc } = utils
const { ReactBootstrap, alertUserResponse } = elements;
const { Modal } = ReactBootstrap;
const { store } = redux
const ParentChildGrids = (props, context) => {
    const [stateGrid, setStateGrid] = useState(undefined)
    const [rowChild, setRowChild] = useState(0)
    const [rowParent, setRowParent] = useState(0)
    const [show, setShow] = useState(false)
    const generateParentGrid = () => {
        const { grids } = props
        const configWs = props.grids[0].objectConfiguration.configuration.onSubmit
        const dataWs = props.grids[0].objectConfiguration.data.onSubmit
        const gridDiv = <>
            <div className={`farm-registry-parent-dynamic-grid`}>
                {props.outerBtnArray && props.generateOuterBtns(props.outerBtnArray)}
                <ExportableGrid
                    gridType={"READ_URL"}
                    key={grids[0].ID + '_' + props.farmObjId}
                    id={grids[0].ID + '_' + props.farmObjId}
                    configTableName={configWs}
                    dataTableName={dataWs}
                    heightRatio={0.7}
                    onRowClickFunct={(id, idx, row) => handleCustomRowClick(id, idx, row, props.grids[0].ID, grids[1])}
                    refreshData={true}
                />
            </div>
            {stateGrid}


        </>
        return gridDiv
    }
    const generateGrid = (objectId, grid) => {
        let gridId = grid.ID + objectId + getDynamicKey()
        if (objectId) {
            const configWs = grid.objectConfiguration.configuration.onSubmit
            let dataWs = grid.objectConfiguration.data.onSubmit
            dataWs = dataWs.replace(/{([^}]+)}/g, objectId)
            const gridDiv = <div className={`farm-registry-child-dynamic-grid`}>
                {props.outerBtnArray && <div className={'farm-registry-child-grid-balancer'} />}
                <ExportableGrid
                    gridType={"READ_URL"}
                    key={gridId}
                    id={gridId}
                    configTableName={configWs}
                    dataTableName={dataWs}
                    heightRatio={0.7}
                    onRowClickFunct={(id, idx, row) => handleRowClick(id, idx, row, grid.ID, gridId)}
                    editContextFunc={(id, idx, row) => handleRowClick(id, idx, row, grid.ID, gridId)}
                    refreshData={true}
                    toggleCustomButton={true}
                    customButton={() => {
                        setShow(true)
                    }}
                    customButtonLabel={labelsManager('add', context, 'farm_registry')}
                />

            </div>
            setStateGrid(gridDiv)
        }
    }
    const generateForm = () => {
        const form = props.grids[1].objectConfiguration.form
        let formData = form.data?.onSubmit
        formData = replaceFunc(form.data?.onSubmit, props.grids[1].ID, rowChild, false)
        formData = replaceFunc(formData, props.grids[0].ID, rowParent, false)
        return (
            <GenericForm
                className={`form-test custom-farm-registry-form`}
                params={'READ_URL'}
                key={props.grids[1] + '_FORM'}
                id={props.grids[1] + '_FORM'}
                method={form.configuration?.onSubmit}
                uiSchemaConfigMethod={form.uischema?.onSubmit}
                tableFormDataMethod={formData}
                addSaveFunction={(e) => onSubmit(e)}
                customSaveButtonName={labelsManager('save', context, 'person-registry')}
                addDeleteFunction={(_id, _action, _session, formData) => deleteFunc(_id, _action, _session, formData)}
                hideBtns={rowChild === 0 ? 'closeAndDelete' : 'close'}
            />
        )
    }

    const onSubmit = (e) => {
        const url = props.grids[1].objectConfiguration.form.save?.onSave
        const reqConfig = { method: 'post', url: `${window.server}${url}`, data: encodeURIComponent(JSON.stringify(e.formData)) }
        axios(reqConfig).then(res => {
            if (res?.data) {
                const resType = res?.data?.type?.toLowerCase() || 'info'
                const onConfirm = () => {
                    if (resType === 'success') {
                        setShow(false)
                        GridManager.reloadAllGrids()
                    } else {
                        ComponentManager.setStateForComponent(props.grids[1] + '_FORM', null, { saveExecuted: false })
                    }
                    if (props?.grids[1]?.objectConfiguration?.refreshSummary) store.dispatch({ type: 'SAVE', payload: { key: 'refreshSummary', value: true } })
                }
                alertUserResponse({ response: res.data, onConfirm })
            }
        }).catch(err => {
            console.error(err)
            alertUserResponse({
                response: err,
                onConfirm: () => ComponentManager.setStateForComponent(props.grids[1] + '_FORM', null, { saveExecuted: false })
            })
        })
    }
    const deleteFunc = (_id, _action, _session, formData) => {
        const { svSession } = props;
        let url = window.server + `/ReactElements/deleteObject/${svSession}`;
        axios({
            method: "post",
            data: encodeURIComponent(formData[4]["PARAM_VALUE"]),
            url: url,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }).then((res) => {
            if (res?.data) {
                const resType = res.data?.type?.toLowerCase() || 'info'
                alertUserResponse({
                    response: res.data,
                    onConfirm: () => ComponentManager.setStateForComponent(props.grids[1] + '_FORM', null, { deleteExecuted: false })
                })
                if (resType === 'success') {
                    setShow(false)
                    GridManager.reloadAllGrids();
                }
            }
        }).catch(err => {
            console.error(err)
            alertUserResponse({
                response: err,
                onConfirm: () => ComponentManager.setStateForComponent(props.grids[1] + '_FORM', null, { deleteExecuted: false })
            })
        });
    };

    const handleCustomRowClick = (_id, _rowIdx, row, gridId, grid) => {
        setRowParent(row[`${gridId}.OBJECT_ID`] || 0)
        generateGrid(row[`${gridId}.OBJECT_ID`], grid)
    }
    const handleRowClick = (_id, _rowIdx, row, gridId, _gridAndDynamic) => {
        setRowChild(row[`${gridId}.OBJECT_ID`] || 0)
        setShow(true)
    }
    return (
        <>

            {generateParentGrid()}
            {show && (
                <Modal className={"farm-registry-modal"} show={show} onHide={() => setShow(false)}>
                    <Modal.Header className={"farm-registry-modal-header"} closeButton>
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
    farmObjId: state['farm_registry.mapData']?.farmData?.objectId
});

ParentChildGrids.contextTypes = {
    intl: PropTypes.object.isRequired,
};
export default connect(mapStateToProps)(ParentChildGrids);
