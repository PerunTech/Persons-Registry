// if client.min.js is hosted on localhost and triglav rest is on remote server
if (window.location.hostname === 'localhost' && window.location.port === '8080') {

  var server = 'http://192.168.100.155:9090/services'
  // var server = 'http://localhost:8091/triglav_rest'
  // var server = 'http://192.168.99.149:9090/triglav_rest'
} else if (window.location.hostname === 'localhost' && window.location.port === '9099') {
  server = 'http://192.168.9.134:8080/triglav_rest'
} else {
  // if client.min.js and triglav rest are on remote server
  server = '/services'
}

// This flag should be enabled if you are using custom plugins.
export const hasCustom = true

// set this to true if you want to see the LPIS menu
export const enableLPIS = false

// load labels from baseUrlPath variable
export const labelBasePath = 'perun'

export const svConfig = {
  restSvcBaseUrl: [server],
  isDebug: process.env.NODE_ENV !== 'production',
  triglavRestVerbs: {
    MAIN_LABELS: '/SvSecurity/i18n/%s1/%s2',
    GET_COMPONENT_CONFIGURATION: '/SvSecurity/configuration/getConfiguration/%session/%componentName',
    /* Delete records */
    // DELETE_TABLE_OBJECT: '/ReactElements/deleteObject/%session/%objectId/%objectType/%objectPkId',
    DELETE_TABLE_OBJECT: '/ReactElements/deleteObject/',
    DELETE_CARD: '/WsConf/deleteCard/',
    MAIN_VALIDATE: '/SvSSO/validateToken/%s1',
    MAIN_LOGOUT: '/SvSSO/logoff/%s1',

    /* Datagrid configuration and data */
    BASE: '/ReactElements/getTableFieldList/%session/%gridName',
    BASE_DATA: '/ReactElements/getTableData/%session/%gridConfigWeWant/100000',
    GET_BYPARENTID: '/ReactElements/getObjectsByParentId/%session/%parentId/%objectType/%rowlimit',
    GET_BYPARENTID_SYNC: '/ReactElements/getObjectsByParentId/%s1/%s2/%s3/%s4',
    GET_BYLINK: '/ReactElements/getObjectByLink/%session/%parentId/%objectType/%linkName/%rowlimit',
    CUSTOM_GRID: '/ReactElements/getTableFieldList/%session/%gridConfigWeWant',

    /* Json schema form configuration and data */
    GET_FORM_BUILDER: '/table/formStyleTableJsonSchema/%session/%formWeWant',
    GET_UISCHEMA: '/table/formStyleTableUiSchema/%session/%formWeWant',
    GET_TABLE_FORMDATA: '/table/formStyleTableData/%session/%object_id/%table_name',
    GET_DATA_FROM_FORM_MAVEN: '/ReactElements/getTableFormData/%session/%object_id/%table_name',
    GET_UISCHEMA_MAVEN: '/ReactElements/getTableUISchema/%session/%formWeWant',
    GET_FORM_BUILDER_MAVEN: '/ReactElements/getTableJSONSchema/%session/%formWeWant',

    /* Json schema form documents */
    GET_DOC_BUILDER: '/ReactElements/getFormJSONSchema/%session/%formWeWant',
    GET_DOC_UISCHEMA: '/ReactElements/getFormUISchema/%session/%formWeWant',
    GET_DOC_FORMDATA: '/ReactElements/getFormFormData/%session/%object_id/%formWeWant',
    SAVE_DOCUMENT_OBJECT: '/ReactElements/createFormWithFields/%session/%parentId/%form_type/%form_validation/%value/%json_string',
    GET_MULTIFILTER_TABLE: '/ReactElements/getTableWithFilter/%s1/%s2/%s3/%s4/%s5/%s6/%s7/%s8',
    GET_DOCUMENTS: '/ReactElements/getTableData/%s1/%s2/%s3',
    GET_DOCUMENT_FORM_FILED_LIST: '/ReactElements/getTransposedFormByParentFieldList/%session/%form_id/%scenario',
    GET_DOCUMENT_FORMS: '/ReactElements/getTransposedFormByParent/%session/%parent_id/%form_id',
    GET_DOCUMENTS_BY_PARENTID: '/ReactElements/getDocumentsByParentId/%session/%parentId/%formName/%recordNumber',

    /* Custon save records */
    SAVE_OBJECT_WITH_LINK: '/table/createTableRecord/%session/%table_name/%parent_id/%jsonString/%object_id_to_link/%table_name_to_link/%link_name/%link_note',

    /* Search tables with equal and like operators */
    GET_TABLE_WITH_FILTER: '/ReactElements/getTableWithFilter/%svSession/%objectName/%searchBy/%searchForValue/%rowlimit',
    GET_TABLE_WITH_LIKE_FILTER: '/ReactElements/getTableWithLike/%session/%objectName/%searchBy/%searchForValue/%rowlimit',
    GET_TABLE_WITH_LIKE_FILTER_SYNC: '/ReactElements/getTableWithLike/%s1/%s2/%s3/%s4/%s5',
    GET_FORM_JSON: '/ReactElements/getFormJSONSchema/%s1/%s2',

    /* Generated card */
    GET_CONFIGURATION_MODULE_CARDS: '/SvSecurity/getConfigModuleCardsEntry/',
    GET_CONFIGURATION_MODULE_DB: '/WsConf/getConfigModuleCardsEntry/',
    SEND_ACTIVATION_LINK: '/SvSecurity/sendActivationLink',
    /* Get batch type f.r */
    GET_BATCH_TYPE: '/SvBatch/getBatchJobTypes/',
    GET_JOB_TEMPLATES: '/SvBatch/getBatchJobTemplates/',
    GET_PARAMS_TEMPLATES: '/SvBatch/getParamByTemplate/',
    SAVE_JOB_TYPE: '/SvBatch/createBatchJob/',
    SAVE_BATCH_PARAMS: '/SvBatch/saveParamsByJob/',
    RUN_JOB: '/SvBatch/runBatchJob/',
    STOP_JOB: '/SvBatch/stopBatchJob',
    GET_JOBS: '/SvBatch/getBatchJob/',
    GET_JOB_INFO: '/SvBatch/getInfoForActiveJob/',
    SELECTION_JOB: '/SvBatch/selectObjects/',
    GET_CENTROID: '/SDI/getCentroidByPolyId/%s1/%s2/%s3',
    GET_TABLE_DATA: '/ReactElements/getTableData/%session/%tableName/%noRec/%doTranslate',
    CORE_LOGOUT: '/SvSecurity/logout/',
    GET_APP_TYPE: '/svReader/getAppType/',
    GET_ORG_UNIT: '/svReader/getOrgUnits/',
    GET_DROP_DOWN_VALUES: '/Iacs/getAppTypeOrgUnit/',

    /* Generate Rank */
    GET_INITIAL_RANKING_DROPDOWN: '/SvScore/getScoreTypes/',
    CHANGE_RANK_STATUS: '/SvScore/changeStatus/',
    GET_RANKING_REPORTS: '/SvScore/getReports/',
    PRINT_REPORTS: '/SvScore/generateExcel/',

    /* Generate Extraction */
    GENERATE_EXTRACTION_DROPDOWN: '/SvSample/getSampleTypes/',
    GET_EXTRACTION_REPORTS: '/SvSample/getReports/',
    CHANGE_EXT_STATUS: '/SvSample/changeStatus/',
    GET_EXTRACTION_PARAMS: '/Iacs/getSampleEnterpriseParams/',
    SAVE_EXTRACTION_PARAMS: '/Iacs/saveSampleEnterpriseParams/',
    RERUN_JOB: '/SvBatch/reRunBatchJob/',
    // REPROCESS_RANKING: '/SvScore/'

    /* Get Svarog tables */
    // GET_SVAROG_TABLES:
    CHECK_SESSION: '/SvSecurity/checkSession/',
    GET_MULTISTEP_FORMS: '/Iacs/getForms/',
    DOWNLOAD_ZIP_FILE: '/SvBatch/getFile/',
    REMOVE_OBJ_FROM_SELECTION: '/Iacs/removeObjFromSelection/',
    SAVE_FORM_WIZARD: '/WsConf/saveFormWizard/',
    SAVE_FORM_CONF: '/WsConf/saveFormConf/'
  }
}
