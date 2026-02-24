package com.prtech.persons_registry.models;

import java.sql.Date;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.prtech.models.BaseObjectModel;
import com.prtech.persons_registry.PRC;
import com.prtech.persons_registry.Reader;
import com.prtech.svarog.I18n;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvLink;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvWriter;
import com.prtech.svarog_common.DbDataObject;

public class Person extends BaseObjectModel {
	static final Logger log4j = LogManager.getLogger(Person.class.getName());

	String idNo;
	String taxNo;
	String name;
	String countryCode;
	String municipality;
	String cityVillage;
	String address;
	Date dtBirthReg;
	String personType;
	String city;
	String phoneNumber;
	String email;
	Long pilotFormId;

	public Person() {
		super();
	}

	@Override
	public Person setValue(String field, Object value) {
		switch (field) {
		case PRC.ID_NO:
			this.idNo = value.toString();
			break;
		case PRC.TAX_NO:
			this.taxNo = value.toString();
			break;
		case PRC.NAME:
			this.name = value.toString();
			break;
		case PRC.COUNTRY_CODE:
			this.countryCode = value.toString();
			break;
		case PRC.MUNICIPALITY:
			this.municipality = value.toString();
			break;
		case PRC.CITY_VILLAGE:
			this.cityVillage = value.toString();
			break;
		case PRC.ADDRESS:
			this.address = value.toString();
			break;
		case PRC.DT_BIRTH_REG:
			this.dtBirthReg = Date.valueOf(value.toString());
			break;
		case PRC.PERSON_TYPE:
			this.personType = value.toString();
			break;
		case PRC.CITY:
			this.city = value.toString();
			break;
		case PRC.PHONE_NUMBER:
			this.phoneNumber = value.toString();
			break;
		case PRC.EMAIL:
			this.email = value.toString();
			break;
		case PRC.PILOT_FORM_ID:
			this.pilotFormId = Long.parseLong(value.toString());
			break;
		default:
			break;
		}
		return this;
	}

	@Override
	public Object getValue(String field) {
		Object o = null;
		switch (field) {
		case PRC.ID_NO:
			o = this.idNo;
			break;
		case PRC.TAX_NO:
			o = this.taxNo;
			break;
		case PRC.NAME:
			o = this.name;
			break;
		case PRC.COUNTRY_CODE:
			o = this.countryCode;
			break;
		case PRC.MUNICIPALITY:
			o = this.municipality;
			break;
		case PRC.CITY_VILLAGE:
			o = this.cityVillage;
			break;
		case PRC.ADDRESS:
			o = this.address;
			break;
		case PRC.DT_BIRTH_REG:
			o = this.dtBirthReg;
			break;
		case PRC.PERSON_TYPE:
			o = this.personType;
			break;
		case PRC.CITY:
			o = this.city;
			break;
		case PRC.PHONE_NUMBER:
			o = this.phoneNumber;
			break;
		case PRC.EMAIL:
			o = this.email;
			break;
		case PRC.PILOT_FORM_ID:
			o = this.pilotFormId;
			break;
		default:
			break;
		}
		return o;
	}

	@Override
	public String getTableName() {
		return PRC.PERSON;
	}

	public DbDataObject setValues(DbDataObject obj) {
		super.setValues(obj);
		obj.setVal(PRC.ID_NO, this.idNo);
		obj.setVal(PRC.TAX_NO, this.taxNo);
		obj.setVal(PRC.NAME, this.name);
		obj.setVal(PRC.COUNTRY_CODE, this.countryCode);
		obj.setVal(PRC.MUNICIPALITY, this.municipality);
		obj.setVal(PRC.CITY_VILLAGE, this.cityVillage);
		obj.setVal(PRC.ADDRESS, this.address);
		obj.setVal(PRC.DT_BIRTH_REG, this.dtBirthReg);
		obj.setVal(PRC.PERSON_TYPE, this.personType);
		obj.setVal(PRC.CITY, this.city);
		obj.setVal(PRC.PHONE_NUMBER, this.phoneNumber);
		obj.setVal(PRC.EMAIL, this.email);
		obj.setVal(PRC.PILOT_FORM_ID, this.pilotFormId);
		return obj;
	}

