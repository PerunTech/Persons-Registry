package com.prtech.persons_registry;

import com.prtech.svarog.svCONST;
import com.prtech.svarog_common.DbDataField;
import com.prtech.svarog_common.DbDataField.DbFieldType;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.DbDataTable;
import com.prtech.svarog_common.IDbInit;
import java.util.ArrayList;

public class DbInit implements IDbInit {

	static final String CONST_SEARCH_FORM = "{\"react\":{\"filterable\":true,\"visible\":true,\"resizable\":true,\"editable\":true,\"searchForm\":{\"minLength\":3}}}";
	static final String CONST_GUI_FIL_VIS_RES_RW = "{\"react\":{\"filterable\":true,\"visible\":true,\"resizable\":true,\"editable\":true}}";
	static final String CONST_GUI_FIL_HIDE = "{\"react\":{\"filterable\":false,\"visible\":false,\"resizable\":true,\"editable\":false,\"uischema\":{\"ui:widget\":\"hidden\"}}}";
	static final String CONST_MASTER_REPO = PRC.MASTER_REPO;
	static final String CONST_DEFAULT_SCHEMA = PRC.DEFAULT_SCHEMA;

	private static DbDataTable addSortOrder(DbDataTable dbtt) {
		Integer order = 100;
		if (dbtt.getDbTableFields() != null)
			for (DbDataField dbf : dbtt.getDbTableFields()) {
				if (dbf != null && dbf.getSort_order() == null) {
					dbf.setSort_order(order);
					order = order + 100;
				}
			}
		return dbtt;
	}

	private static DbDataTable physicalEntity() {
		DbDataTable dbe = new DbDataTable();
		dbe.setDbTableName(PRC.PHYSICAL_ENTITY);
		dbe.setDbRepoName(PRC.MASTER_REPO);
		dbe.setDbSchema(PRC.DEFAULT_SCHEMA);
		dbe.setIsSystemTable(false);
		dbe.setIsRepoTable(false);
		dbe.setLabel_code("master_repo.physical_entity");
		dbe.setUse_cache(false);

		DbDataField dbe1 = new DbDataField();
		dbe1.setDbFieldName("PKID");
		dbe1.setIsPrimaryKey(true);
		dbe1.setDbFieldType(DbFieldType.NUMERIC);
		dbe1.setDbFieldSize(18);
		dbe1.setDbFieldScale(0);
		dbe1.setIsNull(false);
		dbe1.setLabel_code(PRC.MASTER_REPO_PKID);

		DbDataField dbe2 = new DbDataField();
		dbe2.setDbFieldName("FIRST_NAME");
		dbe2.setDbFieldType(DbFieldType.NVARCHAR);
		dbe2.setDbFieldSize(100);
		dbe2.setIsNull(false);
		dbe2.setLabel_code("physical_entity.first_name");

		DbDataField dbe3 = new DbDataField();
		dbe3.setDbFieldName("LAST_NAME");
		dbe3.setDbFieldType(DbFieldType.NVARCHAR);
		dbe3.setDbFieldSize(100);
		dbe3.setIsNull(false);
		dbe3.setLabel_code("physical_entity.last_name");

		// DbDataField dbe4 = new DbDataField();
		// dbe4.setDbFieldName(PRC.ID_NO);
		// dbe4.setDbFieldType(DbFieldType.NVARCHAR);
		// dbe4.setDbFieldSize(13);
		// dbe4.setIsNull(false);
		// dbe4.setIndexName("PHYSICAL_ENTITY_ID_NO_IDX");
		// dbe4.setLabel_code("physical_entity.id_no");

		DbDataField dbe5 = new DbDataField();
		dbe5.setDbFieldName("GENDER");
		dbe5.setDbFieldType(DbFieldType.NVARCHAR);
		dbe5.setDbFieldSize(2);
		dbe5.setIsNull(false);
		dbe5.setCode_list_user_code("GENDER");
		dbe5.setLabel_code("physical_entity.gender");

		// DbDataField dbe6 = new DbDataField();
		// dbe6.setDbFieldName("DT_BIRTH");
		// dbe6.setDbFieldType(DbFieldType.DATE);
		// dbe6.setDbFieldSize(3);
		// dbe6.setIsNull(true);
		// dbe6.setLabel_code("physical_entity.dt_birth");

		DbDataField dbe7 = new DbDataField();
		dbe7.setDbFieldName("STATE_OF_BIRTH");
		dbe7.setDbFieldType(DbFieldType.NVARCHAR);
		dbe7.setDbFieldSize(100);
		dbe7.setIsNull(true);
		// dbe7.setCode_list_user_code("STATES");
		dbe7.setLabel_code("physical_entity.state_of_birth");

//		DbDataField dbe8 = new DbDataField();
//		dbe8.setDbFieldName("PLACE_OF_BIRTH");
//		dbe8.setDbFieldType(DbFieldType.NVARCHAR);
//		dbe8.setDbFieldSize(100);
//		dbe8.setIsNull(true);
//		// dbe8.setCode_list_user_code("PLACES");
//		dbe8.setLabel_code("physical_entity.places_of_birth");

		DbDataField dbe9 = new DbDataField();
		dbe9.setDbFieldName("DT_DEATH");
		dbe9.setDbFieldType(DbFieldType.DATE);
		dbe9.setDbFieldSize(3);
		dbe9.setIsNull(true);
		dbe9.setLabel_code("physical_entity.dt_death");

		DbDataField[] dbTableFields = new DbDataField[6];
		dbTableFields[0] = dbe1;
		dbTableFields[1] = dbe2;
		dbTableFields[2] = dbe3;
		// dbTableFields[3] = dbe4;
		dbTableFields[3] = dbe5;
		// dbTableFields[5] = dbe6;
		dbTableFields[4] = dbe7;
		//dbTableFields[5] = dbe8;
		dbTableFields[5] = dbe9;
		dbe.setDbTableFields(dbTableFields);
		return dbe;
	}

