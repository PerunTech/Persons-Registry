import { React, PropTypes, ExportableGrid, connect, redux, elements, axios, GenericForm, ComponentManager, GridManager, Loading, createHashHistory, utils } from 'perun-core'
const { labelsManager, flattenObject } = utils
const { alertUserResponse } = elements
const { store, dataToRedux, removeAsyncReducer } = redux
const { useState, useEffect } = React
const hashHistory = createHashHistory()

const SearchDynamic = (props, context) => {
    const tableName = props.tableName?.toUpperCase() || ''
    const gridId = `${props.tableName}_SEARCH`
    const [loading, setLoading] = useState(false)
    const [resultsData, setResultsData] = useState(undefined)
    useEffect(() => {
        performSearch({}, false)
    }, [])

    const generateForm = () => {
        const searchConfig = props.configuration?.searchForm
        return (
            <GenericForm
                className={`sectioned-search-form aims-forms hide-all-form-legends`}
                params='FORM_DATA'
                key={gridId + '_FORM'}
                id={gridId + '_FORM'}
                method={searchConfig?.configuration?.onSubmit}
                uiSchemaConfigMethod={searchConfig?.uischema?.onSubmit}
                tableFormDataMethod={searchConfig?.data?.onSubmit}
                hideBtns='closeAndDelete'
                customSave
                addSaveFunction={(e) => {
                    performSearch(e.formData, true)
                }}
                customSaveButtonName={labelsManager('search', context, 'farm_registry')}
            />
        )
    }

    const onRowClick = (_id, _idx, row) => {
        const href = `/main/aims/${tableName}/${row[`${tableName}.OBJECT_ID`]}/summary`
        hashHistory.push(href)
    }

    const generateGrid = () => {
        const buttonsArray = []
        const configWs = props.configuration?.configuration?.onSubmit
        return (
            <ExportableGrid
                gridType='SEARCH_GRID_DATA'
                key={gridId + '_GRID'}
                id={gridId + '_GRID'}
                heightRatio={0.6}
                configTableName={configWs}
                dataTableName={resultsData}
                onRowClickFunct={onRowClick}
                className='animals-search-grid'
                buttonsArray={buttonsArray}
            />
        )
    }

    const performSearch = (formData, isForm) => {
        const searchConfig = props.configuration?.searchForm;
        const searchType = searchConfig?.save?.type || 'GET';
        const contentType = searchConfig?.save?.contentType || 'application/x-www-form-urlencoded'
        const url = searchConfig?.save?.onSave;
        const reqConfig = { method: searchType, url: `${window.server}${url}` };
        if (searchType === 'POST') {
            reqConfig.data = flattenObject(formData)
            reqConfig.headers = { 'Content-Type': contentType }
        }
        // Handle form-specific logic
        if (isForm) {
            setResultsData(undefined);
            removeAsyncReducer(store, gridId + '_GRID');
            dataToRedux(null, 'componentIndex', gridId + '_GRID', '');
        }
        setLoading(true)
        axios(reqConfig)
            .then(res => {
                setLoading(false)
                if (res?.data?.data && Array.isArray(res.data.data) && res.data.data?.length > 0) {
                    setResultsData(res.data.data)
                    GridManager.reloadAllGrids();
                } else if (res?.data && Array.isArray(res?.data) && res.data?.length > 0) {
                    setResultsData(res.data)
                    GridManager.reloadAllGrids();
                } else {
                    alertUserResponse({ response: res })
                }
            })
            .catch(err => {
                console.error(err);
                setLoading(false)
                alertUserResponse({ response: err })
                // Handle form-specific error logic
                if (isForm) {
                    ComponentManager.setStateForComponent(`${gridId}_FORM`, null, {
                        saveExecuted: false,
                    });
                }
            });
    };

    return (
        <>
            {loading && <Loading />}
            <div className='dynamic-search-main-container'>
                <div className='dynamic-search-form'>
                    {props.configuration && generateForm()}
                </div>
                <div className='dynamic-search-grid-container'>
                    {resultsData && generateGrid()}
                </div>
            </div>
        </>
    )
}

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
})

SearchDynamic.contextTypes = {
    intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps)(SearchDynamic)
