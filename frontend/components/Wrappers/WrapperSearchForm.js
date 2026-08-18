import { React, PropTypes, Loading, GenericForm, axios, elements, utils } from 'perun-core'
const { useEffect, useState } = React
const { alertUserResponse } = elements
const { flattenObject, labelsManager } = utils

const WrapperSearchForm = (props, context) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(undefined)

  useEffect(() => {
    getData()

    return () => {
      props.setSearchResult(undefined)
    }
  }, [])

  const onSubmit = (e) => {
    const { formConfig, setSearchResult } = props
    const searchConfig = formConfig?.search
    const searchType = searchConfig?.type || 'GET'
    const contentType = searchConfig?.contentType || 'application/x-www-form-urlencoded'
    const params = searchConfig?.params
    const url = searchConfig?.onSave
    const formData = e.formData
    if (params) {
      Object.assign(formData, { ...params })
    }
    const reqConfig = { method: searchType, url: `${window.server}${url}` }
    if (searchType === 'POST') {
      reqConfig.headers = { 'Content-Type': contentType }
      // #revise_me
      // Remove the flattenObject function once the sections are removed from the search forms
      reqConfig.data = flattenObject(formData)
    }
    setLoading(true)
    axios(reqConfig).then(res => {
      setLoading(false)
      if (res?.data) {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setSearchResult(res.data)
        } else if (res?.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setSearchResult(res.data.data)
        } else {
          if (res?.data && Array.isArray(res?.data)) {
            setSearchResult([])
          } else if (res?.data?.data && Array.isArray(res?.data?.data)) {
            setSearchResult([])
          } else {
            alertUserResponse({ response: res })
          }
        }
      }
    }).catch(err => {
      console.error(err)
      setLoading(false)
      alertUserResponse({ response: err })
    })
  }

  const getConfig = (key, name) => {
    const { formConfig } = props
    const config = formConfig?.[key]
    return {
      name,
      url: config.onSubmit,
      method: config.type,
      ...config.type === 'POST' && { data: config.params || {} },
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
      return await axios(reqConfig).then(response => ({ name, response: response?.data, })).catch(err => ({ name, response: { type: 'error', ...err?.response } }))
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

  const generateForm = () => {
    return (
      <GenericForm
        className='form-test custom-farm-registry-form aims-forms hide-all-form-legends'
        params='FORM_DATA'
        key='PERSON_REGISTRY_WRAPPER_SEARCH_FORM'
        id='PERSON_REGISTRY_WRAPPER_SEARCH_FORM'
        method={data.jsonSchema}
        uiSchemaConfigMethod={data.uiSchema}
        tableFormDataMethod={data.formData}
        addSaveFunction={(e) => onSubmit(e)}
        hideBtns='closeAndDelete'
        customSaveButtonName={labelsManager('search', context, 'farm_registry')}
        customSave
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

WrapperSearchForm.contextTypes = {
  intl: PropTypes.object.isRequired,
}

export default WrapperSearchForm