	private static DbDataTable legalEntity() {
		DbDataTable dbe = new DbDataTable();
		dbe.setDbTableName(PRC.LEGAL_ENTITY);
		dbe.setDbRepoName(PRC.MASTER_REPO);
		dbe.setDbSchema(PRC.DEFAULT_SCHEMA);
		dbe.setIsSystemTable(false);
		dbe.setIsRepoTable(false);
		dbe.setLabel_code("master_repo.legal_entity");
		dbe.setUse_cache(false);

		DbDataField dbe1 = new DbDataField();
		dbe1.setDbFieldName("PKID");
		dbe1.setIsPrimaryKey(true);
		dbe1.setDbFieldType(DbFieldType.NUMERIC);
		dbe1.setDbFieldSize(18);
		dbe1.setDbFieldScale(0);
		dbe1.setIsNull(false);
		dbe1.setLabel_code(PRC.MASTER_REPO_PKID);

//		DbDataField dbe2 = new DbDataField();
//		dbe2.setDbFieldName("FULL_NAME");
//		dbe2.setDbFieldType(DbFieldType.NVARCHAR);
//		dbe2.setDbFieldSize(200);
//		dbe2.setIsNull(false);
//		dbe2.setLabel_code("legal_entity.full_name");

		 DbDataField dbe3 = new DbDataField();
		 dbe3.setDbFieldName("SHORT_NAME");
		 dbe3.setDbFieldType(DbFieldType.NVARCHAR);
		 dbe3.setDbFieldSize(100);
		 dbe3.setLabel_code("legal_entity.short_name");
		//
		// DbDataField dbe4 = new DbDataField();
		// dbe4.setDbFieldName(PRC.ID_NO);
		// dbe4.setDbFieldType(DbFieldType.NVARCHAR);
		// dbe4.setDbFieldSize(13);
		// dbe4.setIsNull(false);
		// dbe4.setIndexName("PHYSICAL_ENTITY_ID_NO_IDX");
		// dbe4.setLabel_code("legal_entity.id_no");
		//
		// DbDataField dbe5 = new DbDataField();
		// dbe5.setDbFieldName(PRC.TAX_NO);
		// dbe5.setDbFieldType(DbFieldType.NVARCHAR);
		// dbe5.setDbFieldSize(20);
		// dbe5.setIsNull(false);
		// dbe5.setIndexName("LEGAL_TAX_NO_IDX");
		// dbe5.setLabel_code("legal_entity.tax_no");
		//
		// DbDataField dbe6 = new DbDataField();
		// dbe6.setDbFieldName("ESTABLISHMENT_DATE");
		// dbe6.setDbFieldType(DbFieldType.TIMESTAMP);
		// dbe6.setDbFieldSize(3);
		// dbe6.setLabel_code("legal_entity.establishment_date");

		DbDataField dbe7 = new DbDataField();
		dbe7.setDbFieldName("BUSINESS_STATUS");
		dbe7.setDbFieldType(DbFieldType.NVARCHAR);
		dbe7.setDbFieldSize(20);
		dbe7.setCode_list_user_code("BUSINESS_STATUS");
		dbe7.setLabel_code("legal_entity.business_status");

		DbDataField dbe8 = new DbDataField();
		dbe8.setDbFieldName("OWNERSHIP_TYPE");
		dbe8.setDbFieldType(DbFieldType.NVARCHAR);
		dbe8.setDbFieldSize(10);
		dbe8.setCode_list_user_code("OWNERSHIP_TYPE");
		dbe8.setLabel_code("legal_entity.ownership_type");

		DbDataField dbe9 = new DbDataField();
		dbe9.setDbFieldName("SUBJECT_SIZE");
		dbe9.setDbFieldType(DbFieldType.NVARCHAR);
		dbe9.setDbFieldSize(10);
		dbe9.setCode_list_user_code("SUBJECT_SIZE");
		dbe9.setLabel_code("legal_entity.subject_size");

		DbDataField dbe10 = new DbDataField();
		dbe10.setDbFieldName("ORGANIZATIONAL_TYPE");
		dbe10.setDbFieldType(DbFieldType.NVARCHAR);
		dbe10.setDbFieldSize(10);
		dbe10.setCode_list_user_code("ORGANIZATIONAL_TYPE");
		dbe10.setLabel_code("legal_entity.organizational_type");

		DbDataField[] dbTableFields = new DbDataField[6];
		dbTableFields[0] = dbe1;
		dbTableFields[1] = dbe3;
		// dbTableFields[2] = dbe3;
		// dbTableFields[3] = dbe4;
		// dbTableFields[4] = dbe5;
		// dbTableFields[5] = dbe6;
		dbTableFields[2] = dbe7;
		dbTableFields[3] = dbe8;
		dbTableFields[4] = dbe9;
		dbTableFields[5] = dbe10;

		dbe.setDbTableFields(dbTableFields);
		return dbe;
	}

