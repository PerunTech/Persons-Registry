create view vsupplier_import as
SELECT
    nvl(SUBJECT_MUNIC,SUPPLIER_SHORT_NAME) FULL_NAME,
    SUPPLIER_SHORT_NAME SHORT_NAME,
    EMBS ID_NO,
    SUPPLIER_EDB TAX_NO,
    DT_OF_CREATION ESTABLISHMENT_DATE,
    (case when nvl(CONDITION_OF_SUPPLIER_ID,0) = 0 then null else '00000'||CONDITION_OF_SUPPLIER_ID end) BUSINESS_STATUS,
    (case when nvl(OWNERSHIP_TYPE_ID,0) = 0 then null else '00000'||OWNERSHIP_TYPE_ID end) OWNERSHIP_TYPE,
    (case when nvl(SIZE_OF_SUBJECT_ID,0) = 0 then null else '00000'||SIZE_OF_SUBJECT_ID end) SUBJECT_SIZE,
    (case when nvl(RESPONSIBLE_REGISTER_ID,0) = 0 then null else '00000'||RESPONSIBLE_REGISTER_ID end) RESPONSIBLE_REGISTER,
    (case when nvl(SUPPLIER_TYPE_ID,0) = 0 then null else '00000'||SUPPLIER_TYPE_ID end) TYPE_OF_SUBJECT,
    COUNTRY_CODE
FROM
    (
        SELECT
            *
        FROM
            REF_PRICE.TSUPPLIERS
        WHERE
            SYSDATE BETWEEN DT_OF_ENTRY AND DT_OF_EXPIRATION
    ) SUPP
    LEFT JOIN (
        SELECT DISTINCT
            NOME
            || ' ('
            || SIGLA_PROV
            || ')' NOME,
            (
                CASE
                    WHEN ISTATR = '01'  THEN 'MK'
                    ELSE SIGLA_PROV
                END
            ) COUNTRY_CODE
        FROM
            SITI.SITICOMU_ISTAT
    ) MUNIC ON SUPP.SUBJECT_MUNIC = MUNIC.NOME;