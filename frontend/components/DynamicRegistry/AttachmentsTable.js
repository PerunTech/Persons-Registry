import { React, useIntl, connect, elements, axios, Loading } from 'perun-core'
const { useState, useEffect, useRef } = React
const { alertUserResponse, alertUserV2 } = elements

// An item's attachments: free-form files in a table, with a drop zone below. Inside a page the
// section is the card; on its own (`standalone`) the component draws one.

const DEFAULT_MAX_SIZE_MB = 10

// The file list only documents object_id and FILE_NAME, so the rest is read from whichever name the service uses
const pick = (item, keys) => keys.map(key => item?.[key]).find(value => value !== undefined && value !== null && value !== '')
const fileSize = (item) => pick(item, ['FILE_SIZE', 'file_size', 'SIZE', 'size'])
const fileDate = (item) => pick(item, ['dt_insert', 'DT_INSERT', 'FILE_DATE', 'UPLOAD_DATE'])

const formatSize = (bytes) => {
    const size = Number(bytes)
    if (!size && size !== 0) return '—'
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (isNaN(date)) return String(value)
    return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const FileIcon = () => (
    <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true'>
        <path d='M14 3H6v18h12V7z' /><path d='M14 3v4h4' />
    </svg>
)
const TrashIcon = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' aria-hidden='true'>
        <path d='M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3' />
    </svg>
)
const UploadIcon = () => (
    <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
        <path d='M12 16V4M7 9l5-5 5 5' /><path d='M4 16v4h16v-4' />
    </svg>
)

