import { React, connect, axios, PropTypes, Loading, elements, ExportableGrid, GridManager, ComponentManager, GenericForm, redux, createHashHistory, utils } from 'perun-core'
const { replaceFunc, getDynamicKey, flattenObject, labelsManager } = utils
// COMPONENTS
import DoubleGrid from './DoubleGrid';
import SearchDynamic from './SearchDynamic';
import ParentChildGrids from './ParentChildGrids'
import Documents from './Documents'
import FormWithGrid from './FormWithGrid';
import * as Wrappers from '../Wrappers';
const { ReactBootstrap, alertUserResponse, alertUserV2 } = elements;
const { Modal } = ReactBootstrap;
const { useState, useEffect } = React
const { store, updateSelectedRows } = redux;

const CustomButtons = (props, context) => {
    const hashHistory = createHashHistory();
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [dynamicFormId, setDynamicFormId] = useState(getDynamicKey())
    const [clickedRowObjectId, setClickedRowObjectId] = useState(0)
    const [renderForm, setRender] = useState(true)
    const [rowCliked, setRowClicked] = useState(undefined)
    const [_cssTableName, _setT] = useState(props.tableName.replace(/\d/g, '').replace(/_$/, ''))
    const [actionToggle, setActionToggle] = useState(undefined)
    useEffect(() => {
        return () => {
            store.dispatch({ type: 'UPDATE_SELECTED_GRID_ROWS', payload: [[], props.tableName + props.appObjId] })
            ComponentManager.setStateForComponent(props.tableName + props.appObjId, 'selectedIndexes', [])
            ComponentManager.setStateForComponent(props.tableName + props.appObjId, 'selectedIndexesBeforeFilters', [])
            ComponentManager.setStateForComponent(props.tableName + props.appObjId, 'selectedRowsBeforeFilters', [])
        }
    }, [])

    const customBtnAction = (el, multiSelect) => {
        const selectedGridRows = store.getState()?.['selectedGridRows']?.['selectedGridRows'] || []

        const executeAction = () => {
            let promptLabel = labelsManager('confirm_submit_action', context, 'person-registry')
            if (el.useMulti) {
                promptLabel = labelsManager('confirm_action_execution', context, 'person-registry')
            }
            let saveUrl = `${window.server}${el?.['onSave']}`
            let data
            switch (el['type']) {
                case 'GET': {
                    const executeGetAction = () => {
                        setLoading(true)
                        axios.get(saveUrl).then(res => {
                            setLoading(false)
                            if (res?.data) {
                                alertUserResponse({ response: res.data })
                            }
                            if (el.refreshSummary) store.dispatch({ type: 'SAVE', payload: { key: 'refreshSummary', value: true } })
                        }).catch(err => {
                            setLoading(false)
                            console.error(err)
                            alertUserResponse({ response: err })
                        });
                    }
                    alertUserV2({
                        type: 'info',
                        title: promptLabel,
                        confirmButtonText: labelsManager('yes', context, 'person-registry'),
                        onConfirm: executeGetAction,
                        showCancel: true,
                        cancelButtonText: labelsManager('no', context, 'person-registry')
                    })
                    break;
                }
                case 'POST': {
                    const executePostAction = () => {
                        setLoading(true)
                        data = JSON.stringify(selectedGridRows)
                        axios({
                            method: "post",
                            data,
                            url: saveUrl,
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        }).then(res => {
                            if (res?.data) {
                                alertUserResponse({
                                    response: res.data, onConfirm: () => {
                                        reloadGrid(props.tableName + props.appObjId, multiSelect)
                                        setLoading(false)
                                        if (el.refreshSummary) store.dispatch({ type: 'SAVE', payload: { key: 'refreshSummary', value: true } })
                                    }
                                })
                            }
                        }).catch(err => {
                            setLoading(false)
                            console.error(err)
                            alertUserResponse({ response: err })
                        });
                    }
                    alertUserV2({
                        type: 'info',
                        title: promptLabel,
                        confirmButtonText: labelsManager('yes', context, 'person-registry'),
                        onConfirm: executePostAction,
                        showCancel: true,
                        cancelButtonText: labelsManager('no', context, 'person-registry')
                    })
                    break;
                }
                case 'action': {
                    const action = () => {
                        setLoading(true)
                        data = {
                            "objectArray": selectedGridRows,
                            "objectParams": [{}]
                        }
                        axios({
                            method: el.method,
                            data: JSON.stringify(data),
                            url: `${window.server}${el.url}`,
                            headers: { "Content-Type": el.contentType },
                        }).then(res => {
                            if (res?.data) {
                                alertUserResponse({
                                    response: res.data, onConfirm: () => {
                                        reloadGrid(props.tableName + props.appObjId, multiSelect)
                                        setLoading(false)
                                        if (el.refreshSummary) store.dispatch({ type: 'SAVE', payload: { key: 'refreshSummary', value: true } })
                                    }
                                })
                            }
                        }).catch(err => {
                            console.error(err)
                            setLoading(false)
                            alertUserResponse({ response: err })
                        });
                    }
                    alertUserV2({
                        type: 'info',
                        title: promptLabel,
                        confirmButtonText: labelsManager('yes', context, 'person-registry'),
                        onConfirm: action,
                        showCancel: true,
                        cancelButtonText: labelsManager('no', context, 'person-registry')
                    })
                    break;
                }
                case 'toggle-action': {
                    if (actionToggle === el.ID) {
                        setActionToggle(undefined)
                    } else {
                        setActionToggle(el.ID)
                    }
                    break;
                }
                case 'link': {
                    let href = el['route']
                    hashHistory.push(href)
                    break;
                }
                default:
                    break;
            }
        }

        if (el.useMulti) {
            if (selectedGridRows.length > 0) {
                executeAction()
            } else {
                alertUserV2({ type: 'info', title: labelsManager('select_multi', context, 'person-registry') })
            }
        } else {
            executeAction()
        }
    }
    const customRowClick = (_id, _rowIdx, row) => {
        // Get the table and menu names
        const tableName = props.configuration?.objectConfiguration?.tableName
        const menuName = props.configuration?.objectConfiguration?.menuName
        // Keep track of all previously accessed routes
        const previousRoutes = props.previousRoutes || []
        previousRoutes.push({
            route: `#${hashHistory.location.pathname}`,
            label: props.routeParams.tableName.toLowerCase()
        })
        store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-previous-routes', value: previousRoutes } })
        store.dispatch({ type: 'SAVE', payload: { key: `person-registry-module-row-${tableName}`, value: row } })
        store.dispatch({ type: 'SAVE', payload: { key: `person-registry-module-menu-name-${tableName}`, value: menuName } })
        // Prepare the route
        const customRowClickConfig = props.configuration?.objectConfiguration?.customRowClick
        let route = customRowClickConfig?.route
        route = route?.replace('{tableName}', tableName)
        route = route?.replace('{rowObjectId}', row[`${tableName}.OBJECT_ID`])
        const url = window.location.href
        const splitUrl = url.split('main')
        const finalUrl = `${splitUrl[0]?.slice(0, -1)}${route}`
        window.location.replace(finalUrl)
    }
    const btnArrCreate = (btnArray, multiSelect) => {
        let btnTest = []
        btnArray.map((el, i) => {
            btnTest.push({
                name: el['label'],
                action: () => customBtnAction(el, multiSelect),
                id: `btn-${i}-${el['ID'].replace('.', '-')}`,
                class: 'test'
            })
        })
        return btnTest
    }

    const generateOuterBtns = (outerBtnArray, multiSelect, togglableChild) => {
        if (outerBtnArray && outerBtnArray.length > 0) {
            return (
                <div className={`${togglableChild ? 'farm-registry-outer-btn-container-togglable-child' : 'farm-registry-outer-btn-container'}`}>
                    {outerBtnArray.map(el => {
                        return (
                            <div key={el.ID} className={`${el.childBtnArray ? 'farm-registry-outer-togglable-child' : ''}`}>
                                <button
                                    onClick={() => customBtnAction(el, multiSelect)}
                                    className={`${togglableChild ? 'farm-registry-outer-btn-togglableChild' : 'farm-registry-outer-btn'} ${el.ID.toLowerCase()}-farm-registry-btn`}
                                    id={el.ID}>
                                    {el.label}</button>
                                {el.childBtnArray && actionToggle === el.ID && generateOuterBtns(el.childBtnArray, multiSelect, true)}
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    const generateGrid = () => {
        const configWs = props.configuration.objectConfiguration.configuration.onSubmit
        const dataWs = props.configuration.objectConfiguration.data.onSubmit
        const multiSelect = props.configuration.objectConfiguration.multiSelect || false
        const btnArray = props.configuration.objectConfiguration.additionalBtns
        const outerBtnArray = props.configuration.objectConfiguration.outerBtnArray
        const _maxLength = props.configuration.objectConfiguration.maxLength || 9999
        const additionalTopBtns = props.configuration.objectConfiguration.additionalTopButtons
        if (additionalTopBtns && Array.isArray(additionalTopBtns) && additionalTopBtns.length > 0) {
            store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-additional-top-buttons', value: additionalTopBtns } })
        }
        const grid = <div className={`${`custom-grid-container-${props.tableName.toLowerCase()}`} ${props.configuration.objectConfiguration.readOnly && 'read-only-grid'}`}>
            {outerBtnArray && generateOuterBtns(outerBtnArray, multiSelect)}
            <ExportableGrid
                gridType={"READ_URL"}
                key={props.tableName + props.appObjId}
                id={props.tableName + props.appObjId}
                configTableName={configWs}
                dataTableName={dataWs}
                onRowClickFunct={props.configuration.objectConfiguration.disableRowClick ? () => { } : props.configuration.objectConfiguration.customRowClick ? customRowClick : handleRowClick}
                refreshData={() => reloadGrid(props.tableName + props.appObjId, multiSelect)}
                toggleCustomButton={!props.configuration.objectConfiguration.configuration.readOnly}
                customButton={() => setShowModal(true)}
                customButtonLabel={labelsManager('add', context, 'farm_registry')}
                enableMultiSelect={multiSelect}
                onSelectChangeFunct={customRowSelection}
                buttonsArray={btnArray ? btnArrCreate(btnArray, multiSelect) : undefined}
                heightRatio={outerBtnArray ? 0.5 : 0.7}
            />
        </div>
        return grid
    }

    //multiselect functions 
    const customRowSelection = (selectedRows, gridId) => {
        store.dispatch(updateSelectedRows(selectedRows, gridId));
    };
    const reloadGrid = (gridId, multiSelect) => {
        GridManager.reloadAllGrids()
        if (multiSelect) {
            store.dispatch({ type: 'UPDATE_SELECTED_GRID_ROWS', payload: [[], gridId] })
            ComponentManager.setStateForComponent(gridId, 'selectedIndexes', [])
            ComponentManager.setStateForComponent(gridId, 'selectedIndexesBeforeFilters', [])
            ComponentManager.setStateForComponent(gridId, 'selectedRowsBeforeFilters', [])
        }
    }
    const handleRowClick = (_id, _rowIdx, row) => {
        if (props.configuration.objectConfiguration?.isSvarogForm) {
            setClickedRowObjectId(row[`SVAROG_FORM.OBJECT_ID`] || 0)
        } else {
            setClickedRowObjectId(row[`${props.tableName}.OBJECT_ID`] || 0)
            setRowClicked(row)
        }
        setShowModal(true)
    }
    const generateForm = (isModal, resetTheId) => {
        // Set a new ID for the form, so we get a re-render
        if (resetTheId) {
            setDynamicFormId(getDynamicKey())
        }
        // Get the WS paths from the configuration object
        let jsonSchemaConfig = props.configuration.objectConfiguration?.configuration?.onSubmit
        let uiSchemaConfig = props.configuration.objectConfiguration?.uischema?.onSubmit
        let formDataWs = props.configuration.objectConfiguration?.data?.onSubmit
        let onSubmitWs = props.configuration.objectConfiguration?.save?.onSave
        let contentType = props.configuration.objectConfiguration?.save?.contentType || 'application/x-www-form-urlencoded'
        let params = props.configuration.objectConfiguration?.save?.params
        let wrapper = props.configuration.objectConfiguration?.wrapper
        // If we're rendering a modal, the configuration services are a bit nested
        let refreshSummary = props.configuration.objectConfiguration?.refreshSummary
        if (isModal) {
            // #revise_me
            // We need to find a smarter way to get the WS paths, instead of duplicating the nested properties all over again
            jsonSchemaConfig = props.configuration.objectConfiguration?.form?.configuration?.onSubmit
            uiSchemaConfig = props.configuration.objectConfiguration?.form?.uischema?.onSubmit
            formDataWs = props.configuration.objectConfiguration?.form?.data?.onSubmit
            // If the form data WS contains something like {TABLE_NAME.OBJECT_ID} find it and replace it with the clicked object's ID
            formDataWs = replaceFunc(formDataWs, props.tableName, clickedRowObjectId, props.configuration.objectConfiguration?.isSvarogForm)
            onSubmitWs = props.configuration.objectConfiguration?.form?.save?.onSave
            contentType = props.configuration.objectConfiguration?.form?.save?.contentType || 'application/x-www-form-urlencoded'
            params = props.configuration.objectConfiguration?.form?.save?.params
            if (!wrapper) {
                wrapper = props.configuration.objectConfiguration?.form?.wrapper
            }

        }
        let hideBtns = 'close'

        let Wrapper = undefined
        // Check if there is a wrapper
        if (wrapper && Object.keys(wrapper).length > 0 && wrapper.enabled) {
            Wrapper = Wrappers.RecordSelectWrapper
        } else if (typeof wrapper === 'string' && Wrappers[wrapper]) {
            Wrapper = Wrappers[wrapper]
        }

        let readOnlyConfig
        let deleteConfig
        if (props.configuration.objectConfiguration.form) {
            readOnlyConfig = props.configuration.objectConfiguration?.form?.configuration?.readOnly || false;
            deleteConfig = props.configuration.objectConfiguration?.form?.delete?.enabled || false;
        } else if (props.configuration.objectConfiguration.type === 'form') {
            readOnlyConfig = props.configuration.objectConfiguration?.configuration?.readOnly || false;
            deleteConfig = props.configuration.objectConfiguration?.delete?.enabled || false;
        }
        switch (true) {
            case readOnlyConfig:
                hideBtns = 'all';
                break;
            case clickedRowObjectId === 0:
                hideBtns = 'closeAndDelete';
                break;
            case !readOnlyConfig && deleteConfig:
                hideBtns = 'close';
                break;
            case !readOnlyConfig && !deleteConfig:
                hideBtns = 'closeAndDelete';
                break;
            default:
                break;
        }
        return (
            <GenericForm
                className={`form-test aims-forms custom-farm-registry-form ${isModal && 'hide-initial-form-legend'} ${props.tableName.toLowerCase()}-form ${props.configuration.objectConfiguration?.readOnly && 'read-only-form'} `}
                params={'READ_URL'}
                key={dynamicFormId}
                id={dynamicFormId}
                method={jsonSchemaConfig}
                uiSchemaConfigMethod={uiSchemaConfig}
                tableFormDataMethod={formDataWs}
                addSaveFunction={(e) => saveForm(e, onSubmitWs, contentType, params, isModal, refreshSummary)}
                addDeleteFunction={(_id, _action, _session, formData) => deleteFunc(_id, _action, _session, formData, refreshSummary)}
                hideBtns={hideBtns}
                inputWrapper={Wrapper}
                wrapperConfig={wrapper}
                closeModalFunc={() => setShowModal(false)}
                objId={props.appObjId}
                appObjId={props.appObjId}
                onSubmitWs={onSubmitWs}
                rowClicked={rowCliked}
                tableName={props.tableName}
                disabled={hideBtns === 'all' ? true : false}
                config={props.configuration.objectConfiguration}
                formName={props.tableName}
                heightRatio={0.8}
            />
        )
    }
    const closeFormModal = () => {
        setShowModal(false)
        setClickedRowObjectId(0)
        ComponentManager.setStateForComponent(props.tableName + props.appObjId, null, { rowClicked: undefined })
    }
    const resetFormDeleteState = () => {
        setLoading(false)
        ComponentManager.setStateForComponent(dynamicFormId, null, { deleteExecuted: false })
    }
    const resetFormSaveState = () => {
        ComponentManager.setStateForComponent(dynamicFormId, null, { saveExecuted: false })
        setRender(true)
    }
    const saveForm = (e, wsPath, contentType, params, isModal, refreshSummary) => {
        let formData = e.formData || e
        const flatFormData = flattenObject(formData)
        // Check if every value in the form data object is nullish
        const isEmpty = Object.values(flatFormData).every(v => v === null || v === undefined)
        // Filter out every nullish value from the form data object
        const nonNullishFormData = Object.fromEntries(Object.entries(flatFormData).filter(([_, v]) => v !== null && v !== undefined))
        // Check if the filtered form data object has only four keys and they are only system fields
        const onlyHasSystemFields = Object.keys(nonNullishFormData).length === 4 && Object.keys(nonNullishFormData).every(k => k === 'OBJECT_ID' || k === 'OBJECT_TYPE' || k === 'PKID' || k === 'PARENT_ID')
        if (isEmpty || onlyHasSystemFields) {
            const label = labelsManager('enter_some_values', context, 'person-registry')
            alertUserV2({ type: 'info', title: label, onConfirm: resetFormSaveState })
        } else {
            if (params && Object.keys(params).length > 0) {
                const additionalParams = Object.assign({}, params)
                Object.entries(additionalParams).forEach(([key, value]) => {
                    if (value === '{rowObjectId}') {
                        Object.assign(additionalParams, { [key]: flatFormData.OBJECT_ID || 0 })
                    }
                })
                Object.assign(formData, additionalParams)
            }
            const url = `${window.server}${wsPath}`
            axios({
                method: "post",
                data: formData,
                url,
                headers: { "Content-Type": contentType },
            }).then(res => {
                if (res?.data) {
                    const resType = res.data?.type?.toLowerCase() || 'info'
                    if (resType === 'error') {
                        alertUserResponse({ response: res.data, onConfirm: resetFormSaveState })
                    } else {
                        setRender(false)
                        alertUserResponse({ response: res.data, onConfirm: resetFormSaveState })
                        if (isModal) {
                            GridManager.reloadAllGrids()
                            closeFormModal()
                        }
                        if (refreshSummary) store.dispatch({ type: 'SAVE', payload: { key: 'refreshSummary', value: true } })
                    }
                }
            }).catch(err => {
                console.error(err)
                alertUserResponse({ response: err, onConfirm: resetFormSaveState })
            });
        }
    };
    const deleteFunc = (_id, _action, _session, formData, refreshSummary) => {
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
                alertUserResponse({ response: res.data, onConfirm: resetFormDeleteState })
                if (resType === 'success') {
                    closeFormModal()
                    GridManager.reloadAllGrids();
                    if (refreshSummary) store.dispatch({ type: 'SAVE', payload: { key: 'refreshSummary', value: true } })
                }
            }
        }).catch(err => {
            console.error(err)
            alertUserResponse({ response: err, onConfirm: resetFormDeleteState })
        });
    };

    return (
        <>
            {loading && <Loading />}
            <div className={`custom-menu-holder ${`custom-menu-${props.tableName.toLowerCase()}-container`}`}>
                {/* FORM */}
                {renderForm && props.configuration?.objectConfiguration?.type === 'form' && generateForm()}
                {/* GRID */}
                {props.configuration?.objectConfiguration?.type === 'grid' && generateGrid()}
                {/* ATTACHMENTS */}
                {props.configuration?.objectConfiguration?.type === 'attachment' && <Documents getUploadedFiles={props.configuration?.objectConfiguration?.data.onSubmit}
                    uploadFileUrl={props.configuration?.objectConfiguration?.attach.onSubmit}
                />}
                {/* SEARCH-GRID*/}
                {props.configuration?.objectConfiguration?.type === 'search-grid' && <SearchDynamic tableName={props.tableName} configuration={props.configuration.objectConfiguration} />}
                {/* PARENT-CHILD-GRID */}
                {props.configuration?.objectConfiguration?.type === "multigrid" && <ParentChildGrids generateOuterBtns={generateOuterBtns} outerBtnArray={props.configuration.objectConfiguration.outerBtnArray} grids={props.configuration?.objectConfiguration?.grids} />}
                {/* DOUBLE-GRID */}
                {props.configuration?.objectConfiguration?.type === 'double-grid' && <DoubleGrid farmObjId={props.objectId} tableName={props.tableName} configuration={props.configuration.objectConfiguration} />}
                {/* FORM-WITH-GRID */}
                {props.configuration?.objectConfiguration?.type === 'form-with-grid' && <FormWithGrid farmObjId={props.objectId} tableName={props.tableName} configuration={props.configuration.objectConfiguration} />}
                {showModal && (
                    <Modal className={"farm-registry-modal"} show={showModal} onHide={() => closeFormModal()}>
                        <Modal.Header className={"farm-registry-modal-header"} closeButton>
                            <Modal.Title>{props.configuration.label}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className={"farm-registry-modal-body"}>
                            {generateForm(true, false)}
                        </Modal.Body>
                        <Modal.Footer className={"farm-registry-modal-footer"} />
                    </Modal>
                )}
            </div>
        </>
    )
}
const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
    selectedGridRows: state.selectedGridRows.selectedGridRows,
    previousRoutes: state.businessLogicReducer?.['person-registry-module-previous-routes'],
});

CustomButtons.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(CustomButtons);