import { React, connect, PropTypes, Loading, axios, createHashHistory, elements, redux, Tooltip } from "perun-core";
const { useEffect, useState, useRef } = React
const { alertUserResponse, Icon } = elements
const { store } = redux;
import CustomButtons from "./CustomButtons";
import ObjectSummary from './ObjectSummary';

const SideMenu = (props) => {
    const mounted = useRef()
    const sideMenuRef = useRef(null);
    let hashHistory = createHashHistory();
    const [activeElement, setActiveElement] = useState('');
    const [activeChild, setActiveChild] = useState('');
    const [activeParent, setActiveParent] = useState('');
    const [configuration, setConfiguration] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true
        } else {
            getConfiguration();
        }
    }, []);

    useEffect(() => {
        getConfiguration()
    }, [props.selectedRow, props.menuName])

    useEffect(() => {
        if (props?.refreshSideMenu) {
            getConfiguration();
            store.dispatch({ type: 'SAVE', payload: { key: 'refreshSideMenu', value: false } })
        }
    }, [props?.refreshSideMenu]);

    const getConfiguration = () => {
        const { svSession, tableName, objectId } = props
        props.setTopButtons(undefined)
        setLoading(true)
        const url = `${window.server}/Menu/getMenu/${svSession}/${objectId}/${tableName}/-`
        const reqConfig = { method: 'get', url }
        axios(reqConfig).then(res => {
            setLoading(false)
            if (res?.data) {
                const buttonArray = []
                const topButtons = []
                const resType = res.data?.type?.toLowerCase()
                if (resType && resType === 'error') {
                    alertUserResponse({ response: res.data })
                } else {
                    if (res.data?.data?.buttonArray && Array.isArray(res.data.data.buttonArray)) {
                        const component = props.routeParams?.component
                        const isChild = component.includes('SUB-')
                        const tableName = component.replace(/^SUB-/, '')
                        res.data?.data?.buttonArray?.map(item => {
                            if (item.position === 'top') {
                                topButtons.push(item)
                            } else {
                                buttonArray.push(item)
                                if (item.data && isChild) {
                                    item.data.map(child => {
                                        if (child?.ID?.includes(tableName)) {
                                            onButtonClick(child, true)
                                            setActive(item)
                                        }
                                    })
                                } else {
                                    if (item?.ID?.includes(tableName)) {
                                        onButtonClick(item)
                                    }
                                }
                            }
                        })
                        setConfiguration(buttonArray)
                        props.setTopButtons(topButtons)
                    }
                }
            }
        }).catch(err => {
            console.error(err)
            setLoading(false)
            alertUserResponse({ response: err })
        })
    }
    const setActive = (el) => {
        if (el.ID === activeParent) {
            setActiveParent('');
            setLoading(false);
        } else {
            setActiveParent(el.ID);
            setTimeout(() => {
                const clickedButton = document.getElementById(el.ID);
                if (clickedButton) {
                    const sideMenu = sideMenuRef.current;
                    if (sideMenu) {
                        sideMenu.scrollBy({
                            top: 200,
                            behavior: 'smooth',
                        });
                    }
                }
            }, 100);
        }
    };

    const activeChildFunc = (el) => {
        setActive(el)
        props.toggleSideMenu(true)
    }
    // Function to generate the buttons (you can keep the one you provided)
    const generateSideMenuButtons = () => {
        if (configuration && Array.isArray(configuration)) {
            return configuration.map(el => {
                if (!el?.ID?.toUpperCase()?.includes('SUMMARY')) {
                    return (
                        <>
                            <button
                                id={el.ID}
                                className={`sidemenu-btn_sub ${activeElement === el.ID && !el.data && 'sidemenu-active'}`}
                                onClick={() => (el.data ? activeChildFunc(el) : onButtonClick(el))}
                                data-tooltip-id={props.toggledMenu && el.data?.length ? "aims-tooltip" : "simple-tooltip"}
                                data-tooltip-content={props.toggledMenu && el.data?.length ? JSON.stringify(el.data) : JSON.stringify(el)}
                                data-tooltip-place="right"
                            >
                                <span className='sidemenu-btn-title'>
                                    {el.iconName && el.iconName !== '%ICON_NAME%' && (
                                        <span className={'sidemenu-dynamic-comp-icon-holder'}>
                                            <Icon name={el.iconName} />
                                        </span>
                                    )}
                                    <p>{el.label}</p>
                                </span>
                                {el.data && (
                                    <span className={`expand-arrow ${el.ID === activeParent && 'rotate-expand'}`}>
                                        <Icon name='IconChevronDown' />
                                    </span>
                                )}
                            </button>
                            {el.data && (
                                <div className={el.ID === activeParent ? 'sidemenu-sub-item-active' : 'sidemenu-sub-item-hidden'}>
                                    {el.data.map(sub => {
                                        return (
                                            <button
                                                key={sub.ID}
                                                className={`sidemenu-btn_sub ${activeChild === sub.ID && 'sidemenu-active'}`}
                                                onClick={() => (sub.ID.includes('PRINT') ? printFunc(sub) : onButtonClick(sub, true))}
                                                data-tooltip-id="aims-tooltip" data-tooltip-content={sub.label}
                                            >
                                                <span className="sidemenu-btn-title">
                                                    {sub.iconName && sub.iconName !== '%ICON_NAME%' && (
                                                        <span className={'sidemenu-dynamic-comp-icon-holder'}>
                                                            <Icon name={sub.iconName} />
                                                        </span>
                                                    )}
                                                    <p>{sub.label}</p>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    );
                }
            });
        } else {
            return <></>;
        }
    };
    const onButtonClick = (element, childEl) => {
        store.dispatch({ type: 'SAVE', payload: { key: 'person-registry-module-additional-top-buttons', value: undefined } })
        const id = element.ID;
        const splitID = id.replace(/\d/g, '').replace(/_$/, '');
        if (childEl) {
            displayComponent('DYNAMIC', splitID, element, true);
            setActiveChild(id)
            setLoading(false)
            setActiveElement('')
        } else {
            displayComponent('DYNAMIC', splitID, element);
            setActiveElement(id)
            setLoading(false)
            setActiveChild('')

        }
    }
    const printFunc = (sub) => {
        let url = window.server + sub.onSubmit;
        window.open(url, '_blank');
    }
    const displayComponent = (component, tableName, configuration, child) => {
        let dynamicComponent;
        let href = `/main/persons-registry/${props.tableName}/${props.objectId}/`
        switch (component) {
            case "DYNAMIC": {
                if (child) {
                    href = `/main/persons-registry/${props.tableName}/${props.objectId}/SUB-${tableName}`
                }
                else href = `/main/persons-registry/${props.tableName}/${props.objectId}/${tableName}`
                hashHistory.push(href)
                const customButtonsProps = {
                    routeParams: props.routeParams,
                    key: tableName,
                    tableName,
                    objectId: props.objectId,
                    appObjId: props.objectId,
                    configuration,
                    getConfiguration: (objId) => getConfiguration(objId)
                }
                dynamicComponent = <CustomButtons {...customButtonsProps} />
                break;
            }
            default:
                break;
        }
        props.setDynamicComponentFunction(dynamicComponent)
    };
    return (
        <>
            {loading && <Loading />}
            <div className={`sidemenu-main-container farm-registry-sidemenu-main-container ${props.toggledMenu && 'toggled-sidemenu'}`} id="sidemenu-main-container">
                {configuration && (
                    <ObjectSummary
                        configuration={configuration}
                        tableName={props.tableName}
                        objectId={props.objectId}
                        toggleSideMenu={props.toggleSideMenu}
                        toggledMenu={props.toggledMenu}
                    />
                )}
                <div ref={sideMenuRef} className='farm-registry-sidemenu-buttons-container'>
                    {generateSideMenuButtons()}
                </div>
            </div>
            {props.toggledMenu && (
                <Tooltip id="aims-tooltip" place="right" clickable className="aims-tooltip"
                    render={({ content }) => {
                        let submenu = [];
                        try {
                            submenu = JSON.parse(content || "[]");
                        } catch (e) {
                            submenu = [];
                        }

                        if (!submenu.length) return null;
                        return (
                            <div className="tooltip-submenu-wrapper">
                                {submenu.map(sub => (
                                    <button key={sub.ID} className={`sidemenu-btn_sub ${activeChild === sub.ID && 'sidemenu-active'}`}
                                        onClick={() => sub.ID.includes('PRINT') ? printFunc(sub) : onButtonClick(sub, true)}>{sub.label} </button>
                                ))}
                            </div>
                        );
                    }}
                />
            )}
            {props.toggledMenu && (
                <Tooltip className="aims-tooltip" id="simple-tooltip" place="right" clickable
                    render={({ content }) => {
                        if (!content) return null;
                        let el;
                        try {
                            el = JSON.parse(content);
                        } catch (e) {
                            return null;
                        }
                        return (
                            <div className="tooltip-submenu-wrapper">
                                <button className="sidemenu-btn_sub" onClick={() => onButtonClick(el)} >
                                    {el.label}</button>
                            </div>
                        );
                    }}
                />
            )}
        </>
    );
}
const mapStateToProps = (state, ownProps) => ({
    svSession: state.security.svSession,
    refreshSideMenu: state.businessLogicReducer?.refreshSideMenu,
    selectedRow: state.businessLogicReducer?.[`person-registry-module-row-${ownProps?.routeParams?.tableName}`],
    menuName: state.businessLogicReducer?.[`person-registry-module-menu-name-${ownProps?.routeParams?.tableName}`],
});

SideMenu.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(SideMenu);