	private static DbDataTable tablePerson() {
		DbDataTable dbe = new DbDataTable();
		dbe.setDbTableName(PRC.PERSON);
		dbe.setDbRepoName(PRC.MASTER_REPO);
		dbe.setDbSchema(PRC.DEFAULT_SCHEMA);
		dbe.setIsSystemTable(false);
		dbe.setIsRepoTable(false);
		dbe.setLabel_code("master_repo.person");
		dbe.setUse_cache(true);

		DbDataField dbf1 = new DbDataField();
		dbf1.setDbFieldName("PKID");
		dbf1.setIsPrimaryKey(true);
		dbf1.setDbFieldType(DbFieldType.NUMERIC);
		dbf1.setDbFieldSize(18);
		dbf1.setDbFieldScale(0);
		dbf1.setIsNull(false);
		dbf1.setLabel_code(PRC.MASTER_REPO_PKID);

		DbDataField dbf2 = new DbDataField();
		dbf2.setDbFieldName(PRC.ID_NO);
		dbf2.setDbFieldType(DbFieldType.NVARCHAR);
		dbf2.setDbFieldSize(20);
		dbf2.setIsNull(false);
		dbf2.setIsUnique(true);
		dbf2.setUnique_constraint_name("PERSON_ID_NO");
		dbf2.setIndexName("PERSON_ID_NO_IDX");
		dbf2.setLabel_code("person.id_no");
		dbf2.setGui_metadata(
				"{\"react\":{\"filterable\":true,\"visible\":true,\"resizable\":true,\"editable\":true,\"minLength\":13,\"maxLength\":13,\"searchForm\":{\"minLength\":5}}}");
		dbf2.setSort_order(1005);
		
		DbDataField dbf3 = new DbDataField();
		dbf3.setDbFieldName(PRC.TAX_NO);
		dbf3.setDbFieldType(DbFieldType.NVARCHAR);
		dbf3.setDbFieldSize(20);
		dbf3.setIsNull(true);
		//dbf3.setIsUnique(true);
		//dbf3.setUnique_constraint_name("PERSON_TAX_NO");
		dbf3.setIndexName("PERSON_TAX_NO_IDX");
		dbf3.setLabel_code("person.tax_no");
		dbf3.setGui_metadata(
				"{\"react\":{\"filterable\":true,\"visible\":true,\"resizable\":true,\"editable\":true,\"searchForm\":{\"minLength\":5}}}");
		dbf3.setSort_order(1010);

		DbDataField dbf4 = new DbDataField();
		dbf4.setDbFieldName("NAME");
		dbf4.setDbFieldType(DbFieldType.NVARCHAR);
		dbf4.setDbFieldSize(300);
		dbf4.setIsNull(false);
		dbf4.setIndexName("PERSON_NAME_NO_IDX");
		dbf4.setLabel_code("person.name");
		dbf4.setGui_metadata(
				"{\"react\":{\"filterable\":true,\"visible\":true,\"resizable\":true,\"editable\":true,\"searchForm\":{\"minLength\":3}}}");
		dbf4.setSort_order(1015);
		
		DbDataField dbf5 = new DbDataField();
		dbf5.setDbFieldName("COUNTRY_CODE");
		dbf5.setDbFieldType(DbFieldType.NVARCHAR);
		dbf5.setDbFieldSize(4);
		dbf5.setIsNull(true);
		dbf5.setCode_list_user_code("COUNTRY_CODE");
		//dbf5.setGui_metadata(
		//		"{\"react\":{\"filterable\":true,\"visible\":true,\"resizable\":true,\"uischema\":{\"ui:widget\":\"DependencyDropdown\",\"parentCodeValue\":\"COUNTRY_CODE\"},\"editable\":true}}");
		dbf5.setLabel_code("person.country_code");
		dbf5.setSort_order(1020);
		
		DbDataField dbf6 = new DbDataField();
		dbf6.setDbFieldName("MUNICIPALITY");
		dbf6.setDbFieldType(DbFieldType.NVARCHAR);
		dbf6.setDbFieldSize(40);
		dbf6.setCode_list_user_code("MUNICIPALITY");
		dbf6.setIsNull(true);
		//dbf6.setGui_metadata(
		//		"{\"react\":{\"filterable\":true,\"visible\":true,\"sortable\":true,\"resizable\":true,\"uischema\":{\"ui:widget\":\"hidden\",\"dependentOn\":\"COUNTRY_CODE\",\"parentCodeValue\":\"MUNICIPALITY\"},\"editable\":true}}");
		dbf6.setLabel_code("person.municipality");
		dbf6.setSort_order(1030);
		
		DbDataField dbf7 = new DbDataField();
		dbf7.setDbFieldName("city_village");
		dbf7.setDbFieldType(DbFieldType.NVARCHAR);
		dbf7.setDbFieldSize(50);
		dbf7.setIsNull(true);
		dbf7.setCode_list_user_code("POPULATED_AREAS");
		//dbf7.setGui_metadata(
		//		"{\"react\":{\"filterable\":true,\"visible\":true,\"sortable\":true,\"resizable\":true,\"uischema\":{\"ui:widget\":\"hidden\",\"dependentOn\":\"MUNICIPALITY\",\"parentCodeValue\":\"POPULATED_AREAS\"},\"editable\":true}}");
		dbf7.setLabel_code("person.city_village");
		dbf7.setSort_order(1035);
		
		DbDataField dbf8 = new DbDataField();
		dbf8.setDbFieldName("ADDRESS");
		dbf8.setDbFieldType(DbFieldType.NVARCHAR);
		dbf8.setDbFieldSize(200);
		dbf8.setIsNull(true);
		dbf8.setLabel_code("person.address");
		dbf8.setSort_order(1040);

		DbDataField dbf9 = new DbDataField();
		dbf9.setDbFieldName("DT_BIRTH_REG");
		dbf9.setDbFieldType(DbFieldType.DATE);
		dbf9.setDbFieldSize(3);
		dbf9.setIsNull(true);
		dbf9.setLabel_code("person.dt_birth_reg");
		dbf9.setSort_order(1045);

		DbDataField dbf10 = new DbDataField();
		dbf10.setDbFieldName("PERSON_TYPE");
		dbf10.setDbFieldType(DbFieldType.NVARCHAR);
		dbf10.setDbFieldSize(2);
		dbf10.setIsNull(true);
		dbf10.setCode_list_user_code("PERSON_TYPE");
		dbf10.setLabel_code("person.person_type");
		dbf10.setGui_metadata(CONST_GUI_FIL_HIDE);
		
		DbDataField dbf11 = new DbDataField();
		dbf11.setDbFieldName("CITY");
		dbf11.setDbFieldType(DbFieldType.NVARCHAR);
		dbf11.setDbFieldSize(100);
		dbf11.setIsNull(true);
		dbf11.setLabel_code("person.city");
		dbf11.setSort_order(1025);
		
		
		DbDataField dbf12 = new DbDataField();
		dbf12.setDbFieldName("PHONE_NUMBER");
		dbf12.setDbFieldType(DbFieldType.NVARCHAR);
		dbf12.setDbFieldSize(75);
		dbf12.setIsNull(true);
		dbf12.setLabel_code("person.phone_number");
		dbf12.setSort_order(1050);
		
		
		DbDataField dbf13 = new DbDataField();
		dbf13.setDbFieldName("EMAIL");
		dbf13.setDbFieldType(DbFieldType.NVARCHAR);
		dbf13.setDbFieldSize(150);
		dbf13.setIsNull(true);
		dbf13.setLabel_code("person.email");
		dbf13.setSort_order(1060);
		
		
		
		
		
		
		DbDataField[] dbTableFields = new DbDataField[13];
		dbTableFields[0] = dbf1;
		dbTableFields[1] = dbf2;
		dbTableFields[2] = dbf3;
		dbTableFields[3] = dbf4;
		dbTableFields[4] = dbf5;
		dbTableFields[5] = dbf6;
		dbTableFields[6] = dbf7;
		dbTableFields[7] = dbf8;
		dbTableFields[8] = dbf9;
		dbTableFields[9] = dbf10;
		dbTableFields[10] = dbf11;
		dbTableFields[11] = dbf12;
		dbTableFields[12] = dbf13;

		dbe.setDbTableFields(dbTableFields);
		return dbe;
	}

