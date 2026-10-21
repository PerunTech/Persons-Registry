import { React, axios, PropTypes } from 'perun-core'
const { useEffect, useState } = React

// Counts per status ({ label, value } in data.STATISTICS) as a row of tiles above a registry.
// The label is shown as the service sends it (translated when it is a label code) and is also
// the tile's data-status, so a project's styles can colour particular statuses.
const ObjectStatistics = ({ url }, context) => {
    const [rows, setRows] = useState([])
    useEffect(() => {
        if (!url) return
        axios.get(`${window.server}/${url.replace(/^\//, '')}`).then(res => {
            const data = res?.data?.data?.STATISTICS
            setRows(Array.isArray(data) ? data : [])
        }).catch(err => console.error(err))
    }, [url])

    if (!rows.length) return null
    return (
        <dl className="fr-stats">
            {rows.map(({ label, value }, idx) => (
                <div key={idx} className="fr-stat" data-status={label}>
                    <dt>{context.intl.formatMessage({ id: String(label), defaultMessage: String(label) })}</dt>
                    <dd>{value}</dd>
                </div>
            ))}
        </dl>
    )
}

ObjectStatistics.contextTypes = {
    intl: PropTypes.object.isRequired,
}

export default ObjectStatistics
