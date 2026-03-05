import { React, ReactDOM, PropTypes, Tooltip, Swal, Loading, ExportableGrid, ComponentManager, GridManager, axios, connect, elements, redux, utils } from 'perun-core'
import { ActionForm } from '../Utils'
const { useEffect, useState } = React
const { alertUserResponse, alertUserV2, ReactBootstrap, Icon } = elements
const { Modal } = ReactBootstrap
const { store } = redux
const { labelsManager } = utils

const TopButtons = (props, context) => {
  const [loading, setLoading] = useState(false)
  const [buttons, setButtons] = useState(undefined)
  const [formConfig, setFormConfig] = useState(undefined)
  const [showFormModal, setShowFormModal] = useState(false)
  const [gridConfig, setGridConfig] = useState(undefined)
  const [showGridModal, setShowGridModal] = useState(false)

  useEffect(() => {
    const topButtons = Array.prototype.slice.call(props.configuration)
    if (props.additionalTopBtns) {
      topButtons.push(...props.additionalTopBtns)
    }
    setButtons(topButtons)
  }, [props.additionalTopBtns])

  useEffect(() => {
    resetState()
  }, [props.activeComponent])

  const reloadGrid = () => {
    const gridId = props.activeComponent + props.objectId
    GridManager.reloadAllGrids()
    store.dispatch({ type: 'UPDATE_SELECTED_GRID_ROWS', payload: [[], gridId] })
    ComponentManager.setStateForComponent(gridId, 'selectedIndexes', [])
    ComponentManager.setStateForComponent(gridId, 'selectedIndexesBeforeFilters', [])
    ComponentManager.setStateForComponent(gridId, 'selectedRowsBeforeFilters', [])
  }

  const resetState = () => {
    setFormConfig(undefined)
    setGridConfig(undefined)
  }

  const getRowData = () => {
    const { session, objectId, tableName, selectedRow } = props
    const url = `${window.server}/ReactElements/getRowDataByObjectId/${session}/${objectId}/${tableName}`
    setLoading(true)
    axios.get(url).then(res => {
      setLoading(false)
      if (res?.data?.[0] && Object.keys(res.data[0]).length > 0) {
        const rowData = Object.assign({}, selectedRow)
        const mergedRowData = { ...rowData, ...res.data[0] }
        store.dispatch({ type: 'SAVE', payload: { key: `person-registry-module-row-${tableName}`, value: mergedRowData } })
        GridManager.reloadAllGrids()
      }
    }).catch(err => {
      console.error(err)
      setLoading(false)
      alertUserResponse({ response: err })
    })
  }

  const handleTransition = (el) => {
    setLoading(true)
    const formData = {}
    const configuration = el?.objectConfiguration?.save
    const reqType = configuration?.type || 'GET'
    const contentType = configuration?.contentType || 'application/x-www-form-urlencoded'
    const params = configuration?.params
    if (params) {
      Object.assign(formData, { ...params })
    }
    const url = configuration?.onSubmit
    const reqConfig = { method: reqType, url: `${window.server}${url}` }
    if (reqType === 'POST') {
      reqConfig.headers = { 'Content-Type': contentType }
      reqConfig.data = formData
    }
    axios(reqConfig).then(res => {
      setLoading(false)
      if (res?.data) {
        alertUserResponse({ response: res })
        if (res.data?.type?.toLowerCase() === 'success') {
          getRowData()
        }
      }
    }).catch(err => {
      console.error(err)
      setLoading(false)
      alertUserResponse({ response: err })
    })
  }

  const handleAction = (el) => {
    switch (el.type) {
      case 'transition': {
        handleTransition(el)
        break;
      }
    }
  }

  const executeGeneralAction = (config) => {
    const customInputsData = store.getState()?.businessLogicReducer?.['person-registry-module-custom-inputs-data']
    const formData = {}
    const reqType = config?.type || 'GET'
    const contentType = config?.contentType || 'application/x-www-form-urlencoded'
    const params = config?.params
    if (params) {
      Object.assign(formData, { ...params })
    }
    if (customInputsData && Object.keys(customInputsData).length > 0) {
      Object.assign(formData, customInputsData)
    }
    const url = config?.onSubmit
    const reqConfig = { method: reqType, url: `${window.server}${url}` }
    if (reqType === 'POST') {
      reqConfig.headers = { 'Content-Type': contentType }
      reqConfig.data = formData
    }
    setLoading(true)
    axios(reqConfig).then(res => {
      setLoading(false)
      store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-custom-inputs-data', value: {} } })
      if (res?.data) {
        const resType = res.data?.type?.toLowerCase() || 'info'
        alertUserResponse({ response: res })
        if (resType === 'success') {
          GridManager.reloadAllGrids()
          getRowData()
        }
      }
    }).catch(err => {
      console.error(err)
      setLoading(false)
      store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-custom-inputs-data', value: {} } })
      alertUserResponse({ response: err })
    })
  }

  const onCustomInputsChange = (e) => {
    const customInputsData = props.customInputsData
    let newData = {}
    if (customInputsData) {
      Object.assign(newData, { ...customInputsData, [e.target.name]: e.target.value })
    } else {
      Object.assign(newData, { [e.target.name]: e.target.value })
    }
    store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-custom-inputs-data', value: newData } })
  }

  const onClick = (el, hasChildren) => {
    switch (el.type) {
      case 'print': {
        const printReport = (needsSignature, shouldSign) => {
          let url = `${window.server}${el.onSubmit}`
          if (needsSignature) {
            url = `${window.server}${el.eSignature.onSubmit}`
            url = url.replace('{shouldSign}', shouldSign)
          }
          window.open(url, '_blank')
        }
        if (el.eSignature && el.eSignature.enabled === true) {
          alertUserV2({
            type: 'question',
            title: labelsManager('e_sign_report_prompt', context, 'person-registry'),
            showCancel: true,
            showDeny: true,
            confirmButtonText: labelsManager('yes', context, 'person-registry'),
            cancelButtonText: labelsManager('cancel', context, 'person-registry'),
            denyButtonText: labelsManager('no', context, 'person-registry'),
            denyButtonColor: '#87adbd',
            onConfirm: () => printReport(true, 'true'),
            onCancel: () => Swal.close(),
            onDeny: () => printReport(true, 'false'),
          })
        } else {
          printReport()
        }
        break;
      }
      case 'transition': {
        if (!hasChildren) {
          alertUserV2({
            type: 'question',
            title: labelsManager('transition_to_selected_status', context, 'person-registry'),
            confirmButtonText: labelsManager('yes', context, 'person-registry'),
            confirmButtonColor: '#87adbd',
            onConfirm: () => handleAction(el),
            showCancel: true,
            cancelButtonText: labelsManager('no', context, 'person-registry'),
          })
        }
        break;
      }
      case 'action': {
        const selectedGridRows = store.getState()?.['selectedGridRows']?.['selectedGridRows'] || []
        const executeAction = () => {
          const action = el?.action
          const reqType = action?.type || 'GET'
          const contentType = action?.contentType || 'application/x-www-form-urlencoded'
          const url = action?.onSubmit
          const reqConfig = { method: reqType, url: `${window.server}${url}` }
          if (reqType === 'POST') {
            reqConfig.headers = { 'Content-Type': contentType }
            reqConfig.data = { objArray: selectedGridRows }
          }
          setLoading(true)
          axios(reqConfig).then(res => {
            setLoading(false)
            if (res?.data) {
              const resType = res.data?.type?.toLowerCase() || 'info'
              alertUserResponse({ response: res })
              if (resType === 'success') {
                reloadGrid()
              }
            }
          }).catch(err => {
            console.error(err)
            setLoading(false)
            alertUserResponse({ response: err })
          })
        }
        if (selectedGridRows.length > 0) {
          if (el.form) {
            setShowFormModal(true)
            setFormConfig(el)
          } else if (el.preview) {
            const previewConfig = el.preview
            if (previewConfig?.onSubmit) {
              const reqType = previewConfig?.type || 'GET'
              const contentType = previewConfig?.contentType || 'application/x-www-form-urlencoded'
              const url = previewConfig?.onSubmit
              const reqConfig = { method: reqType, url: `${window.server}${url}` }
              if (reqType === 'POST') {
                reqConfig.headers = { 'Content-Type': contentType }
                reqConfig.data = { objArray: selectedGridRows }
              }
              setLoading(true)
              axios(reqConfig).then(res => {
                setLoading(false)
                if (res?.data) {
                  alertUserV2({
                    type: res.data?.type?.toLowerCase() || '',
                    title: res.data?.title || '',
                    message: res.data?.message || '',
                    ...res.data?.message && { html: res.data?.message?.replace(/\n/g, '<br>') },
                    confirmButtonText: labelsManager('proceed', context, 'person-registry'),
                    onConfirm: executeAction,
                    showCancel: true,
                    cancelButtonText: labelsManager('cancel', context, 'person-registry')
                  })
                }
              }).catch(err => {
                console.error(err)
                setLoading(false)
                alertUserResponse({ response: err })
              })
            }
          }
        } else {
          alertUserV2({ type: 'info', title: labelsManager('no_rows_selected', context, 'person-registry') })
        }
        break;
      }
      case 'grid': {
        setShowGridModal(true)
        setGridConfig(el)
        break;
      }
      default: {
        if (!hasChildren) {
          if (el.onSubmit) {
            if (el.promptTitle || el.promptMessage) {
              const customInputsContainer = document.createElement('div')
              customInputsContainer.className = 'custom-alert-inputs'
              let customInputs = undefined
              const promptInputs = el?.promptInput
              if (promptInputs && Array.isArray(promptInputs) && promptInputs.length > 0) {
                customInputs = (
                  <>
                    {promptInputs.map(input => {
                      const inputKey = input.key
                      return (
                        <form key={`${inputKey}_FORM`} onChange={onCustomInputsChange} onSubmit={(e) => e.preventDefault()}>
                          <div key={inputKey} className='form-group'>
                            <label key={`${inputKey}_LABEL`} htmlFor={inputKey} className='control-label'>{input.label}</label>
                            <input key={`${inputKey}_INPUT`} id={inputKey} name={inputKey} type={input.type} className='form-control' />
                          </div>
                        </form>
                      )
                    })}
                  </>
                )
                ReactDOM.render(customInputs, customInputsContainer)
              }
              alertUserV2({
                type: 'info',
                title: el?.promptTitle || '',
                message: el?.promptMessage || '',
                confirmButtonText: labelsManager('yes', context, 'person-registry'),
                onConfirm: () => executeGeneralAction(el),
                showCancel: true,
                cancelButtonText: labelsManager('no', context, 'person-registry'),
                onCancel: () => store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-custom-inputs-data', value: {} } }),
                ...customInputs && { html: customInputsContainer }
              })
            } else {
              executeGeneralAction(el)
            }
          }
        }
        break;
      }
    }
  }

  const closeGridModal = () => {
    setShowGridModal(false)
  }

  const onActionGridRowClick = (_id, _idx, row) => {
    const actionWs = gridConfig?.objectConfiguration?.action?.onSubmit
    const tableName = gridConfig?.objectConfiguration?.action?.tableName
    if (actionWs && tableName) {
      let url = `${window.server}${actionWs}`
      url = url.replace('{rowObjectId}', row[`${tableName}.OBJECT_ID`])
      setLoading(true)
      axios.get(url).then(res => {
        setLoading(false)
        if (res?.data) {
          const resType = res.data?.type?.toLowerCase() || 'info'
          alertUserResponse({ response: res })
          if (resType === 'success') {
            GridManager.reloadAllGrids()
            closeGridModal()
          }
        }
      }).catch(err => {
        console.error(err)
        setLoading(false)
        alertUserResponse({ response: err })
      })
    }
  }

  const generateGrid = () => {
    const gridId = gridConfig?.ID
    const configWs = gridConfig?.objectConfiguration?.configuration?.onSubmit
    const dataWs = gridConfig?.objectConfiguration?.data?.onSubmit
    return (
      <ExportableGrid
        gridType='READ_URL'
        key={gridId}
        id={gridId}
        configTableName={configWs}
        dataTableName={dataWs}
        onRowClickFunct={onActionGridRowClick}
        heightRatio={0.7}
      />
    )
  }

  const resetFormSaveState = () => {
    ComponentManager.setStateForComponent('PERSON_REGISTRY_ACTION_FORM', null, { saveExecuted: false })
  }

  const handleFormAction = () => {
    const { action, promptTitle, promptMessage } = formConfig

    const executeAction = () => {
      const formData = ComponentManager.getStateForComponent('PERSON_REGISTRY_ACTION_FORM', 'formTableData')
      const selectedGridRows = store.getState()?.['selectedGridRows']?.['selectedGridRows'] || []
      const params = action?.params || {}
      const reqType = action?.type || 'GET'
      const contentType = action?.contentType || 'application/x-www-form-urlencoded'
      const url = action?.onSubmit
      const reqConfig = { method: reqType, url: `${window.server}${url}` }
      if (reqType === 'POST') {
        const data = { formData, objArray: selectedGridRows }
        if (params && Object.keys(params).length > 0) {
          Object.assign(data, params)
        }
        reqConfig.headers = { 'Content-Type': contentType }
        reqConfig.data = data
      }
      setLoading(true)
      axios(reqConfig).then(res => {
        setLoading(false)
        if (res?.data) {
          const resType = res.data?.type?.toLowerCase() || 'info'
          alertUserResponse({ response: res, onConfirm: resetFormSaveState })
          if (resType === 'success') {
            reloadGrid()
            setShowFormModal(false)
          }
        }
      }).catch(err => {
        console.error(err)
        setLoading(false)
        alertUserResponse({ response: err, onConfirm: resetFormSaveState })
      })
    }

    alertUserV2({
      type: 'info',
      title: promptTitle || '',
      message: promptMessage || '',
      confirmButtonText: labelsManager('yes', context, 'person-registry'),
      onConfirm: executeAction,
      showCancel: true,
      cancelButtonText: labelsManager('no', context, 'person-registry'),
      onCancel: resetFormSaveState
    })
  }

  return (
    <>
      {loading && <Loading />}
      <div className='top-button-container'>
        {buttons?.map(el => {
          return (
            <div key={el.ID} className={`${el.data ? 'top-btn-toggleable' : ''}`}>
              <button
                id={el.ID}
                onClick={() => onClick(el, el.data?.length > 0)}
                className={`btn top-btn top-btn-parent ${el.ID.toLowerCase()}-aims-btn`}
                data-tooltip-id={el.data?.length > 0 ? 'top-buttons-tooltip' : 'top-buttons-simple-tooltip'}
                data-tooltip-content={el.data?.length > 0 ? JSON.stringify(el.data) : el.label}
                data-tooltip-place='bottom'
              >
                {el.iconName && el.iconName !== '%ICON_NAME%' && (
                  <span className='top-button-icon-holder'>
                    <Icon name={el.iconName} />
                  </span>
                )}
                <span className='top-button-label'>{el.label}</span>
              </button>
              <Tooltip id='top-buttons-tooltip' place='bottom' clickable className='aims-tooltip'
                render={({ content }) => {
                  const submenu = JSON.parse(content || '[]')
                  if (!submenu.length) return null
                  return (
                    <div className='top-buttons-children-container' style={{ display: 'flex', flexDirection: 'column' }}>
                      {submenu.map(subEl => (
                        <button
                          key={`SUB_${subEl.ID}`}
                          id={`SUB_${subEl.ID}`}
                          onClick={() => onClick(subEl)}
                          className={`btn top-btn-child ${subEl.ID.toLowerCase()}-aims-btn`}
                        >
                          {subEl.iconName && subEl.iconName !== '%ICON_NAME%' && (
                            <span className='top-button-icon-holder'>
                              <Icon name={subEl.iconName} />
                            </span>
                          )}
                          <span className='top-button-label'>{subEl.label}</span>
                        </button>
                      ))}
                    </div>
                  )
                }}
              />
              <Tooltip className='aims-tooltip' id='top-buttons-simple-tooltip' place='bottom' />
            </div>
          )
        })}
      </div>
      {showFormModal && formConfig && (
        <Modal className='farm-registry-modal' show={showFormModal} onHide={() => setShowFormModal(false)}>
          <Modal.Header className='farm-registry-modal-header' closeButton>
          </Modal.Header>
          <Modal.Body className='farm-registry-modal-body'>
            <ActionForm formConfig={formConfig} setShowFormModal={setShowFormModal} executeAction={handleFormAction} />
          </Modal.Body>
          <Modal.Footer className='farm-registry-modal-footer' />
        </Modal>
      )}
      {showGridModal && gridConfig && (
        <Modal className='farm-registry-modal' show={showGridModal} onHide={closeGridModal}>
          <Modal.Header className='farm-registry-modal-header' closeButton>
          </Modal.Header>
          <Modal.Body className='farm-registry-modal-body'>
            {generateGrid()}
          </Modal.Body>
          <Modal.Footer className='farm-registry-modal-footer' />
        </Modal>
      )}
    </>
  )
}

TopButtons.contextTypes = {
  intl: PropTypes.object.isRequired,
}

const mapStateToProps = (state, ownProps) => ({
  session: state.security.svSession,
  selectedRow: state.businessLogicReducer?.[`person-registry-module-row-${ownProps?.tableName}`],
  additionalTopBtns: state.businessLogicReducer?.['person-registry-module-additional-top-buttons'],
  customInputsData: state.businessLogicReducer?.['person-registry-module-custom-inputs-data'],
})

export default connect(mapStateToProps)(TopButtons)
