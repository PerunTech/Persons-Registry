package com.prtech.persons_registry.models;

import java.util.HashMap;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.prtech.models.BaseObjectModel;
import com.prtech.models.ModelFactory;
import com.prtech.persons_registry.PRC;

public class PersonsModelFactory extends ModelFactory {
	static final Logger log4j = LogManager.getLogger(PersonsModelFactory.class.getName());

	static final Map<String, Class<? extends BaseObjectModel>> BASE_MODEL_CLASSES;
	static {
		BASE_MODEL_CLASSES = new HashMap<String, Class<? extends BaseObjectModel>>();
		BASE_MODEL_CLASSES.put(PRC.PERSON, Person.class);
	}

	@Override
	public BaseObjectModel createObject(String tableName) {
		BaseObjectModel obj = null;
		if (BASE_MODEL_CLASSES.containsKey(tableName)) {
			try {
				obj = BASE_MODEL_CLASSES.get(tableName).getDeclaredConstructor().newInstance();
			} catch (Exception e) {
				log4j.error(e.getMessage(), e);
			}
		}
		return obj;
	}
}
