package com.prtech.persons_registry;

import org.apache.logging.log4j.Logger;

import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvWriter;
import com.prtech.svarog.svCONST;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.ISvOnSave;

public class OnSaveHook implements ISvOnSave {

	static final Logger log4j = SvConf.getLogger(OnSaveHook.class);

	@Override
	public boolean beforeSave(SvCore parentCore, DbDataObject dbo) throws SvException {
		try (SvReader svr = new SvReader(parentCore); SvWriter svw = new SvWriter(svr)) {
			HookUpdates hu = new HookUpdates();
			Long dboTypeId = dbo.getObjectType();
			if (dboTypeId == null || dboTypeId.equals(0L)) {
				throw new SvException("perun.error.not_handled_type", svr.getInstanceUser());
			}
			DbDataObject objectTable = svr.getObjectById(dboTypeId, svCONST.OBJECT_TYPE_TABLE, null);
			String dboTableName = (String) objectTable.getVal(PRC.TABLE_NAME);
			switch (dboTableName) {
			case PRC.BANKACC:
				hu.defaultBankAccChecksAfterSave(dbo, svw, svr);
				break;
			default:
				break;
			}
		}
		return false;
	}

	@Override
	public void afterSave(SvCore parentCore, DbDataObject dbo) throws SvException {
		// Do nothing because
	}
}