	public DbDataObject setValues(DbDataObject obj, DbDataObject otherDbObj) {
		super.setValues(obj, otherDbObj);
		obj.setVal(PRC.ID_NO, otherDbObj.getVal(PRC.ID_NO));
		obj.setVal(PRC.TAX_NO, otherDbObj.getVal(PRC.TAX_NO));
		obj.setVal(PRC.NAME, otherDbObj.getVal(PRC.NAME));
		obj.setVal(PRC.COUNTRY_CODE, otherDbObj.getVal(PRC.COUNTRY_CODE));
		obj.setVal(PRC.MUNICIPALITY, otherDbObj.getVal(PRC.MUNICIPALITY));
		obj.setVal(PRC.CITY_VILLAGE, otherDbObj.getVal(PRC.CITY_VILLAGE));
		obj.setVal(PRC.ADDRESS, otherDbObj.getVal(PRC.ADDRESS));
		obj.setVal(PRC.DT_BIRTH_REG, otherDbObj.getVal(PRC.DT_BIRTH_REG));
		obj.setVal(PRC.PERSON_TYPE, otherDbObj.getVal(PRC.PERSON_TYPE));
		obj.setVal(PRC.CITY, otherDbObj.getVal(PRC.CITY));
		obj.setVal(PRC.PHONE_NUMBER, otherDbObj.getVal(PRC.PHONE_NUMBER));
		obj.setVal(PRC.EMAIL, otherDbObj.getVal(PRC.EMAIL));
		obj.setVal(PRC.PILOT_FORM_ID, otherDbObj.getVal(PRC.PILOT_FORM_ID));
		return obj;
	}

	public void from(DbDataObject obj) {
		super.from(obj);
		this.idNo = (String) obj.getVal(PRC.ID_NO);
		this.taxNo = (String) obj.getVal(PRC.TAX_NO);
		this.name = (String) obj.getVal(PRC.NAME);
		this.countryCode = (String) obj.getVal(PRC.COUNTRY_CODE);
		this.municipality = (String) obj.getVal(PRC.MUNICIPALITY);
		this.cityVillage = (String) obj.getVal(PRC.CITY_VILLAGE);
		this.address = (String) obj.getVal(PRC.ADDRESS);
		this.dtBirthReg = obj.getVal(PRC.DT_BIRTH_REG) != null ? (Date) obj.getVal(PRC.DT_BIRTH_REG) : null;
		this.personType = (String) obj.getVal(PRC.PERSON_TYPE);
		this.city = (String) obj.getVal(PRC.CITY);
		this.phoneNumber = (String) obj.getVal(PRC.PHONE_NUMBER);
		this.email = (String) obj.getVal(PRC.EMAIL);
		this.pilotFormId = obj.getVal(PRC.PILOT_FORM_ID) != null ? (Long) obj.getVal(PRC.PILOT_FORM_ID) : null;
	}

	public List<String> saveObject(Long parentId, Long objectId, String localeId, SvReader svr, SvWriter svw)
			throws SvException {
		List<String> errorsList = null;
		DbDataObject obj = null;

		if (objectId == 0) {
			obj = new DbDataObject();
		} else {
			obj = BaseObjectModel.getObjectVersion(objectId, getTableName(), true, svr);
			super.from(obj);
		}
		if (parentId != null) {
			this.setParentId(parentId);
		}
		obj = setValues(obj);
		errorsList = checkValidData(obj, localeId, svr, svw, true);

		if (!errorsList.isEmpty()) {
			log4j.trace("The following validation errors have appeared:");
			for (String error : errorsList) {
				log4j.trace(error);
			}
		} else {
			svw.saveObject(obj, true);
			this.from(obj);
			log4j.trace("Person object saved successfully with objectId: {}", this.getObjectId());
		}
		return errorsList;
	}