	private static DbDataTable applicantType() {
		DbDataTable dbe = new DbDataTable();
		dbe.setDbTableName("APPLICANT_TYPE");
		dbe.setDbRepoName(PRC.MASTER_REPO);
		dbe.setDbSchema(PRC.DEFAULT_SCHEMA);
		dbe.setIsSystemTable(false);
		dbe.setIsRepoTable(false);
		dbe.setLabel_code("master_repo.applicant_type");
		dbe.setUse_cache(false);

		DbDataField dbe1 = new DbDataField();
		dbe1.setDbFieldName("PKID");
		dbe1.setIsPrimaryKey(true);
		dbe1.setDbFieldType(DbFieldType.NUMERIC);
		dbe1.setDbFieldSize(18);
		dbe1.setDbFieldScale(0);
		dbe1.setIsNull(false);
		dbe1.setLabel_code(PRC.MASTER_REPO_PKID);

		DbDataField dbe2 = new DbDataField();
		dbe2.setDbFieldName("NAME");
		dbe2.setDbFieldType(DbFieldType.NVARCHAR);
		dbe2.setDbFieldSize(200);
		dbe2.setIsNull(false);
		dbe2.setIsUnique(false);
		dbe2.setLabel_code("applicant_type.name");

		DbDataField dbe3 = new DbDataField();
		dbe3.setDbFieldName(PRC.IS_IPARD);
		dbe3.setDbFieldType(DbFieldType.NVARCHAR);
		dbe3.setDbFieldSize(1);
		dbe3.setIsNull(false);
		dbe3.setLabel_code("applicant_type.is_ipard");

		DbDataField dbe4 = new DbDataField();
		dbe4.setDbFieldName(PRC.IS_FARM);
		dbe4.setDbFieldType(DbFieldType.NVARCHAR);
		dbe4.setDbFieldSize(1);
		dbe4.setIsNull(false);
		dbe4.setLabel_code("applicant_type.is_farm");

		DbDataField[] dbTableFields = new DbDataField[4];
		dbTableFields[0] = dbe1;
		dbTableFields[1] = dbe2;
		dbTableFields[2] = dbe3;
		dbTableFields[3] = dbe4;

		dbe.setDbTableFields(dbTableFields);
		return dbe;
	}

