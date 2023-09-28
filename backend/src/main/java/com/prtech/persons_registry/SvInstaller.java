package com.prtech.persons_registry;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;

import com.prtech.svarog.SvException;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvWriter;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.DbSearchCriterion;
import com.prtech.svarog_common.DbSearchCriterion.DbCompareOperand;
import com.prtech.svarog_common.DbSearchExpression;
import com.prtech.svarog_interfaces.ISvConfigurationMulti;
import com.prtech.svarog_interfaces.ISvCore;

/**
 * Configuration class
 * 
 * @author dcekovic
 *
 */
public class SvInstaller implements ISvConfigurationMulti {

	@Override
	public int executionOrder(UpdateType updateType) {
		return 0;
	}

	@Override
	public String beforeSchemaUpdate(Connection conn, ISvCore core, String schema) throws Exception {
		return null;
	}

	@Override
	public String beforeLabelsUpdate(Connection conn, ISvCore core, String schema) throws Exception {
		return null;
	}

	@Override
	public String beforeCodesUpdate(Connection conn, ISvCore core, String schema) throws Exception {
		return null;
	}

	@Override
	public String beforeTypesUpdate(Connection conn, ISvCore core, String schema) throws Exception {
		return null;
	}

	@Override
	public String beforeLinkTypesUpdate(Connection conn, ISvCore core, String schema) throws Exception {
		return null;
	}

	@Override
	public String beforeAclUpdate(Connection conn, ISvCore core, String schema) throws Exception {
//		try (SvReader svr = (SvReader) core; SvWriter svw = new SvWriter(svr)) {
//			createApplicantType("Физичко лице", "Y", "N", svr, svw);
//			createApplicantType("Занаетчија", "Y", "N", svr, svw);
//			createApplicantType("Семејно земјоделско стопанство", "Y", "Y", svr, svw);
//			createApplicantType("Индивидуален земјоделски производител", "Y", "Y", svr, svw);
//			createApplicantType("Физичко лице регистрирано за вршење на угостителска дејност", "Y", "N", svr, svw);
//			createApplicantType("Трговско/ Акционерско друштво", "Y", "N", svr, svw);
//			createApplicantType("Трговец поединец", "Y", "N", svr, svw);
//			createApplicantType("Задруга", "Y", "N", svr, svw);
//			createApplicantType("Здружение на правни субјекти", "Y", "N", svr, svw);
//
//			createApplicantType("Инд. земјоделец-ФПИОМ", "Y", "Y", svr, svw);
//			createApplicantType("Инд.земјоделец-МЗШВ", "Y", "N", svr, svw);
//			createApplicantType("Кооператива(Зем.задруга)", "Y", "N", svr, svw);
//			createApplicantType("Допол. дејност", "Y", "N", svr, svw);
//			createApplicantType("Стоп.интер.заедница", "Y", "N", svr, svw);
//			createApplicantType("Правно лице (индивидуален земјоделец-мзшв)", "Y", "N", svr, svw);
//			createApplicantType("Акционерско друштво", "Y", "N", svr, svw);
//			svw.dbCommit();
//		}
		return null;

	}

	@Override
	public String beforeSidAclUpdate(Connection conn, ISvCore core, String schema) throws Exception {
		return null;
	}

	@Override
	public String afterUpdate(Connection conn, ISvCore core, String schema) throws Exception {
//		try (SvReader svr = (SvReader) core; SvWriter svw = new SvWriter(svr)) {
//			Reader rdr = new Reader();
//			DbDataObject dboCodeList = rdr.getCodeListByCodeValue(PRC.COUNTRY_CODE, svr);
//			if (dboCodeList != null) {
//				DbDataObject dboField = rdr.getFieldByFieldName("contact_data.state", svr);
//				if (dboField != null) {
//					dboField.setVal(PRC.CODE_LIST_ID, dboCodeList.getObjectId());
//					dboField.setVal(PRC.CODE_LIST_MNEMONIC, dboCodeList.getVal(PRC.CODE_VALUE).toString());
//					svw.saveObject(dboField, false);
//					svw.dbCommit();
//				}
//			}
//		}
		return null;
	}

	private void createApplicantType(String name, String is_ipard, String is_farm, SvReader svr, SvWriter svw)
			throws SvException {
		DbDataObject applicantType = null;

		DbSearchCriterion cr1 = new DbSearchCriterion("NAME", DbCompareOperand.EQUAL, name);
		DbSearchExpression expr1 = new DbSearchExpression().addDbSearchItem(cr1);
		DbDataArray results = svr.getObjects(expr1, SvReader.getTypeIdByName("APPLICANT_TYPE"), null, 0, 0);

		if (!results.isEmpty()) {
			applicantType = results.getItems().get(0);
		}

		if (applicantType == null) {
			applicantType = new DbDataObject(SvReader.getTypeIdByName("APPLICANT_TYPE"));
			applicantType.setVal("NAME", name);
			applicantType.setVal(PRC.IS_IPARD, is_ipard);
			applicantType.setVal(PRC.IS_FARM, is_farm);
			svw.saveObject(applicantType, false);
		} else {
			if (!applicantType.getVal("NAME").toString().equals(name)) {
				applicantType.setVal("NAME", name);
			}
			if (!applicantType.getVal(PRC.IS_IPARD).toString().equals(is_ipard)) {
				applicantType.setVal(PRC.IS_IPARD, is_ipard);
			}
			if (!applicantType.getVal(PRC.IS_FARM).toString().equals(is_farm)) {
				applicantType.setVal(PRC.IS_FARM, is_farm);
			}
			if (applicantType.getIsDirty()) {
				svw.saveObject(applicantType, false);
			}
		}
	}

	@Override
	public int getVersion(int currentVersion) {
		return 2;
	}

	@Override
	public List<UpdateType> getUpdateTypes() {
		ArrayList<UpdateType> updateTypes = new ArrayList<>();
		updateTypes.add(UpdateType.FINAL);
		return updateTypes;
	}
}
