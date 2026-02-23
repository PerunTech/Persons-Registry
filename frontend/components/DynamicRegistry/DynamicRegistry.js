import { React, PropTypes, GridManager, connect, utils } from 'perun-core'
import SideMenu from './SideMenu'
import TopButtons from './TopButtons'
const { updateIdScreen } = utils
const { useState, useEffect } = React

const DynamicRegistry = (props, context) => {
    const [dynamicComponent, setDynamicComponent] = useState(undefined)
    const [topButtons, setTopButtons] = useState(undefined)
    const [toggledMenu, setToggledMenu] = useState(false)
    useEffect(() => {
        updateIdScreen('persons_registry', context)
    }, [])
    useEffect(() => {
        const name = props.match.params.component;
        const table = name.startsWith("SUB-") ? name.slice(4) : name;
        const id = props.match.params.objectId;
        GridManager.reloadGridData(`${table}${id}`);
    }, [toggledMenu]);
    const setDynamicComponentFunction = (comp) => {
        setDynamicComponent(comp)
    }
    const toggleSideMenu = (toggleOn) => {
        if (toggleOn) {
            setToggledMenu(false)
        } else {
            setToggledMenu(!toggledMenu)
        }
    }
    return (
        <div className="farm-registry-main-container">
            <SideMenu
                toggleSideMenu={toggleSideMenu}
                toggledMenu={toggledMenu}
                objectId={props?.match?.params?.objectId}
                tableName={props?.match?.params?.tableName}
                setDynamicComponentFunction={setDynamicComponentFunction}
                setTopButtons={setTopButtons}
                routeParams={props.match.params}
            />
            <div className={`farm-registry-content person-registry-content ${toggledMenu && 'aims-registry-content-toggled'}`}>
                {topButtons && Array.isArray(topButtons) && topButtons.length > 0 && (
                    <div className='top-buttons-container'>
                        <TopButtons
                            configuration={topButtons}
                            objectId={props?.match?.params?.objectId}
                            tableName={props?.match?.params?.tableName}
                            activeComponent={props?.match?.params?.component}
                        />
                    </div>
                )}
                <div className='dynamic-component-container'>
                    {dynamicComponent}
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});

DynamicRegistry.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(DynamicRegistry);
