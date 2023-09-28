import { React, connect, GenericGrid, Modal, axios, elements, PropTypes } from 'perun-core'
const { InputElement, Dropdown, alertUser, ComponentManager } = elements

/**
* MANDATORY PARAMETERS
* @param {function} closeConnector - function that manages visibility state of this component shown in the modal,
* OTHER PARAMETERS
* @param {string} tableName - search table name not requred when using modelType, but it is mandatory when not using modelType,
* @param {string} modelType - string value that can manage modalContent (ex: modelType={'persons'}), if not send it has default value,
* OPTIONAL PARAMETERS
* @param {function} persRegConnRowClickFn - extended on rowClick function callback from gridManager returning the selected dropDownValue too besiedes the other onRowClick params,
* @param {string} connectorModalSize manage modal width from 40 (min) to 90 (max, also this is the max width), if prop is not recieved it will have a default value of 70
* @param {fucntion} modalOnMouseEnter function that is passed to Modal content, usually onMouseEnter for the content data
* @param {string} modalTitleProp - string used as a modal title
*/

class Connector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
    this.generateModalFromInput = this.generateModalFromInput.bind(this)
    this.hanldeSearchForm = this.hanldeSearchForm.bind(this)
    this.displayGrid = this.displayGrid.bind(this)
    this.onRowClickWithModalSearch = this.onRowClickWithModalSearch.bind(this)
    this.onChange = this.onChange.bind(this)
    this.checkType = this.checkType.bind(this)
  }

  componentDidMount() {
    if (this.props.closeConnector) {
      this.setState({ closeConnector: this.props.closeConnector, tableName: this.props.tableName, connectorModalSize: this.props.connectorModalSize }, () => {
        let type
        if (this.props.modelType) {
          type = this.props.modelType.toLowerCase()
        }
        this.checkType(type)
      })
    } else {
      console.log('closeConnector is mandatory prop')
    }
  }

  /* check the prop send type */
  checkType(type) {
    switch (type) {
      case 'persons': {
        this.setState({ tableName: 'PERSON' })
        this.generateModalFromInput('persons')
        break;
      }
      default: {
        if (this.props.tableName) {
          this.hanldeSearchForm('defaultValue')
        } else {
          console.warn('please enter tableName when you dont use modelType')
        }
        break;
      }
    }
  }

  /* generate modal component on inputClick depneds on the type */
  generateModalFromInput(checkType) {
    let modalTitle
    if (this.props.modalTitleProp) {
      modalTitle = this.props.modalTitleProp
    } else {
      modalTitle = this.context.intl.formatMessage({ id: 'perun.persons_registry.search', defaultMessage: 'perun.persons_registry.search' })
    }
    let modalWidth
    if (this.state.connectorModalSize) {
      modalWidth = this.state.connectorModalSize
    } else {
      modalWidth = '70'
    }
    let modalOnMouseEnterFunction
    if (this.props.modalOnMouseEnter) {
      modalOnMouseEnterFunction = this.props.modalOnMouseEnter
    }
    let modalCntnt
    if (checkType) {
      if (checkType === 'persons') {
        modalCntnt = <div>
          <select onChange={(e) => this.onChange(e, 'dropDownVal')} value={this.state.dropDownVal} name='group_type' id='group_type' className='form-control'>
            <option value='choose' disabled='disabled' selected>{this.context.intl.formatMessage({ id: 'perun.persons_registry.choose_person', defaultMessage: 'perun.persons_registry.choose_person' })}</option>
            <option value='PHYSICAL_ENTITY'>{this.context.intl.formatMessage({ id: 'perun.persons_registry.mi.physical', defaultMessage: 'perun.persons_registry.mi.physical' })}</option>
            <option value='LEGAL_ENTITY'>{this.context.intl.formatMessage({ id: 'perun.persons_registry.mi.legal', defaultMessage: 'perun.persons_registry.mi.legal' })}</option>
          </select>
          {this.state.secondDropDown ? this.state.secondDropDown : null}
          {this.state.modalGridState ? this.state.modalGridState : null}
        </div>
      } else if (checkType === 'defaultValue') {
        modalCntnt = <div>
          {this.state.secondDropDown ? this.state.secondDropDown : null}
          {this.state.modalGridState ? this.state.modalGridState : null}
        </div>
      }
    }
    this.setState({
      modal: <Modal key={checkType} modalTitle={modalTitle}
        nameSubmitBtn={this.context.intl.formatMessage({ id: 'perun.ipardSpa.close', defaultMessage: 'perun.ipardSpa.close' })}
        closeModal={() => this.state.closeConnector()} modalContent={modalCntnt} modalSize={modalWidth} onMouseEnterFunction={modalOnMouseEnterFunction} />
    })
    /* clear all incoming params just to be sure that they will not be the same */
    modalCntnt = ''
    checkType = ''
    modalOnMouseEnterFunction = ''
  }

  /* get search form fields and generate html */
  hanldeSearchForm(forType) {
    let secondDropDown
    let url
    if (forType === 'changedDropDown') {
      url = window.server + '/SvPersonRegistry/getOptions/' + this.props.svSession + '/' + this.state.dropDownVal
    } else if (forType === 'defaultValue') {
      url = window.server + '/SvPersonRegistry/getOptions/' + this.props.svSession + '/' + this.state.tableName
    }
    axios.get(url)
      .then((response) => {
        if (response.data) {
          secondDropDown = <div>
            <Dropdown
              key={response.data.data}
              onChange={(e) => this.onChange(e, 'modalSecondDropDown')}
              options={response.data.data}
            />
            <InputElement name='modalSearchInput' placeholder={this.context.intl.formatMessage({ id: 'perun.persons_registry.search_value', defaultMessage: 'perun.persons_registry.search_value' })} label='modalSearchInput' type='input' onChange={(e) => this.onChange(e, 'modalSearchInput')} id='modalSearchInput'
            />
            <button className={style['button-create'] + ' ' + style['btn']} onClick={() => this.displayGrid(forType)}>{this.context.intl.formatMessage({ id: 'perun.persons_registry.search', defaultMessage: 'perun.persons_registry.search' })}</button>
          </div>
        }
        if (forType === 'changedDropDown') {
          this.setState({ secondDropDown: secondDropDown }, () => this.generateModalFromInput('persons'))
        } else if (forType === 'defaultValue') {
          this.setState({ secondDropDown: secondDropDown }, () => this.generateModalFromInput('defaultValue'))
        }
      })
      .catch((error) => {
        let type
        type = error.data.type
        type = type.toLowerCase()
        this.setState({ alert: alertUser(true, type, error.data.message, null, null) })
      })
  }

  /* display grid */
  displayGrid(forType) {
    if ((this.state.modalInputIsCompleted === true && this.state.modalSecondOptionIsCompleted === true) && this.state.modalSearchInput.length > 0) {
      let configTableName
      let dataTableName
      if (forType === 'changedDropDown') {
        configTableName = '/ReactElements/getTableFieldList/%session/' + this.state.dropDownVal
        dataTableName = '/ReactElements/getTableWithLike/%session/' + this.state.dropDownVal + '/' + this.state.modalSecondDropDown + '/' + this.state.modalSearchInput + '/100/1'
      } else if (forType === 'defaultValue') {
        configTableName = '/ReactElements/getTableFieldList/%session/' + this.state.tableName
        dataTableName = '/ReactElements/getTableWithLike/%session/' + this.state.tableName + '/' + this.state.modalSecondDropDown + '/' + this.state.modalSearchInput + '/100/1'
      }
      let modalGrid =
        <GenericGrid
          gridType={'READ_URL'}
          key={this.state.tableName + this.state.modalSecondDropDown + this.state.modalSearchInput + '_GRID'}
          id={this.state.tableName + this.state.modalSecondDropDown + this.state.modalSearchInput + '_GRID'}
          configTableName={configTableName}
          dataTableName={dataTableName}
          onRowClickFunct={this.onRowClickWithModalSearch}
        />
      ComponentManager.setStateForComponent(this.state.tableName + this.state.modalSecondDropDown + this.state.modalSearchInput + '_GRID', null, {
        onRowClickFunct: this.onRowClickWithModalSearch
      })
      if (forType === 'changedDropDown') {
        this.setState({ modalGridState: modalGrid }, () => this.generateModalFromInput('persons'))
      } else if (forType === 'defaultValue') {
        this.setState({ modalGridState: modalGrid }, () => this.generateModalFromInput('defaultValue'))
      }
    } else {
      this.setState({ alert: alertUser(true, 'info', this.context.intl.formatMessage({ id: 'perun.persons_registry.search_params', defaultMessage: 'perun.persons_registry.search_params' })) })
    }
  }

  /* extended onRowClick function from the grid returning another param as callback in the parent component */
  onRowClickWithModalSearch(gridId, rowId, row) {
    if (this.props.persRegConnRowClickFn) {
      this.props.persRegConnRowClickFn(gridId, rowId, row, this.state.dropDownVal)
    } else {
      console.log('missing persRegConnRowClickFn prop')
    }
  }

  componendDidUnmount() {
    this.setState({ modal: false, dropDownVal: '' })
  }

  /* on change function */
  onChange(e, select) {
    switch (select) {
      case 'modalSearchInput': {
        this.setState({ modalSearchInput: e.target.value, modalInputIsCompleted: true })
        break;
      }
      case 'modalSecondDropDown': {
        this.setState({ modalSecondDropDown: e.target.value, modalSecondOptionIsCompleted: true })
        break;
      }
      case 'dropDownVal': {
        this.setState({ dropDownVal: e.target.value, modalInputIsCompleted: true }, () => {
          this.hanldeSearchForm('changedDropDown')
        })
        break;
      }
      default: {
        this.setState({ [e.target.name]: e.target.value })
        break;
      }
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.state.modal}
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  svSession: state.security.svSession
})

Connector.contextTypes = {
  intl: PropTypes.object.isRequired
}

Connector.propTypes = {
  closeConnector: PropTypes.func.isRequired,
  tableName: PropTypes.string,
  modelType: PropTypes.string,
  persRegConnRowClickFn: PropTypes.func,
  connectorModalSize: PropTypes.string,
}

export default connect(mapStateToProps)(Connector)
