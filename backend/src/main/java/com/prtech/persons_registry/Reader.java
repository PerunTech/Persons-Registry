package com.prtech.persons_registry;

import java.util.ArrayList;
import java.util.HashMap;

import com.google.gson.JsonObject;
import com.prtech.svarog.CodeList;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.svCONST;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.DbSearchCriterion;
import com.prtech.svarog_common.DbSearchExpression;
import com.prtech.svarog_common.DbSearchCriterion.DbCompareOperand;

public class Reader {
	public DbDataObject getCodeListByCodeValue(String codeValue, SvReader svr) throws SvException {
		DbDataObject dboCodeList = null;
		DbSearchCriterion cr1 = new DbSearchCriterion(PRC.CODE_VALUE, DbCompareOperand.EQUAL, codeValue);
		DbSearchCriterion cr2 = new DbSearchCriterion(PRC.PARENT_CODE_VALUE, DbCompareOperand.ISNULL);
		DbDataArray dbArr = svr.getObjects(new DbSearchExpression().addDbSearchItem(cr1).addDbSearchItem(cr2),
				svCONST.OBJECT_TYPE_CODE, null, 0, 0);
		if (dbArr != null && !dbArr.getItems().isEmpty()) {
			dboCodeList = dbArr.get(0);
		}
		return dboCodeList;
	}

	public DbDataObject getFieldByFieldName(String labelCode, SvReader svr) throws SvException {
		DbDataObject dboField = null;
		DbSearchCriterion cr = new DbSearchCriterion(PRC.LABEL_CODE, DbCompareOperand.EQUAL, labelCode);
		DbDataArray dbArr = svr.getObjects(new DbSearchExpression().addDbSearchItem(cr), svCONST.OBJECT_TYPE_FIELD,
				null, 0, 0);
		if (dbArr != null && !dbArr.getItems().isEmpty()) {
			dboField = dbArr.get(0);
		}
		return dboField;
	}
	
	public JsonObject getDependentElements(JsonObject jFormData, String tableName, SvReader svr) throws SvException {
		JsonObject jResult = new JsonObject();
		HashMap<String, String> hmDistinctDependentValues = new HashMap<>();
		DbDataArray dbaDependencyConfigurationTable = new DbDataArray();
		try (CodeList cl = new CodeList(svr)) {
			if (!jFormData.has(PRC.PARENT_CODE_VALUE)) {
				throw new SvException("error.perun_core.missing_code_value", svr.getInstanceUser());
			}
			String fieldValue = null;
			String parentCodeValue = jFormData.get(PRC.PARENT_CODE_VALUE).getAsString();
			if (!jFormData.has(PRC.FIELD_VALUE)) {
				throw new SvException("error.perun_core.missing_field_value", svr.getInstanceUser());
			} else {
				fieldValue = jFormData.get(PRC.FIELD_VALUE).getAsString();
			}
			DbDataObject dboConfigField = getDependencyDropdownConfigurationDboField(tableName, parentCodeValue);
			if (dboConfigField == null) {
				throw new SvException("error.perun_core.missing_config_field", svr.getInstanceUser());
			}
			
			if (fieldValue.equals("MKD")) {
				ArrayList<String> regions = new ArrayList<>();
				regions.add("VAR");
				regions.add("SK");
				regions.add("EAST");
				regions.add("SE");
				regions.add("PEL");
				regions.add("NE");
				regions.add("POL");
				regions.add("SW");
				dbaDependencyConfigurationTable = searchDbObjectsByMultipleFilter(DbCompareOperand.EQUAL,
						SvCore.getTypeIdByName(tableName), dboConfigField.getVal(PRC.FIELD_NAME).toString(), regions,
						svr);
			} else
				dbaDependencyConfigurationTable = searchDbObjectsBySingleFilter(DbCompareOperand.EQUAL,
						SvCore.getTypeIdByName(tableName), dboConfigField.getVal(PRC.FIELD_NAME).toString(), fieldValue,
						svr);
			
			if (!jFormData.has(PRC.DEPENDENT_PARENT_CODE_VALUE)) {
				throw new SvException("error.perun_core.missing_dep_code_value", svr.getInstanceUser());
			}
			String dependentParentCodeValue = jFormData.get(PRC.DEPENDENT_PARENT_CODE_VALUE).getAsString();
			dboConfigField = getDependencyDropdownConfigurationDboField(tableName, dependentParentCodeValue);
			if (dboConfigField == null) {
				throw new SvException("error.perun_core.missing_config_field", svr.getInstanceUser());
			}
			DbDataObject dboParentCode = getDboCodebyParentCodeValue(dependentParentCodeValue, svr);
			if (dboParentCode == null) {
				throw new SvException("error.perun_core.dependent_parent_code_value_not_found", svr.getInstanceUser());
			}
			hmDistinctDependentValues = cl.getCodeList(dboParentCode.getObjectId(), true);
			for (DbDataObject dbo : dbaDependencyConfigurationTable.getItems()) {
				if (hmDistinctDependentValues
						.get(dbo.getVal(dboConfigField.getVal(PRC.FIELD_NAME).toString())) != null) {
					jResult.addProperty(dbo.getVal(dboConfigField.getVal(PRC.FIELD_NAME).toString()).toString(),
							hmDistinctDependentValues.get(dbo.getVal(dboConfigField.getVal(PRC.FIELD_NAME).toString())));
				}
			}
		}
		return jResult;
	}

