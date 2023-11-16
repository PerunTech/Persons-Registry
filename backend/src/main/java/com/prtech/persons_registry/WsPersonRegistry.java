package com.prtech.persons_registry;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.locks.ReentrantLock;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;

import org.apache.logging.log4j.Logger;
import org.joda.time.DateTime;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import com.prtech.perun.PerunUtil;
import com.prtech.perun_core.ws.Rc;
import com.prtech.perun_core.ws.WsReactElements;
import com.prtech.svarog.I18n;
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvLink;
import com.prtech.svarog.SvLock;
import com.prtech.svarog.SvParameter;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvWorkflow;
import com.prtech.svarog.SvWriter;
import com.prtech.svarog.svCONST;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.DbQueryExpression;
import com.prtech.svarog_common.DbQueryObject;
import com.prtech.svarog_common.DbSearchCriterion;
import com.prtech.svarog_common.ResponseHandler;
import com.prtech.svarog_common.DbQueryObject.DbJoinType;
import com.prtech.svarog_common.DbQueryObject.LinkType;
import com.prtech.svarog_common.DbSearchCriterion.DbCompareOperand;
import com.prtech.svarog_common.DbSearchExpression;
import com.prtech.svarog_common.ResponseHandler.MessageType;

@Path("/SvPersonRegistry")
public class WsPersonRegistry {

	static final Logger log4j = SvConf.getLogger(WsPersonRegistry.class);

	@Path("/getOptions/{token}/{tableName}")
	@GET
	@Produces("application/json")
	public Response getOptions(@PathParam("token") String token, @PathParam("tableName") String tableName) {

		ResponseHandler jrh = new ResponseHandler();
		try (SvReader svr = new SvReader(token)) {

			JsonArray jArray = new JsonArray();
			JsonObject jObj;

			jObj = new JsonObject();
			jObj.addProperty("text", I18n.getText("options.choose"));
			jObj.addProperty(PRC.VALUE, 0);
			jObj.addProperty("selected", true);
			jObj.addProperty("disabled", true);
			jArray.add(jObj);

			DbDataArray fields = SvReader.getFields(SvReader.getTypeIdByName(tableName));

			for (DbDataObject field : fields.getItems()) {
				if (field.getVal("INDEX_NAME") != null) {
					jObj = new JsonObject();
					jObj.addProperty("text", I18n.getText(field.getVal("LABEL_CODE").toString()));
					jObj.addProperty(PRC.VALUE, field.getVal("FIELD_NAME").toString());
					jArray.add(jObj);
				}
			}
			jrh.create(MessageType.SUCCESS, I18n.getText(PRC.SUCCESS_GET_OPTIONS),
					I18n.getText(PRC.SUCCESS_GET_OPTIONS), jArray);

		} catch (Exception e) {
			return PerunUtil.handleException(e, "Error getting options");
		}
		return Response.status(200).entity(jrh.getAll().toString()).build();
	}

