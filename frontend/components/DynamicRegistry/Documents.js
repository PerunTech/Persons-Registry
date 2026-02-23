import { React, connect, elements, PropTypes, axios, Loading, utils } from "perun-core";
const { useState, useEffect } = React;
const { labelsManager } = utils
const { alertUserResponse, alertUserV2, Icon } = elements;

const Documents = (props, context) => {
    const [fileItems, setFileItems] = useState(undefined)
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        generateFileItem()
    }, [])
    const handleUploadedFiles = (e) => {
        let arr = []
        Object.values(e.target.files).map(file => {
            arr.push(file)
        })
        handleMultiAttach(arr)
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

    const generateFileItem = () => {
        const onDeleteBtnClick = (el, e) => {
            alertUserV2({
                type: 'warning',
                title: labelsManager('delete_uploaded_file', context, 'farm_registry'),
                confirmButtonText: labelsManager('yes', context, 'farm_registry'),
                confirmButtonColor: '#8d230f',
                onConfirm: () => deleteDownload(el, e),
                showCancel: true,
                cancelButtonText: labelsManager('no', context, 'farm_registry')
            })
        }

        setLoading(true)
        axios.get(`${window.server}${props.getUploadedFiles}`).then(res => {
            if (res?.data) {
                if (res.data?.data.items?.length > 0) {
                    let files = res.data.data.items.map((el) => (
                        <div key={el.object_id} className={'downloadable-item-div'}>
                            <div className={'download-icon-text'}>
                                <button id='file-name-upload' className={'file-name-upload'} onClick={(e) => downloadFile(el, e)}><Icon name="IconFile" size="40" stroke="1" />{el.FILE_NAME}</button>
                            </div>
                            <div>
                                <button type='button' id='deleteBtn' className={`delete-file-btn`}
                                    onClick={(e) => onDeleteBtnClick(el, e)}>{<Icon name="IconX" />}
                                </button>
                                <button type='button' id='downloadBtn' className={`download-file-btn`}
                                    onClick={(e) => downloadFile(el, e)}>{<Icon name="IconDownload" />}
                                </button>
                            </div>
                        </div>
                    ))
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

    const handleMultiAttach = (arr) => {
        if (arr.length > 0) {
            let errorArr = []
            setLoading(true)
            const promises = arr.map(async (file) => {
                let data = new FormData()
                data.append('file', file)
                return await axios({
                    method: 'post',
                    data: data,
                    url: `${window.server}${props.uploadFileUrl}`,
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
            alertUserV2({ type: 'info', title: labelsManager('no_file_selected', context, 'farm_registry') })
            setLoading(false)
        }

        generateFileItem()
    }

    const responseFunc = (errorArr) => {
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
                message: ` ${nameString}`
            })
        } else {
            alertUserV2({ type: 'success', title: labelsManager('desc_success_upload_title', context, 'farm_registry') })
        }
        generateFileItem()
    }

    return (
        <>
            {loading && <Loading />}
            <div className={'farm-registry-documents-container'}>
                <div className={'farm-registry-upload'}>
                    <p>{labelsManager('attachment_title', context, 'farm_registry')}</p>
                    <label title={labelsManager('upload_file_btn', context, 'farm_registry')} htmlFor={'upload-file'} className={'upload-file-btn'} id='uploadBtn'><Icon name="IconPlus" size="35" /></label>
                    <input className={'farm-registry-upload-input'} type="file" id='upload-file' onChange={handleUploadedFiles} multiple={true} />
                </div>
                <div className={'farm-registry-files'}>
                    {fileItems}
                </div>
            </div>
        </>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
    farmObjId: state['farm_registry.mapData']?.farmData?.objectId
});

Documents.contextTypes = {
    intl: PropTypes.object.isRequired,
};
export default connect(mapStateToProps)(Documents);