	private static DbDataTable mkAddressDict() {
		DbDataTable dbe = new DbDataTable();
		dbe.setDbTableName("mk_address_dic");
		dbe.setDbRepoName(PRC.MASTER_REPO);
		dbe.setDbSchema(PRC.DEFAULT_SCHEMA);
		dbe.setIsSystemTable(false);
		dbe.setIsRepoTable(false);
		dbe.setLabel_code("master_repo.mk_address_dic");
		dbe.setUse_cache(false);

		DbDataField dbe1 = new DbDataField();
		dbe1.setDbFieldName("PKID");
		dbe1.setIsPrimaryKey(true);
		dbe1.setDbFieldType(DbFieldType.NUMERIC);
		dbe1.setDbFieldSize(18);
		dbe1.setDbFieldScale(0);
		dbe1.setIsNull(false);
		dbe1.setLabel_code(PRC.MASTER_REPO_PKID);

		DbDataField dbe2 = new DbDataField();
		dbe2.setDbFieldName("CODE");
		dbe2.setDbFieldType(DbFieldType.NVARCHAR);
		dbe2.setDbFieldSize(20);
		dbe2.setIsNull(false);
		dbe2.setLabel_code("mk_address_dic.code");

		DbDataField dbe3 = new DbDataField();
		dbe3.setDbFieldName("NTES_3");
		dbe3.setDbFieldType(DbFieldType.NVARCHAR);
		dbe3.setDbFieldSize(100);
		dbe3.setIsNull(false);
		dbe3.setLabel_code("mk_address_dic.ntes_3");

		DbDataField dbe4 = new DbDataField();
		dbe4.setDbFieldName("NTES_4");
		dbe4.setDbFieldType(DbFieldType.NVARCHAR);
		dbe4.setDbFieldSize(150);
		dbe4.setIsNull(false);
		dbe4.setLabel_code("mk_address_dic.ntes_4");

		DbDataField dbe5 = new DbDataField();
		dbe5.setDbFieldName("NTES_5");
		dbe5.setDbFieldType(DbFieldType.NVARCHAR);
		dbe5.setDbFieldSize(150);
		dbe5.setIsNull(false);
		dbe5.setLabel_code("mk_address_dic.ntes_5");

		DbDataField[] dbTableFields = new DbDataField[5];
		dbTableFields[0] = dbe1;
		dbTableFields[1] = dbe2;
		dbTableFields[2] = dbe3;
		dbTableFields[3] = dbe4;
		dbTableFields[4] = dbe5;

		dbe.setDbTableFields(dbTableFields);
		return dbe;
	}