	public DbDataObject getDependencyDropdownConfigurationDboField(String configTableName, String parentCodeValue)
			throws SvException {
		DbDataObject dboMatchedField = null;
		DbDataArray dbaFields = SvCore.getFields(SvCore.getTypeIdByName(configTableName));
		if (dbaFields == null) {
			throw new SvException("error.perun_core.config_table_not_found", null);
		}
		for (DbDataObject dbo : dbaFields.getItems()) {
			if (dbo.getVal(PRC.CODE_LIST_MNEMONIC) != null
					&& dbo.getVal(PRC.CODE_LIST_MNEMONIC).toString().equals(parentCodeValue)) {
				dboMatchedField = dbo;
				break;
			}
		}
		return dboMatchedField;
	}
	
	public DbDataObject getDboCodebyParentCodeValue(String parentCodeValue, SvReader svr) {
		DbDataObject dbo = null;
		DbDataArray dbaParentCodes = searchDbObjectsBySingleFilter(DbCompareOperand.EQUAL, svCONST.OBJECT_TYPE_CODE,
				PRC.CODE_VALUE, parentCodeValue, svr);
		for (DbDataObject dboParentCode : dbaParentCodes.getItems()) {
			if (dboParentCode.getVal(PRC.PARENT_CODE_VALUE) == null) {
				dbo = dboParentCode;
				break;
			}
		}
		return dbo;
	}
	
	public DbDataArray searchDbObjectsBySingleFilter(DbCompareOperand operand, Long objectType, String columnName,
			Object value, SvReader svr) {
		DbDataArray dbArr = new DbDataArray();
		try {
			DbSearchCriterion cr1 = new DbSearchCriterion(columnName, operand, value);
			dbArr = svr.getObjects(cr1, objectType, null, 0, 0);
			return dbArr;
		} catch (SvException e) {
		}
		return dbArr;
	}
	
	public DbDataArray searchDbObjectsByMultipleFilter(DbCompareOperand operand, Long objectType, String columnName,
			ArrayList<String> vals, SvReader svr) {
		DbDataArray dbArr = new DbDataArray();
		try {
			DbSearchExpression exp = new DbSearchExpression();
			for (String s : vals) {
				DbSearchCriterion cr = new DbSearchCriterion(columnName, operand, s);
				cr.setNextCritOperand("OR");
				exp.addDbSearchItem(cr);
			}
			dbArr = svr.getObjects(exp, objectType, null, 0, 0);
			return dbArr;
		} catch (SvException e) {
		}
		return dbArr;
	}
}