	@Path("/getTableJSONSchemaPerson/{sessionId}/{table_name}/{personType}")
	@GET
	@Produces("application/json")
	public Response getTableJSONSchemaPerson(@PathParam("sessionId") String sessionId,
			@PathParam("table_name") String tableName, @PathParam("personType") String personType,
			@Context HttpServletRequest httpRequest) {
		ResponseHandler jrh = new ResponseHandler();
		JsonObject jObj2 = null;
		try {
			Response response = (new WsReactElements()).getTableJSONSchema(sessionId, tableName, httpRequest);
			if (response.getStatus() == 200) {
				String defaultCountry = SvParameter.getSysParam("DEFAULT_COUNTRY", "MKD").toUpperCase();
				JsonObject jObj = (new Gson()).fromJson((String) response.getEntity(), JsonObject.class);
				JsonArray jARequired = new JsonArray();
				// if (jObj.has(Rc.REQUIRED)) {
				ArrayList<String> listRequired = new ArrayList<>();
				if (personType.equalsIgnoreCase("p")) {
					switch (defaultCountry) {
					case "MDA":
						listRequired.add(PRC.ID_NO);
						listRequired.add("DT_BIRTH_REG");
						break;
					default:
						listRequired.add(PRC.ID_NO);
						listRequired.add("ADDRESS");
						listRequired.add("DT_BIRTH_REG");
						listRequired.add("COUNTRY_CODE");
						listRequired.add("MUNICIPALITY");
						listRequired.add("CITY_VILLAGE");
						listRequired.add("CITY");
					}

					response = (new WsReactElements()).getTableJSONSchema(sessionId, PRC.PHYSICAL_ENTITY, httpRequest);

					if (response.getStatus() == 200) {
						jObj2 = (new Gson()).fromJson((String) response.getEntity(), JsonObject.class);
						if (jObj2.has(Rc.REQUIRED)) {
							jARequired = jObj2.get(Rc.REQUIRED).getAsJsonArray();
						}
					}

				} else if (personType.equalsIgnoreCase("g")) {
					switch (defaultCountry) {
					case "MDA":
						listRequired.add(PRC.ID_NO);
						listRequired.add("NAME");
						listRequired.add("DT_BIRTH_REG");
						break;
					default:
						listRequired.add(PRC.ID_NO);
						listRequired.add(PRC.TAX_NO);
						listRequired.add("NAME");
						listRequired.add("ADDRESS");
						listRequired.add("DT_BIRTH_REG");
						listRequired.add("COUNTRY_CODE");
						listRequired.add("MUNICIPALITY");
						listRequired.add("CITY_VILLAGE");
						listRequired.add("CITY");
					}

					response = (new WsReactElements()).getTableJSONSchema(sessionId, PRC.LEGAL_ENTITY, httpRequest);

					if (response.getStatus() == 200) {
						jObj2 = (new Gson()).fromJson((String) response.getEntity(), JsonObject.class);

						if (jObj2.has(Rc.REQUIRED)) {
							jARequired = jObj2.get(Rc.REQUIRED).getAsJsonArray();
						}
					}

				}
				JsonElement element = (new Gson()).toJsonTree(listRequired, new TypeToken<List<String>>() {
				}.getType());

				if (jObj2 != null) {
					jObj.addProperty(Rc.TITLE, jObj2.get(Rc.TITLE).getAsString());
					JsonObject properties = jObj.get(Rc.PROPERTIES).getAsJsonObject();
					if (personType.equalsIgnoreCase("p")) {

						switch (defaultCountry) {
						case "MDA":
							properties.remove("NAME");
							properties.remove(PRC.TAX_NO);
							break;
						default:
							properties.remove("NAME");
							properties.remove(PRC.TAX_NO);
						}
					}
					if (personType.equalsIgnoreCase("g")) {
						switch (defaultCountry) {
						case "MDA":

							break;
						default:
							if (properties.has(PRC.ID_NO)) {
								JsonObject jIdNo = properties.get(PRC.ID_NO).getAsJsonObject();
								jIdNo.addProperty("minLength", 7);
								jIdNo.addProperty("maxLength", 7);
								properties.add(PRC.ID_NO, jIdNo);
							}
						}
					}
					for (Map.Entry<String, JsonElement> entry : jObj2.entrySet()) {
						if (entry.getKey().equals(Rc.PROPERTIES))
							for (Map.Entry<String, JsonElement> entry1 : entry.getValue().getAsJsonObject()
									.entrySet()) {
								if (!entry1.getKey().equalsIgnoreCase("DT_DEATH")
										&& !entry1.getKey().equalsIgnoreCase("PLACE_OF_BIRTH")
										&& !entry1.getKey().equalsIgnoreCase("STATE_OF_BIRTH")) {
									properties.add(entry1.getKey(), entry1.getValue());
								}
							}
					}
					jObj.add(Rc.PROPERTIES, properties);
				}

				if (element.isJsonArray()) {
					jARequired.addAll(element.getAsJsonArray());
					jObj.add(Rc.REQUIRED, jARequired);
				}
				// }
				jrh.create(MessageType.SUCCESS, I18n.getText(PRC.SUCCESS_PERUN_GET_DATA),
						I18n.getText(PRC.SUCCESS_PERUN_GET_DATA), jObj);
			} else {
				jrh.create(MessageType.ERROR, I18n.getText("error.perun.get.data"),
						I18n.getText("error.perun.get.data"), new JsonObject());
			}

		} catch (Exception e) {
			return PerunUtil.handleException(e, "Error getting table json schema");
		}
		return Response.status(200).entity(jrh.getAll().toString()).build();

	}