const AttachmentsTable = (props) => {
    const intl = useIntl()
    const t = (id, defaultMessage, values) => intl.formatMessage({ id, defaultMessage }, values)
    const config = props.configuration || {}
    // Any file type unless the item restricts it, e.g. ".pdf,.png"; the size limit always applies
    const accept = config.accept || ''
    const maxSizeMb = config.maxSizeMb || DEFAULT_MAX_SIZE_MB
    const readOnly = config.readOnly === true || config.readOnly === 'true'

    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const fileInput = useRef(null)

    useEffect(() => {
        loadFiles()
    }, [config.data?.onSubmit])

    useEffect(() => {
        props.onCount?.(files.length)
    }, [files.length])

    const loadFiles = () => {
        setLoading(true)
        axios.get(`${window.server}${config.data?.onSubmit}`).then(res => {
            setLoading(false)
            setFiles(res?.data?.data?.items || [])
        }).catch(err => {
            setLoading(false)
            console.error(err)
            alertUserResponse({ response: err })
        })
    }

    const downloadFile = (file) => {
        if (file.object_id && file.FILE_NAME) {
            window.open(`${window.server}/ReactElements/downloadFile/sid/${props.svSession}/object-id/${file.object_id}/file-name/${file.FILE_NAME}`, '_blank')
        }
    }

    const deleteFile = (file) => {
        alertUserV2({
            type: 'warning',
            title: t('perun.persons_registry.attachments.delete_prompt', 'Delete this file?'),
            message: file.FILE_NAME,
            confirmButtonText: t('perun.persons_registry.yes', 'Yes'),
            showCancel: true,
            cancelButtonText: t('perun.persons_registry.no', 'No'),
            onConfirm: () => {
                setLoading(true)
                axios({
                    method: 'post',
                    data: JSON.stringify({ OBJECT_ID: file.object_id, OBJECT_TYPE: 2 }),
                    url: `${window.server}/ReactElements/deleteObject/${props.svSession}`,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                }).then(res => {
                    setLoading(false)
                    if (res?.data) {
                        alertUserResponse({ response: res.data })
                        if (res.data.type?.toLowerCase() === 'success') loadFiles()
                    }
                }).catch(err => {
                    setLoading(false)
                    console.error(err)
                    alertUserResponse({ response: err })
                })
            }
        })
    }

    // Checked before anything is sent: the size limit, and the extensions if the item restricts them
    const isAccepted = (file) => {
        if (file.size > maxSizeMb * 1024 * 1024) return false
        if (!accept) return true
        const name = file.name.toLowerCase()
        return accept.split(',').some(ext => name.endsWith(ext.trim().toLowerCase()))
    }

    const uploadFiles = (picked) => {
        const list = Array.from(picked || [])
        if (list.length === 0) return
        const rejected = list.filter(file => !isAccepted(file))
        const accepted = list.filter(isAccepted)
        const url = `${window.server}${config.attach?.onSubmit}`
        setLoading(true)
        Promise.all(accepted.map(file => {
            const data = new FormData()
            data.append('file', file)
            return axios({ method: 'post', data, url, headers: { 'Content-Type': 'multipart/form-data' } })
                .then(res => (res?.data?.type === 'SUCCESS' ? null : file))
                .catch(() => file)
        })).then(results => {
            setLoading(false)
            const failed = [...rejected, ...results.filter(Boolean)]
            if (failed.length > 0) {
                alertUserV2({
                    type: 'warning',
                    title: t('perun.persons_registry.attachments.upload_failed', 'These files were not uploaded:'),
                    message: failed.map(file => file.name).join(', ')
                })
            }
            loadFiles()
        })
    }

    const onPicked = (e) => {
        uploadFiles(e.target.files)
        // The same file can be picked again after it was deleted
        e.target.value = ''
    }

    const onDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        if (!readOnly) uploadFiles(e.dataTransfer.files)
    }

    return (
        <div className={`fr-attachments ${props.standalone ? 'fr-attachments-standalone' : ''}`}>
            {loading && <Loading />}
            <input ref={fileInput} type='file' accept={accept || undefined} multiple className='fr-attachments-input' onChange={onPicked} />
            {/* On its own screen there is no page section to title it, so the card carries the title and file count */}
            {props.standalone && (
                <div className='fr-page-section-head'>
                    <div>
                        <h2 className='fr-page-section-title'>{t('perun.persons_registry.attachment_title', 'Attachments')}</h2>
                    </div>
                    <span className='fr-section-count'>
                        {files.length} {files.length === 1 ? t('perun.persons_registry.attachments.count_one', 'file') : t('perun.persons_registry.attachments.count_other', 'files')}
                    </span>
                </div>
            )}
            {files.length > 0 && (
                <div className='fr-attachments-table-wrap'>
                    <table className='fr-attachments-table'>
                        <thead>
                            <tr>
                                <th>{t('perun.persons_registry.attachments.file', 'File')}</th>
                                <th className='fr-num'>{t('perun.persons_registry.attachments.size', 'Size')}</th>
                                <th>{t('perun.persons_registry.attachments.uploaded', 'Uploaded')}</th>
                                <th><span className='fr-sr-only'>{t('perun.persons_registry.attachments.actions', 'Actions')}</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map(file => (
                                <tr key={file.object_id}>
                                    <td>
                                        <button type='button' className='fr-chip' onClick={() => downloadFile(file)} title={t('perun.persons_registry.attachments.download', 'Download')}>
                                            <FileIcon />{file.FILE_NAME}
                                        </button>
                                    </td>
                                    <td className='fr-num fr-muted'>{formatSize(fileSize(file))}</td>
                                    <td className='fr-muted'>{formatDate(fileDate(file))}</td>
                                    <td className='fr-attachments-actions'>
                                        {!readOnly && (
                                            <button type='button' className='fr-icon-btn' onClick={() => deleteFile(file)} aria-label={t('perun.persons_registry.attachments.remove_file', 'Remove file')}>
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {!readOnly && (
                <div
                    className={`fr-dropzone ${dragOver ? 'fr-dropzone-active' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                >
                    <span className='fr-dropzone-icon'><UploadIcon /></span>
                    <span className='fr-dropzone-text'>{t('perun.persons_registry.attachments.drag_here', 'Drag files here or')}</span>
                    <button type='button' className='fr-btn' onClick={() => fileInput.current?.click()}>{t('perun.persons_registry.attachments.browse', 'Browse files')}</button>
                    <span className='fr-dropzone-hint'>
                        {config.hint
                            ? t(config.hint, config.hint)
                            // One label with placeholders, so a translation can order the sentence its own way
                            : t('perun.persons_registry.attachments.size_hint', '{types} · up to {size} MB each', {
                                types: accept
                                    ? accept.split(',').map(ext => ext.trim().replace('.', '').toUpperCase()).filter(ext => ext !== 'JPEG').join(', ')
                                    : t('perun.persons_registry.attachments.any_type', 'Any file type'),
                                size: maxSizeMb
                            })}
                    </span>
                </div>
            )}
        </div>
    )
}

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
})

export default connect(mapStateToProps)(AttachmentsTable)
