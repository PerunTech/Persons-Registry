import { React, Loading, GenericForm, ComponentManager, GridManager, axios, elements, redux, createHashHistory } from 'perun-core'
import { RecordSelectWrapper } from '../Wrappers'
import PersonWrapper from '../Wrappers/PersonWrapper'
const { useEffect, useState } = React
const { alertUserResponse } = elements
const { store } = redux

const Form = (props) => {
  let hashHistory = createHashHistory();
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(undefined)

  useEffect(() => {
    getData()
  }, [])

  const getConfig = (key, name) => {
    const { formConfig } = props
    const config = formConfig[key]
    return {
      name,
      url: config.onSubmit,
      method: config.type,
      ...config.type === 'POST' && { data: config.params },
      ...config.type === 'POST' && { contentType: config.contentType },
    }
  }

  const getData = () => {
    setLoading(true)
    const jsonSchema = {}
    const uiSchema = {}
    const formData = {}
    const jsonSchemaOptions = getConfig('configuration', 'jsonSchema')
    const uiSchemaOptions = getConfig('uischema', 'uiSchema')
    const formDataOptions = getConfig('data', 'formData')
    const requests = [jsonSchemaOptions, uiSchemaOptions, formDataOptions]
    const promises = requests.map(async request => {
      const { method, url, contentType, data, name } = request
      const reqConfig = { method, url: `${window.server}${url}` }
      if (method === 'POST') {
        reqConfig.headers = { 'Content-Type': contentType }
        reqConfig.data = data
      }
      return await axios(reqConfig).then(response => ({ name, response: response?.data?.data || response?.data, })).catch(err => ({ name, response: { type: 'error', ...err?.response } }))
    })

    Promise.allSettled(promises).then(results => {
      setLoading(false)
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value?.response?.type?.toLowerCase() === 'error') {
            alertUserResponse({ response: result.value.response })
          } else {
            if (result.value?.name === 'jsonSchema') {
              Object.assign(jsonSchema, result.value.response)
            }
            if (result.value?.name === 'uiSchema') {
              Object.assign(uiSchema, result.value.response)
            }
            if (result.value?.name === 'formData') {
              Object.assign(formData, result.value.response)
            }
          }
        }
      })

      setData({ jsonSchema, uiSchema, formData })
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }

  const resetFormSaveState = () => {
    ComponentManager.setStateForComponent('PERSON_REGISTRY_REGISTRATION_FORM', null, { saveExecuted: false })
  }

  const onSubmit = () => {
    const formId = 'PERSON_REGISTRY_REGISTRATION_FORM'
    const { formConfig, showGrid, gridId, searchResult } = props
    const saveConfig = formConfig.save
    const formData = ComponentManager.getStateForComponent(formId, 'formTableData')
    const data = Object.assign({}, formData)
    if (saveConfig.params) {
      Object.assign(data, { ...saveConfig.params })
    }
    const reqConfig = { method: saveConfig.type, url: `${window.server}${saveConfig.onSave}`, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: encodeURIComponent(JSON.stringify(data)), }
    axios(reqConfig).then(res => {
      if (res?.data) {
        const resType = res.data?.type?.toLowerCase() || 'info'
        if (resType === 'success') {
          const objid = res?.data?.data['OBJECT_ID']
          if (objid) {
            const href = `/main/persons-registry/PERSON/${objid}/summary`
            hashHistory.push(href);
          }

          props.setShowFormModal(false)
          if (showGrid) {
            GridManager.reloadGridData(gridId)
          } else if (searchResult) {

            store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-reload-search-grid', value: true } })
          }
        }
        alertUserResponse({ response: res, onConfirm: resetFormSaveState })
      }
    }).catch(err => {
      console.error(err)
      alertUserResponse({ response: err, onConfirm: resetFormSaveState })
    })
  };

  const generateForm = () => {
    const { formConfig } = props
    let wrapperConfig = undefined
    let Wrapper = undefined
    // Check if there is a wrapper
    if (formConfig.wrapper && Object.keys(formConfig.wrapper).length > 0 && formConfig.wrapper.enabled) {
      wrapperConfig = formConfig.wrapper
      Wrapper = RecordSelectWrapper
    }

    return (
      <GenericForm
        className='form-test person-registry-forms person-registration-form-initial aims-forms'
        params='FORM_DATA'
        key='PERSON_REGISTRY_REGISTRATION_FORM'
        id='PERSON_REGISTRY_REGISTRATION_FORM'
        method={data.jsonSchema}
        uiSchemaConfigMethod={data.uiSchema}
        tableFormDataMethod={data.formData}
        addSaveFunction={(e) => onSubmit(e)}
        hideBtns='closeAndDelete'
        inputWrapper={PersonWrapper}
        isAddForm={true}
      />
    )
  }

  return (
    <>
      {loading && <Loading />}
      {data && generateForm()}
    </>
  )
}

export default Form