	@Path("/getTableUISchemaPerson/{sessionId}/{table_name}/{personType}")
	@GET
	@Produces("application/json")
	public Response getTableUISchemaPerson(@PathParam("sessionId") String sessionId,
			@PathParam("table_name") String tableName, @PathParam("personType") String personType,
			@Context HttpServletRequest httpRequest) {
		JsonObject jsonData = new JsonObject();
		Gson gson = new Gson();
		try {
			String personTypeTableName = "";
			switch (personType.toUpperCase()) {
			case "P":
				personTypeTableName = "PHYSICAL_ENTITY";
				break;
			case "G":
				personTypeTableName = "LEGAL_ENTITY";
				break;
			default:
				break;
			}
			DbDataArray typetoGet = SvCore.getFields(SvCore.getTypeIdByName(tableName));
			if (personTypeTableName != "") {
				DbDataArray typetoGet2 = SvCore.getFields(SvCore.getTypeIdByName(personTypeTableName));
				for (DbDataObject dbo : typetoGet2.getItems()) {
					typetoGet.addDataItem(dbo);
				}
			}

			for (int i = 0; i < typetoGet.getItems().size(); i++) {
				JsonObject jsonreactGUI = null;
				JsonObject jsonObj = null;
				JsonObject jsonUISchema = null;
				DbDataObject tempDboField = typetoGet.getItems().get(i);
				String tmpField = tempDboField.getVal(Rc.FIELD_NAME).toString();
				if (!tmpField.equalsIgnoreCase("pkid")) {
					if (tempDboField.getVal(Rc.GUI_METADATA) != null)
						jsonObj = gson.fromJson(tempDboField.getVal(Rc.GUI_METADATA).toString(), JsonObject.class);
					if (jsonObj != null && jsonObj.has(Rc.REACT))
						jsonreactGUI = (JsonObject) jsonObj.get(Rc.REACT);
					if (jsonreactGUI != null && jsonreactGUI.has(Rc.UISCHEMA))
						jsonUISchema = (JsonObject) jsonreactGUI.get(Rc.UISCHEMA);
					// if this is first object in group create the group obect,
					// if not, retreve it, add it to exising and put it back
					if (jsonUISchema != null) {
						String groupPath = null;
						if (jsonreactGUI != null && jsonreactGUI.has(Rc.GROUPPATH)) { // grouppath
																						// found
							groupPath = jsonreactGUI.get(Rc.GROUPPATH).getAsString();
							JsonObject groupValues = null;
							if (jsonData.has(groupPath))
								groupValues = (JsonObject) jsonData.get(groupPath);
							if (groupValues == null)
								groupValues = new JsonObject();
							groupValues.add(tmpField, jsonUISchema);
							jsonData.add(groupPath, groupValues);
						} else // no grouppath found
						{
							if (personType.equalsIgnoreCase("p") && tmpField.equalsIgnoreCase(PRC.TAX_NO)) {
								jsonUISchema.addProperty("ui:widget", "hidden");
							}
							jsonData.add(tmpField, jsonUISchema);
						}

					} else {
						if (personType.equalsIgnoreCase("p") && tmpField.equalsIgnoreCase(PRC.TAX_NO)) {
							jsonUISchema = new JsonObject();
							jsonUISchema.addProperty("ui:widget", "hidden");
							jsonData.add(tmpField, jsonUISchema);
						}
					}
				}

			}
		} catch (SvException e) {
			return PerunUtil.handleException(e, "Error getting table ui schema");
		}
		return Response.status(200).entity(jsonData.toString()).build();
	}

