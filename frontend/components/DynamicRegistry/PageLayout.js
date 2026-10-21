import { React, axios, PropTypes, GridManager, ComponentManager, redux } from 'perun-core'
import CustomButtons from './CustomButtons'
import TopButtons from './TopButtons'
import ObjectStatistics from './ObjectStatistics'
const { useEffect, useState } = React
const { store } = redux

// A section's width as a percent of the row, e.g. 66. Defaults to the full row.
const sectionWidth = (width) => {
    const percent = parseFloat(width)
    return percent > 0 && percent <= 100 ? percent / 100 : 1
}

// Read-only label/value list (data.DETAILED) from the section's own service.
const SummaryList = ({ url }) => {
    const [rows, setRows] = useState([])
    useEffect(() => {
        if (!url) return
        axios.get(`${window.server}/${url.replace(/^\//, '')}`).then(res => setRows(res?.data?.data?.DETAILED || [])).catch(err => console.error(err))
    }, [url])
    return (
        <dl className="fr-details">
            {rows.map(({ label, value }) => (
                <React.Fragment key={label}>
                    <dt>{label}</dt>
                    <dd>{value ?? '—'}</dd>
                </React.Fragment>
            ))}
        </dl>
    )
}

// Reload a section's grid after one of its buttons ran; a multi-select grid also drops its selection (as CustomButtons does)
const reloadSectionGrid = (gridId, multiSelect) => {
    GridManager.reloadAllGrids()
    if (multiSelect) {
        store.dispatch({ type: 'UPDATE_SELECTED_GRID_ROWS', payload: [[], gridId] })
        ComponentManager.setStateForComponent(gridId, 'selectedIndexes', [])
        ComponentManager.setStateForComponent(gridId, 'selectedIndexesBeforeFilters', [])
        ComponentManager.setStateForComponent(gridId, 'selectedRowsBeforeFilters', [])
    }
}

// Audit entries ({ LABEL_TITLE, LABEL_TEXT }) from the section's own service, oldest first as returned.
const HistoryList = ({ url }) => {
    const [rows, setRows] = useState([])
    useEffect(() => {
        if (!url) return
        axios.get(`${window.server}/${url.replace(/^\//, '')}`).then(res => {
            const data = Array.isArray(res?.data) ? res.data : res?.data?.data
            setRows(Array.isArray(data) ? data : [])
        }).catch(err => console.error(err))
    }, [url])
    return (
        <ul className="fr-history">
            {rows.map((row, idx) => (
                <li key={idx}>
                    <div className="fr-history-title">{row.LABEL_TITLE}</div>
                    <div className="fr-history-text">{row.LABEL_TEXT}</div>
                </li>
            ))}
        </ul>
    )
}

const PageLayout = (props, context) => {
    // Titles and descriptions are label codes; a plain string falls through unchanged as its own default.
    const t = (code) => (code ? context.intl.formatMessage({ id: code, defaultMessage: code }) : code)
    const { header, sections } = props.configuration?.objectConfiguration || {}
    // The screen's top buttons (e.g. Change Status), passed down from the registry so they sit in the header
    const hasTopButtons = props.headerTopButtons?.length > 0
    // Item counts a section reports about itself (an attachments section's files), shown in its header
    const [counts, setCounts] = useState({})
    const countLabel = (count) => count === 1
        ? `1 ${context.intl.formatMessage({ id: 'perun.persons_registry.attachments.count_one', defaultMessage: 'file' })}`
        : `${count} ${context.intl.formatMessage({ id: 'perun.persons_registry.attachments.count_other', defaultMessage: 'files' })}`

    return (
        <div className="fr-page">
            {(header || hasTopButtons) && (
                <div className="fr-page-header">
                    <div>
                        {header?.title && <h1 className="fr-page-title">{t(header.title)}</h1>}
                        {header?.description && <p className="fr-page-description">{t(header.description)}</p>}
                    </div>
                    {header?.action && <button type="button" className="fr-btn fr-btn-primary">{t(header.action)}</button>}
                    {hasTopButtons && <div className="fr-page-header-actions">
                        <TopButtons
                            configuration={props.headerTopButtons}
                            objectId={props.objectId}
                            tableName={props.routeParams?.tableName}
                            activeComponent={props.routeParams?.component}
                        />
                    </div>}
                </div>
            )}
            <div className="fr-page-grid">
                {(sections || []).map(section => {
                    // The section ID names its grid, so it must be unique across pages; its table is
                    // section.tableName, or the ID itself when the two are the same
                    const configuration = section.objectConfiguration && { ID: `${section.ID}_${props.objectId}`, tableName: section.tableName || section.ID, objectConfiguration: section.objectConfiguration }
                    // A grid's item related top buttons (e.g. Approve on the selected rows) sit in the section's header
                    const sectionTopButtons = section.objectConfiguration?.type === 'grid' && section.objectConfiguration.additionalTopButtons
                    const hasSectionTopButtons = Array.isArray(sectionTopButtons) && sectionTopButtons.length > 0
                    return (
                        <section key={section.ID} className="fr-page-section fr-col" style={{ '--fr-w': sectionWidth(section.width) }}>
                            {(section.title || section.badge || section.action || hasSectionTopButtons) && (
                                <div className="fr-page-section-head">
                                    <div>
                                        {section.title && <h2 className="fr-page-section-title">{t(section.title)}</h2>}
                                        {section.description && <p className="fr-page-section-description">{t(section.description)}</p>}
                                    </div>
                                    {section.badge && <span className="fr-lock">{t(section.badge)}</span>}
                                    {counts[section.ID] !== undefined && <span className="fr-section-count">{countLabel(counts[section.ID])}</span>}
                                    {section.action && <button type="button" className="fr-btn fr-btn-primary">{t(section.action)}</button>}
                                    {hasSectionTopButtons && <div className="fr-section-top-buttons">
                                        <TopButtons
                                            configuration={sectionTopButtons}
                                            objectId={props.objectId}
                                            tableName={props.routeParams?.tableName}
                                            refreshResults={() => reloadSectionGrid(`${section.ID}${props.appObjId}`, [true, 'true'].includes(section.objectConfiguration.multiSelect))}
                                        />
                                    </div>}
                                </div>
                            )}
                            {section.type === 'summary' && <SummaryList url={section.url} />}
                            {section.type === 'history' && <HistoryList url={section.url} />}
                            {section.type === 'statistics' && <ObjectStatistics url={section.url} />}
                            {!['summary', 'history', 'statistics'].includes(section.type) && <CustomButtons
                                tableName={section.ID}
                                objectId={props.objectId}
                                appObjId={props.appObjId}
                                configuration={configuration}
                                routeParams={props.routeParams}
                                getConfiguration={props.getConfiguration}
                                onSectionCount={(count) => setCounts(prev => (prev[section.ID] === count ? prev : { ...prev, [section.ID]: count }))}
                                inPage
                            />}
                        </section>
                    )
                })}
            </div>
        </div>
    )
}

PageLayout.contextTypes = {
    intl: PropTypes.object.isRequired,
}

export default PageLayout