	private static DbDataTable createBankAcc() {

		DbDataTable dbf = new DbDataTable();
		dbf.setDbTableName("bankacc");
		dbf.setDbRepoName(PRC.MASTER_REPO);
		dbf.setDbSchema(PRC.DEFAULT_SCHEMA);
		dbf.setIsSystemTable(true);
		dbf.setIsRepoTable(false);
		dbf.setLabel_code("master_repo.bankacc");
		dbf.setUse_cache(false);
		dbf.setParentName(PRC.PERSON);

		DbDataField dbf1 = new DbDataField();
		dbf1.setDbFieldName("PKID");
		dbf1.setIsPrimaryKey(true);
		dbf1.setDbFieldType(DbFieldType.NUMERIC);
		dbf1.setDbFieldSize(18);
		dbf1.setDbFieldScale(0);
		dbf1.setIsNull(false);
		dbf1.setLabel_code("bankacc.table_meta_pkid");

		DbDataField dbf2 = new DbDataField();
		dbf2.setDbFieldName("BANK_NAME");
		dbf2.setDbFieldType(DbFieldType.NVARCHAR);
		dbf2.setDbFieldSize(100);
		dbf2.setIsNull(false);
		dbf2.setCode_list_user_code("MKBANKS2020");
		dbf2.setLabel_code("bankacc.bank_name");

		DbDataField dbf3 = new DbDataField();
		dbf3.setDbFieldName("BANK_ACCOUNT");
		dbf3.setDbFieldType(DbFieldType.NUMERIC);
		dbf3.setDbFieldSize(15);
		dbf3.setIsUnique(true);
		dbf3.setIsNull(false);
		dbf3.setLabel_code("bankacc.bank_account");
		dbf3.setGui_metadata("{\"react\":{\"filterable\":true,\"visible\":true,\"minLength\":15,\"maxLength\":15,\"maximum\":\"\"}}");

		DbDataField dbf7 = new DbDataField();
		dbf7.setDbFieldName("IS_DEFAULT");
		dbf7.setDbFieldType(DbFieldType.BOOLEAN);
		dbf7.setLabel_code("bankacc.is_default");
		//dbf.setGui_metadata("{\"react\":{\"filterable\":true,\"visible\":true,\"resizable\":true,\"editable\":true}}");
	
		 DbDataField dbf4 = new DbDataField();
		 dbf4.setDbFieldName("BRANCH_ADDRESS");
		 dbf4.setDbFieldType(DbFieldType.NVARCHAR);
		 dbf4.setDbFieldSize(100);
		 dbf4.setIsNull(true);
		 dbf4.setLabel_code("bankacc.branch_address");
		 dbf4.setGui_metadata(CONST_GUI_FIL_VIS_RES_RW);

		// DbDataField dbf5 = new DbDataField();
		// dbf5.setDbFieldName("DATE_TO");
		// dbf5.setDbFieldType(DbFieldType.DATE);
		// dbf5.setDbFieldSize(3);
		// dbf5.setIsNull(true);
		// dbf5.setLabel_code("bankacc.date_to");
		// dbf5.setGui_metadata(CONST_GUI_FIL_HIDE);

//		DbDataField dbf6 = new DbDataField();
//		dbf6.setDbFieldName("person_id");
//		dbf6.setDbFieldType(DbFieldType.NUMERIC);
//		dbf6.setDbFieldSize(18);
//		dbf6.setIsNull(true);
//		dbf6.setLabel_code("bankacc.person_id");
//		dbf6.setGui_metadata(CONST_GUI_FIL_HIDE);

		DbDataField[] dbTableFields = new DbDataField[5];
		dbTableFields[0] = dbf1;
		dbTableFields[1] = dbf2;
		dbTableFields[2] = dbf3;
		dbTableFields[3] = dbf7;
		dbTableFields[4] = dbf4;
		// dbTableFields[3] = dbf4;
		// dbTableFields[4] = dbf5;
		// dbTableFields[3] = dbf6;
		

		dbf.setDbTableFields(dbTableFields);
		return dbf;
	}
	
