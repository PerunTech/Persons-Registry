import { React, axios, connect, ComponentManager, GenericGrid, GridManager, PropTypes, elements, Modal, Form, Loading, createHashHistory } from 'perun-core'
const { alertUser } = elements
import { iconManager } from '../assets/svg/svgHolder'
import { labelsManager } from './components/LabelsExport'
import { axiosCall } from './components/AxiosCalls'
import { searchComponent, searchRender, searchResult } from './components/SearchComponent'

const dynamicKey = function () {
  return (+ new Date() + Math.floor(Math.random() * 999999)).toString(36)
}
const p_r = 'persons_registry'

class PersonWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showModal: '',
      showSearchForm: true,
      shoformis: false,
      showButtons: false,
      isLoading: false,
      jsonSchemaP: {},
      jsonSchemaG: {},
      jsonSchema: {},
      uiSchema: {},
      formData: {},
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
    this.getCustomFormJson()
    this.setState({ searchForm: searchRender(this.searchComponentParent, this.context) })
  }

  getCustomFormJson = () => {
    this.setState({ isLoading: <Loading /> })
    const { svSession } = this.props
    let personTypeP = window.server + '/SvPersonRegistry/getTableJSONSchemaPerson/' + svSession + '/PERSON/P'
    let personTypeG = window.server + '/SvPersonRegistry/getTableJSONSchemaPerson/' + svSession + '/PERSON/G'
    let urlArr = []
    urlArr.push(personTypeP, personTypeG)
    axiosCall(urlArr, svSession, this.responseAxios, 'get')
  }
  //used in dependency dropdown to get settlements based on municipality
  getSettlements = (municipality) => {
    const { svSession } = this.props
    const { jsonSchema, uiSchema, formData } = this.state
    // JSON schema stuff
    const newSchema = JSON.parse(JSON.stringify(jsonSchema))
    // UI schema stuff
    const newUiSchema = JSON.parse(JSON.stringify(uiSchema))
    newUiSchema.CITY_VILLAGE.classNames = 'hidden-field'
    // Form data stuff
    const newFormData = JSON.parse(JSON.stringify(formData))
    newFormData.CITY_VILLAGE = '/'
    // Getting the new dropdown data
    const dataObj = { FIELD_NAME: 'MUNIC_CODE', FIELD_VALUE: municipality }
    const data = new URLSearchParams()
    data.append('params', JSON.stringify(dataObj))
    const wsPath = `SvPersonRegistry/get/dependency-dropdown/location/sid/${svSession}`
    const url = `${window.server}/${wsPath}`
    const reqConfig = { method: 'post', url, data }
    axios(reqConfig).then(res => {
      if (res.data && Object.keys(res.data).length > 0) {
        const finalUiSchema = JSON.parse(JSON.stringify(newUiSchema))
        // This will remove the hidden-field className, i.e. it will display the CITY_VILLAGE field
        finalUiSchema.CITY_VILLAGE.classNames = ''

        const finalSchema = JSON.parse(JSON.stringify(newSchema))
        // Assign the dropdown values for the CITY_VILLAGE_FIELD
        finalSchema.properties.CITY_VILLAGE.enum = Object.keys(res.data)
        finalSchema.properties.CITY_VILLAGE.enumNames = Object.values(res.data)
        const cityFieldIndex = finalSchema.required?.indexOf('CITY')
        const cityVillageFieldIndex = finalSchema.required?.indexOf('CITY_VILLAGE')
        // Unset the CITY field as required
        if (cityFieldIndex > -1) {
          finalSchema.required.splice(cityFieldIndex, 1)
        }
        // Set the CITY_VILLAGE field as required
        if (cityVillageFieldIndex === -1) {
          finalSchema.required.push('CITY_VILLAGE')
        }
        this.setState({ jsonSchema: finalSchema, uiSchema: finalUiSchema, formData: newFormData })
      } else {
        this.setState({ jsonSchema: newSchema, uiSchema: newUiSchema, formData: newFormData })
      }
    }).catch(err => {
      console.error(err)
    })
  }

  //used in dependency dropdown to get municipalities based on country
  getMunicipalities = (country) => {
    const { svSession } = this.props
    const { jsonSchema, uiSchema, formData, selectedPersonType } = this.state
    // JSON schema stuff
    const newSchema = JSON.parse(JSON.stringify(jsonSchema))
    // UI schema stuff
    const newUiSchema = JSON.parse(JSON.stringify(uiSchema))
    if (!newUiSchema.MUNICIPALITY) {
      newUiSchema.MUNICIPALITY = {}
    }
    newUiSchema.MUNICIPALITY.classNames = 'hidden-field'
    newUiSchema.CITY_VILLAGE.classNames = 'hidden-field'
    // Form data stuff
    const newFormData = JSON.parse(JSON.stringify(formData))
    newFormData.MUNICIPALITY = '/'
    newFormData.CITY_VILLAGE = '/'
    // Getting the new dropdown data
    const dataObj = { FIELD_NAME: 'COUNTRY_CODE', FIELD_VALUE: country }
    const data = new URLSearchParams()
    data.append('params', JSON.stringify(dataObj))
    const wsPath = `SvPersonRegistry/get/dependency-dropdown/location/sid/${svSession}`
    const url = `${window.server}/${wsPath}`
    const reqConfig = { method: 'post', url, data }
    axios(reqConfig).then(res => {
      if (res.data && Object.keys(res.data).length > 0) {
        newFormData.CITY = undefined
        const finalUiSchema = JSON.parse(JSON.stringify(newUiSchema))
        // This will remove the hidden-field className, i.e. it will display the MUNICIPALITY field
        finalUiSchema.MUNICIPALITY.classNames = ''
        if (!finalUiSchema.CITY) {
          finalUiSchema.CITY = {}
        }
        // This will add the hidden-field className, i.e. it will hide the CITY field
        finalUiSchema.CITY.classNames = 'hidden-field'

        const finalSchema = JSON.parse(JSON.stringify(newSchema))
        finalSchema.properties.MUNICIPALITY.enum = Object.keys(res.data)
        finalSchema.properties.MUNICIPALITY.enumNames = Object.values(res.data)
        const cityFieldIndex = finalSchema.required?.indexOf('CITY')
        const municipalityFieldIndex = finalSchema.required?.indexOf('MUNICIPALITY')
        // Unset the CITY field as required
        if (cityFieldIndex > -1) {
          finalSchema.required.splice(cityFieldIndex, 1)
        }
        // Set the MUNICIPALITY field as required
        if (municipalityFieldIndex === -1) {
          finalSchema.required.push('MUNICIPALITY')
        }
        this.setState({ jsonSchema: finalSchema, uiSchema: finalUiSchema, formData: newFormData })
      } else {
        const finalSchema = JSON.parse(JSON.stringify(newSchema))
        // Reset the MUNICIPALITY and CITY_VILLAGE dropdown values
        finalSchema.properties.MUNICIPALITY.enum = ['/']
        finalSchema.properties.MUNICIPALITY.enumNames = ['/']
        finalSchema.properties.CITY_VILLAGE.enum = ['/']
        finalSchema.properties.CITY_VILLAGE.enumNames = ['/']
        const municipalityFieldIndex = finalSchema.required?.indexOf('MUNICIPALITY')
        // Unset the MUNICIPALITY field as required
        if (municipalityFieldIndex > -1) {
          finalSchema.required.splice(municipalityFieldIndex, 1)
        }
        const cityVillageFieldIndex = finalSchema.required?.indexOf('CITY_VILLAGE')
        // Unset the CITY_VILLAGE field as required
        if (cityVillageFieldIndex) {
          finalSchema.required.splice(cityVillageFieldIndex, 1)
        }
        const cityFieldIndex = finalSchema.required?.indexOf('CITY')
        // Set the CITY field as required
        if (cityFieldIndex === -1) {
          finalSchema.required.push('CITY')
        }
        const finalUiSchema = JSON.parse(JSON.stringify(newUiSchema))
        if (!finalUiSchema.CITY) {
          finalUiSchema.CITY = {}
        }
        // This will remove the hidden-field className, i.e. it will display the CITY field
        finalUiSchema.CITY.classNames = ''
        if (!finalUiSchema['ui:order']) {
          finalUiSchema['ui:order'] = []
        }
        // Set the order of the fields based on the selected person type
        if (selectedPersonType === 'P') {
          finalUiSchema['ui:order'] = [
            'ID_NO', 'COUNTRY_CODE', 'MUNICIPALITY', 'CITY_VILLAGE', 'CITY', 'ADDRESS',
            'DT_BIRTH_REG', 'FIRST_NAME', 'LAST_NAME', 'GENDER', 'PERSON_TYPE', 'PHONE_NUMBER', 'EMAIL'
          ]
        } else if (selectedPersonType === 'G') {
          finalUiSchema['ui:order'] = [
            'ID_NO', 'TAX_NO', 'NAME', 'COUNTRY_CODE', 'MUNICIPALITY', 'CITY_VILLAGE', 'CITY', 'ADDRESS',
            'DT_BIRTH_REG', 'SHORT_NAME', 'BUSINESS_STATUS', 'OWNERSHIP_TYPE', 'SUBJECT_SIZE', 'ORGANIZATIONAL_TYPE', 'PERSON_TYPE', 'PHONE_NUMBER', 'EMAIL'
          ]
        }
        this.setState({ jsonSchema: finalSchema, uiSchema: finalUiSchema, formData: newFormData })
      }
    }).catch(err => {
      console.error(err)
    })
  }

  onChange = ({ formData }) => {
    const { formData: formDataState } = this.state
    this.setState({ formData })
    if (formData.COUNTRY_CODE && formData.COUNTRY_CODE !== formDataState.COUNTRY_CODE) {
      this.getMunicipalities(formData.COUNTRY_CODE)
    } else if (formData.MUNICIPALITY && formData.MUNICIPALITY !== formDataState.MUNICIPALITY) {
      this.getSettlements(formData.MUNICIPALITY)
    }
  }

  responseAxios = (data, ln, i, personType) => {
    switch (data.type) {
      case 'SUCCESS': {
        if (personType) {
          switch (personType) {
            case 'P': {
              this.setState({ jsonSchemaP: data.data })
              break;
            }
            case 'G': {
              this.setState({ jsonSchemaG: data.data })
              break;
            }
          }
        }
        this.setState({ showButtons: true })
        break;
      }
      case 'ERROR': {
        this.setState({ isLoading: false })
        alertUser(true, data.type.toLowerCase(), data.message, data.message)
        break;
      }
      default: {
        alertUser(true, 'error', labelsManager.importLabel('error', p_r, this.context), labelsManager.importLabel('try_again_or_contact_admin', p_r, this.context))
        break;
      }
    }
    if (ln === i) {
      this.setState({ isLoading: false })
    }
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
    th1s.setState({ objectId, selectedPersonType })
    let href = '/main/persons-registry/person/' + objectId + '/' + selectedPersonType + '/' + personName
    this.hashHistory.push(href)
  }

  saveCallBackGridFunc = (parent_id) => {
    let dynamic_key = dynamicKey()
    let grid = <GenericGrid
      gridType={'READ_URL'}
      key={'PERSON_GRID' + parent_id + dynamic_key}
      id={'PERSON_GRID' + parent_id + dynamic_key}
      configTableName={'/ReactElements/getTableFieldList/%session/PERSON'}
      dataTableName={'/ReactElements/getRowDataByObjectId/%session/' + parent_id + '/PERSON'}
      onRowClickFunct={this.onPersonRowClick}
      defaultHeight={false}
      heightRatio={0.50}
    />

    ComponentManager.setStateForComponent('PERSON_GRID' + parent_id + dynamic_key, null, {
      onRowClickFunct: this.onPersonRowClick,
    })

    GridManager.reloadGridData('PERSON_GRID' + parent_id + dynamic_key)

    this.setState({ personsGrid: grid, showPersonsGrid: true, showSearchForm: true })
  }

  closeModalFn = () => {
    this.setState({ showModal: false, jsonSchema: {}, uiSchema: {}, formData: {} })
  }

  generatePerson = (_personType, modalTitle, personTypeShort) => {
    if (personTypeShort) {
      let uiSchema = {}, jsonSchema = {}, formData = {}
      switch (personTypeShort) {
        case 'P': {
          uiSchema = {
            PERSON_TYPE: { 'ui:widget': 'hidden' },
            CITY_VILLAGE: { 'classNames': 'hidden-field' },
            CITY: { 'classNames': 'hidden-field' }
          }
          jsonSchema = this.state.jsonSchemaP;

          if (Array.isArray(jsonSchema?.properties?.MUNICIPALITY?.enum)) {
            jsonSchema.properties.MUNICIPALITY.enum = jsonSchema.properties.MUNICIPALITY.enum.filter(v => v !== '/' && v !== '0');
          } else {
            jsonSchema.properties.MUNICIPALITY.enum = [];
            jsonSchema.properties.MUNICIPALITY.enumNames = [];
          }

          this.setState({ selectedPersonType: personTypeShort, jsonSchema, uiSchema, formData, modalTitle }, () => this.generateForm());
          break;
        }
        case 'G': {
          uiSchema = {
            PERSON_TYPE: { 'ui:widget': 'hidden' },
            CITY_VILLAGE: { 'classNames': 'hidden-field' },
            CITY: { 'classNames': 'hidden-field' }
          }
          jsonSchema = this.state.jsonSchemaG;

          if (Array.isArray(jsonSchema?.properties?.MUNICIPALITY?.enum)) {
            jsonSchema.properties.MUNICIPALITY.enum = jsonSchema.properties.MUNICIPALITY.enum.filter(v => v !== '/' && v !== '0');
          } else {
            jsonSchema.properties.MUNICIPALITY.enum = [];
            jsonSchema.properties.MUNICIPALITY.enumNames = [];
          }

          this.setState({ selectedPersonType: personTypeShort, jsonSchema, uiSchema, formData, modalTitle }, () => this.generateForm());
          break;
        }
        default: {
          jsonSchema = {}
          uiSchema = {}
          const errorLabel = labelsManager.importLabel('error', p_r, this.context)
          const tryAgainLabel = labelsManager.importLabel('try_again_or_contact_admin', p_r, this.context)
          alertUser(true, 'error', errorLabel, tryAgainLabel)
          break;
        }
      }
    }
  }

  generateForm = () => {
    this.setState({ showModal: true })
  }

  savePerson = (formData) => {
    let form_params = formData.formData
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
    let th1s = this
    axios({
      method: 'post',
      data: form_params,
      url: restUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function (response) {
      if (response.data) {
        if (response.data.type === 'ERROR' && response.data.title === 'Невалидна сесија') {
          alertUser(true, response.data.type.toLowerCase(), response.data.title, response.data.message)
          logOut()
        } else {
          th1s.setState({ selectedPersonType: '', objectId: '' })
          th1s.closeModalFn()
          // if (response.data.data.parent_id) {
          //   th1s.saveCallBackGridFunc(response.data.data.parent_id)
          // }
          alertUser(true, response.data.type.toLowerCase(), response.data.title, response.data.message)
        }
      }
    }).catch(function (error) {
      if (error) {
        if (error.response.data) {
          alertUser(true, 'error', error.response.data.title, error.response.data.message)
        }
      }
    })
  }

  render() {
    const { personsGrid, searchForm, showSearchForm, showModal, showButtons, isLoading, showPersonsGrid, modalTitle, jsonSchema, uiSchema, formData } = this.state;

    const form = (
      <Form
        schema={jsonSchema}
        uiSchema={uiSchema}
        formData={formData}
        onChange={this.onChange}
        onSubmit={this.savePerson}
        className={`form-test person-registry-forms person-registration-form`}
      >
        <div id="btnSeparator" style={{ width: 'auto', float: 'right' }}>
          <button id='submit_btn' type='submit' className={'btn-success btn_save_form'}> {labelsManager.importLabel('save', p_r, this.context)} </button>
        </div>
      </Form>
    )

    return (
      <React.Fragment>
        {isLoading}
        <div className='pr-holder '>
          <div id='btn_holder' className='pr-btn-holder'>
            {showButtons && <>
              <button id='P' onClick={() => this.generatePerson('PHYSICAL_ENTITY', this.context.intl.formatMessage({ id: 'perun.persons_registry.add_physical', defaultMessage: 'perun.persons_registry.add_physical' }), 'P')} className='pr-btn-reg'>{iconManager.getIcon('addPerson')} {labelsManager.importLabel('add_physical', p_r, this.context)} </button>
              <button id='G' onClick={() => this.generatePerson('LEGAL_ENTITY', this.context.intl.formatMessage({ id: 'perun.persons_registry.add_legal', defaultMessage: 'perun.persons_registry.add_legal' }), 'G')} className='pr-btn-reg'>{iconManager.getIcon('addPerson')} {labelsManager.importLabel('add_legal', p_r, this.context)} </button>
            </>
            }
          </div>
          <div id='content' className='pr-content'>
            {showSearchForm && searchForm}
            {(showPersonsGrid && personsGrid) && '* ' + labelsManager.importLabel('additional_info_select_row', p_r, this.context)}
            {showPersonsGrid && personsGrid}
            {showModal && (
              <Modal key={modalTitle} id={modalTitle} modalTitle={modalTitle} closeModal={() => this.closeModalFn()} modalContent={form} />
            )}
          </div>
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession,
})

PersonWrapper.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(PersonWrapper)
