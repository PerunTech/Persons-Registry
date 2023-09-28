package com.prtech.persons_registry;

import org.joda.time.DateTime;

import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvWriter;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;

public class HookUpdates {

	public void defaultBankAccChecksAfterSave(DbDataObject dbo, SvWriter svw, SvReader svr) throws SvException {
		DbDataObject dboDatabaseVersion = svr.getObjectById(dbo.getObjectId(), SvCore.getTypeIdByName(PRC.BANKACC),
				new DateTime());
		if (dbo != null) {
			DbDataArray bankAccs = svr.getObjectsByParentId(dbo.getParentId(), SvCore.getTypeIdByName(PRC.BANKACC),
					null);
			if (bankAccs != null && !bankAccs.getItems().isEmpty()) {
				for (DbDataObject tempBankAcc : bankAccs.getItems()) {
					if ((tempBankAcc.getVal(PRC.IS_DEFAULT) != null && (boolean) tempBankAcc.getVal(PRC.IS_DEFAULT)
							&& tempBankAcc.getVal(PRC.BEFORE_SAVE_DEFAULT_CHECK) == null && dboDatabaseVersion != null
							&& dboDatabaseVersion.getVal(PRC.IS_DEFAULT) != null
							&& !(boolean) dboDatabaseVersion.getVal(PRC.IS_DEFAULT))
							|| (tempBankAcc.getVal(PRC.IS_DEFAULT) != null
									&& (boolean) tempBankAcc.getVal(PRC.IS_DEFAULT)
									&& tempBankAcc.getVal(PRC.BEFORE_SAVE_DEFAULT_CHECK) == null
									&& dboDatabaseVersion == null)) {
						tempBankAcc.setVal(PRC.IS_DEFAULT, false);
						tempBankAcc.setVal(PRC.BEFORE_SAVE_DEFAULT_CHECK, true);
						svw.saveObject(tempBankAcc);
					}
				}
			}
		}
	}
}
