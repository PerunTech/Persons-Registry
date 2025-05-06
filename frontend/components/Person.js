import { React, axios, connect, ComponentManager, GenericForm, PropTypes, elements, createHashHistory, Loading } from 'perun-core'
const { ReactBootstrap, alertUserResponse, alertUserV2 } = elements
import { iconManager } from '../assets/svg/svgHolder'
import { labelsManager } from '../utils/LabelsExport'
import { searchComponent, searchRender, searchResult } from './SearchComponent'
import { PersonIdNoFieldFormWrapper } from '../components/wrappers'
const { Modal } = ReactBootstrap;
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
      alertUserV2({
        type: 'info',
        title: labelsManager.importLabel('empty_field', p_r, th1s.context),
        message: labelsManager.importLabel('please_enter_filter', p_r, th1s.context)
      })
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

  savePerson = async (formData) => {
    let onConfirm = () => this.resetRegisterPersonFormSaveState();
    let form_params = formData;

    const personType = form_params.PERSON_TYPE || this.state.selectedPersonType;
    const nameP = `${form_params.FIRST_NAME}/${form_params.LAST_NAME}`.toUpperCase();
    const nameG = `${form_params.SHORT_NAME}/${form_params.NAME}`.toUpperCase();
    const name = personType === 'P' ? nameP : nameG;

    if (!form_params.PERSON_TYPE) {
      form_params.PERSON_TYPE = this.state.selectedPersonType;
    }
    if (form_params.FIRST_NAME && form_params.LAST_NAME) {
      form_params.FIRST_NAME = form_params.FIRST_NAME?.toUpperCase();
      form_params.LAST_NAME = form_params.LAST_NAME?.toUpperCase();
    }
    if (form_params.NAME) {
      form_params.NAME = form_params.NAME?.toUpperCase();
    }

    const url = `${window.server}/SvPersonRegistry/savePerson/${this.props.svSession}`;

    try {
      const response = await axios({
        method: 'post',
        data: encodeURIComponent(JSON.stringify(form_params)),
        url,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response?.data) {
        const resType = response.data?.type?.toLowerCase() || 'info';

        if (resType === 'success') {
          const objectId = response.data.data?.OBJECT_ID;
          onConfirm = () => this.redirectPerson(response.data, personType, name);
          alertUserResponse({ response: response.data, onConfirm });

          return objectId;
        }

        alertUserResponse({ response: response.data, onConfirm });
      }

      return null;
    } catch (err) {
      console.error(err);
      alertUserResponse({ response: err, onConfirm });
      return null;
    }
  };

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
        className={'form-test person-registry-forms person-registration-form-initial aims-forms'}
        inputWrapper={PersonIdNoFieldFormWrapper}
        isAddForm={true}
      />
    )

    const modal = (
      <Modal className={'person-registry-modal'} show onHide={() => this.closeModalFn()}>
        <Modal.Header className={'person-registry-modal-header'} closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={'person-registry-modal-body'}>
          {form}
        </Modal.Body>
        <Modal.Footer className={'person-registry-modal-footer'} />
      </Modal>
    )
    this.setState({ showModal: true, modal, selectedPersonType: personType })
  }

  render() {
    const { personsGrid, searchForm, showSearchForm, showModal, showPersonsGrid, modal } = this.state;
    const { loading } = this.props


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
            {loading && <Loading />}
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
  loading: state['person-registry.loading'].loading
})

Person.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(Person)
