import { React, GenericForm, ExportableGrid, ComponentManager, GridManager, utils } from 'perun-core'
import { axiosCall } from '../utils/AxiosCalls'
const { getDynamicKey, labelsManager } = utils

/** 
function used for making a request to the back-end for fetching data to meet search result
@param {object} formData
@param {string} form
@param {function} callback
@param {string} session
**/
export function searchComponent(formData, _form, callback, session) {
  var form_params
  if (formData.formData) {
    form_params = formData.formData
    if (form_params["NAME"] && form_params["NAME"].length > 0) {
      let dataTmp = form_params["NAME"]
      form_params["NAME"] = dataTmp?.toUpperCase()
    }
    if (form_params["ID_NO"] && form_params["ID_NO"].length > 0) {
      let dataTmp = form_params["ID_NO"]
      form_params["ID_NO"] = dataTmp.trim()
    }
    if (form_params["TAX_NO"] && form_params["TAX_NO"].length > 0) {
      let dataTmp = form_params["TAX_NO"]
      form_params["TAX_NO"] = dataTmp.trim()
    }
  }

  var isUndefined = Object.keys(form_params).reduce((res, k) => res && !(!!form_params[k] || form_params[k] === false || !isNaN(parseInt(form_params[k]))), true)

  if (isUndefined === false) {
    let urlArr = []
    urlArr.push(`${window.server}/ReactElements/searchTable/${session}/PERSON/1000`)
    axiosCall(urlArr, session, callback, 'post', form_params)
  } else {
    callback('inside_error')
  }
}
/**
this function returns <GenericForm/>  with custom save function recieved from param searchComponent
    @param {function} searchComponent
    @param {object} context
    @param {Node} wrapper
**/
export const searchRender = (searchComponent, context, wrapper) => {
  let InputWrapper = wrapper
  let formId = 'PERSON'
  return <GenericForm
    params={'READ_URL'}
    key={formId + 'search'}
    id={formId + 'search'}
    method={'/ReactElements/getTableSearchJSONSchema/%session/' + formId}
    uiSchemaConfigMethod={'/ReactElements/getTableUISchema/%session/' + formId}
    tableFormDataMethod={'/ReactElements/getTableFormData/%session/0/' + formId}
    addSaveFunction={searchComponent}
    hideBtns={'closeAndDelete'}
    customSave={true}
    customSaveButtonName={labelsManager('search', context, 'persons_registry')}
    className={`form-test person-registry-forms admin-console-search-from`}
    inputWrapper={InputWrapper}
  />
}
/** 
this function returns <ExportableGrid/> element based on the data recieved from params
@param {string} gridId
@param {object} formData
@param {function} onRowClick
@param {string} customHeight
**/

export const searchResult = (gridId, formData, onRowClick, customHeight) => {
  let dynamic_key = getDynamicKey()
  let grid = <ExportableGrid gridType={'SEARCH_GRID_DATA'} key={gridId + dynamic_key}
    id={gridId + dynamic_key}
    configTableName={"/ReactElements/getTableFieldList/%session/PERSON"}
    dataTableName={formData}
    onRowClickFunct={onRowClick}
    minHeight={0}
    defaultHeight={false}
    heightRatio={customHeight}
  />

  ComponentManager.setStateForComponent(gridId + dynamic_key, null, {
    onRowClickFunct: onRowClick
  })
  GridManager.reloadGridData(gridId + dynamic_key)

  return grid
}