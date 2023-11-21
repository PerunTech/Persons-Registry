import { React, ComponentManager } from 'perun-core'

const { useEffect } = React

const ModifyAuthrorizedPersonFormWrapper = (props) => {
  useEffect(() => {
    hideFiscalCodeInput()
  }, [])

  const hideFiscalCodeInput = () => {
    const formData = ComponentManager.getStateForComponent(props.formid, 'formTableData')
    const uiSchema = ComponentManager.getStateForComponent(props.formid, 'uischema')
    if (!uiSchema.TAX_NO) {
      uiSchema.TAX_NO = {}
      uiSchema.TAX_NO = { 'ui:widget': 'hidden' }
    }
    formData.PERSON_TYPE = 'P'
    ComponentManager.setStateForComponent(props.formid, 'uischema', uiSchema)
    ComponentManager.setStateForComponent(props.formid, 'formTableData', formData)
    props.formInstance.setState({ uischema: uiSchema })
    props.formInstance.setState({ formTableData: formData })
  }

  return (
    <>
      {props.children}
    </>
  )
}

export default ModifyAuthrorizedPersonFormWrapper