import { React, axios, connect, ComponentManager, GenericGrid, GridManager, GenericForm, elements, Modal } from 'perun-core'
const { alertUser } = elements
class WizardWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 0,
      showModal: true,
      finalFormData: [],
      stateListTabels: '',
    }
  }

  componentDidMount = () => {
    let listTables = this.props.listTables
    this.setState({ personTypeState: listTables[0].personType })
    this.addPerson(listTables, '');
  }

  addPerson = (listTables, previousStepIndex) => {
    let elementArr = []
    let form
    let modalWrap
    let addCustomFunction
    let customSaveButtonName
    let formParams
    let tableFormDataMethod
    for (let i = 0; i < listTables.length; i++) {
      if (listTables[i].tableName) {
        if (i === 0) {
          addCustomFunction = ''
        }
        if (i !== 0 && i < listTables.length) {
          addCustomFunction = this.prevStep
        }
        if (previousStepIndex !== '') {
          formParams = 'FORM_DATA'
          tableFormDataMethod = this.state.list[previousStepIndex]
        } else {
          formParams = 'READ_URL'
          tableFormDataMethod = '/ReactElements/getTableFormData/%session/0/' + listTables[i].tableName
        }
        if (i === listTables.length - 1) {
          customSaveButtonName = this.context.intl.formatMessage({ id: 'perun.persons_registry.save', defaultMessage: 'perun.persons_registry.save' })
        } else {
          customSaveButtonName = this.context.intl.formatMessage({ id: 'perun.persons_registry.continue', defaultMessage: 'perun.persons_registry.continue' })
        }

        form = this.formFunction(listTables[i].tableName, listTables[i].personType, customSaveButtonName, addCustomFunction, formParams, tableFormDataMethod)

        modalWrap = <div>{<Modal modalTitle={listTables[i].label} closeModal={() => this.closeModalFn()} modalContent={form}></Modal>}</div>

        elementArr.push(modalWrap)
      }
    }
    this.setState({ generatedValues: elementArr })
  }

  formFunction = (tableName, personType, customSaveButtonName, addCustomFunction, formParams, tableFormDataMethod) => {
    let form = <GenericForm
      className={'form-test person-registry-forms'}
      params={formParams}
      key={tableName}
      id={tableName}
      method={'/ReactElements/getTableJSONSchema/%session/' + tableName}
      uiSchemaConfigMethod={'/SvPersonRegistry/getTableUISchemaPerson/%session/' + tableName + '/' + personType}
      tableFormDataMethod={tableFormDataMethod}
      addSaveFunction={this.nextStep}
      hideBtns={'closeAndDelete'}
      customSave={true}
      customSaveButtonName={customSaveButtonName}
      addCustomFunction={addCustomFunction}
      addCustomButtonName={this.context.intl.formatMessage({ id: 'perun.persons_registry.before', defaultMessage: 'perun.persons_registry.before' })}
      bypassInputChange={this.onChange}
    />

    return form;
  }
  onChange = (param) => {
    const { step, generatedValues } = this.state
    let listTablesData = param
    let listTablesDataArr = []
    let getTableName = this.props.listTables[step].tableName

    if (getTableName) {
      listTablesData['tableName'] = getTableName
    }

    if (step === 0 && !this.state.list) {
      listTablesDataArr.push(listTablesData)
      this.setState({ list: listTablesDataArr })
    } else {
      let list = [...this.state.list];
      // check if data for current form exists f.r
      if (list[step]) {
        // make copy to change data later
        let element = { ...list[step] };
        /* replace newData with old and write it into list - state*/
        element = listTablesData
        list[step] = element
        this.setState({ list });
      } else {
        listTablesDataArr.push(listTablesData)
        this.setState({ list: [...this.state.list, listTablesData] })
      }
    }
  }

  closeModalFn = () => {
    this.setState({ showModal: false })
    if (this.props.emptyWizardState) {
      this.props.emptyWizardState()
    }
  }

  nextStep = () => {
    const { step, generatedValues } = this.state

    if (step === generatedValues.length - 1) {
      this.saveFormData(this.state.list)
    } else {
      if (step >= 0) {
        this.setState({ step: step + 1 })
        this.addPerson(this.props.listTables, step + 1)
      } else {
        this.setState({ step: step + 1 })
      }
    }
  }

  saveFormData = (currentFormData) => {
    currentFormData[0].PERSON_TYPE = this.state.personTypeState
    let formsData = []
    formsData = currentFormData
    let restUrl = window.server + '/ReactElements/createTableRecordMultiStepForm/' + this.props.svSession + '/0'
    axios({
      method: 'post',
      data: formsData,
      url: restUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then((response) => {
      console.log(response)
      if (response.data) {
        console.log(response.data)
        const wrapper = document.createElement('div')
        if (response.data.data) {
          console.log(response.data.data)
          const paragraphDiv = document.createElement('div')
          paragraphDiv.setAttribute('id', 'paragraphDiv')
          paragraphDiv.style.cssText = 'background: #e0ab1040; padding:3px; box-shadow: 5px 5px 10px #b7b7b7; border:6px solid #f7eac3; margin-bottom:5px; border-radius: 5px;'

          const text = document.createElement('p')
          text.setAttribute('id', 'text')
          text.innerHTML = this.context.intl.formatMessage({ id: 'perun.persons_registry.preview_data', defaultMessage: 'perun.persons_registry.preview_data' })
          text.style.cssText = 'font-weight: bold; font-size: 1.2rem; color: #595959; margin:-1%; margin-bottom:2%; border-bottom: 2px solid #e0ab10;'
          paragraphDiv.appendChild(text)

          for (const [key, value] of Object.entries(response.data.data)) {
            console.log(response)
            if (key === 'FIRST_NAME' || key === 'LAST_NAME' || key === 'GENDER' || key === 'FULL_NAME') {
              const paragraph = document.createElement('div')
              paragraph.setAttribute('id', 'paragraph')
              let keyVal
              let val
              if (key === 'FIRST_NAME') {
                keyVal = 'Име:'
                paragraph.innerHTML = keyVal + ' ' + value
              }
              if (key === 'FULL_NAME') {
                keyVal = 'Име:'
                paragraph.innerHTML = keyVal + ' ' + value
              }
              if (key === 'LAST_NAME') {
                keyVal = 'Презиме:'
                paragraph.innerHTML = keyVal + ' ' + value
              }
              if (key === 'GENDER' && value === 'M') {
                keyVal = 'Пол:'
                val = 'Машко'
                paragraph.innerHTML = keyVal + ' ' + val
              }
              if (key === 'GENDER' && value === 'F') {
                keyVal = 'Пол:'
                val = 'Женско'
                paragraph.innerHTML = keyVal + ' ' + val
              }
              paragraphDiv.appendChild(paragraph)
            }
            wrapper.appendChild(paragraphDiv)
          }

          this.setState({ showModal: false })
          alertUser(true, response.data.type.toLowerCase(), response.data.message, null, null, null, null, null, null, null, null, null, wrapper)
          this.props.saveCallBackFunc(response.data.data.parent_id)
        }
      }
    })
      .catch((err) => {
        if (err.data) {
          if (err.data.type && err.data.message) {
            this.setState({ showModal: false })
            alertUser(true, err.data.type.toLowerCase(), err.data.message, null)
          }
        }
      })
  }

  prevStep = () => {
    const { step } = this.state
    this.setState({ step: step - 1 })
    this.addPerson(this.props.listTables, step - 1)
  }

  render() {
    const { step, generatedValues, showModal } = this.state
    return (
      <div>
        <div>
          {showModal && generatedValues && generatedValues[step]}
        </div>
      </div>
    )
  }
}


const mapStateToProps = state => ({
  svSession: state.security.svSession
})

export default connect(mapStateToProps)(WizardWrapper)
