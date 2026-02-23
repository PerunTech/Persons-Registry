import { React, PropTypes, ComponentManager, GridManager, GenericForm, ExportableGrid, elements, axios, connect, redux, utils } from 'perun-core'
const { flattenObject, getDynamicKey, replaceFunc, labelsManager } = utils
const { useEffect, useState } = React
const { store } = redux
const { ReactBootstrap, alertUserResponse, alertUserV2 } = elements
const { Modal } = ReactBootstrap

const FormWithGrid = (props, context) => {
  const [showModal, setShowModal] = useState(false)
  const [dynamicFormId, _setDynamicFormId] = useState(getDynamicKey())
  const [dynamicModalFormId, _setDynamicModalFormId] = useState(getDynamicKey())
  const [clickedRowObjectId, setClickedRowObjectId] = useState(0)
  const [renderForm, setRender] = useState(true)

  useEffect(() => {
    return () => {
      ComponentManager.cleanComponentReducerState(props.tableName + props.farmObjId)
      store.dispatch({ type: 'UPDATE_SELECTED_GRID_ROWS', payload: [[], props.tableName + props.farmObjId] })
      ComponentManager.setStateForComponent(props.tableName + props.farmObjId, 'selectedIndexes', [])
      ComponentManager.setStateForComponent(props.tableName + props.farmObjId, 'selectedIndexesBeforeFilters', [])
      ComponentManager.setStateForComponent(props.tableName + props.farmObjId, 'selectedRowsBeforeFilters', [])
    }
  }, [])

  const resetFormDeleteState = () => {
    const formId = showModal ? dynamicModalFormId : dynamicFormId
    ComponentManager.setStateForComponent(formId, null, { deleteExecuted: false })
  }

  const resetFormSaveState = () => {
    const formId = showModal ? dynamicModalFormId : dynamicFormId
    ComponentManager.setStateForComponent(formId, null, { saveExecuted: false })
    setRender(true)
  }

  const closeFormModal = () => {
    setShowModal(false)
    setClickedRowObjectId(0)
    ComponentManager.setStateForComponent(props.tableName + props.farmObjId, null, { rowClicked: undefined })
  }

  const saveForm = (e, wsPath, isModal, refreshSummary) => {
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
      const url = `${window.server}${wsPath}`
      axios({
        method: 'post',
        data: encodeURIComponent(JSON.stringify(formData)),
        url,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }).then(res => {
        if (res?.data) {
          const resType = res.data?.type?.toLowerCase() || 'info'
          if (resType === 'error') {
            alertUserResponse({ response: res.data, onConfirm: resetFormSaveState })
          } else {
            alertUserResponse({ response: res.data, onConfirm: resetFormSaveState })
            if (isModal) {
              GridManager.reloadGridData(props.tableName + props.farmObjId)
              closeFormModal()
            } else {
              setRender(false)
            }
            if (refreshSummary) store.dispatch({ type: 'SAVE', payload: { key: 'refreshSummary', value: true } })
          }
        }
      }).catch(err => {
        console.error(err)
        alertUserResponse({ response: err, onConfirm: resetFormSaveState })
      });
    }
  }

  const deleteFunc = (_id, _action, _session, formData, isModal, refreshSummary) => {
    const { svSession } = props;
    const url = window.server + `/ReactElements/deleteObject/${svSession}`;
    axios({
      method: 'post',
      data: encodeURIComponent(formData[4]['PARAM_VALUE']),
      url: url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      if (res?.data) {
        const resType = res.data?.type?.toLowerCase() || 'info'
        alertUserResponse({ response: res.data, onConfirm: resetFormDeleteState })
        if (resType === 'success') {
          if (isModal) {
            closeFormModal()
            GridManager.reloadGridData(props.tableName + props.farmObjId);
          }
          if (refreshSummary) store.dispatch({ type: 'SAVE', payload: { key: 'refreshSummary', value: true } })
        }
      }
    }).catch(err => {
      console.error(err)
      alertUserResponse({ response: err, onConfirm: resetFormDeleteState })
    });
  };

  const generateForm = (isModal) => {
    const gridConfig = props.configuration.grid
    const tableName = gridConfig?.tableName
    let formId = dynamicFormId
    let formConfig = props.configuration.form
    let jsonSchemaConfig = formConfig?.configuration?.onSubmit
    let uiSchemaConfig = formConfig?.uischema?.onSubmit
    let formDataWs = formConfig?.data?.onSubmit
    let onSubmitWs = formConfig?.save?.onSave
    let readOnly = formConfig?.readOnly || false
    let refreshSummary = formConfig?.refreshSummary || false
    let deleteConfig = formConfig?.delete?.enabled || false

    if (isModal) {
      let modalFormConfig = gridConfig?.form
      jsonSchemaConfig = modalFormConfig?.configuration?.onSubmit
      uiSchemaConfig = modalFormConfig?.uischema?.onSubmit
      formDataWs = modalFormConfig?.data?.onSubmit
      formDataWs = replaceFunc(formDataWs, tableName, clickedRowObjectId)
      onSubmitWs = modalFormConfig?.save?.onSave
      readOnly = modalFormConfig?.readOnly || false
      deleteConfig = modalFormConfig?.delete?.enabled || false
      formId = dynamicModalFormId
    }

    let hideBtns = 'close'
    switch (true) {
      case readOnly:
        hideBtns = 'all';
        break;
      case clickedRowObjectId === 0:
        hideBtns = 'closeAndDelete';
        break;
      case !readOnly && deleteConfig:
        hideBtns = 'close';
        break;
      case !readOnly && !deleteConfig:
        hideBtns = 'closeAndDelete';
        break;
      default:
        break;
    }

    return (
      <GenericForm
        className={`form-test aims-forms custom-farm-registry-form ${props.tableName.toLowerCase()}-form ${readOnly && 'read-only-form'}`}
        params='READ_URL'
        key={formId}
        id={formId}
        method={jsonSchemaConfig}
        uiSchemaConfigMethod={uiSchemaConfig}
        tableFormDataMethod={formDataWs}
        addSaveFunction={(e) => saveForm(e, onSubmitWs, isModal, refreshSummary)}
        addDeleteFunction={(_id, _action, _session, formData) => deleteFunc(_id, _action, _session, formData, isModal, refreshSummary)}
        hideBtns={hideBtns}
      />
    )
  }

  const handleRowClick = (_id, _rowIdx, row, tableName) => {
    setClickedRowObjectId(row[`${tableName}.OBJECT_ID`] || 0)
    setShowModal(true)
  }

  const generateGrid = () => {
    const gridConfig = props.configuration.grid
    const tableName = gridConfig?.tableName
    const configWs = gridConfig?.configuration?.onSubmit
    const dataWs = gridConfig?.data?.onSubmit
    const readOnly = gridConfig?.readOnly || false

    return (
      <div className={`${`custom-grid-container-${props.tableName.toLowerCase()}`} ${readOnly && 'read-only-grid'}`}>
        <ExportableGrid
          gridType={'READ_URL'}
          key={props.tableName + props.farmObjId}
          id={props.tableName + props.farmObjId}
          configTableName={configWs}
          dataTableName={dataWs}
          toggleCustomButton={!readOnly}
          customButton={() => setShowModal(true)}
          customButtonLabel={labelsManager('add', context, 'farm_registry')}
          onRowClickFunct={(id, idx, row) => handleRowClick(id, idx, row, tableName)}
          heightRatio={0.4}
        />
      </div>
    )
  }

  return (
    <>
      <div className='form-with-grid-container'>
        {renderForm && props.configuration?.form && generateForm()}
        {props.configuration?.grid && generateGrid()}
      </div>
      {showModal && (
        <Modal className={'farm-registry-modal'} show={showModal} onHide={() => closeFormModal()}>
          <Modal.Header className={'farm-registry-modal-header'} closeButton>
            <Modal.Title>{props.configuration.label}</Modal.Title>
          </Modal.Header>
          <Modal.Body className={'farm-registry-modal-body'}>
            {generateForm(true)}
          </Modal.Body>
          <Modal.Footer className={'farm-registry-modal-footer'} />
        </Modal>
      )}
    </>
  )
}

FormWithGrid.contextTypes = {
  intl: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
})

export default connect(mapStateToProps)(FormWithGrid)
