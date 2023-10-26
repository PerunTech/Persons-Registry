package com.prtech.persons_registry;

public class PRC {
	private PRC() {
	}

	// STATUS
	public static final String ACTIVE = "ACTIVE";
	public static final String INACTIVE = "INACTIVE";

	// TABLES
	public static final String BANKACC = "BANKACC";
	public static final String PERSON = "PERSON";
	public static final String LINK_TYPE = "LINK_TYPE";

	// OTHER
	public static final String EMPTY_STRING = "";
	public static final String TABLE_NAME = "TABLE_NAME";
	public static final String BEFORE_SAVE_DEFAULT_CHECK = "BEFORE_SAVE_DEFAULT_CHECK";

	// FIELDS
	public static final String IS_DEFAULT = "IS_DEFAULT";
	public static final String PARENT_CODE_VALUE = "PARENT_CODE_VALUE";
	public static final String CODE_VALUE = "CODE_VALUE";
	public static final String FIELD_NAME = "FIELD_NAME";
	public static final String STATE = "STATE";
	public static final String CODE_LIST_ID = "CODE_LIST_ID";
	public static final String CODE_LIST_MNEMONIC = "CODE_LIST_MNEMONIC";
	public static final String LABEL_CODE = "LABEL_CODE";
	public static final String LINK_TYPE_DESCRIPTION = "LINK_TYPE_DESCRIPTION";
	public static final String LINK_OBJ_TYPE_1 = "LINK_OBJ_TYPE_1";
	public static final String LINK_OBJ_TYPE_2 = "LINK_OBJ_TYPE_2";
	public static final String DEFER_SECURITY = "DEFER_SECURITY";
	public static final String IS_IPARD = "IS_IPARD";
	public static final String IS_FARM = "IS_FARM";
	public static final String ID_NO = "ID_NO";
	public static final String TAX_NO = "TAX_NO";
	public static final String PHYSICAL_ENTITY = "PHYSICAL_ENTITY";
	public static final String LEGAL_ENTITY = "LEGAL_ENTITY";
	public static final String FIELD_VALUE = "FIELD_VALUE";
	public static final String DEPENDENT_PARENT_CODE_VALUE = "DEPENDENT_PARENT_CODE_VALUE";

	// CODES
	public static final String COUNTRY_CODE = "COUNTRY_CODE";

	// OTHER
	public static final String MASTER_REPO = "{MASTER_REPO}";
	public static final String DEFAULT_SCHEMA = "{DEFAULT_SCHEMA}";
	public static final String VALUE = "value";
	public static final String MASTER_REPO_PKID = "master_repo.pkid";
	public static final String SUCCESS_GET_OPTIONS = "success.get_options";
	public static final String ERROR_INVALID_SESSION = "error.invalid_session";
	public static final String PR_ERROR_GET_OPTIONS = "person_registry.error.get_options";
	public static final String SUCCESS_PERUN_GET_DATA = "success.perun.get.data";
	public static final String ERROR_PERUN_GET_DATA = "error.perun.get.data";
	public static final String PERUN_ERROR_SAVE = "perrun.error.save";
	public static final String ERROR_PERUN_CHANGED_STATUS = "error.perun.changedStatus";
	public static final String ERROR_USER_NOT_AUTHORIZED = "error_user_not_authorized";

}