	@Path("/savePerson/{session_id}")
	@POST
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
	@Produces("application/json")
	public Response savePerson(@PathParam("session_id") String sessionId, MultivaluedMap<String, String> formVals,
			@Context HttpServletRequest httpRequest) {
		ResponseHandler jrh = new ResponseHandler();
		String jsonObjString = "{}";
		if (formVals != null)
			for (Entry<String, List<String>> entry : formVals.entrySet()) {
				if (entry.getKey() != null && !entry.getKey().isEmpty()) {
					String key = entry.getKey();
					jsonObjString = key;
				}
			}

		try (SvReader svr = new SvReader(sessionId); SvWriter svw = new SvWriter(svr);) {
			WsReactElements re = new WsReactElements();
			Gson gson = new Gson();
			JsonObject jsonData = gson.fromJson(jsonObjString, JsonObject.class);

			if (jsonData.has("PERSON_TYPE") && jsonData.has("ID_NO")) {
				DbDataArray people = new Reader().searchDbObjectsBySingleFilter(DbCompareOperand.EQUAL,
						SvCore.getTypeIdByName(PRC.PERSON), "ID_NO", jsonData.get("ID_NO").getAsString(), svr);
				if (null == people || people.isEmpty()) {
					jsonData.addProperty("tableName", PRC.PERSON);
					DbDataObject vdataObject = re.prepareObjectToSave(jsonData, 0L, svr);

					String tableName = jsonData.get("PERSON_TYPE").getAsString().equalsIgnoreCase("g")
							? PRC.LEGAL_ENTITY
							: PRC.PHYSICAL_ENTITY;
					if (tableName.equals(PRC.PHYSICAL_ENTITY)) {
						vdataObject.setVal("NAME", jsonData.get("FIRST_NAME").getAsString() + " "
								+ jsonData.get("LAST_NAME").getAsString());
					}
					svw.saveObject(vdataObject, false);

					jsonData.addProperty("tableName", tableName);
					if (jsonData.has(tableName + "." + Rc.OBJECT_TYPE) && jsonData.has(tableName + "." + Rc.OBJECT_ID)
							&& jsonData.has(tableName + "." + Rc.PKID)) {
						jsonData.addProperty(Rc.OBJECT_TYPE,
								jsonData.get(tableName + "." + Rc.OBJECT_TYPE).getAsLong());
						jsonData.addProperty(Rc.OBJECT_ID, jsonData.get(tableName + "." + Rc.OBJECT_ID).getAsLong());
						jsonData.addProperty(Rc.PKID, jsonData.get(tableName + "." + Rc.PKID).getAsLong());
					}
					vdataObject = re.prepareObjectToSave(jsonData, vdataObject.getObjectId(), svr);

					svw.saveObject(vdataObject, false);
					svw.dbCommit();

					jrh.create(MessageType.SUCCESS, I18n.getText("perrun.success.save"),
							I18n.getText("perrun.success.save"), vdataObject.toSimpleJson());

				} else {
					jrh.create(MessageType.WARNING, I18n.getText("warning_message"),
							I18n.getText("warning.person_id_no_exist"), jsonData);
				}
			} else {
				jrh.create(MessageType.WARNING, I18n.getText("perrun.bad_data.save"),
						I18n.getText("perrun.bad_data.save"), new JsonObject());
			}
		} catch (SvException e) {
			return PerunUtil.handleException(e, "Error saving person");
		}
		return Response.status(200).entity(jrh.getAll().toString()).build();
	}

	@Path("/getPerson/{sessionId}/{objectId}/{personType}")
	@GET
	@Produces("text/html;charset=utf-8")
	public Response getPerson(@PathParam("sessionId") String sessionId, @PathParam("objectId") Long objectId,
			@PathParam("personType") String personType, @Context HttpServletRequest httpRequest) throws SvException {
		JsonObject responseJson = new JsonObject();
		ResponseHandler jrh = new ResponseHandler();
		WsReactElements wre = new WsReactElements();
		try (SvReader svr = new SvReader(sessionId);) {
			String tableName = personType.equalsIgnoreCase("g") ? PRC.LEGAL_ENTITY : PRC.PHYSICAL_ENTITY;

			Response response = wre.getTableFormData(sessionId, objectId, PRC.PERSON, httpRequest);

			if (!objectId.equals(0L) && response.getStatus() == 200) {
				String personDataStr = response.getEntity().toString();
				responseJson = (new Gson()).fromJson(personDataStr, JsonObject.class);
				if (responseJson.has(Rc.OBJECT_ID)) {
					DbDataArray arrPersonDetail = svr.getObjectsByParentId(objectId, SvCore.getTypeIdByName(tableName),
							null);
					if (!arrPersonDetail.isEmpty()) {
						DbDataObject personDetail = arrPersonDetail.get(0);
						DbDataArray vFields = svr.getObjectsByParentId(SvCore.getTypeIdByName(tableName),
								svCONST.OBJECT_TYPE_FIELD, null, 0, 0, Rc.SORT_ORDER);
						String fieldType = "";
						for (int j = 0; j < vFields.getItems().size(); j++) {

							String tmpFieldname = vFields.getItems().get(j).getVal(Rc.FIELD_NAME).toString();
							fieldType = vFields.getItems().get(j).getVal(Rc.FIELD_TYPE).toString();
							if (tmpFieldname.equalsIgnoreCase(Rc.PKID)) {
								tmpFieldname = tableName + "." + tmpFieldname;
								responseJson.addProperty(tmpFieldname, personDetail.getPkid());
							} else {
								if (personDetail.getVal(tmpFieldname) != null) {
									switch (fieldType) {
									case Rc.NUMERIC:
										responseJson.addProperty(tmpFieldname,
												(Long) personDetail.getVal(tmpFieldname));
										break;
									case Rc.NVARCHAR:
									case "TEXT":
										responseJson.addProperty(tmpFieldname,
												(String) personDetail.getVal(tmpFieldname));
										break;
									case Rc.BOOLEAN:
										responseJson.addProperty(tmpFieldname,
												(Boolean) personDetail.getVal(tmpFieldname));
										break;
									case Rc.DATE:
										DateTime tmpDsh = new DateTime(personDetail.getVal(tmpFieldname));

										if (tmpDsh != null) {
											int monthInt = tmpDsh.monthOfYear().get();
											int dayInt = tmpDsh.dayOfMonth().get();
											String monthStr = ((monthInt < 10) ? "0" : "") + String.valueOf(monthInt);
											String dayStr = ((dayInt < 10) ? "0" : "") + String.valueOf(dayInt);
											responseJson.addProperty(tmpFieldname,
													tmpDsh.year().get() + "-" + monthStr + "-" + dayStr);
										}
										break;
									case Rc.TIMESTAMP:
									case Rc.DATETIME:
										DateTime tmpDl = (DateTime) personDetail.getVal(tmpFieldname);
										if (tmpDl != null)
											responseJson.addProperty(tmpFieldname, tmpDl.toString());
										break;
									default:
										break;
									}
								}
							}
						}

						responseJson.addProperty(tableName + "." + Rc.OBJECT_ID, personDetail.getObjectId());
						responseJson.addProperty(tableName + "." + Rc.OBJECT_TYPE, personDetail.getObjectType());
					}
					jrh.create(MessageType.SUCCESS, I18n.getText(PRC.SUCCESS_PERUN_GET_DATA),
							I18n.getText(PRC.SUCCESS_PERUN_GET_DATA), responseJson);
				}

			}

		} catch (SvException e) {
			return PerunUtil.handleException(e, "Error getting person");
		}
		return Response.status(200).entity(responseJson.toString()).build();
	}

