import { React, axios, connect, ComponentManager, GenericForm, PropTypes, elements, Modal, createHashHistory } from 'perun-core'
const { alertUser } = elements
import { iconManager } from '../assets/svg/svgHolder'
import { labelsManager } from '../utils/LabelsExport'
import { searchComponent, searchRender, searchResult } from './SearchComponent'
import { PersonIdNoFieldFormWrapper } from '../components/wrappers'

const p_r = 'persons_registry'

class Person extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showModal: false,
      showSearchForm: true,
      formData: {},
      selectedPersonType: '',
    }
    this.hashHistory = createHashHistory()
  }

  /*  SEARCH BLOCK START */
  /* show search component on entering module f.r */
  componentDidMount() {
    if (document.getElementById('identificationScreen')) {
      document.getElementById('identificationScreen').className = 'identificationScreen'
      document.getElementById('identificationScreen').innerText = this.context.intl.formatMessage({ id: 'perun.plugin.persons_registry', defaultMessage: 'perun.plugin.persons_registry' })
    }
    this.setState({ searchForm: searchRender(this.searchComponentParent, this.context, PersonIdNoFieldFormWrapper) })
  }

  callBack = (formData) => {
    let th1s = this
    if (formData == 'inside_error') {
      alertUser(true, 'info', labelsManager.importLabel('empty_field', p_r, th1s.context), labelsManager.importLabel('please_enter_filter', p_r, th1s.context))
      th1s.setState({ showPersonsGrid: false })
    } else {
      let name, taxNo, idNo
      if (th1s.state.NAME) {
        name = th1s.state.NAME
      }
      if (th1s.state.TAX_NO) {
        taxNo = th1s.state.TAX_NO
      }
      if (th1s.state.ID_NO) {
        idNo = th1s.state.ID_NO
      }
      let gridId = 'PERSON_GRID_'
      let customHeight = '0.57'
      let grid = searchResult(gridId, formData, this.onPersonRowClick, customHeight)
      th1s.setState({
        personsGrid: grid,
        showPersonsGrid: true,
        showSearchForm: true
      })
    }
  }

  searchComponentParent = (formData, form) => {
    let object = formData.formData
    for (const property in object) {
      this.setState({ [property]: object[property] })
    }
    const { svSession } = this.props
    searchComponent(formData, form, this.callBack, svSession)
  }

  /* on row selection show both forms for person_registry table and physical or legal entity, 
    depending od the person type f.r */
  onPersonRowClick = (gridId, _rowId, row) => {
    let th1s = this
    let tableName = gridId.split('_')[0]
    let objectId = row[`${tableName}.OBJECT_ID`]
    let selectedPersonType = row[`${tableName}.PERSON_TYPE`]
    let personName = row[`${tableName}.NAME`]
    let encodedPersonName = encodeURIComponent(personName).replace(/%20/g, '_');
    th1s.setState({ objectId, selectedPersonType })
    let href = '/main/persons-registry/person/' + objectId + '/' + selectedPersonType + '/' + encodedPersonName + '/editPerson'
    this.hashHistory.push(href)
  }

  closeModalFn = () => {
    this.setState({ showModal: false, modal: undefined })
  }

  resetRegisterPersonFormSaveState = () => {
    ComponentManager.setStateForComponent('REGISTER_PERSON_FORM', null, { saveExecuted: false })
  }

  savePerson = (formData) => {
    let form_params = formData.formData
    let personType = form_params.PERSON_TYPE || this.state.selectedPersonType
    const nameP = `${form_params.FIRST_NAME}/${form_params.LAST_NAME}`.toUpperCase()
    const nameG = `${form_params.SHORT_NAME}/${form_params.NAME}`.toUpperCase()
    const name = personType === 'P' ? nameP : nameG;
    if (!form_params.PERSON_TYPE) {
      form_params.PERSON_TYPE = this.state.selectedPersonType
    }
    if (form_params.FIRST_NAME && form_params.LAST_NAME) {
      form_params.FIRST_NAME = form_params.FIRST_NAME?.toUpperCase()
      form_params.LAST_NAME = form_params.LAST_NAME?.toUpperCase()
    }
    if (form_params.NAME) {
      form_params.NAME = form_params.NAME?.toUpperCase()
    }

    let restUrl = window.server + '/SvPersonRegistry/savePerson/' + this.props.svSession
    axios({
      method: 'post',
      data: form_params,
      url: restUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then((response) => {
      if (response.data) {
        if (response.data.type === 'ERROR' && response.data.title === 'Невалидна сесија') {
          alertUser(true, response.data.type.toLowerCase(), response.data.title, response.data.message)
          logOut()
        } else {
          alertUser(true, response.data.type.toLowerCase(), response.data.title, response.data.message, () => this.resetRegisterPersonFormSaveState())
          if (response.data.type === 'SUCCESS') {
            this.setState({ selectedPersonType: '', objectId: '' })
            this.closeModalFn()
            alertUser(true, response.data.type.toLowerCase(), response.data.title, response.data.message, () => this.redirectPerson(response.data, personType, name))
          }
        }
      }
    }).catch((err) => {
      console.error(err)
      const title = err.response?.data?.title || err
      const msg = err.response?.data?.message || ''
      alertUser(true, 'error', title, msg, () => this.resetRegisterPersonFormSaveState());
    })
  }

  redirectPerson = (formParams, personType, name) => {
    const objectId = formParams.data.OBJECT_ID || formParams.data.object_id
    const href = `/main/persons-registry/person/${objectId}/${personType}/${name}/editPerson`
    this.hashHistory.push(href)
  }

  generatePersonRegistrationForm = (personType) => {
    const addPhysicalLabel = this.context.intl.formatMessage({ id: 'perun.persons_registry.add_physical', defaultMessage: 'perun.persons_registry.add_physical' })
    const addLegalLabel = this.context.intl.formatMessage({ id: 'perun.persons_registry.add_legal', defaultMessage: 'perun.persons_registry.add_legal' })
    const modalTitle = personType === 'P' ? addPhysicalLabel : addLegalLabel
    const form = (
      <GenericForm
        params={"READ_URL"}
        key={`REGISTER_PERSON_FORM`}
        id={`REGISTER_PERSON_FORM`}
        method={`/SvPersonRegistry/getTableJSONSchemaPerson/${this.props.svSession}/PERSON/${personType}`}
        uiSchemaConfigMethod={`/SvPersonRegistry/getTableUISchemaPerson/${this.props.svSession}/PERSON/${personType}`}
        tableFormDataMethod={`/SvPersonRegistry/getPerson/${this.props.svSession}/0/${personType}`}
        addSaveFunction={this.savePerson}
        hideBtns={'closeAndDelete'}
        className={'form-test person-registry-forms person-registration-form'}
        inputWrapper={PersonIdNoFieldFormWrapper}
      />
    )

    const modal = <Modal key={modalTitle} id={modalTitle} modalTitle={modalTitle} closeModal={() => this.closeModalFn()} modalContent={form} />
    this.setState({ showModal: true, modal, selectedPersonType: personType })
  }

  render() {
    const { personsGrid, searchForm, showSearchForm, showModal, showPersonsGrid, modal } = this.state;

    return (
      <React.Fragment>
        <div className='pr-holder '>
          <div id='btn_holder' className='pr-btn-holder'>
            <>
              <button id='P' onClick={() => this.generatePersonRegistrationForm('P')} className='pr-btn-reg'>{iconManager.getIcon('IDENTITY_DATA')} {labelsManager.importLabel('add_physical', p_r, this.context)} </button>
              <button id='G' onClick={() => this.generatePersonRegistrationForm('G')} className='pr-btn-reg'>{iconManager.getIcon('IDENTITY_DATA')} {labelsManager.importLabel('add_legal', p_r, this.context)} </button>
            </>
          </div>
          <div id='content' className='pr-content'>
            {showSearchForm && searchForm}
            {(showPersonsGrid && personsGrid) && '* ' + labelsManager.importLabel('additional_info_select_row', p_r, this.context)}
            {showPersonsGrid && personsGrid}
            {showModal && modal}
          </div>
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession,
})

Person.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(Person)
