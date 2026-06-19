
import {
    React,
    connect,
    elements,
    PropTypes,
    axios,
    Loading,
    ComponentManager,
    GridManager, utils
} from "perun-core";
const { useState, useEffect } = React;
const { alertUserV2, alertUserResponse, Icon } = elements;
const { labelsManager, formatDateAndTime } = utils

const Attachments = (props, context) => {
    const [fileItems, setFileItems] = useState(undefined)
    const [loading, setLoading] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState(undefined)
    const [temp, setTemp] = useState([])
    const [showDelete, setDelete] = useState(false)
    const [showSave, setSave] = useState(false)
    const [readOnly, setReadOnly] = useState(false)
    useEffect(() => {
        const config = ComponentManager.getStateForComponent(props.formid, "config")
        setReadOnly(config.readOnlyAttachment)
        setSave(!config.form.configuration.readOnly)
        setDelete(config.form.delete.enabled)
        if (props.objId !== 0 && props.objId) {
            generateFileItem()
        }
    }, [])

    useEffect(() => {
        if (temp && temp?.length > 0) {
            generateSelectedFiles(temp)
        } else {
            setSelectedFiles(<></>)
        }
    }, [temp])

    const reloadGrid = (appObjId) => {
        let gridId = `${props.tableName}${appObjId}`
        if (props.svarogFormName) {
            gridId = `${props.svarogFormName}${appObjId}`
        }
        GridManager.reloadAllGrids();
        ComponentManager.setStateForComponent(gridId, null, { rowClicked: undefined })
    }

    const handleUploadedFiles = (e) => {
        const uploadedFiles = Array.from(e.target.files);
        setTemp(temp => [...uploadedFiles, ...temp]);
    }

    const handleMultiAttach = (arr, objId) => {
        if (arr.length > 0) {
            let errorArr = []
            setLoading(true)
            const promises = arr.map(async (file) => {
                let data = new FormData()
                data.append('file', file)
                return await axios({
                    method: 'post',
                    data,
                    url: `${window.server}${`/ReactElements/uploadFile/sid/${props.svSession}/object-id/${objId}/object-type/${props.tableName}/file-type/ATTACHMENT/note/note`}`,
                    headers: { 'Content-Type': 'multipart/form-data' }
                }).then(res => {
                    return { res, file }
                }).catch((error) => {
                    return { error, file }
                })
            })

            Promise.allSettled(promises).
                then((results) => {
                    results.forEach(result => {
                        if (result.value?.error) {
                            errorArr.push(result.value.file)
                        } else {
                            if (result.value.res.data.type !== "SUCCESS") {
                                errorArr.push(result.value.file)
                            }
                        }
                    })
                    setLoading(false)
                    responseFunc(errorArr)

                })
        } else {
            setLoading(false)
        }
    }

    const responseFunc = (errorArr) => {
        const { formid } = props
        const appObjId = ComponentManager.getStateForComponent(formid, "appObjId");
        const closeModal = ComponentManager.getStateForComponent(formid, "closeModalFunc");
        const resetClickedRowObjectId = ComponentManager.getStateForComponent(formid, "resetClickedRowObjectId");
        const onConfirm = () => {
            closeModal()
            resetClickedRowObjectId()
            reloadGrid(appObjId)
        }
        if (errorArr.length > 0) {
            let erroArrNames = []
            let nameString = " "
            errorArr.forEach(error => {
                erroArrNames.push(error.name)
            })
            nameString = erroArrNames.join(',')
            alertUserV2({
                type: 'warning',
                title: `${labelsManager('desc_error_upload', context, 'farm_registry')} :`,
                message: ` ${nameString}`,
                onConfirm
            })
        } else {
            alertUserV2({
                type: 'success',
                title: labelsManager('desc_success_upload_title', context, 'farm_registry'),
                onConfirm
            })
        }
    }

    const downloadFile = (el, e) => {
        e.preventDefault()
        if (el['object_id'] && el['FILE_NAME']) {
            let url = window.server + `/ReactElements/downloadFile/sid/${props.svSession}/object-id/${el['object_id']}/file-name/${el['FILE_NAME']}`
            window.open(url, '_blank')
        }
    }
    const deleteDownload = (el, e) => {
        e.preventDefault()
        let deleteObj = { 'OBJECT_ID': el['object_id'], 'OBJECT_TYPE': 2 }
        let url = window.server + `/ReactElements/deleteObject/${props.svSession}`
        axios({
            method: "post",
            data: JSON.stringify(deleteObj),
            url: url,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }).then((res) => {
            if (res?.data) {
                const resType = res.data?.type?.toLowerCase() || 'info'
                alertUserResponse({ response: res.data })
                if (resType === 'success') {
                    generateFileItem()
                }
            }
        }).catch(err => {
            console.error(err)
            alertUserResponse({ response: err })
        });
    }

    const deletePrompt = (el, e) => {
        alertUserV2({
            type: 'warning',
            title: labelsManager('delete_uploaded_file', context, 'farm_registry'),
            confirmButtonText: labelsManager('yes', context, 'farm_registry'),
            onConfirm: () => deleteDownload(el, e),
            showCancel: true,
            cancelButtonText: labelsManager('no', context, 'farm_registry')
        })
    }

    const generateFileItem = (objId) => {
        setLoading(true)
        axios.get(`${window.server}${`/ReactElements/getUploadedFiles/sid/${props.svSession}/object-id/${objId || props.objId}/object-type/${props.tableName}/file-type/0`}`).then(res => {
            if (res.data) {
                if (res.data.data.items?.length > 0) {
                    let files = res.data.data.items.map((el) => (<div key={el.object_id} className={'downloadable-item-div'}>
                        <div className={'download-icon-text'}>
                            <button id='file-name-upload' className={'file-name-upload'} onClick={(e) => downloadFile(el, e)}>{<Icon name="IconFile" size="40" stroke="1" />}{`${el.FILE_NAME} / ${formatDateAndTime(el.dt_insert)}`}</button>
                        </div>
                        <div>
                            <button type='button' id='deleteBtn' className={'delete-file-btn'} onClick={(e) => deletePrompt(el, e)}>
                                {<Icon name="IconTrashX" />}
                            </button>
                            <button type='button' id='downloadBtn' className={'download-file-btn'}
                                onClick={(e) => downloadFile(el, e)}>{<Icon name="IconDownload" />}
                            </button>
                        </div>
                    </div>))
                    setFileItems(files)
                    setLoading(false)
                } else {
                    setFileItems(undefined)
                    setLoading(false)
                }
            }
        }).catch(err => {
            console.error(err)
            setLoading(false)
            alertUserResponse({ response: err })
        });
    }

    const handleSubmit = () => {
        const { formid } = props
        const appObjId = ComponentManager.getStateForComponent(formid, "appObjId");
        const formData = ComponentManager.getStateForComponent(formid, "formTableData");
        const closeModal = ComponentManager.getStateForComponent(formid, "closeModalFunc");
        const resetClickedRowObjectId = ComponentManager.getStateForComponent(formid, "resetClickedRowObjectId");
        const onSubmitWs = ComponentManager.getStateForComponent(formid, "onSubmitWs");
        let url = `${window.server}${onSubmitWs}`

        if (formData) {
            axios({
                method: "post",
                data: encodeURIComponent(JSON.stringify(formData)),
                url,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }).then(res => {
                if (res?.data) {
                    if (temp && temp.length > 0) {
                        handleMultiAttach(temp, res.data.data['object_id'] || res.data.data['OBJECT_ID'])
                    } else {
                        alertUserResponse({
                            response: res.data, onConfirm: () => {
                                closeModal()
                                resetClickedRowObjectId()
                                reloadGrid(appObjId)
                            }
                        })
                    }
                }
            }).catch(err => {
                console.error(err)
                alertUserResponse({ response: err, onConfirm: () => ComponentManager.setStateForComponent(formid, null, { saveExecuted: false }) })
            });
        }
    }

    const deleteSelectedFile = (index, arr) => {
        const newArr = [...arr.slice(0, index), ...arr.slice(index + 1)];
        setTemp(newArr);
    }

    const generateSelectedFiles = (arr) => {
        let files
        if (arr && arr?.length > 0) {
            files = arr.map((el, index) => (
                <div key={index} className={'downloadable-item-div'}>
                    <div className={'download-icon-text'}>
                        <span><Icon name="IconFile" size="40" stroke="1" /></span>  <button id='file-name-upload' className={'file-name-upload'}>{`${el.name}`}</button>
                    </div>
                    <div>
                        <button type='button' id='deleteBtn' onClick={() => {
                            deleteSelectedFile(index, arr)
                        }} className={'delete-file-btn'}>{<Icon name="IconX" />}
                        </button>
                    </div>
                </div>
            ))

        } else {
            files = <></>
        }
        setSelectedFiles(files)
    }

    const deleteFunc = (_id, _action, _session) => {
        const { formid, svSession } = props
        const appObjId = ComponentManager.getStateForComponent(formid, "appObjId");
        const formData = ComponentManager.getStateForComponent(formid, "formTableData");
        const closeModal = ComponentManager.getStateForComponent(formid, "closeModalFunc");
        const resetClickedRowObjectId = ComponentManager.getStateForComponent(formid, "resetClickedRowObjectId");
        const id = ComponentManager.getStateForComponent(formid, "id");
        const onConfirm = () => {
            closeModal()
            resetClickedRowObjectId()
            reloadGrid(appObjId)
        }
        let url = window.server + `/ReactElements/deleteObject/${svSession}`;
        axios({
            method: "post",
            data: encodeURIComponent(JSON.stringify(formData)),
            url: url,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }).then((res) => {
            if (res?.data) {
                alertUserResponse({ response: res.data, onConfirm })
            }
        }).catch(err => {
            console.error(err)
            alertUserResponse({ response: err, onConfirm: () => ComponentManager.setStateForComponent(id, null, { deleteExecuted: false }) })
        });
    }

    return (
        <>
            {loading && <Loading />}
            <div className={'applications-all-attachments-container'}>
                {/* attachl left-live */}
                {!readOnly && <div className={'applications-attachments-selected applications-attachments-container'}>
                    <div className={'applications-upload'}>
                        <p>{labelsManager('attachment_title-temp', context, 'farm_registry')}</p>
                        <label title={labelsManager('upload_file_btn', context, 'farm_registry')} htmlFor={'upload-file'} className={'upload-file-btn'} id='uploadBtn'><Icon name="IconPlus" size="35" /></label>
                        <input className={'applications-upload-input'} type="file" id='upload-file' onChange={handleUploadedFiles} multiple={true} />
                    </div>
                    <div className={'applications-files'}>
                        {selectedFiles}
                    </div>
                </div>}
                {/* attach right offline */}
                <div className={'applications-attachments-uploaded applications-attachments-container'}>
                    <div className={'applications-upload'}>
                        <p>{labelsManager('attachment_title', context, 'farm_registry')}</p>
                    </div>
                    <div className={'applications-files'}>
                        {fileItems}
                    </div>
                </div>
            </div>

            {/* save and delete section */}
            {<div id="btnSeparator" className={"attachment-btns"}>
                {showSave && <button onClick={() => { handleSubmit() }} type="submit" id="save_form_btn" className={'wrapper-btn-save btn-success btn_save_form'}>{labelsManager('save', context, 'farm_registry')}</button>}
                {(props.objId !== 0 && props.objId) && showDelete && <button onClick={() => { deleteFunc() }} type="button" id="save_form_btn" className={'wrapper-btn-save btn-danger btn_delete_form'}>{labelsManager('delete', context, 'farm_registry')}</button>}
            </div>}
        </>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});

Attachments.contextTypes = {
    intl: PropTypes.object.isRequired,
};
export default connect(mapStateToProps)(Attachments);