	private static DbDataTable createIdentityData() {

		DbDataTable dbf = new DbDataTable();
		dbf.setDbTableName("identity_data");
		dbf.setDbRepoName(PRC.MASTER_REPO);
		dbf.setDbSchema(PRC.DEFAULT_SCHEMA);
		dbf.setIsSystemTable(true);
		dbf.setIsRepoTable(false);
		dbf.setLabel_code("master_repo.identity_data");
		dbf.setUse_cache(false);
		dbf.setParentName(PRC.PERSON);

		DbDataField dbf1 = new DbDataField();
		dbf1.setDbFieldName("PKID");
		dbf1.setIsPrimaryKey(true);
		dbf1.setDbFieldType(DbFieldType.NUMERIC);
		dbf1.setDbFieldSize(18);
		dbf1.setDbFieldScale(0);
		dbf1.setIsNull(false);
		dbf1.setLabel_code("identity_data.table_meta_pkid");

		DbDataField dbf2 = new DbDataField();
		dbf2.setDbFieldName("IDENTITY_CODE");
		dbf2.setDbFieldType(DbFieldType.NVARCHAR);
		dbf2.setDbFieldSize(30);
		dbf2.setIsNull(false);
		dbf2.setLabel_code("identity_data.bank_name");
		dbf2.setGui_metadata(CONST_GUI_FIL_VIS_RES_RW);

		DbDataField dbf3 = new DbDataField();
		dbf3.setDbFieldName("DOCUMENT_SERAIL_NO");
		dbf3.setDbFieldType(DbFieldType.NVARCHAR);
		dbf3.setDbFieldSize(30);
		dbf3.setIsNull(false);
		dbf3.setLabel_code("identity_data.document_serial_no");
		dbf3.setGui_metadata(CONST_GUI_FIL_VIS_RES_RW);

		DbDataField dbf4 = new DbDataField();
		dbf4.setDbFieldName("ISSUED_BY");
		dbf4.setDbFieldType(DbFieldType.NVARCHAR);
		dbf4.setDbFieldSize(10);
		dbf4.setIsNull(true);
		dbf4.setLabel_code("identity_data.issued_by");
		dbf4.setCode_list_user_code("identity_data.document_authority");
		dbf4.setGui_metadata(CONST_GUI_FIL_VIS_RES_RW);

		DbDataField[] dbTableFields = new DbDataField[4];
		dbTableFields[0] = dbf1;
		dbTableFields[1] = dbf2;
		dbTableFields[2] = dbf3;
		dbTableFields[3] = dbf4;

		dbf.setDbTableFields(dbTableFields);
		return dbf;
	}
	
