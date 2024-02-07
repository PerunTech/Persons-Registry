import { React, connect, axios, PropTypes, Loading, elements, GenericGrid, GridManager, ComponentManager, GenericForm, redux } from 'perun-core'
import { getDynamicKey } from '../utils/utils'
import { labelsManager } from '../utils/LabelsExport';
import Address from './Address/Address'
import SAPWrapper from './wrappers/SAPWrapper';
import PersonwWrapper from './wrappers/PersonWrapper';
const { ReactBootstrap, alertUser } = elements;
const { Modal } = ReactBootstrap;
const { useState, useEffect } = React
const { store, updateSelectedRows } = redux;
const CustomButtons = (props, context) => {
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [dynamicFormId, setDynamicFormId] = useState(getDynamicKey())
    const [clickedRowObjectId, setClickedRowObjectId] = useState(0)
    const [wrapperName, setWrapper] = useState(undefined)
    const [wrappers, _setWrappers] = useState([{ Showauthorizedperson: SAPWrapper }, { Person: PersonwWrapper }])
    const [renderForm, setRender] = useState(true)
    useEffect(() => {
        setWrapper(props.tableName.replace(/(\w)(\w*)/g,
            function (g0, g1, g2) { return g1.toUpperCase() + g2.toLowerCase(); }).replace(/_/g, '').replaceAll(' ', ''))
        return () => {
            ComponentManager.cleanComponentReducerState(props.tableName + props.personObjId);
            store.dispatch({ type: 'UPDATE_SELECTED_GRID_ROWS', payload: [[], props.tableName + props.personObjId] })
            ComponentManager.setStateForComponent(props.tableName + props.personObjId, 'selectedIndexes', [])
        }
    }, [])

    const buildCustomBtnArr = (btnArray, multiSelect, maxLength) => {
        const div = <div className={`custom-btn-holder-${props.tableName.toLowerCase()}`}>
            {btnArray.map(el => (
                <button id={el['ID']} className={`${props.tableName.toLowerCase()}-btn`} onClick={() => customBtnAction(el, multiSelect, maxLength)}>
                    {el['label']}
                </button>
            ))}
        </div>
        return div
    }
    const customBtnAction = (el, multiSelect, maxLength) => {
        if ((props.selectedGridRows.length > 0 && props.selectedGridRows.length <= maxLength) || (!multiSelect)) {
            alertUser(true, 'info', labelsManager.importLabel('confirm_btn_action', 'persons_registry', context), '', () => {

                let saveUrl = `${window.server}${el?.['onSave']}`
                let data
                setLoading(true)
                switch (el['type']) {
                    case 'GET':
                        axios.get(saveUrl).then(res => {
                            alertUser(true, res.data.type.toLowerCase(), res.data.title, res.data.message)
                            setLoading(false)
                        }).catch(err => {
                            setLoading(false)
                            console.error(err)
                            const title = err.response?.data?.title || err
                            const msg = err.response?.data?.message || ''
                            alertUser(true, "error", title, msg);
                        });
                        break;
                    case 'POST':
                        data = JSON.stringify(props.selectedGridRows)
                        axios({
                            method: "post",
                            data,
                            url: saveUrl,
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        }).then(res => {
                            if (res.data) {
                                alertUser(true, res.data.type.toLowerCase(), res.data.title, res.data.message, () => reloadGrid(props.tableName + props.personObjId, multiSelect));

                            }
                        }).catch(err => {
                            console.error(err)
                            const title = err.response?.data?.title || err
                            const msg = err.response?.data?.message || ''
                            alertUser(true, "error", title, msg);
                        });
                        break;
                    case 'status':
                        saveUrl = saveUrl.replace('{objId}', props.selectedGridRows[0][`${props.tableName}.OBJECT_ID`]).replace('{nextStatus}', el.changeStatus[`${props.selectedGridRows[0][`${props.tableName}.STATUS`]}`])
                        axios.get(saveUrl).then(res => {
                            alertUser(true, res.data.type.toLowerCase(), res.data.title, res.data.message, () => reloadGrid(props.tableName + props.personObjId, multiSelect))
                            setLoading(false)

                        }).catch(err => {
                            setLoading(false)
                            console.error(err)
                            const title = err.response?.data?.title || err
                            const msg = err.response?.data?.message || ''
                            alertUser(true, "error", title, msg);
                        });
                        break;
                    case 'deleteLink':
                        data = el['payLoad']
                        data['objectId2'] = props.selectedGridRows[0][`${props.tableName}.OBJECT_ID`]
                        data['linkType'] = props.selectedGridRows[0]['LINK_TYPE']
                        axios({
                            method: "post",
                            data,
                            url: saveUrl,
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        }).then(res => {
                            if (res.data) {
                                alertUser(true, res.data.type.toLowerCase(), res.data.title, res.data.message, () => reloadGrid(props.tableName + props.personObjId, multiSelect));
                            }
                        }).catch(err => {
                            console.error(err)
                            const title = err.response?.data?.title || err
                            const msg = err.response?.data?.message || ''
                            alertUser(true, "error", title, msg);
                        });
                        setLoading(false)
                        break;
                    default:
                        break;
                }



            }, () => { }, true, labelsManager.importLabel('yes', 'persons_registry', context), labelsManager.importLabel('no', 'persons_registry', context))
        } else {
            alertUser(true, 'info', labelsManager.importLabel('select_multi', 'persons_registry', context));
        }
    }

    const generateGrid = () => {
        const configWs = props.configuration.objectConfiguration.configuration.onSubmit
        const dataWs = props.configuration.objectConfiguration.data.onSubmit
        const multiSelect = props.configuration.objectConfiguration.multiSelect || false
        const btnArray = props.configuration.objectConfiguration.additionalBtns
        const maxLength = props.configuration.objectConfiguration.maxLength || 9999
        const grid = <div className={`${`custom-grid-container-${props.tableName.toLowerCase()}`}`}>
            {btnArray && buildCustomBtnArr(btnArray, multiSelect, maxLength)}

            <GenericGrid
                gridType={"READ_URL"}
                key={props.tableName + props.personObjId}
                id={props.tableName + props.personObjId}
                configTableName={configWs}
                dataTableName={dataWs}
                heightRatio={0.58}
                onRowClickFunct={props.configuration.objectConfiguration.disableRowClick ? () => { } : handleRowClick}
                refreshData={() => reloadGrid(props.tableName + props.personObjId, multiSelect)}
                toggleCustomButton={!props.configuration.objectConfiguration.readOnly}
                customButton={() => setShowModal(true)}
                customButtonLabel={labelsManager.importLabel('add', 'persons_registry', context)}
                enableMultiSelect={multiSelect}
                onSelectChangeFunct={customRowSelection}
                editContextFunc={props.configuration.objectConfiguration.disableRowClick ? () => { } : handleRowClick}
            />

        </div>
        return grid
    }
    //multiselect functions 
    const customRowSelection = (selectedRows, gridId) => {
        store.dispatch(updateSelectedRows(selectedRows, gridId));
    };

    const reloadGrid = (gridId, multiSelect) => {
        GridManager.reloadGridData(gridId)
        if (multiSelect) {
            store.dispatch({ type: 'UPDATE_SELECTED_GRID_ROWS', payload: [[], gridId] })
            ComponentManager.setStateForComponent(gridId, 'selectedIndexes', [])
        }
    }

    const replaceFunc = (wsPath, id, obj) => {
        if (wsPath.indexOf(`{${id}.OBJECT_ID}`) >= 0) {
            wsPath = wsPath.replace(`{${id}.OBJECT_ID}`, obj)
            return wsPath
        } else {
            return wsPath
        }
    }

    const generateForm = (isModal, resetTheId) => {
        let inputWrapper
        if (props.configuration.objectConfiguration.wrapper) {
            wrappers.forEach(wrap => {
                const keys = Object.keys(wrap);
                if (wrapperName === keys[0]) {
                    inputWrapper = wrap[wrapperName];
                }
            });
        }
        // Set a new ID for the form, so we get a re-render
        if (resetTheId) {
            setDynamicFormId(getDynamicKey())
        }
        // Get the WS paths from the configuration object
        let jsonSchemaConfig = props.configuration.objectConfiguration?.configuration?.onSubmit
        let uiSchemaConfig = props.configuration.objectConfiguration?.uischema?.onSubmit
        let formDataWs = props.configuration.objectConfiguration?.data?.onSubmit
        let onSubmitWs = props.configuration.objectConfiguration?.save?.onSave
        // If we're rendering a modal, the configuration services are a bit nested
        if (isModal) {
            // #revise_me
            // We need to find a smarter way to get the WS paths, instead of duplicating the nested properties all over again
            jsonSchemaConfig = props.configuration.objectConfiguration?.form?.configuration?.onSubmit
            uiSchemaConfig = props.configuration.objectConfiguration?.form?.uischema?.onSubmit
            formDataWs = props.configuration.objectConfiguration?.form?.data?.onSubmit
            // If the form data WS contains something like {TABLE_NAME.OBJECT_ID} find it and replace it with the clicked object's ID
            formDataWs = replaceFunc(formDataWs, props.tableName, clickedRowObjectId)
            onSubmitWs = props.configuration.objectConfiguration?.form?.save?.onSave
        }
        return (
            <GenericForm
                className={`form-test custom-persons-registry-form  person-registry-forms person-registration-form ${isModal && 'hide-legend-form'} ${props.tableName.toLowerCase()}-persons-registry-form ${props.configuration.objectConfiguration?.readOnly && 'read-only-form'} `}
                params={'READ_URL'}
                key={dynamicFormId}
                id={dynamicFormId}
                method={jsonSchemaConfig}
                uiSchemaConfigMethod={uiSchemaConfig}
                tableFormDataMethod={formDataWs}
                addSaveFunction={(e) => saveForm(e, onSubmitWs, isModal)}
                addDeleteFunction={(_id, _action, _session, formData) => deleteFunc(_id, _action, _session, formData)}
                hideBtns={(clickedRowObjectId === 0) || props.configuration.objectConfiguration?.readOnly ? 'closeAndDelete' : 'close'}
                inputWrapper={inputWrapper}
                closeModalFunc={() => setShowModal(false)}
                objId={props.personObjId}
            />
        )
    }
    const handleRowClick = (_id, _rowIdx, row) => {
        setClickedRowObjectId(row[`${props.tableName}.OBJECT_ID`] || 0)
        setShowModal(true)
    }

    const closeFormModal = () => {
        setShowModal(false)
        setClickedRowObjectId(0)
        ComponentManager.setStateForComponent(props.tableName + props.personObjId, null, { rowClicked: undefined })
    }

    const resetFormDeleteState = () => {
        setLoading(false)
        ComponentManager.setStateForComponent(dynamicFormId, null, { deleteExecuted: false })
    }

    const resetFormSaveState = () => {
        ComponentManager.setStateForComponent(dynamicFormId, null, { saveExecuted: false })
        ComponentManager.cleanComponentReducerState(dynamicFormId)
        setRender(true)
    }

    const saveForm = (e, wsPath, isModal) => {
        let formData = e.formData
        // // Check if every value in the form data object is nullish
        const isEmpty = Object.values(formData).every(v => v === null || v === undefined)
        // // Filter out every nullish value from the form data object
        const nonNullishFormData = Object.fromEntries(Object.entries(formData).filter(([_, v]) => v !== null && v !== undefined))
        // // Check if the filtered form data object has only four keys and they are only system fields
        const onlyHasSystemFields = Object.keys(nonNullishFormData).length === 4 && Object.keys(nonNullishFormData).every(k => k === 'OBJECT_ID' || k === 'OBJECT_TYPE' || k === 'PKID' || k === 'PARENT_ID')
        if (isEmpty || onlyHasSystemFields) {
            const label = labelsManager.importLabel('enter_some_values', 'persons_registry', context)
            alertUser(true, 'info', label, '', () => resetFormSaveState())
        } else {
            const url = `${window.server}${wsPath}`
            axios({
                method: "post",
                data: formData,
                url,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }).then(res => {
                const resType = res.data.type
                const title = res.data.title || ''
                const msg = res.data.message || ''
                if (resType?.toLowerCase() === 'error') {
                    alertUser(true, 'error', title, msg, () => resetFormSaveState());
                } else {
                    setRender(false)
                    alertUser(true, resType?.toLowerCase(), title, msg, () => { resetFormSaveState() });
                    if (isModal) {
                        GridManager.reloadGridData(props.tableName + props.personObjId)
                        closeFormModal()
                    }
                }
            }).catch(err => {
                console.error(err)
                const title = err.response?.data?.title || err
                const msg = err.response?.data?.message || ''
                alertUser(true, "error", title, msg, () => resetFormSaveState());
            });
        }
    };

    const deleteFunc = (_id, _action, _session, formData) => {
        const { svSession } = props;
        let url = window.server + `/ReactElements/deleteObject/${svSession}`;
        axios({
            method: "post",
            data: formData[4]["PARAM_VALUE"],
            url: url,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }).then((res) => {
            const resType = res.data.type
            const title = res.data.title || ''
            const msg = res.data.message || ''
            if (resType?.toLowerCase() === "success") {
                alertUser(true, "success", title, msg, () => resetFormDeleteState());
                closeFormModal()
                GridManager.reloadGridData(props.tableName + props.personObjId);
            } else {
                alertUser(true, resType?.toLowerCase() || 'info', title, msg, () => resetFormDeleteState())
            }
        }).catch(err => {
            console.error(err)
            const title = err.response?.data?.title || err
            const msg = err.response?.data?.message || ''
            alertUser(true, "error", title, msg, () => resetFormDeleteState());
        });
    };
    return (
        <>
            {loading && <Loading />}
            <div className={`'custom-menu-holder' ${`custom-menu-${props.tableName.toLowerCase()}-container`}`}>
                {renderForm && props.configuration?.objectConfiguration?.type === 'form' && generateForm()}
                {props.configuration?.objectConfiguration?.type === 'grid' && generateGrid()}
                {props.configuration?.objectConfiguration?.type === 'address' && <Address personObjId={props.personObjId} defaultCountry={props.defaultCountry} />}
                {showModal && (
                    <Modal className={"person-registry-modal"} show={showModal} onHide={() => closeFormModal()}>
                        <Modal.Header className={"person-registry-modal-header"} closeButton>
                            <Modal.Title>{props.configuration.label}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className={"person-registry-modal-body"}>
                            {generateForm(true, false)}
                        </Modal.Body>
                        <Modal.Footer className={"person-registry-modal-footer"} />
                    </Modal>
                )}
            </div>
        </>
    )
}

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
    selectedGridRows: state.selectedGridRows.selectedGridRows,
});

CustomButtons.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(CustomButtons);
