import {
    React,
    connect,
    axios,
    PropTypes,
    Loading,
    Form,
    elements,
    ExportableGrid,
    GridManager,
    ComponentManager,
    validator
} from 'perun-core'
import style from "./address.module.css"
const { ReactBootstrap, alertUserResponse, alertUserV2 } = elements;
const { Modal } = ReactBootstrap;
const { useState, useEffect } = React
import { labelsManager } from '../../utils/LabelsExport'
import { CustomOnchangeFunction } from './CustomOnchangeFunction';
let changeField = 'LOCALITY1'
const Address = (props, context) => {
    const [schema, setSchema] = useState({})
    const [uiSchema, setUiSchema] = useState({})
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState()
    const [permaSchema, setPermaSchema] = useState({})
    const [permaUi, setPermaUi] = useState({})
    const [show, setShow] = useState(false)
    const [flagForm, setFlagForm] = useState(false)
    const [deleteBtn, setDelete] = useState(false)

    useEffect(() => {
        return () => {
            ComponentManager.cleanComponentReducerState("ADDRESS_GRID" + props.personObjId);
            changeField = undefined
        }
    }, [])

    const generateMainForm = (row) => {
        if (row) {
            setDelete(true)
        } else {
            setDelete(false)
        }
        const urlS = window.server + `/ReactElements/getTableJSONSchema/${props.svSession}/ADDRESS`
        const urlU = window.server + `/ReactElements/getTableUISchema/${props.svSession}/ADDRESS`
        setLoading(true)
        setFlagForm(false)
        axios.get(urlS).then(res => {
            setSchema(res.data)
            setPermaSchema(res.data)
            axios.get(urlU).then(res => {
                setUiSchema(res.data)
                setPermaUi(res.data)
                setFlagForm(true)
                setLoading(false)
                setShow(true)
            }).catch(err => {
                console.error(err)
                setLoading(false)
                alertUserResponse({ response: err })
            })
        }).catch(err => {
            console.error(err)
            setLoading(false)
            alertUserResponse({ response: err })
        })
        let id = row?.['ADDRESS.OBJECT_ID'] || 0

        const ulrD = window.server + `/ReactElements/getTableFormData/${props.svSession}/${id}/ADDRESS`
        axios.get(ulrD).then(res => {
            if (Object.keys(res.data).length > 0) {
                setFormData(res.data)
            } else {
                setFormData({ 'COUNTRY': props.defaultCountry })
            }
        }).catch(err => {
            console.error(err)
            setLoading(false)
            alertUserResponse({ response: err })
        })
    };

    const generateNewDependentForm = (data) => {
        let tempUi = JSON.parse(JSON.stringify(permaUi))
        if (data['COUNTRY'] === props.defaultCountry) {
            if (data['LOCALITY1']) {
                tempUi.LOCALITY2 = {}
                if (formData['LOCALITY1'] !== data['LOCALITY1'] || formData['LOCALITY1'] === data['LOCALITY1']) {
                    setFlagForm(false)
                    let tempSchema = JSON.parse(JSON.stringify(permaSchema))
                    let tempEnum = []
                    let tempEnumNames = []
                    let innerId
                    let innerOpt
                    innerId = data['LOCALITY1'].split('_') //array of two elements (string example: parentid_childid)
                    tempSchema.properties['LOCALITY2'].enum.map((option, i) => {
                        innerOpt = option.split('_')
                        if (innerId[1] === innerOpt[0]) {
                            tempEnum.push(option)
                            tempEnumNames.push(tempSchema.properties['LOCALITY2'].enumNames[i])
                        }
                    })
                    tempSchema.properties['LOCALITY2'].enum = tempEnum
                    tempSchema.properties['LOCALITY2'].enumNames = tempEnumNames
                    setSchema(tempSchema)
                    setFlagForm(true)
                }
            } else {
                tempUi.LOCALITY2 = { 'ui:widget': 'hidden' }
            }
        }
        setUiSchema(tempUi)
    }

    const saveAddress = (e) => {
        let restUrl = window.server + "/ReactElements/createTableRecordFormData/" + props.svSession + "/ADDRESS/" + props.personObjId
        let form_params = e.formData;
        setLoading(true)
        axios({
            method: "post",
            data: JSON.stringify(form_params),
            url: restUrl,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }).then(res => {
            if (res?.data) {
                alertUserResponse({
                    response: res.data, onConfirm: () => {
                        GridManager.reloadGridData("ADDRESS_GRID" + props.personObjId)
                        setShow(false)
                        setLoading(false)
                    }
                })
            }
        }).catch(err => {
            console.error(err)
            setLoading(false)
            alertUserResponse({ response: err })
        });
    };

    const handleRowClick = (_id, _rowIdx, row) => {
        generateMainForm(row)
        changeField = 'LOCALITY1'
    }

    const deleteFunc = (formData) => {
        const { svSession } = props;
        let url = window.server + `/ReactElements/deleteObject/${svSession}`;
        axios({
            method: "post",
            data: JSON.stringify(formData),
            url: url,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }).then((res) => {
            if (res?.data) {
                alertUserResponse({
                    response: res.data, onConfirm: () => {
                        GridManager.reloadGridData('ADDRESS_GRID' + props.personObjId)
                        setShow(false);
                    }
                })
            }
        }).catch(err => {
            console.error(err)
            alertUserResponse({ response: err })
        });
    };
    const onFieldChange = (name, _formData) => {
        changeField = name

    }
    const formContext = {
        onFieldChange: onFieldChange
    };

    const onChange = (e) => {
        setFormData(e.formData)
        if (changeField === 'LOCALITY1' || changeField === 'LOCALITY2') {
            generateNewDependentForm(e.formData)
        }
    }
    return (
        <>{loading && <Loading />}
            <div>
                <ExportableGrid
                    gridType={"READ_URL"}
                    key={"ADDRESS_GRID" + props.personObjId}
                    id={"ADDRESS_GRID" + props.personObjId}
                    configTableName={
                        `/ReactElements/getTableFieldList/${props.svSession}/ADDRESS`
                    }
                    dataTableName={
                        `/ReactElements/getObjectsByParentId/${props.svSession}/${props.personObjId}/ADDRESS/100000`
                    }
                    heightRatio={0.58}
                    onRowClickFunct={handleRowClick}
                    refreshData={true}
                    toggleCustomButton={true}
                    customButton={() => generateMainForm()}
                    customButtonLabel={labelsManager.importLabel(
                        "add_address",
                        "persons_registry", context
                    )}
                    editContextFunc={handleRowClick}
                />
                {show && <Modal className={style["person-registry-modal"]} show={show} onHide={() => setShow(false)}>
                    <Modal.Header className={style["person-registry-modal-header"]} closeButton>
                        <Modal.Title>{labelsManager.importLabel(
                            "add_address",

                            "persons_registry", context
                        )}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={style["person-registry-modal-body"]}>
                        {flagForm && <Form
                            validator={validator}
                            schema={schema}
                            uiSchema={uiSchema}
                            onSubmit={(e) => saveAddress(e)}
                            fields={{ SchemaField: CustomOnchangeFunction }}
                            className={`person-registry-forms`}
                            formData={formData}
                            formContext={formContext}
                            onChange={(e) => onChange(e)}
                        >
                            <></>
                            <div className={style['person-registry-btn-holder']} >
                                {deleteBtn && (
                                    <button
                                        type='button'
                                        className='btn-danger btn_delete_form'
                                        onClick={() => {
                                            alertUserV2({
                                                type: 'wanring',
                                                title: labelsManager.importLabel('delete_record_prompt_title', 'main', context),
                                                message: labelsManager.importLabel('delete_record_prompt_message', 'main', context),
                                                confirmButtonText: labelsManager.importLabel('yes', 'admin_console', context),
                                                confirmButtonColor: '#8d230f',
                                                onConfirm: () => deleteFunc(formData),
                                                showCancel: true,
                                                cancelcancelButtonText: labelsManager.importLabel('no', 'admin_console', context)
                                            })
                                        }}
                                    >
                                        {labelsManager.importLabel("delete", "persons_registry", context)}
                                    </button>
                                )}
                                <button className='btn-success btn_save_form' type='submit'>{labelsManager.importLabel(
                                    "add_address",
                                    "persons_registry", context
                                )}</button>
                            </div>
                        </Form>}
                    </Modal.Body>
                    <Modal.Footer className={style["person-registry-modal-footer"]}></Modal.Footer>
                </Modal>}
            </div>

        </>
    )
}

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});

Address.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(Address);