	// LINK between USER and PERSON
	private static DbDataObject createPoaLinkUserPerson() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "POA");
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "link between USER and PERSON");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, ("SVAROG_USERS"));
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, (PRC.PERSON));
		return dbLink;
	}

	private static DbDataObject createLinkPhysicalLegal() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "LINK_PHYSICAL_LEGAL");
		dbLink.setVal(PRC.DEFER_SECURITY, true);
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "СОПСТВЕНИК");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, PRC.PERSON);
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, PRC.PERSON);
		return dbLink;
	}

	private static DbDataObject createLinkSupervisorBLegal() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "LINK_SUPERVISOR_B_LEGAL");
		dbLink.setVal(PRC.DEFER_SECURITY, true);
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "НАДЗОРЕН ОДБОР");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, PRC.PERSON);
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, PRC.PERSON);
		return dbLink;
	}

	private static DbDataObject createLinkExecutiveBLegal() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "LINK_EXECUTIVE_B_LEGAL");
		dbLink.setVal(PRC.DEFER_SECURITY, true);
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "ИЗВРШЕН ОДБОР");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, PRC.PERSON);
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, PRC.PERSON);
		return dbLink;
	}

	private static DbDataObject createLinkNonExecutiveBLegal() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "LINK_NON_EXECUTIVE_B_LEGAL");
		dbLink.setVal(PRC.DEFER_SECURITY, true);
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "НЕИЗВРШЕН ОДБОР");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, PRC.PERSON);
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, PRC.PERSON);
		return dbLink;
	}

	private static DbDataObject createLinkManagerBLegal() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "LINK_MANAGER_B_LEGAL");
		dbLink.setVal(PRC.DEFER_SECURITY, true);
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "УПРАВЕН ОДБОР");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, PRC.PERSON);
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, PRC.PERSON);
		return dbLink;
	}

	private static DbDataObject createLinkOManagerLegal() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "LINK_MANAGER_LEGAL");
		dbLink.setVal(PRC.DEFER_SECURITY, true);
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "УПРАВИТЕЛ");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, PRC.PERSON);
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, PRC.PERSON);
		return dbLink;
	}

	private static DbDataObject createLinkAssemblyLegal() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "LINK_ASSEMBLY_LEGAL");
		dbLink.setVal(PRC.DEFER_SECURITY, true);
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "ЧЛЕН НА СОБРАНИЕ");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, PRC.PERSON);
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, PRC.PERSON);
		return dbLink;
	}

	private static DbDataObject createLinkAdvisorLegal() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "LINK_ADVISOR_LEGAL");
		dbLink.setVal(PRC.DEFER_SECURITY, true);
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "СОВЕТНИК");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, PRC.PERSON);
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, PRC.PERSON);
		return dbLink;
	}

	private static DbDataObject createLinkProcuratorLegal() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "LINK_PROCURATOR_LEGAL");
		dbLink.setVal(PRC.DEFER_SECURITY, true);
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "ПРОКУРИСТ");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, PRC.PERSON);
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, PRC.PERSON);
		return dbLink;
	}

	private static DbDataObject createLinkCourierLegal() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "LINK_COURIER_LEGAL");
		dbLink.setVal(PRC.DEFER_SECURITY, true);
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "КУРИР");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, PRC.PERSON);
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, PRC.PERSON);
		return dbLink;
	}

	private static DbDataObject createLinkAccountantLegal() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "LINK_ACCOUNTANT_LEGAL");
		dbLink.setVal(PRC.DEFER_SECURITY, true);
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "СМЕТКОВОДИТЕЛ");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, PRC.PERSON);
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, PRC.PERSON);
		return dbLink;
	}

	private static DbDataObject createLinkShareholderLegal() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "LINK_SHAREHOLDER_LEGAL");
		dbLink.setVal(PRC.DEFER_SECURITY, true);
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "АКЦИОНЕР");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, PRC.PERSON);
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, PRC.PERSON);
		return dbLink;
	}

	private static DbDataObject createLinkLegalOwner() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "LINK_LEGAL_OWNER");
		dbLink.setVal(PRC.DEFER_SECURITY, true);
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "Link between LEGAL and OWNED LEGAL ENTITY");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, PRC.PERSON);
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, PRC.PERSON);
		return dbLink;
	}

	private static DbDataObject createLinkLegalSubsidiary() {
		DbDataObject dbLink = new DbDataObject();
		dbLink.setObjectType(svCONST.OBJECT_TYPE_LINK_TYPE);
		dbLink.setVal(PRC.LINK_TYPE, "LINK_LEGAL_SUBSIDIARY");
		dbLink.setVal(PRC.DEFER_SECURITY, true);
		dbLink.setVal(PRC.LINK_TYPE_DESCRIPTION, "Link between LEGAL ENTITY and SUBSIDIARY");
		dbLink.setVal(PRC.LINK_OBJ_TYPE_1, PRC.PERSON);
		dbLink.setVal(PRC.LINK_OBJ_TYPE_2, PRC.PERSON);
		return dbLink;
	}

	@Override
	public ArrayList<DbDataTable> getCustomObjectTypes() {
		DbDataTable dbtt = null;
		ArrayList<DbDataTable> dbtList = new ArrayList<DbDataTable>();
		dbtt = tablePerson();
		dbtList.add(addSortOrder(dbtt));
		dbtt = physicalEntity();
		dbtList.add(addSortOrder(dbtt));
		dbtt = legalEntity();
		dbtList.add(addSortOrder(dbtt));
		dbtt = mkAddressDict();
		dbtList.add(addSortOrder(dbtt));
		dbtt = createBankAcc();
		dbtList.add(addSortOrder(dbtt));
		dbtt = applicantType();
		dbtList.add(addSortOrder(dbtt));
		dbtt = createIdentityData();
		dbtList.add(addSortOrder(dbtt));
		
		
		return dbtList;
	}

	@Override
	public ArrayList<DbDataObject> getCustomObjectInstances() {
		DbDataObject dbio = new DbDataObject();
		ArrayList<DbDataObject> dbiList = new ArrayList<DbDataObject>();
//		dbio = createLinkPhysicalLegal();
//		dbiList.add(dbio);
//		dbio = createLinkSupervisorBLegal();
//		dbiList.add(dbio);
//		dbio = createLinkExecutiveBLegal();
//		dbiList.add(dbio);
//		dbio = createLinkNonExecutiveBLegal();
//		dbiList.add(dbio);
//		dbio = createLinkManagerBLegal();
//		dbiList.add(dbio);
//		dbio = createLinkOManagerLegal();
//		dbiList.add(dbio);
//		dbio = createLinkAssemblyLegal();
//		dbiList.add(dbio);
//		dbio = createLinkAdvisorLegal();
//		dbiList.add(dbio);
//		dbio = createLinkProcuratorLegal();
//		dbiList.add(dbio);
//		dbio = createLinkCourierLegal();
//		dbiList.add(dbio);
//		dbio = createLinkAccountantLegal();
//		dbiList.add(dbio);
//		dbio = createLinkShareholderLegal();
//		dbiList.add(dbio);
		dbio = createLinkLegalOwner();
		dbiList.add(dbio);
		dbio = createLinkLegalSubsidiary();
		dbiList.add(dbio);
		dbio = createPoaLinkUserPerson();
		dbiList.add(dbio);

		return dbiList;
	}

}