	public List<String> checkValidData(DbDataObject obj, String localeId, SvReader svr, SvWriter svw,
			Boolean checkCustom) throws SvException {
		List<String> errors = super.checkValidData(localeId, svr);

		if (this.idNo == null || this.idNo.isBlank()) {
			errors.add(I18n.getText(localeId, "perun.error.missingValueForField") + " "
					+ I18n.getText(localeId, this.fieldsLabels.get(PRC.ID_NO)));
		}

		if (this.name == null || this.name.isBlank()) {
			errors.add(I18n.getText(localeId, "perun.error.missingValueForField") + " "
					+ I18n.getText(localeId, this.fieldsLabels.get(PRC.NAME)));
		}

		if (this.dtBirthReg == null) {
			errors.add(I18n.getText(localeId, "perun.error.missingValueForField") + " "
					+ I18n.getText(localeId, this.fieldsLabels.get(PRC.DT_BIRTH_REG)));
		}

		return errors;
	}

	@Override
	public LinkedHashMap<String, String> getDetails(String localeId, SvReader svr) throws SvException {
		LinkedHashMap<String, String> details = new LinkedHashMap<String, String>();
		String labelElement = null;
		String valueElement = null;

		labelElement = I18n.getText(localeId, this.fieldsLabels.get(PRC.NAME));
		valueElement = this.name != null ? this.name : PRC.NOT_AVAILABLE_NA;
		details.put(labelElement, valueElement);

		labelElement = I18n.getText(localeId, this.fieldsLabels.get(PRC.PERSON_TYPE));
		if (this.personType != null) {
			String value = Reader.getLabelCodeByCodelist("PERSON_TYPE", this.personType, svr);
			valueElement = I18n.getText(localeId, value);
		} else {
			valueElement = PRC.NOT_AVAILABLE_NA;
		}
		details.put(labelElement, valueElement);

		labelElement = I18n.getText(localeId, this.fieldsLabels.get(PRC.ID_NO));
		valueElement = this.idNo != null ? this.idNo : PRC.NOT_AVAILABLE_NA;
		details.put(labelElement, valueElement);

		labelElement = I18n.getText(localeId, this.fieldsLabels.get(PRC.TAX_NO));
		valueElement = this.taxNo != null ? this.taxNo : PRC.NOT_AVAILABLE_NA;
		details.put(labelElement, valueElement);

		return details;
	}

	@Override
	public LinkedHashMap<String, String> getSummary(String localeId, SvReader svr) throws SvException {
		LinkedHashMap<String, String> summary = new LinkedHashMap<String, String>();
		String labelElement = null;
		String valueElement = null;

		labelElement = I18n.getText(localeId, this.fieldsLabels.get(PRC.NAME));
		valueElement = this.name != null ? this.name : PRC.NOT_AVAILABLE_NA;
		summary.put(labelElement, valueElement);

		labelElement = I18n.getText(localeId, this.fieldsLabels.get(PRC.ID_NO));
		valueElement = this.idNo != null ? this.idNo : PRC.NOT_AVAILABLE_NA;
		summary.put(labelElement, valueElement);

		labelElement = I18n.getText(localeId, this.fieldsLabels.get(PRC.PERSON_TYPE));
		valueElement = this.personType != null ? this.personType : PRC.NOT_AVAILABLE_NA;
		summary.put(labelElement, valueElement);

		return summary;
	}

	@Override
	public List<String> onStatusChange(String newStatus, SvReader svr, SvWriter svw) {
		return new ArrayList<String>();
	}

	@Override
	public List<String> invalidateLink(String linkName, Long linkedObjectId, SvReader svr, SvWriter svw)
			throws SvException {
		return new ArrayList<String>();
	}

	@Override
	public List<String> saveAndLink(Long parentId, Long objectId, String linkType, Long objectToBeLinkedTo,
			String locale, SvReader svr, SvWriter svw, SvLink svLink) throws SvException {
		return new ArrayList<String>();
	}
}