	@Path("/getLinkTypeOptions/{token}")
	@GET
	@Produces("application/json")
	public Response getLinkTypeOptions(@PathParam("token") String token) {
		ResponseHandler jrh = new ResponseHandler();
		try (SvReader svr = new SvReader(token);) {
			JsonArray jArray = new JsonArray();
			JsonObject jObj;

			jObj = new JsonObject();
			jObj.addProperty("text", I18n.getText("options.choose"));
			jObj.addProperty(PRC.VALUE, 0);
			jObj.addProperty("selected", true);
			jObj.addProperty("disabled", true);
			jArray.add(jObj);

			DbSearchCriterion crit = new DbSearchCriterion(Rc.LINK_OBJECT_TYPE1, DbCompareOperand.EQUAL,
					SvCore.getTypeIdByName(PRC.PERSON));
			DbSearchCriterion crit2 = new DbSearchCriterion(Rc.LINK_OBJECT_TYPE2, DbCompareOperand.EQUAL,
					SvCore.getTypeIdByName(PRC.PERSON));
			DbSearchExpression exp = new DbSearchExpression().addDbSearchItem(crit).addDbSearchItem(crit2);

			DbDataArray linkTypes = svr.getObjects(exp, SvReader.getTypeIdByName(Rc.LINK_TYPE), null, 0, 0);

			for (DbDataObject linkType : linkTypes.getItems()) {
				jObj = new JsonObject();
				jObj.addProperty("text", I18n.getText(linkType.getVal(PRC.LINK_TYPE_DESCRIPTION).toString()));
				jObj.addProperty(PRC.VALUE, linkType.getVal(Rc.LINK_TYPE).toString());
				jArray.add(jObj);
			}
			jrh.create(MessageType.SUCCESS, I18n.getText(PRC.SUCCESS_GET_OPTIONS),
					I18n.getText(PRC.SUCCESS_GET_OPTIONS), jArray);

		} catch (Exception e) {
			return PerunUtil.handleException(e, "Error getting link options");
		}
		return Response.status(200).entity(jrh.getAll().toString()).build();
	}

