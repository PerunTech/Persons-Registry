import {
    React,
    connect,
    elements,
    ComponentManager,
    PropTypes, axios, GenericForm, redux,
    Loading, ExportableGrid, GridManager, utils
} from "perun-core";
const { labelsManager, flattenObject, jsonToURI } = utils
const { useState, useEffect } = React;
const { alertUserResponse, ReactBootstrap } = elements
const { Modal } = ReactBootstrap
const { store, dataToRedux, removeAsyncReducer } = redux
const WrapperSearch = (props, context) => {
    const gridId = `${props.tableName}`
    const [loading, setLoading] = useState(false)
    const [resultsData, setResultsData] = useState(undefined)
    const [show, setShow] = useState(false)
    useEffect(() => {
        setShow(true)
        if (!props.searchWs && props.dataWs) {
            axios.get(`${window.server}/${props.dataWs}`).then(res => {
                setResultsData(res.data)
            })
        }
    }, [])

    useState(() => {
        return () => {
            props.handleShow()
            setResultsData(undefined)
        };
    })

    const performSearch = (formData, isForm) => {
        const searchType = 'POST'
        const contentType = props.contentType || 'application/x-www-form-urlencoded'
        const reqConfig = { method: searchType, url: `${window.server}/${props.searchWs}` };
        if (searchType === 'POST') {
            reqConfig.data = jsonToURI(flattenObject(formData))
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
                ComponentManager.setStateForComponent(`${gridId}_FORM`, null, {
                    saveExecuted: false,
                });
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

    const generateGrid = () => {
        return (
            <ExportableGrid
                gridType='SEARCH_GRID_DATA'
                key={gridId + '_GRID'}
                id={gridId + '_GRID'}
                heightRatio={0.48}
                configTableName={`/ReactElements/getTableFieldList/${props.svSession}/${props.tableName}`}
                dataTableName={resultsData}
                onRowClickFunct={performRowClick}
                className='animals-search-grid'
            />
        )
    }
    const performRowClick = (_id, _rowIdx, row) => {
        props.rowClick(row)
        setResultsData(undefined);
        removeAsyncReducer(store, gridId + '_GRID');
        dataToRedux(null, 'componentIndex', gridId + '_GRID', '');
        props.handleShow()
    }

    return (
        <>
            {loading && <Loading />}
            {show && <Modal className='farm-registry-modal vmp-modal' show={show} onHide={() => props.handleShow()}>
                <Modal.Header className='farm-registry-modal-header' closeButton>
                    <Modal.Title>{labelsManager('search', context, 'farm_registry')}</Modal.Title>
                </Modal.Header>
                <Modal.Body className='farm-registry-modal-body'>
                    {props.searchWs && <GenericForm
                        className={`form-test custom-farm-registry-form aims-forms hide-all-form-legends ${props?.tableName?.toLowerCase()}-search vmp-search-app`}
                        params='FORM_DATA'
                        key={`${props.tableName}_FORM`}
                        id={`${props.tableName}_FORM`}
                        method={`/ReactElements/getTableSearchJSONSchema/${props.svSession}/${props.tableName}`}
                        uiSchemaConfigMethod={`/ReactElements/getTableUISchemaOverride/${props.svSession}/${props.tableName}`}
                        tableFormDataMethod={`/ReactElements/getTableFormData/${props.svSession}/0/${props.tableName}`}
                        addSaveFunction={(e) => {
                            performSearch(e.formData, true)
                        }}
                        customSaveButtonName={labelsManager('search', context, 'farm_registry')}
                        customSave
                        hideBtns={'closeAndDelete'}
                    />}
                    <div className='dynamic-search-grid-container'>
                        {resultsData && generateGrid()}
                    </div>
                </Modal.Body>
                <Modal.Footer className='farm-registry-modal-footer' />
            </Modal>}
        </>
    );

};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});
WrapperSearch.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(WrapperSearch);
