import { React, ReactDOM, PropTypes, Loading, ComponentManager, redux, ExportableGrid, axios, connect, createHashHistory, elements, utils } from 'perun-core'
import Form from './Form'
import SearchForm from './SearchForm'
import { ActionForm } from '../Utils'
const { useEffect, useState } = React
const { getDynamicKey, updateIdScreen, labelsManager } = utils
const { alertUserResponse, alertUserV2, ReactBootstrap, Icon } = elements
const { Modal } = ReactBootstrap
const { store, updateSelectedRows } = redux
const hashHistory = createHashHistory()

const Search = (props, context) => {
  const [loading, setLoading] = useState(false)
  const [configuration, setConfiguration] = useState(undefined)
  const [activeElement, setActiveElement] = useState('')
  const [activeChild, setActiveChild] = useState('')
  const [activeParent, setActiveParent] = useState('')
  const [formConfig, setFormConfig] = useState(undefined)
  const [gridConfig, setGridConfig] = useState(undefined)
  const [searchFormConfig, setSearchFormConfig] = useState(undefined)
  const [showSearchForm, setShowSearchForm] = useState(false)
  const [searchFormId, setSearchFormId] = useState('')
  const [searchResult, setSearchResult] = useState(undefined)
  const [showGrid, setShowGrid] = useState(false)
  const [gridId, setGridId] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [actionFormConfig, setActionFormConfig] = useState(undefined)
  const [showActionFormModal, setShowActionFormModal] = useState(false)

  useEffect(() => {
    updateIdScreen('persons_registry', context)
    getConfiguration()
    store.dispatch({ type: 'SAVE', payload: { key: 'farm-registry-route', value: '' } })
    store.dispatch({ type: 'SAVE', payload: { key: 'farm-registry-object-id', value: '' } })
    const initialRoute = { route: `#/main/persons-registry`, label: 'person-registry' }
    store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-previous-routes', value: [initialRoute] } })
  }, [])

  useEffect(() => {
    if (searchResult) {
      setGridId(getDynamicKey())
    }
  }, [searchResult])

  const resetGridState = () => {
    setGridConfig(undefined)
    setShowGrid(false)
  }

  const resetFormState = () => {
    setFormConfig(undefined)
    setShowFormModal(false)
  }

  const resetSearchFormState = () => {
    setSearchFormConfig(undefined)
    setShowSearchForm(false)
    setSearchResult(undefined)
  }

  const getConfiguration = () => {
    setLoading(true)
    const { svSession } = props
    const url = `${window.server}/Menu/getMenu/${svSession}/0/0/person_registry-person-search-main`
    const reqConfig = { method: 'get', url }
    axios(reqConfig).then(res => {
      setLoading(false)
      if (res?.data) {
        const resType = res.data?.type?.toLowerCase()
        if (resType && resType === 'error') {
          alertUserResponse({ response: res.data })
        } else {
          if (res.data?.data?.buttonArray) {
            const configuration = res.data.data.buttonArray
            if (Array.isArray(configuration) && configuration?.length > 0) {
              setConfiguration(configuration)
            }
          }
        }
      }
    }).catch(err => {
      setLoading(false)
      console.error(err)
      alertUserResponse({ response: err })
    })
  }

  const handleRowClick = () => {

  }

  const customRowClick = (_id, _rowIdx, row) => {
    const href = `/main/persons-registry/PERSON/${row[`PERSON.OBJECT_ID`]}/summary`
    hashHistory.push(href)
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

  const resetActionFormSaveState = () => {
    ComponentManager.setStateForComponent('PERSON_REGISTRY_ACTION_FORM', null, { saveExecuted: false })
  }

  const executeAction = (config) => {
    let formData = {}
    if (showActionFormModal) {
      formData = ComponentManager.getStateForComponent('PERSON_REGISTRY_ACTION_FORM', 'formTableData')
    }
    const selectedGridRows = store.getState()?.['selectedGridRows']?.['selectedGridRows'] || []
    const customInputsData = store.getState()?.businessLogicReducer?.['person-registry-module-custom-inputs-data']
    const reqType = config?.type || 'GET'
    const contentType = config?.contentType || 'application/x-www-form-urlencoded'
    const params = config?.params
    const url = config?.onSave || config?.onSubmit
    const reqConfig = { method: reqType, url: `${window.server}${url}` }
    if (reqType === 'POST') {
      const data = { objArray: selectedGridRows }
      if (params && Object.keys(params).length > 0) {
        Object.assign(data, params)
      }
      if (customInputsData && Object.keys(customInputsData).length > 0) {
        Object.assign(data, customInputsData)
      }
      if (formData && Object.keys(formData).length > 0) {
        Object.assign(data, { formData })
      }
      reqConfig.headers = { 'Content-Type': contentType }
      reqConfig.data = data
    }
    setLoading(true)
    axios(reqConfig).then(res => {
      setLoading(false)
      store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-custom-inputs-data', value: {} } })
      if (res?.data) {
        const resType = res.data?.type?.toLowerCase() || 'info'
        alertUserResponse({ response: res, onConfirm: resetActionFormSaveState })
        if (resType === 'success') {
          store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-reload-search-grid', value: true } })
          setShowActionFormModal(false)
        }
      }
    }).catch(err => {
      console.error(err)
      setLoading(false)
      store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-custom-inputs-data', value: {} } })
      alertUserResponse({ response: err, onConfirm: resetActionFormSaveState })
    })
  }

  const showPrompt = (config) => {
    const customInputsContainer = document.createElement('div')
    customInputsContainer.className = 'custom-alert-inputs'
    let customInputs = undefined
    const promptInputs = config?.promptInput
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

    const onCancel = () => {
      store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-custom-inputs-data', value: {} } })
      resetActionFormSaveState()
    }

    let actionConfig = config
    if (config?.type === 'form') {
      actionConfig = config?.action
    }

    alertUserV2({
      type: 'info',
      title: config?.promptTitle || '',
      message: config?.promptMessage || '',
      confirmButtonText: labelsManager('yes', context, 'person-registry'),
      onConfirm: () => executeAction(actionConfig),
      showCancel: true,
      cancelButtonText: labelsManager('no', context, 'person-registry'),
      onCancel,
      ...customInputs && { html: customInputsContainer }
    })
  }

  const actionPrompt = (config) => {
    const selectedGridRows = store.getState()?.['selectedGridRows']?.['selectedGridRows'] || []
    if (selectedGridRows.length > 0) {
      switch (config?.type) {
        case 'form':
          setShowActionFormModal(true)
          setActionFormConfig(config)
          break;
        default:
          showPrompt(config)
          break;
      }
    } else {
      alertUserV2({ type: 'info', title: labelsManager('no_rows_selected', context, 'person-registry') })
    }
  }

  const handleRowSelection = (selectedRows, gridId) => {
    store.dispatch(updateSelectedRows(selectedRows, gridId))
  }

  const generateGrid = () => {
    let heightRatio = 0.8
    let config = gridConfig?.configuration?.onSubmit
    let data = gridConfig?.data?.onSubmit
    if (searchResult) {
      data = searchResult
      heightRatio = 0.6
    }
    const buttonsArray = []
    const additionalBtns = gridConfig?.additionalBtns
    if (additionalBtns && Array.isArray(additionalBtns) && additionalBtns.length > 0) {
      additionalBtns.forEach(btn => {
        buttonsArray.push({
          name: btn.label,
          action: () => actionPrompt(btn),
          id: btn.ID,
          class: ''
        })
      })
    }
    return (
      <ExportableGrid
        gridType='SEARCH_GRID_DATA'
        key={gridId}
        id={gridId}
        configTableName={config}
        dataTableName={data}
        className='epi-management-search-grid'
        heightRatio={heightRatio}
        onRowClickFunct={gridConfig.disableRowClick ? () => { } : gridConfig.customRowClick?.enabled === true ? customRowClick : handleRowClick}
        enableMultiSelect={gridConfig.multiSelect}
        onSelectChangeFunct={handleRowSelection}
        buttonsArray={buttonsArray}
      />
    )
  }

  const onButtonClick = (config, child) => {
    const id = config.ID
    const objectConfiguration = config.objectConfiguration
    const isModal = objectConfiguration?.isModal
    if (child) {
      if (!isModal) {
        setActiveChild(id)
        setActiveElement('')
      }
      const type = objectConfiguration?.type
      switch (type) {
        case 'grid':
          resetGridState()
          resetFormState()
          resetSearchFormState()
          setGridConfig(objectConfiguration)
          setGridId(getDynamicKey())
          setShowGrid(true)
          break;
        case 'form':
          if (!isModal) {
            resetGridState()
            resetFormState()
            resetSearchFormState()
          }
          setFormConfig(objectConfiguration)
          setShowFormModal(true)
          break;
        case 'search-grid':
          setSearchResult(undefined)
          setSearchFormId(getDynamicKey())
          resetGridState()
          resetFormState()
          setSearchFormConfig(objectConfiguration)
          setGridConfig(objectConfiguration)
          setGridId(getDynamicKey())
          setShowSearchForm(true)
          break;
        default:
          resetFormState()
          resetGridState()
          resetSearchFormState()
          break;
      }
    } else {
      // Multiple items (toggleable)
      if (config.data && Array.isArray(config.data) && config.data.length > 0) {
        if (id === activeParent) {
          setActiveParent('')
        } else {
          setActiveParent(id)
        }
      } else {
        // Single item (non-toggleable)
        if (!isModal) {
          setActiveElement(id)
          setActiveChild('')
        }
        if (config.objectConfiguration) {
          const objectConfiguration = config.objectConfiguration
          const type = objectConfiguration?.type
          switch (type) {
            case 'grid':
              resetGridState()
              resetFormState()
              resetSearchFormState()
              setGridConfig(objectConfiguration)
              setGridId(getDynamicKey())
              setShowGrid(true)
              break;
            case 'form':
              if (!isModal) {
                resetGridState()
                resetFormState()
                resetSearchFormState()
              }
              setFormConfig(objectConfiguration)
              setShowFormModal(true)
              break;
            case 'search-grid':
              setSearchResult(undefined)
              setSearchFormId(getDynamicKey())
              resetGridState()
              resetFormState()
              setSearchFormConfig(objectConfiguration)
              setGridConfig(objectConfiguration)
              setGridId(getDynamicKey())
              setShowSearchForm(true)
              break;
            default:
              break;
          }
        }
      }
    }
  }

  const generateSideMenuButtons = () => {
    return configuration.map(el => {
      return (
        <>
          <button
            key={el.ID}
            id={el.ID}
            type='button'
            className={`sidemenu-btn_sub ${activeElement === el.ID && !el.data ? 'sidemenu-active' : ''}`}
            onClick={() => onButtonClick(el)}
          >
            <span className='sidemenu-btn-title'>
              {el.iconName && el.iconName !== '%ICON_NAME%' && (
                <span className='sidemenu-dynamic-comp-icon-holder'>
                  <Icon name={el.iconName} />
                </span>
              )}
              <p>{el.label}</p>
            </span>
            {el.data && (
              <span className={`expand-arrow ${el.ID === activeParent && 'rotate-expand'}`}>
                <Icon name='IconChevronDown' />
              </span>
            )}
          </button>
          {el.data && (
            <div className={el.ID === activeParent ? 'sidemenu-sub-item-active' : 'sidemenu-sub-item-hidden'}>
              {el.data.map(sub => {
                return (
                  <button
                    key={sub.ID}
                    id={sub.ID}
                    className={`sidemenu-btn_sub ${activeChild === sub.ID ? 'sidemenu-active' : ''}`}
                    onClick={() => onButtonClick(sub, true)}
                  >
                    <span className='sidemenu-btn-title'>
                      {sub.iconName && sub.iconName !== '%ICON_NAME%' && (
                        <span className='sidemenu-dynamic-comp-icon-holder'>
                          <Icon name={sub.iconName} />
                        </span>
                      )}
                      <p>{sub.label}</p>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )
    })
  }

  return (
    <>
      {loading && <Loading />}
      <div className='farm-registry-search-main-container epi-module-search-main-container'>
        <div className='sidemenu-main-container farm-registry-sidemenu-main-container hide-all-form-legends'>
          <div className='back-button-container'>
            <button className='btn back-btn epi-back-btn' onClick={() => hashHistory.push('/main')}>
              <Icon name='IconChevronLeft' />
              <span className='back-btn-text'>{labelsManager('back', context, 'persons_registry')}</span>
            </button>
          </div>
          <div className="farm-registry-sidemenu-buttons-container">
            {configuration && generateSideMenuButtons()}
          </div>
        </div>
        <div className='farm-registry-search-grid-container phc-search-grid-container person-registry-search-grid-container'>
          {showSearchForm && searchFormConfig && <SearchForm key={searchFormId} id={searchFormId} formConfig={searchFormConfig} setSearchResult={setSearchResult} />}
          {searchResult && gridConfig && generateGrid()}
          {showGrid && gridConfig && generateGrid()}
        </div>
        {showFormModal && formConfig && (
          <Modal className='farm-registry-modal' show={showFormModal} onHide={() => setShowFormModal(false)}>
            <Modal.Header className='farm-registry-modal-header' closeButton>
            </Modal.Header>
            <Modal.Body className='farm-registry-modal-body'>
              <Form formConfig={formConfig} setShowFormModal={setShowFormModal} showGrid={showGrid} gridId={gridId} searchResult={searchResult} />
            </Modal.Body>
            <Modal.Footer className='farm-registry-modal-footer' />
          </Modal>
        )}
        {showActionFormModal && actionFormConfig && (
          <Modal className='farm-registry-modal' show={showActionFormModal} onHide={() => setShowActionFormModal(false)}>
            <Modal.Header className='farm-registry-modal-header' closeButton>
            </Modal.Header>
            <Modal.Body className='farm-registry-modal-body'>
              <ActionForm formConfig={actionFormConfig} setShowFormModal={setShowActionFormModal} executeAction={() => showPrompt(actionFormConfig)} />
            </Modal.Body>
            <Modal.Footer className='farm-registry-modal-footer' />
          </Modal>
        )}
      </div>
    </>
  )
}

Search.contextTypes = {
  intl: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
  customInputsData: state.businessLogicReducer?.['person-registry-module-custom-inputs-data'],
})

export default connect(mapStateToProps)(Search)