	@Path("/linkTwoPersons/{session_id}")
	@POST
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
	@Produces("application/json")
	public Response linkTwoPersons(@PathParam("session_id") String sessionId, MultivaluedMap<String, String> formVals,
			@Context HttpServletRequest httpRequest) {
		ResponseHandler jrh = new ResponseHandler();
		Long objectId1 = null;
		Long objectId2 = null;
		String linkName = "";
		String jsonObjString = "";
		ReentrantLock lock = null;
		JsonObject jObj = new JsonObject();
		String lockKey = "";
		try (SvReader svr = new SvReader(sessionId); SvLink svl = new SvLink(svr);) {
			if (formVals != null)
				for (Entry<String, List<String>> entry : formVals.entrySet()) {
					if (entry.getKey() != null && !entry.getKey().isEmpty()) {
						String key = entry.getKey();
						jsonObjString = key;
					}
				}

			JsonObject jsonData = null;
			Gson gson = new Gson();
			jsonData = gson.fromJson(jsonObjString, JsonObject.class);

			if (jsonData.has("objId1") && jsonData.has("objId2") && jsonData.has("linkName")) {
				objectId1 = jsonData.get("objId1").getAsLong();
				objectId2 = jsonData.get("objId2").getAsLong();
				linkName = jsonData.get("linkName").getAsString();
				lockKey = linkName + "-" + objectId1 + "-" + objectId2;

				lock = SvLock.getLock(lockKey, false, 0);
				if (lock != null) {
					DbDataObject obj1 = svr.getObjectById(objectId1, SvCore.getDbtByName(PRC.PERSON), null);
					DbDataObject obj2 = svr.getObjectById(objectId2, SvCore.getDbtByName(PRC.PERSON), null);
					if (! new Reader().linkExists(obj1, obj2, linkName, svr)) {
						svl.linkObjects(objectId1, objectId2, SvLink.getLinkType(linkName,
							SvCore.getTypeIdByName(PRC.PERSON), SvCore.getTypeIdByName(PRC.PERSON)).getObjectId(), "",
							true, true);
						
						jrh.create(MessageType.SUCCESS, I18n.getText("success.object_is_linked"),
							I18n.getText("success.object_is_linked"), jObj);
					} else {
						jrh.create(MessageType.WARNING, I18n.getText("warning_message"),
								I18n.getText("warning.object_already_linked"), jObj);
					}
				} else {
					jrh.create(MessageType.WARNING, I18n.getText("warning.object_is_locked"),
							I18n.getText("warning.object_is_locked"), jObj);
				}
			} else {
				jrh.create(MessageType.ERROR, I18n.getText("error.bad_json_date"), I18n.getText("error.bad_json_date"),
						new JsonObject());
			}
		} catch (Exception e) {
			return PerunUtil.handleException(e, "Error creating link");
		} finally {
			if (lock != null) {
				SvLock.releaseLock(lockKey, lock);
			}
		}
		return Response.status(200).entity(jrh.getAll().toString()).build();
	}

