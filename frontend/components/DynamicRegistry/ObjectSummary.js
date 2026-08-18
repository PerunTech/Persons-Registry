import { React, connect, PropTypes, Tooltip, Loading, axios, elements, createHashHistory, redux, ReactDOM, utils } from "perun-core";
const { labelsManager } = utils
const { useEffect, useRef, useState } = React;
const { ReactBootstrap, alertUserResponse, alertUserV2, Icon } = elements;
const { Modal } = ReactBootstrap;
const { store } = redux
const hashHistory = createHashHistory();
const ObjectSummary = (props, context) => {
    const mounted = useRef()
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [menuData, setMenuData] = useState([]);
    const [modalData, setModalData] = useState([]);
    const [actions, setActions] = useState([])
    const [importUrl, setImportUrl] = useState(undefined)
    const [backBtnTooltipIsOpen, setBackBtnTooltipIsOpen] = useState(false)
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true
        } else {
            props?.configuration?.map(el => {
                if (el?.ID?.toUpperCase()?.includes('SUMMARY')) {
                    getObjectSummary(el.url);
                }
            })
        }
        window.addEventListener('click', closeBackBtnTooltip);
        return () => {
            window.removeEventListener('click', closeBackBtnTooltip);
        }
    }, []);

    useEffect(() => {
        props?.configuration?.map(el => {
            if (el?.ID?.toUpperCase()?.includes('SUMMARY')) {
                getObjectSummary(el.url);
            }
        })
    }, [props.configuration])

    useEffect(() => {
        if (props.refreshSummary) {
            props?.configuration?.map(el => {
                if (el?.ID?.toUpperCase()?.includes('SUMMARY')) {
                    getObjectSummary(el.url);
                    store.dispatch({ type: 'SAVE', payload: { key: 'refreshSummary', value: false } })
                    store.dispatch({ type: 'SAVE', payload: { key: 'refreshSideMenu', value: true } })
                }
            })
        }
    }, [props.refreshSummary]);

    const getObjectSummary = (url) => {
        setLoading(true);
        axios.get(`${window.server}/${url}`)
            .then(res => {
                setLoading(false);
                if (res?.data) {
                    const resType = res.data?.type?.toLowerCase();
                    if (resType === 'error') {
                        alertUserResponse({ response: res.data });
                    } else {
                        setMenuData(res.data?.data?.DETAILED || []);
                        setModalData(res.data?.data?.SHORT || []);
                        setActions(res.data?.data?.ACTIONS || [])
                        setImportUrl(res.data?.data?.IMPORT?.[0]['import'] || undefined)
                    }
                }
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
                alertUserResponse({ response: err });
            });
    };

    const closeBackBtnTooltip = () => {
        setBackBtnTooltipIsOpen(false)
    }

    const backButtonRightClick = (e) => {
        e.preventDefault()
        setBackBtnTooltipIsOpen(true)
    }

    const onRouteClick = (index) => {
        const previousRoutes = props?.businessLogicReducer?.['person-registry-module-previous-routes']
        // Replace the current route with the selected one
        window.location.replace(previousRoutes[index].route)
        // Remove all routes after the selected one from the tracking array
        const newRoutes = previousRoutes.slice()
        newRoutes.splice(index)
        store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-previous-routes', value: newRoutes } })
    }

    const backButtonFunction = () => {
        closeBackBtnTooltip()
        if (props?.businessLogicReducer?.['farm-registry-route']) {
            hashHistory.push(props?.businessLogicReducer?.['farm-registry-route'])
            store.dispatch({ type: 'SAVE', payload: { key: 'farm-registry-route', value: '' } })
        } else if (props?.businessLogicReducer?.['person-registry-module-previous-routes'] && Array.isArray(props?.businessLogicReducer?.['person-registry-module-previous-routes'])) {
            const previousRoutes = props?.businessLogicReducer?.['person-registry-module-previous-routes']
            if (previousRoutes.length >= 1) {
                // Replace the current route with the last previously accessed one
                window.location.replace(previousRoutes[previousRoutes.length - 1].route)
                // Remove the route from the tracking array
                const newRoutes = previousRoutes.slice()
                newRoutes.pop()
                store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-previous-routes', value: newRoutes } })
            } else {
                hashHistory.push('/main/persons-registry')
            }
        } else {
            hashHistory.push('/main/persons-registry')
        }
    }

    const generateMenuData = () => {
        return (
            <>
                {menuData.map(({ label, value }) => (
                    <div className="farm-registry-object-summary-row" key={label}>
                        <p>{label} :</p>
                        <p>{value}</p>
                    </div>
                ))}
            </>
        )
    }

    const generateModalData = () => (
        <div className="farm-registry-object-summary-modal">
            {modalData.map(({ label, value }) => (
                <div className="farm-registry-object-summary-row" key={label}>
                    <p>{label}</p>
                    <p>: {value}</p>
                </div>
            ))}
        </div>
    );
    const updateData = () => {
        const onConfirm = () => {
            setLoading(true)
            const url = `${window.server}${importUrl}`
            axios.get(url).then(res => {
                setLoading(false)
                if (res?.data) {
                    alertUserResponse({ response: res.data })
                }
            }).catch(err => {
                setLoading(false)
                console.error(err)
                alertUserResponse({ response: err })
            });
        }
        alertUserV2({
            type: 'info',
            title: labelsManager('confirm_update_action', context, 'person-registry'),
            message: labelsManager('confirm_update_action_msg', context, 'person-registry'),
            confirmButtonText: labelsManager('yes', context, 'person-registry'),
            onConfirm,
            showCancel: true,
            cancelButtonText: labelsManager('no', context)
        })
    }

    const generateSummaryActions = () => {
        return actions?.map((el, i) => (
            <button
                key={`${props.tableName}_${props.objectId}_ACTION_${i + 1}`}
                className="farm-registry-object-summary-show-more farm-registry-object-summary-btn-action"
                onClick={() => summaryAction(el.onSubmit)}
            >
                {el.label}
            </button>
        ))
    }

    const generateCheckList = (data) => {
        const customElement = document.createElement('div');
        ReactDOM.render(
            <div className='farm-registry-alert'>
                <div className='farm-registry-alert-title'><p>{labelsManager('alert-title', context, 'person-registry')}</p></div>
                <div className='farm-registry-alert-fields'>
                    {data['FIELDS'].map((el, index) => (
                        <div className='farm-registry-alert-field' key={index}>
                            <>                         <div className='farm-registry-alert-field-icon'>{!el.value ? <Icon name="IconX" /> : <Icon name="IconCheck" />}</div>
                                <p>{el.label}</p></>
                        </div>
                    ))}
                </div>
            </div>,
            customElement
        );
        alertUserV2({
            html: customElement,
            allowOutsideClick: true,
        });
        store.dispatch({ type: 'SAVE', payload: { key: 'refreshSummary', value: true } })
        store.dispatch({ type: 'SAVE', payload: { key: 'refreshSideMenu', value: true } })
    }

    const summaryAction = (url) => {
        setLoading(true);

        axios.get(`${window.server + url}`)
            .then(res => {
                setLoading(false);
                if (res?.data?.data) {
                    const data = JSON.parse(res.data.data);
                    data?.['FIELDS'] ? generateCheckList(data) : () => { }
                } else {
                    alertUserResponse({ response: res })
                    store.dispatch({ type: 'SAVE', payload: { key: 'refreshSummary', value: true } })
                    store.dispatch({ type: 'SAVE', payload: { key: 'refreshSideMenu', value: true } })
                }

            })
            .catch(err => {
                setLoading(false);
                alertUserResponse({ response: err });
            });
    };

    return (
        <>
            {loading && <Loading />}
            <div className="farm-registry-object-summary">
                <div className="summary-buttons">
                    <button
                        className='farm-registry-summary-back-btn epi-module-summary-back-btn'
                        onClick={backButtonFunction}
                        onContextMenu={backButtonRightClick}
                        data-tooltip-id='epi-back-button-tooltip'
                        data-tooltip-content={JSON.stringify(props?.businessLogicReducer?.['person-registry-module-previous-routes'])}
                    >
                        <Icon name='IconChevronLeft' />
                        <span className='back-btn-text'>{labelsManager('back', context, 'persons_registry')}</span>
                    </button>
                    <Tooltip
                        id='epi-back-button-tooltip'
                        openEvents={[]}
                        isOpen={backBtnTooltipIsOpen}
                        anchorSelect="[data-tooltip-id='epi-back-button-tooltip']"
                        clickable
                        className='aims-tooltip back-btn-tooltip'
                        render={({ content }) => {
                            const routes = JSON.parse(content || '[]')
                            if (!routes.length) return null
                            return (
                                <div className='aims-back-route-container'>
                                    {routes.map((route, index) => {
                                        return (
                                            <>
                                                {index !== 0 && (
                                                    <Icon name='IconChevronLeft' />
                                                )}
                                                <button key={index} className='aims-back-route' onClick={() => onRouteClick(index)}>
                                                    {labelsManager(route.label, context, 'person-registry')}
                                                </button>
                                            </>
                                        )
                                    })}
                                </div>
                            )
                        }}
                    />
                    <button
                        title={labelsManager(props.toggledMenu ? 'expand' : 'collapse', context, 'general')}
                        className='farm-registry-summary-back-btn aims-registry-collapse'
                        onClick={() => props.toggleSideMenu()}
                    >
                        <div className='aims-collapse-icon-holder epi-module-icon-holder'>
                            <Icon name='IconChevronsLeft' />
                        </div>
                    </button>
                </div>
                {menuData.length > 0 && (
                    <>
                        <div className='farm-registry-object-summary-rows-container'>
                            {generateMenuData()}
                        </div>
                        <div className='farm-registry-object-summary-btn-container'>
                            {modalData.length > 0 && (
                                <button
                                    className="farm-registry-object-summary-show-more"
                                    onClick={() => setShow(true)}
                                >
                                    {labelsManager('show_more', context, 'person-registry')}
                                </button>
                            )}
                            {importUrl && <button className={`update-farm-btn`} onClick={() => updateData()}><span className={`update-farm-btn-container`}>{labelsManager("update_data_btn", context, 'person-registry')} <span className={`update-farm-btn-icon`}><Icon name="IconReload" /></span></span></button>}
                            {actions && generateSummaryActions()}
                        </div>
                    </>
                )}
            </div>
            {show && (
                <Modal
                    className="farm-registry-modal farm-registry-modal-object-summary"
                    show={show}
                    onHide={() => setShow(false)}
                >
                    <Modal.Header className="farm-registry-modal-header" closeButton />
                    <Modal.Body className="farm-registry-modal-body">
                        {modalData.length > 0 && generateModalData()}
                    </Modal.Body>
                    <Modal.Footer className="farm-registry-modal-footer" />
                </Modal>
            )}
        </>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
    businessLogicReducer: state.businessLogicReducer,
    refreshSummary: state.businessLogicReducer?.refreshSummary
});

ObjectSummary.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(ObjectSummary);
