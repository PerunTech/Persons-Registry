package com.prtech.persons_registry.data_import;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.List;

import com.prtech.svarog.SvException;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvWriter;
import com.prtech.svarog_common.DbDataObject;

public class DataImporter {

	public void importMkAddress(String fileName, SvReader svr) throws IOException {
		InputStream fis = new FileInputStream(fileName);
		InputStreamReader isr = new InputStreamReader(fis, Charset.forName("UTF-8"));
		BufferedReader br = new BufferedReader(isr);
		String strLine;
		try (SvWriter svw = new SvWriter(svr)) {
			svw.setAutoCommit(false);
			// read the csv file
			DbDataObject mkAddressDict = null;
			while ((strLine = br.readLine()) != null) {
				if (strLine.startsWith("\"CODE\"")) {
					continue;
				}
				List<String> addresData = Arrays.asList(strLine.split("\",\""));
				mkAddressDict = new DbDataObject(SvReader.getTypeIdByName("MK_ADDRESS_DICT"));
				mkAddressDict.setVal("CODE", addresData.get(0));
				mkAddressDict.setVal("NTES_3", addresData.get(1));
				mkAddressDict.setVal("NTES_4", addresData.get(2));
				mkAddressDict.setVal("NTES_5", addresData.get(3));
				svw.saveObject(mkAddressDict, false);
			}
			br.close();
			fis.close();
			svw.dbCommit();
		} catch (SvException e) {

		} catch (Exception e) {

		} finally {
			try {
				fis.close();
			} catch (IOException ioex) {
				// omitted.
			}
		}

	}
}