	/**
	 * TAKEN FROM WSIPARDSPA
	 * 
	 * Method to get responsible persons for a given objectId
	 * 
	 * @param sessionId   String token access
	 * @param objectId    Long OBJECT_ID for the PERSON
	 * @param isReverse   what is the orientation of the responsibility
	 * @param httpRequest
	 * @return ResponseHandler
	 * @throws SvException
	 */
	@Path("/getResponsiblePersons/{sessionId}/{objectId}/{isReverse}")
	@GET
	@Produces("text/html;charset=utf-8")
	public Response getResponsiblePersons(@PathParam("sessionId") String sessionId,
			@PathParam("objectId") Long objectId, @PathParam("isReverse") Boolean isReverse,
			@Context HttpServletRequest httpRequest) throws SvException {

		/**
		 * for some reson we check POA for USER that is logged in if it has link to
		 * PERSON , for that group of users we give one type of search , probably what
		 * legal entities is this natural entity attached to, and for oher group we give
		 * what are the netural entities attached to this legal entity
		 * 
		 */
		ResponseHandler jrh = new ResponseHandler();

		JsonArray tmpJArray = new JsonArray();
		JsonObject joPerson = new JsonObject();
		JsonArray responseJArray = new JsonArray();
		String[] tablesUsedArray = new String[1];
		Boolean[] tableShowArray = new Boolean[1];
		int tablesusedCount = 1;

		try (SvReader svr = new SvReader(sessionId);) {
			DbDataObject userDbo = svr.getInstanceUser();
			DbDataObject linkTypePerson = SvCore.getLinkType("POA", SvCore.getTypeIdByName("USERS"),
					SvCore.getTypeIdByName(PRC.PERSON));
			DbDataArray persons = svr.getObjectsByLinkedId(userDbo.getObjectId(), linkTypePerson, null, 0, 0);
			Boolean isPerson = (persons != null && !persons.getItems().isEmpty()) ? true : false;

			tablesUsedArray[0] = PRC.PERSON;
			tableShowArray[0] = true;
			Long personObjTypeId = SvCore.getTypeIdByName(PRC.PERSON);
			DbSearchCriterion crit = new DbSearchCriterion("LINK_OBJ_TYPE_1", DbCompareOperand.EQUAL, personObjTypeId);
			DbSearchCriterion crit2 = new DbSearchCriterion("LINK_OBJ_TYPE_2", DbCompareOperand.EQUAL, personObjTypeId);
			DbSearchExpression exp = new DbSearchExpression().addDbSearchItem(crit).addDbSearchItem(crit2);

			DbDataArray linkTypes = svr.getObjects(exp, SvReader.getTypeIdByName(PRC.LINK_TYPE), null, 0, 0);

			for (DbDataObject linkType : linkTypes.getItems()) {
				DbDataArray linkedPersons;
				if (isPerson) {
					DbSearchCriterion critPerson = new DbSearchCriterion("OBJECT_ID", DbCompareOperand.EQUAL, objectId);
					DbQueryObject dqoPerson = new DbQueryObject(SvCore.getDbtByName(PRC.PERSON), critPerson,
							DbJoinType.INNER, linkType, LinkType.DBLINK_REVERSE, null, null);
					DbQueryObject dqoPerson1 = new DbQueryObject(SvCore.getDbtByName(PRC.PERSON), null, null, null);

					DbQueryExpression q = new DbQueryExpression();
					dqoPerson.setIsReturnType(false);
					dqoPerson1.setIsReturnType(true);
					q.addItem(dqoPerson);
					q.addItem(dqoPerson1);
					linkedPersons = svr.getObjects(q, 0, 0);
				} else {
					linkedPersons = svr.getObjectsByLinkedId(objectId, personObjTypeId, linkType, personObjTypeId,
							isReverse, new DateTime(), 0, 0);
				}

				tmpJArray = WsReactElements.prapareTableQueryData(linkedPersons, tablesUsedArray, tableShowArray,
						tablesusedCount, true, svr, false, new HashMap<String, String>());
				for (int i = 0; i < tmpJArray.size(); i++) {
					joPerson = tmpJArray.get(i).getAsJsonObject();
					joPerson.addProperty(PRC.LINK_TYPE + "." + PRC.LINK_TYPE,
							I18n.getText(linkType.getVal(PRC.LINK_TYPE_DESCRIPTION).toString()));
					joPerson.addProperty(PRC.LINK_TYPE, linkType.getVal(PRC.LINK_TYPE).toString());
					responseJArray.add(joPerson);
				}
			}

			jrh.create(MessageType.SUCCESS, I18n.getText(PRC.SUCCESS_PERUN_GET_DATA),
					I18n.getText(PRC.SUCCESS_PERUN_GET_DATA), responseJArray);

		} catch (Exception e) {
			return PerunUtil.handleException(e, "Error getting responsible persons");
		}
		return Response.status(200).entity(jrh.getAll().toString()).build();
	}

	/**
	 * field list for method /getResponsiblePersons/
	 * 
	 * @param sessionId
	 * @param httpRequest
	 * @return ResponseHandler
	 */
	@Path("/getTableFieldListForResponsiblePersons/{session_id}")
	@GET
	@Produces("application/json")
	public Response getTableFieldListForResponsiblePersons(@PathParam("session_id") String sessionId,
			@Context HttpServletRequest httpRequest) {
		WsReactElements wre = new WsReactElements();
		ResponseHandler jrh = new ResponseHandler();
		Response response = wre.getTableFieldList(sessionId, PRC.PERSON, httpRequest);
		JsonArray jResponse = new JsonArray();
		jrh.create(MessageType.ERROR, I18n.getText(PRC.ERROR_PERUN_GET_DATA), I18n.getText(PRC.ERROR_PERUN_GET_DATA),
				jResponse);
		if (response.getStatus() == 200) {
			String strResponse = (String) response.getEntity();
			jResponse = (new Gson()).fromJson(strResponse, JsonArray.class);
			JsonObject linkType = new JsonObject();
			linkType.addProperty("key", PRC.LINK_TYPE + "." + PRC.LINK_TYPE);
			linkType.addProperty(PRC.TABLE_NAME, PRC.LINK_TYPE);
			linkType.addProperty(PRC.FIELD_NAME, PRC.LINK_TYPE);
			linkType.addProperty("filterable", true);
			linkType.addProperty("visible", true);
			linkType.addProperty("resizable", true);
			jResponse.add(linkType);
			jrh.create(MessageType.SUCCESS, I18n.getText(PRC.SUCCESS_PERUN_GET_DATA),
					I18n.getText(PRC.SUCCESS_PERUN_GET_DATA), jResponse);
		}
		return Response.status(200).entity(jrh.getAll().toString()).build();
	}

