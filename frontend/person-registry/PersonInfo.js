import { React, axios, connect, ComponentManager, GenericGrid, GridManager, GenericForm, elements, Modal, Form, Loading, createHashHistory, PropTypes } from 'perun-core'
const { alertUser, Dropdown } = elements
import { iconManager } from '../assets/svg/svgHolder'
import { labelsManager } from './components/LabelsExport'
import { searchRender, searchComponent, searchResult } from './components/SearchComponent'
import { logOut } from './components/LogOut'
import EditForm from './EditForm'
import Address from './Address/Address'
import { CombineAuthorizedPersonFormWrappers } from './wrappers'
let arrOfGrids = []
const p_r = 'persons_registry'
class PersonInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      dataToRender: [],
      jsonSchemaP: {},
      jsonSchemaG: {},
      jsonSchema: {},
      uiSchema: {},
      formData: {},
      activeTab: 'editPerson',
      active: 'editPerson',
      defaultCountry: ''

    }
    this.hashHistory = createHashHistory()
  }
  componentDidMount() {
    if (this.props.match) {
      if (this.props.match.params) {
        const { objId, personType, component, name } = this.props.match.params
        this.setState({ selectedPersonType: personType, objectId: objId })
        this.setState({ activeTab: component })
        if (component === 'editPerson' || component === 'address') {
          this.setState({ active: component })

        } else {
          this.additionalInfo(component)
        }
        this.formatNameFromParams(name)
      }
    }
    let url = window.server + `/WsConf/params/get/sys/DEFAULT_COUNTRY`
    axios.get(url).then(res => {
      if (res.data.VALUE) {
        this.setState({ defaultCountry: res.data.VALUE })
      }
    })
  }
  componentWillUnmount() {
    arrOfGrids.map(el => {
      ComponentManager.cleanComponentReducerState(el);
    })
    arrOfGrids = []
  }
  formatNameFromParams = (name) => {
    let formatedName = name.replace(/_/g, ' ');
    this.setPersonName(formatedName)
  }
  setPersonName = (fullname, first, last,) => {
    let name
    if (first && last) {
      name = first + " " + last
    } else {
      name = fullname
    }
    this.setState({ entityName: name })
  }
  /*  
  Used to save  custom jsonSchemas for further usage
  */
  /*
 Used as a button function located in the side menu used to generate diffrent <GenericGrid/> components based on current case
   */

  additionalInfo = (infoType) => {
    const objectId = this.props.match.params.objId
    if (infoType) {
      switch (infoType) {
        case 'bankAcc': {
          let obj = [
            {
              "name": `${labelsManager.importLabel('edit', p_r, this.context)}`,
              "action": () => this.manageSave('edit', gridId),
              "id": "editBtn"
            }, {
              "name": `${labelsManager.importLabel('status', p_r, this.context)}`,
              "action": () => this.manageSave('change_status', gridId),
              "id": "changeStatusBtn"
            }]
          let gridId = 'BANKACC'
          let grid = <GenericGrid
            gridType={'READ_URL'}
            key={gridId + objectId}
            id={gridId + objectId}
            configTableName={'/ReactElements/getTableFieldList/%session/' + gridId}
            dataTableName={'/ReactElements/getObjectsByParentId/%session/' + objectId + '/' + gridId + '/10000'}
            onRowClickFunct={this.rowClickFunction}
            heightRatio={0.58}
            toggleCustomButton={true}
            customButton={() => this.manageSave('add', gridId)}
            customButtonLabel={labelsManager.importLabel('add', p_r, this.context)}
            buttonsArray={obj}

          />
          arrOfGrids.push(`${gridId}${objectId}`)
          ComponentManager.setStateForComponent(gridId + objectId, null, {
            onRowClickFunct: this.rowClickFunction,
            customButton: () => this.manageSave('add', gridId),
            buttonsArray: obj,
            rowClicked: undefined
          })
          this.setState({ additionalInfoRender: grid, active: undefined, contactObjId: '', linkTypeObjId: '', linkType: '', respPersonName: '', objTypeId: '', bankStatus: '' })
          break;
        }
        case 'authorizedPerson': {
          this.setState({ bankObjId: '', contactObjId: '', linkTypeObjId: '', linkType: '', respPersonName: '', objTypeId: '', bankStatus: '' })
          this.generateSearch()
          break;
        }
        case 'showAuthC': {
          let grid = <GenericGrid
            gridType={'READ_URL'}
            key={'RESPONSIBLE_PERSON' + objectId}
            id={'RESPONSIBLE_PERSON' + objectId}
            configTableName={'/SvPersonRegistry/getTableFieldListForResponsiblePersons/%session'}
            dataTableName={'/SvPersonRegistry/getResponsiblePersons/%session/' + objectId + '/' + false}
            onRowClickFunct={this.getRespPersonOnRowClick}
            heightRatio={0.58}
            toggleCustomButton={true}
            customButton={() => this.manageSave('delete')}
            customButtonLabel={labelsManager.importLabel('delete', p_r, this.context)}
          />
          arrOfGrids.push(`${'RESPONSIBLE_PERSON'}${objectId}`)
          ComponentManager.setStateForComponent('RESPONSIBLE_PERSON' + objectId, null, {
            onRowClickFunct: this.getRespPersonOnRowClick,
            customButton: () => this.manageSave('delete'),
            rowClicked: undefined
          })
          this.setState({ additionalInfoRender: grid, active: undefined, bankObjId: '', contactObjId: '', objTypeId: '', bankStatus: '' })
          break;
        }
        case 'showAuthP': {
          let grid = <GenericGrid
            gridType={'READ_URL'}
            key={'RESPONSIBLE_PERSON' + objectId}
            id={'RESPONSIBLE_PERSON' + objectId}
            configTableName={'/SvPersonRegistry/getTableFieldListForResponsiblePersons/%session'}
            dataTableName={'/SvPersonRegistry/getResponsiblePersons/%session/' + objectId + '/' + true}
            onRowClickFunct={this.getRespPersonOnRowClick}
            heightRatio={0.58}
            toggleCustomButton={true}
            customButton={() => this.manageSave('delete')}
            customButtonLabel={labelsManager.importLabel('delete', p_r, this.context)}
          />
          arrOfGrids.push(`${'RESPONSIBLE_PERSON'}${objectId}`)
          ComponentManager.setStateForComponent('RESPONSIBLE_PERSON' + objectId, null, {
            onRowClickFunct: this.getRespPersonOnRowClick,
            customButton: () => this.manageSave('delete'),
            rowClicked: undefined
          })
          this.setState({ additionalInfoRender: grid, active: undefined, bankObjId: '', contactObjId: '', objTypeId: '', bankStatus: '' })
          break;
        }
        case 'idData': {
          let gridId = 'IDENTITY_DATA'
          let obj = [
            {
              "name": `${labelsManager.importLabel('edit', p_r, this.context)}`,
              "action": () => this.manageSave('edit', gridId),
              "id": "editBtnContact"
            }, {
              "name": `${labelsManager.importLabel('delete', p_r, this.context)}`,
              "action": () => this.deleteIdData(`${gridId}${objectId}`),
              "id": "deleteIdData"
            }
          ]
          let grid = <GenericGrid
            gridType={'READ_URL'}
            key={gridId + objectId}
            id={gridId + objectId}
            configTableName={'/ReactElements/getTableFieldList/%session/' + gridId}
            dataTableName={'/ReactElements/getObjectsByParentId/%session/' + objectId + '/' + gridId + '/10000/PKID'}
            onRowClickFunct={this.rowClickFunction}
            heightRatio={0.58}
            toggleCustomButton={true}
            customButton={() => this.manageSave('add', gridId)}
            customButtonLabel={labelsManager.importLabel('add', p_r, this.context)}
            buttonsArray={obj}
            refreshData={true}
          />
          arrOfGrids.push(`${gridId}${objectId}`)
          ComponentManager.setStateForComponent(gridId + objectId, null, {
            onRowClickFunct: this.rowClickFunction,
            customButton: () => this.manageSave('add', gridId),
            buttonsArray: obj,
            rowClicked: undefined
          })
          this.setState({ additionalInfoRender: grid, active: undefined, bankObjId: '', linkTypeObjId: '', linkType: '', respPersonName: '' })
          break;
        }
        case 'pureRender': {
          this.setState({ additionalInfoRender: this.state.pureRender, renderForm: false })
          break;
        }
        default: {
          break;
        }
      }
    }
  }
  /*
  Used to change the contact status to DELETED using a simple condition that checks bankStatus === 'DELETED' if this is false the status of the selected contact will be set to DELETED
  by making a POST request to   window.server + `/ReactElements/changeStatus/${svSession}`
  */
  changeStatusContact = () => {
    let th1s = this
    let { svSession } = th1s.props
    let { contactObjId, objTypeId, objectId, bankStatus } = th1s.state
    if (contactObjId && objTypeId) {
      alertUser(true, 'info',
        labelsManager.importLabel('delete_contact', p_r, th1s.context),
        labelsManager.importLabel('confirm_delete_contact', p_r, th1s.context),
        () => {
          if (bankStatus === 'DELETED') {
            alertUser(true, 'info', labelsManager.importLabel('status_deleted', p_r, th1s.context), labelsManager.importLabel('contact_is_deleted', p_r, th1s.context))
          } else {
            let restUrl = window.server + `/ReactElements/changeStatus/${svSession}`
            let valueToSend = { "objectId": contactObjId, "objectTypeId": objTypeId, "status": 'DELETED' }
            axios({
              method: 'post',
              data: valueToSend,
              url: restUrl,
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then((response) => {
              if (response.data) {
                GridManager.reloadGridData('SVAROG_CONTACT_DATA' + objectId)
                th1s.setState({ objTypeId: '', contactObjId: '', bankStatus: '' })
                alertUser(true, response.data.type.toLowerCase(), response.data.title, response.data.message)
              }
            }).catch((err) => {
              if (err.data) {
                th1s.setState({ objTypeId: '', contactObjId: '', bankStatus: '' })
                alertUser(true, err.data.type.toLowerCase(), err.data.title, err.data.message)
              }
            })
          }
        }, null, true,
        labelsManager.importLabel('delete', p_r, th1s.context),
        labelsManager.importLabel('cancel', p_r, th1s.context)
      )
    } else {
      alertUser(true, 'info', labelsManager.importLabel('no_selection', p_r, th1s.context), labelsManager.importLabel('choose_selection', p_r, th1s.context))
    }
  }

  getRespPersonOnRowClick = (_id, _idx, row) => {
    let linkTypeObjId = row['PERSON.OBJECT_ID']
    let linkType = row['LINK_TYPE']
    let respPersonName = row['PERSON.NAME']
    this.setState({ linkTypeObjId, linkType, respPersonName })
  }

  responseAxios = (response) => {
    if (response.data.data.length > 0) {
      let showDropdown = <Dropdown
        id={'setAuthPerson'}
        name={'setAuthPerson'}
        onChange={this.onChange}
        className={'pr-drop-down'}
        options={response.data.data}
      />
      this.generateModal(showDropdown)
    }
  }

  generateSearch = () => {
    let showAddAuthPerson = []
    let title = <div>{labelsManager.importLabel('please_search_person', p_r, this.context)}</div>
    let form = searchRender(this.searchComponentParent, this.context, CombineAuthorizedPersonFormWrappers)
    showAddAuthPerson.push(title, form)
    this.setState({ additionalInfoRender: showAddAuthPerson, active: undefined, pureRender: showAddAuthPerson })
  }

  searchComponentParent = (formData, form) => {
    let object = formData.formData
    for (const property in object) {
      this.setState({ [property]: object[property] })
    }
    const { svSession } = this.props
    searchComponent(formData, form, this.callBack, svSession)
  }

  callBack = (formData) => {
    let th1s = this
    if (formData == 'inside_error') {
      alertUser(true, 'info', labelsManager.importLabel('empty_field', p_r, th1s.context), labelsManager.importLabel('please_enter_filter', p_r, th1s.context))
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
      let grid = searchResult(gridId, formData, th1s.onPersonRowClick, 0.5)
      let title = <div>{labelsManager.importLabel('please_choose_person', p_r, th1s.context)}</div>
      let arr = []
      arr.push(title, grid)
      // remove the last element of state if the array have already rendered grid
      let arrayOfState = th1s.state.additionalInfoRender
      if (arrayOfState.length >= 3) {
        arrayOfState.splice(-1, 1)
        th1s.setState({ additionalInfoRender: [...arrayOfState, arr] })
      } else {
        th1s.setState(previousState => ({
          additionalInfoRender: [...previousState.additionalInfoRender, arr]
        }));
      }
    }
  }

  saveAuthPerson = () => {
    const { svSession } = this.props
    if (this.state.objectId && this.state.setAuthPerson) {
      const { objectId, objectIdF, setAuthPerson } = this.state
      let params = { 'objId1': objectIdF, 'objId2': objectId, 'linkName': setAuthPerson }
      const url = window.server + '/SvPersonRegistry/linkTwoPersons/' + svSession
      axios({
        method: 'post',
        url: url,
        data: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
        .then(this.responseAuth)
        .catch(err => {
          console.error(err)
          const title = err.response?.data?.title || err
          const msg = err.response?.data?.message || ''
          alertUser(true, "error", title, msg);
        });
    } else {
      alertUser(true, 'info', labelsManager.importLabel('missing_dd_value', p_r, this.context), labelsManager.importLabel('please_choose_dd', p_r, this.context))
    }
  }

  responseAuth = (data) => {
    const { objectId } = this.state
    if (data.data.type) {
      GridManager.reloadGridData('RESPONSIBLE_PERSON' + objectId)
      this.setState({ additionalInfoRender: '', initial: false, objectIdF: '', nameAuth: '', setAuthPerson: '', showModal: '' }, () => this.additionalInfo('pureRender'))
      alertUser(true, data.data.type.toLowerCase(), data.data.title, data.data.message)
    } else {
      alertUser(true, 'error', labelsManager.importLabel('error', p_r, this.context), labelsManager.importLabel('try_again_or_contact_admin', p_r, this.context))
    }
  }

  onPersonRowClick = (gridId, _rowId, row) => {
    const { svSession } = this.props
    let tableName = gridId.split('_')[0]
    let objectIdF = row[`${tableName}.OBJECT_ID`]
    let nameAuth = row[`${tableName}.NAME`]
    let selectedPersonTypeP = row['PERSON.PERSON_TYPE']
    if (selectedPersonTypeP === 'P') {
      this.setState({ objectIdF, nameAuth }, () => {
        const url = window.server + '/SvPersonRegistry/getLinkTypeOptions/' + svSession
        axios({
          method: 'get',
          url: url,
        })
          .then(this.responseAxios)
          .catch(err => {
            console.error(err)
            const title = err.response?.data?.title || err
            const msg = err.response?.data?.message || ''
            alertUser(true, "error", title, msg);
          });
      });
    } else {
      this.setState({ objectIdF: '', nameAuth: '' })
      alertUser(true, 'info', labelsManager.importLabel('legal_selected', p_r, this.context), labelsManager.importLabel('please_choose_physical', p_r, this.context))
    }
  }

  onChange = (e) => {
    this.setState({ [e.target.id]: e.target.value })
  }

  generateModal = (dropdown) => {
    let modalContent = <React.Fragment>
      <div>{labelsManager.importLabel('your_selection', p_r, this.context)} {this.state.nameAuth}</div>
      <div id='dropTitle' className='pr-drop-down-title'> {labelsManager.importLabel('connection_type', p_r, this.context)} </div>
      {dropdown}
    </React.Fragment>
    this.setState({
      showModal: <Modal
        key={this.state.nameAuth}
        id={this.state.nameAuth}
        modalTitle={labelsManager.importLabel('connect_persons', p_r, this.context)}
        closeModal={() => this.closeModalFn('clearConnection')}
        modalContent={modalContent}
        submitAction={this.saveAuthPerson}
        closeAction={() => this.closeModalFn('clearConnection')}
        nameCloseBtn={labelsManager.importLabel('cancel', p_r, this.context)}
        nameSubmitBtn={labelsManager.importLabel('connect', p_r, this.context)}
      />
    })
  }

  rowClickFunction = (id, _idx, row) => {
    // fn that matches the letters in the string excluding numbers and join the created array with "_" into single string
    let removeNumber = id.match(/[a-zA-Z]+/g).join('_')
    if (removeNumber === 'BANKACC') {
      this.setState({ bankObjId: row['BANKACC.OBJECT_ID'], status: row['BANKACC.STATUS'] })
    } else if (removeNumber === 'SVAROG_CONTACT_DATA') {
      this.setState({ contactObjId: row['SVAROG_CONTACT_DATA.OBJECT_ID'], objTypeId: row['SVAROG_CONTACT_DATA.OBJECT_TYPE'], bankStatus: row['SVAROG_CONTACT_DATA.STATUS'] })
    } else if (removeNumber === 'IDENTITY_DATA') {
      this.setState({ idDataId: row['IDENTITY_DATA.OBJECT_ID'], idDataType: row['IDENTITY_DATA.OBJECT_TYPE'] })
    }
  }

  savePerson = (formData) => {
    this.setState({ active: undefined })
    let form_params = formData.formData
    this.setPersonName(form_params.NAME, form_params.FIRST_NAME, form_params.LAST_NAME)
    if (!form_params.PERSON_TYPE) {
      form_params.PERSON_TYPE = this.state.selectedPersonType
    }
    if (form_params.FIRST_NAME && form_params.LAST_NAME) {
      form_params.FIRST_NAME = form_params.FIRST_NAME?.toUpperCase()
      form_params.LAST_NAME = form_params.LAST_NAME?.toUpperCase()
    }
    const url = window.server + '/SvPersonRegistry/savePerson/' + this.props.svSession;
    axios({
      method: 'post',
      url: url,
      data: form_params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
      .then(res => {
        alertUser(true, res.data.type.toLowerCase(), res.data.title, res.data.message)
        this.setState({ additionalInfoRender: '', active: 'editPerson' })
      })
      .catch(err => {
        console.error(err)
        const title = err.response?.data?.title || err
        const msg = err.response?.data?.message || ''
        alertUser(true, "error", title, msg);
      });
  }
  //reusable button function used to define button label and  button action based on the saveType
  manageSave = (saveType, gridId) => {
    const { bankObjId, contactObjId, status, idDataId } = this.state
    let tableFormDataMethod
    let customSaveButtonName
    let modalTitle
    let generateModal = true
    let hideBtns = 'closeAndDelete'
    switch (saveType) {
      case 'add': {
        tableFormDataMethod = '/ReactElements/getTableFormData/%session/0/' + gridId
        customSaveButtonName = labelsManager.importLabel('add', p_r, this.context)
        if (gridId === 'BANKACC') {
          modalTitle = labelsManager.importLabel('add_bank_acc', p_r, this.context)
        } else if (gridId === 'SVAROG_CONTACT_DAT') {
          modalTitle = labelsManager.importLabel('contact', p_r, this.context)
        } else if (gridId === 'IDENTITY_DATA') {
          modalTitle = labelsManager.importLabel('id_data', p_r, this.context)
        }
        break;
      }
      case 'edit': {
        switch (gridId) {
          case 'BANKACC': {
            if (bankObjId) {
              tableFormDataMethod = '/ReactElements/getTableFormData/%session/' + bankObjId + '/' + gridId
              customSaveButtonName = labelsManager.importLabel('edit', p_r, this.context)
              modalTitle = labelsManager.importLabel('edit_bank_acc', p_r, this.context)
              hideBtns = 'closeAndDelete'
            } else {
              generateModal = false
              this.alertInfo()
            }
            break;
          }
          case 'SVAROG_CONTACT_DATA': {
            if (contactObjId) {
              tableFormDataMethod = '/ReactElements/getTableFormData/%session/' + contactObjId + '/' + gridId
              customSaveButtonName = labelsManager.importLabel('edit', p_r, this.context)
              modalTitle = labelsManager.importLabel('edit_contact_data', p_r, this.context)
              hideBtns = 'closeAndDelete'
            } else {
              generateModal = false
              this.alertInfo()
            }
          }
            break;
          case 'IDENTITY_DATA': {
            if (idDataId) {
              tableFormDataMethod = '/ReactElements/getTableFormData/%session/' + idDataId + '/' + gridId
              customSaveButtonName = labelsManager.importLabel('edit', p_r, this.context)
              modalTitle = labelsManager.importLabel('edit_id_data', p_r, this.context)
              hideBtns = 'closeAndDelete'
            }
            else {
              generateModal = false
              this.alertInfo()
            }
          }
            break;
        }
        break;
      }
      case 'delete': {
        generateModal = false
        const { linkTypeObjId, linkType, respPersonName, objectId } = this.state
        const { svSession } = this.props
        if (this.state.linkTypeObjId && this.state.linkType && this.state.respPersonName) {
          let params
          if (this.props.match.params.personType === 'G') {
            params = { 'objectId1': linkTypeObjId, 'objectType1': 'PERSON', 'objectId2': objectId, 'objectType2': 'PERSON', 'linkType': linkType }
          } else {
            params = { 'objectId1': objectId, 'objectType1': 'PERSON', 'objectId2': linkTypeObjId, 'objectType2': 'PERSON', 'linkType': linkType }
          }
          const url = window.server + '/ReactElements/deleteLinkObject/' + svSession;
          this.setState({ isLoading: true })
          alertUser(true, 'info', `${labelsManager.importLabel('your_selection', p_r, this.context)} ${respPersonName}`, labelsManager.importLabel('delete_connect', p_r, this.context), () => {
            axios({
              method: 'post',
              url: url,
              data: params,
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            })
              .then(this.deleteConnCallback)
              .catch(err => {
                console.error(err)
                const title = err.response?.data?.title || err
                const msg = err.response?.data?.message || ''
                alertUser(true, "error", title, msg);
                this.setState({ isLoading: false })
              });
          }, null, true, labelsManager.importLabel('delete', p_r, this.context), labelsManager.importLabel('cancel', p_r, this.context))
        } else {
          alertUser(true, 'info', labelsManager.importLabel('no_selection', p_r, this.context), labelsManager.importLabel('choose_selection', p_r, this.context))
          this.setState({ isLoading: false })
        }
        break;
      }
      case 'change_status': {
        generateModal = false
        if (bankObjId && status) {
          let th1s = this
          alertUser(true, 'info',
            labelsManager.importLabel('change_status_bank', p_r, th1s.context),
            labelsManager.importLabel('change_status_bank_confirm', p_r, th1s.context),
            () => th1s.setStatus(),
            null, true,
            labelsManager.importLabel('change', p_r, th1s.context),
            labelsManager.importLabel('cancel', p_r, th1s.context)
          )
        } else {
          this.alertInfo()
        }
        break;
      }
      default: {
        generateModal = false
        alertUser(true, 'error', labelsManager.importLabel('error', p_r, this.context)
          , labelsManager.importLabel('try_again_or_contact_admin', p_r, this.context))
        break;
      }
    }
    if (generateModal) {
      let formId = gridId + '_FORM'
      let form = <GenericForm
        params={'READ_URL'}
        key={formId + saveType}
        id={formId + saveType}
        className={`form-test person-registry-forms`}
        method={'/ReactElements/getTableJSONSchema/%session/' + gridId}
        uiSchemaConfigMethod={'/ReactElements/getTableUISchema/%session/' + gridId}
        tableFormDataMethod={tableFormDataMethod}
        hideBtns={hideBtns}
        customSave={true}
        customSaveButtonName={customSaveButtonName}
        addSaveFunction={(formData) => this.saveFunction(formData, gridId)}
        addDeleteFunction={(id, method, session, params) => this.deleteMethod(id, method, session, params, gridId)}
      />
      this.setState({
        showModal: <Modal key={formId + saveType} id={formId + saveType}
          modalTitle={modalTitle} closeModal={() => this.closeModalFn()} modalContent={form} />
      })
    }
  }

  setStatus = () => {
    let { svSession } = this.props
    let { status, bankObjId } = this.state
    let nextStatus
    switch (status) {
      case 'VALID':
        nextStatus = 'ACTIVE'
        break;
      case 'ACTIVE':
        nextStatus = 'INACTIVE'
        break;
      case 'INACTIVE':
        nextStatus = 'ACTIVE'
        break;
      default:
        nextStatus = 'INACTIVE'
        break;
    }
    const url = window.server + `/SvPersonRegistry/BankAcc/changeStatus/sId/${svSession}/oId/${bankObjId}/nextStatus/${nextStatus}`;
    axios.get(url)
      .then(res => {
        this.responseStatus(res.data)
      })
      .catch(err => {
        console.error(err)
        const title = err.response?.data?.title || err
        const msg = err.response?.data?.message || ''
        alertUser(true, "error", title, msg);
      });
  }

  responseStatus = (data) => {
    let { objectId } = this.state
    if (data) {
      alertUser(true, data.type.toLowerCase(), data.title, data.message)
      this.setState({ status: '', bankObjId: '' })
      GridManager.reloadGridData('BANKACC' + objectId)
      ComponentManager.setStateForComponent('BANKACC' + objectId, null, { rowClicked: undefined })
    }
  }

  alertInfo = () => {
    alertUser(true, 'info', labelsManager.importLabel('no_selection', p_r, this.context), labelsManager.importLabel('choose_selection', p_r, this.context))
  }

  deleteConnCallback = (data) => {
    if (data.data.type) {
      const { objectId } = this.state
      this.setState({ linkTypeObjId: '', linkType: '', respPersonName: '' })
      GridManager.reloadGridData('RESPONSIBLE_PERSON' + objectId)
      alertUser(true, data.data.type.toLowerCase(), data.data.title, data.data.message)
      this.setState({ isLoading: false })
      ComponentManager.setStateForComponent('RESPONSIBLE_PERSON' + objectId, null, {
        rowClicked: undefined
      })
    } else {
      this.setState({ linkTypeObjId: '', linkType: '', respPersonName: '' })
      alertUser(true, 'error', labelsManager.importLabel('error', p_r, this.context), labelsManager.importLabel('try_again_or_contact_admin', p_r, this.context))
      ComponentManager.setStateForComponent('RESPONSIBLE_PERSON' + objectId, null, {
        rowClicked: undefined
      })
      this.setState({ isLoading: false })
    }
  }

  deleteMethod = (_id, _method, _session, params, gridId) => {
    let valueToSend = params[4].PARAM_VALUE
    let th1s = this
    const { objectId } = th1s.state
    const { svSession } = th1s.props
    let restUrl = window.server + '/ReactElements/deleteObject/' + svSession + '/false/false'
    axios({
      method: 'post',
      data: valueToSend,
      url: restUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then((response) => {
      if (response.data) {
        if (response.data.type === 'ERROR' && response.data.title === 'Невалидна сесија') {
          alertUser(true, response.data.type.toLowerCase(), response.data.title, response.data.message)
          logOut()
        } else {
          GridManager.reloadGridData(gridId + objectId)
          th1s.setState({ showModal: false, bankObjId: '', contactObjId: '', objTypeId: '', bankStatus: '' })
          alertUser(true, response.data.type.toLowerCase(), response.data.message)
        }
      }
    }).catch((error) => {
      if (error.response && error.response.data && error.response.data.type) {
        th1s.setState({ showModal: false, bankObjId: '', contactObjId: '', objTypeId: '', bankStatus: '' })
        alertUser(true, err.data.type.toLowerCase(), err.data.message)
      }
    })
  }

  saveFunction = (formData, gridId) => {
    const { objectId } = this.state
    const { svSession } = this.props
    let th1s = this
    let canMakeAxios = false
    let restUrl = window.server + '/ReactElements/createTableRecordFormData/' + svSession + '/' + gridId + '/' + objectId
    let form_params = formData.formData
    if (gridId === 'BANKACC') {
      if (form_params['BANK_ACCOUNT'] && form_params['BANK_ACCOUNT'].toString().length == 15) {
        canMakeAxios = true
      } else {
        alertUser(true, 'info', labelsManager.importLabel('not_valid', p_r, this.context), labelsManager.importLabel('please_enter_correct_input', p_r, this.context))
      }
    } else if (gridId === 'SVAROG_CONTACT_DATA') {
      canMakeAxios = true
    } else if (gridId === 'IDENTITY_DATA') {
      canMakeAxios = true
    }
    else {
      alertUser(true, 'error', 'Настана грешка', 'Ве молиме контактирајте го администраторот')
    }
    if (canMakeAxios === true) {
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
            GridManager.reloadGridData(gridId + objectId)
            th1s.setState({ showModal: false, bankObjId: '', contactObjId: '', objTypeId: '', bankStatus: '' })
            alertUser(true, response.data.type.toLowerCase(), response.data.title, response.data.message)
          }
        }
      }).catch(function (error) {
        if (error.response && error.response.data && error.response.data.type) {
          alertUser(true, error.response.data.type.toLowerCase(), error.response.data.title, error.response.data.message)
          th1s.setState({ showModal: false, bankObjId: '', contactObjId: '', objTypeId: '', bankStatus: '' })
        }
      })
    }
  }

  closeModalFn = (clearConn) => {
    this.setState({ showModal: false })
    if (clearConn) {
      this.setState({ objectIdF: '', nameAuth: '', setAuthPerson: '' })
    }
  }

  redirectBack = () => {
    let href = '/main/persons-registry'
    this.hashHistory.push(href)
  }

  deleteIdData = (gridid) => {
    let { svSession } = this.props
    let { idDataId, idDataType } = this.state
    if (idDataId && idDataType) {
      alertUser(true, 'info',
        labelsManager.importLabel('delete_id_data', p_r, this.context),
        labelsManager.importLabel('confirm_delete_id_data', p_r, this.context),
        () => {
          let restUrl = window.server + '/ReactElements/deleteObject/' + svSession + '/false/false'
          let data = { 'OBJECT_ID': idDataId, 'OBJECT_TYPE': idDataType }
          axios({
            method: 'post',
            data,
            url: restUrl,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          }).then((response) => {


            this.setState({ objTypeId: '', contactObjId: '', bankStatus: '', idDataId: '', idDataType: '' })
            alertUser(true, response.data.type.toLowerCase(), response.data.title, response.data.message, () => GridManager.reloadGridData(gridid))

          }).catch(err => {
            console.error(err)
            const title = err.response?.data?.title || err
            const msg = err.response?.data?.message || ''
            alertUser(true, "error", title, msg);
            this.setState({ objTypeId: '', contactObjId: '', bankStatus: '', idDataId: '', idDataType: '' })
          });
        }, null, true,
        labelsManager.importLabel('delete', p_r, this.context),
        labelsManager.importLabel('cancel', p_r, this.context)
      )
    } else {
      alertUser(true, 'info', labelsManager.importLabel('no_selection', p_r, this.context), labelsManager.importLabel('choose_selection', p_r, this.context))
    }
  }
  changeRouteFunc = (component) => {
    const href = `/main/persons-registry/person/${this.props.match.params.objId}/${this.props.match.params.personType}/${this.props.match.params.name}/${component}`
    if (this.props.match.params.component === 'editPerson' || 'address') {
      this.setState({ active: component })
    } else {
      this.additionalInfo(component)
    }
    this.hashHistory.push(href)
  }
  render() {
    const { showRenderBtns, additionalInfoRender, renderForm, selectedPersonType, showModal, isLoading, entityName, activeTab } = this.state;
    return (
      <React.Fragment>
        <div className='pr-background'>
          <div className='pr-holder-info'>
            {isLoading}
            {showModal}
            <div className='pr-main-btn-holder'>
              <div className='pr-info-btn-holder'> <button id='back' onClick={this.redirectBack} className='pr-btn-back'>{iconManager.getIcon('back')} {labelsManager.importLabel('back', p_r, this.context)} </button>
                <div className='pr-selected-user'><p>{iconManager.getIcon('user')}{labelsManager.importLabel('selected_user', p_r, this.context)} : <b>{entityName}</b></p></div>
              </div >
              <div id='alt-btn_holder' className='pr-btn-holder-info'>
                <div className='pr-btn-container'>
                  <button id='editPerson' onClick={() => {
                    this.changeRouteFunc('editPerson')
                    this.setState({ activeTab: 'editPerson', active: 'editPerson', additionalInfoRender: '', bankObjId: '', contactObjId: '', linkTypeObjId: '', linkType: '', respPersonName: '', objTypeId: '', bankStatus: '' })
                  }} className={`pr-btn-reg-info  pr-editPerson ${activeTab === 'editPerson' && 'pr-active-tab'}`}>{iconManager.getIcon('editUser')} {labelsManager.importLabel('edit_person', p_r, this.context)} </button>

                  <button id='bankAcc' onClick={() => {
                    this.changeRouteFunc('bankAcc')
                    this.setState({ activeTab: 'bankAcc' })
                    this.additionalInfo('bankAcc')
                  }} className={`pr-btn-reg-info pr-bankAcc  ${activeTab === 'bankAcc' && 'pr-active-tab'}`}>{iconManager.getIcon('bankAcc')} {labelsManager.importLabel('bank_acc', p_r, this.context)} </button>


                  <button id='address' onClick={() => {
                    this.changeRouteFunc('address')
                    this.setState({ activeTab: 'address', additionalInfoRender: '', bankObjId: '', active: 'address', linkTypeObjId: '', linkType: '', respPersonName: '', objTypeId: '', bankStatus: '' })
                    this.additionalInfo('address')
                  }} className={`pr-btn-reg-info pr-address  ${activeTab === 'address' && 'pr-active-tab'}`}>{iconManager.getIcon('address')} {labelsManager.importLabel('address', p_r, this.context)} </button>


                  {selectedPersonType === 'P' && <button id='showAuthC' onClick={() => {
                    this.changeRouteFunc('showAuthC')
                    this.setState({ activeTab: 'showAuthC' })
                    this.additionalInfo('showAuthC')
                  }} className={`pr-btn-reg-info pr-showAuthC  ${activeTab === 'showAuthC' && 'pr-active-tab'}`}>{iconManager.getIcon('addPerson')} {this.context.intl.formatMessage({ id: 'perun.persons_registry.legal_connection', defaultMessage: 'perun.persons_registry.legal_connection' })} </button>}

                  {selectedPersonType === 'G' && <button id='authorizedPerson' onClick={() => {
                    this.changeRouteFunc('authorizedPerson')
                    this.setState({ activeTab: 'authorizedPerson' })
                    this.additionalInfo('authorizedPerson')
                  }} className={`pr-btn-reg-info pr-authorizedPerson  ${activeTab === 'authorizedPerson' && 'pr-active-tab'}`}>{iconManager.getIcon('addPerson')} {labelsManager.importLabel('add_authorized_person', p_r, this.context)} </button>}

                  {this.props.match.params.personType === 'P' && <button id='idData' onClick={() => {
                    this.changeRouteFunc('idData')
                    this.setState({ activeTab: 'idData' })
                    this.additionalInfo('idData')
                  }} className={`pr-btn-reg-info pr-idData ${activeTab === 'idData' && 'pr-active-tab'}`}>{iconManager.getIcon('idData')} {labelsManager.importLabel('add_identity_data', p_r, this.context)} </button>}

                  {selectedPersonType == 'G' && <button id='showAuthP' onClick={() => {
                    this.changeRouteFunc('showAuthP')
                    this.setState({ activeTab: 'showAuthP' })
                    this.additionalInfo('showAuthP')
                  }} className={`pr-btn-reg-info pr-showAuthP  ${activeTab === 'showAuthP' && 'pr-active-tab'}`}>{iconManager.getIcon('preview')} {labelsManager.importLabel('show_auth_person', p_r, this.context)} </button>}
                </div>
              </div>
            </div>
            <div id='alt-content' className='pr-content-info'>
              <div className='pr-content-inner'>
                {additionalInfoRender}
                {this.state.active === 'editPerson' && <EditForm setPersonName={this.setPersonName} objId={this.props.match.params.objId} personType={this.props.match.params.personType} savePerson={this.savePerson} />}
                {this.state.active === 'address' && <Address personObjId={this.state.objectId} defaultCountry={this.state.defaultCountry} />}
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession,
})

PersonInfo.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(PersonInfo)