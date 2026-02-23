import { React, Loading, GenericForm, axios, elements } from 'perun-core'
const { useEffect, useState } = React
const { alertUserResponse } = elements

const ActionForm = (props) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(undefined)

  useEffect(() => {
    getData()
  }, [])

  const getConfig = (key, name) => {
    const { formConfig } = props
    const config = formConfig?.form?.[key]
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
        className='form-test custom-farm-registry-form aims-forms hide-initial-form-legend'
        params='FORM_DATA'
        key='PERSON_REGISTRY_ACTION_FORM'
        id='PERSON_REGISTRY_ACTION_FORM'
        method={data.jsonSchema}
        uiSchemaConfigMethod={data.uiSchema}
        tableFormDataMethod={data.formData}
        addSaveFunction={(e) => props.executeAction(e)}
        hideBtns='closeAndDelete'
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

export default ActionForm