	@Path("BankAcc/changeStatus/sId/{sId}/oId/{oId}/nextStatus/{nextStatus}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response changeBankAccStatus(@PathParam("sId") String sId, @PathParam("oId") Long oId,
			@PathParam("nextStatus") String nextStatus) {
		ResponseHandler jrh = new ResponseHandler();
		try (SvReader svr = new SvReader(sId); SvWorkflow sww = new SvWorkflow(svr);) {
			if (oId != null && nextStatus != null && !nextStatus.equalsIgnoreCase(PRC.EMPTY_STRING)
					&& (nextStatus.equalsIgnoreCase(PRC.ACTIVE) || nextStatus.equalsIgnoreCase(PRC.INACTIVE))) {
				DbDataObject bankAcc = svr.getObjectById(oId, SvReader.getTypeIdByName(PRC.BANKACC), null);
				sww.moveObject(bankAcc, nextStatus);
				switch (nextStatus) {
				case PRC.ACTIVE:
					jrh.create(MessageType.SUCCESS, I18n.getText("success.perun.changedActiveStatus"),
							I18n.getText("success.perun.changedActiveStatus"));
					break;
				case PRC.INACTIVE:
					jrh.create(MessageType.SUCCESS, I18n.getText("success.perun.changedInactiveStatus"),
							I18n.getText("success.perun.changedInactiveStatus"));
					break;
				default:
					break;
				}
			} else {
				jrh.create(MessageType.ERROR, I18n.getText(PRC.ERROR_PERUN_CHANGED_STATUS),
						I18n.getText(PRC.ERROR_PERUN_CHANGED_STATUS));
			}
		} catch (Exception e) {
			return PerunUtil.handleException(e, "Error changing status");
		}
		return Response.status(200).entity(jrh.getAll().toString()).build();
	}

	@Path("/get/dependency-dropdown/location/sid/{sid}")
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public Response getLocationDependencyDropdown(@PathParam("sid") String sessionId,
			MultivaluedMap<String, String> postData, @Context HttpServletRequest httpRequest) {
		JsonObject jResult = new JsonObject();
		try (SvReader svr = new SvReader(sessionId); SvWriter svw = new SvWriter(svr);) {
			JsonObject jObject = new JsonObject();
			if (postData != null) {
				for (Entry<String, List<String>> entry : postData.entrySet()) {
					List<String> value = entry.getValue();
					jObject = (new Gson()).fromJson(value.get(0), JsonObject.class);
				}
			}

			Reader perunCoreRdr = new Reader();
			String tableName = "REGION";
			JsonObject jModifiedFormData = new JsonObject();
			if (!jObject.has("FIELD_NAME")) {
				throw new SvException("error.ipard_spa.missing_field_name", svr.getInstanceUser());
			}
			if (!jObject.has("FIELD_VALUE")) {
				throw new SvException("error.ipard_spa.missing_field_value", svr.getInstanceUser());
			}
			String fieldName = jObject.get("FIELD_NAME").getAsString();
			String fieldValue = jObject.get("FIELD_VALUE").getAsString();
			jModifiedFormData.addProperty("FIELD_VALUE", fieldValue);
			switch (fieldName) {
			case "COUNTRY_CODE":
				jModifiedFormData.addProperty("PARENT_CODE_VALUE", "REGIONS");
				jModifiedFormData.addProperty("DEPENDENT_PARENT_CODE_VALUE", "MUNICIPALITY");
				break;
			case "MUNIC_CODE":
				jModifiedFormData.addProperty("PARENT_CODE_VALUE", "MUNICIPALITY");
				jModifiedFormData.addProperty("DEPENDENT_PARENT_CODE_VALUE", "POPULATED_AREAS");
				break;
			default:
				break;
			}
			jResult = perunCoreRdr.getDependentElements(jModifiedFormData, tableName, svr);
		} catch (Exception e) {
			return PerunUtil.handleException(e, "Error getting location dependencies");
		}
		return Response.status(200).entity(jResult.toString()).build();
	}

}
