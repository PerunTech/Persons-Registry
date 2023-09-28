package com.prtech.persons_registry;

import com.google.gson.JsonObject;
import com.prtech.svarog_interfaces.ISvCore;
import com.prtech.svarog_interfaces.MenuGenerator;

public class BundleMenu extends MenuGenerator {

	public BundleMenu(JsonObject initialJsonObject, String moduleCode, String menuCode, ISvCore svr) {
		super(initialJsonObject, moduleCode, menuCode, svr);
	}

}