import { React, PropTypes, ComponentManager, Loading, GenericForm, axios, connect, elements, redux, utils } from 'perun-core'
const { useEffect, useState } = React
const { alertUserResponse } = elements
const { store } = redux
const { labelsManager } = utils

const SearchForm = (props, context) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(undefined)

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    if (props.reloadSearchGrid) {
      onSubmit()
      store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-reload-search-grid', value: false } })
    }
  }, [props.reloadSearchGrid])

  const onSubmit = () => {
    store.dispatch({ type: 'UPDATE_SELECTED_GRID_ROWS', payload: [[], ''] })
    const formData = ComponentManager.getStateForComponent(props.searchFormId, 'formTableData')
    const { formConfig, setSearchResult } = props
    const searchConfig = formConfig?.searchForm
    const searchType = searchConfig?.save?.type || 'GET'
    const contentType = searchConfig?.save?.contentType || 'application/x-www-form-urlencoded'
    const params = searchConfig?.save?.params
    const url = searchConfig?.save?.onSave
    const data = Object.assign({}, formData)
    if (params) {
      Object.assign(data, { ...params })
    }
    const reqConfig = { method: searchType, url: `${window.server}${url}` }
    if (searchType === 'POST') {
      reqConfig.headers = { 'Content-Type': contentType }
      reqConfig.data = data
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
    const config = formConfig?.searchForm[key]
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
        className='form-test person-registry-forms admin-console-search-from person-registry-search-form'
        params='FORM_DATA'
        key={props.searchFormId}
        id={props.searchFormId}
        method={data.jsonSchema}
        uiSchemaConfigMethod={data.uiSchema}
        tableFormDataMethod={data.formData}
        addSaveFunction={onSubmit}
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

SearchForm.contextTypes = {
  intl: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
  reloadSearchGrid: state.businessLogicReducer?.['person-registry-module-reload-search-grid'],
})

export default connect(mapStateToProps)(SearchForm)
