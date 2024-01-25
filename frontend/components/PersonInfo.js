import { React, axios, connect, Loading, ComponentManager, GenericForm, PropTypes, elements, Modal, createHashHistory } from 'perun-core'
const { alertUser } = elements
const { useEffect, useState } = React
import { iconManager } from '../assets/svg/svgHolder'
import style from '../assets/style/registration.module.css'
import CustomButtons from './CustomButtons'
const PersonInfo = (props) => {
    const [configuration, setConfig] = useState([])
    const [loading, setLoading] = useState(false)
    const [activeElement, setElement] = useState('SEARCH')
    const [activeChild, setChild] = useState('')
    const [activeParent, setParent] = useState('')
    const [comp, setComp] = useState(undefined)
    useEffect(() => {
        getConfiguration()
    }, [])


    const getConfiguration = () => {
        setLoading(true)
        let url = window.server + `/custom-menu/get-configuration/sid/${props.svSession}/component-name/menu-person-${props.match.params.personType.toLowerCase()}/object-id/${props.match.params.objId}/object-type/PERSON`
        axios.get(url).then(res => {
            setConfig(res.data)
            setLoading(false)
        }).catch(err => {
            setLoading(false)
            console.error(err)
            const title = err.response?.data?.title || err
            const msg = err.response?.data?.message || ''
            alertUser(true, "error", title, msg);
        });
    }

    const generateCustomButtons = () => {
        if (configuration && Array.isArray(configuration.data)) {
            return configuration.data.map(el => {
                let modifiedID = el.ID.replace(/\d/g, '').replace(/_$/, '');
                return (
                    <>
                        <button
                            className={`${style["btn_sub"]} ${activeElement === el.ID && !el.data && style['active']}`}
                            onClick={() => (el.data ? setActive(el) : onButtonClick(el))}
                        >
                            <span className={style['dynamic-comp-icon-holder']}>{iconManager.getIcon(modifiedID)}</span><p>{el.label}</p>
                        </button>
                        {el.data && <div className={el.ID === activeParent ? style['sub-menu-sub-item-active'] : style['sub-menu-sub-item-hidden']}>
                            {el.data.map(sub => {
                                modifiedID = sub.ID.replace(/\d/g, '').replace(/_$/, '')
                                return < button
                                    className={`${style["btn_sub"]} ${activeChild === sub.ID && style['active']}`
                                    }
                                    onClick={() => (onButtonClick(sub, true))}
                                >
                                    <span className={style['dynamic-comp-icon-holder']}>{iconManager.getIcon(modifiedID)}</span><p>{sub.label}</p>
                                </button>
                            })}
                        </div >}
                    </>
                );
            });
        } else {
            return <></>;
        }
    }
    const setActive = (el) => {
        if (el.ID === activeParent) {
            setParent('')
            setLoading(false)
        } else {
            setParent(el.ID)
        }
    }

    const onButtonClick = (element, childEl) => {
        const id = element.ID;
        const splitID = id.replace(/\d/g, '').replace(/_$/, '');
        if (childEl) {
            displayComponent(splitID, element);
            setChild(id)
            setElement('')
            setLoading(false)
        } else {
            displayComponent(splitID, element);
            setChild('')
            setElement(id)
            setLoading(false)
        }
    }
    const displayComponent = (tableName, configuration) => {
        let comp
        const customButtonsProps = {
            key: tableName,
            tableName,
            configuration,
            personObjId: props.match.params.objId,
            defaultCountry: 'MLD',//change
            getConfiguration: (objId) => getConfiguration(objId)
        }
        comp = <CustomButtons {...customButtonsProps} />
        setComp(comp)
    }

    return (
        <>
            {loading && <Loading />}
            <div>PersonInfo</div>
            {generateCustomButtons()}
            {comp}
        </>

    )
}

const mapStateToProps = state => ({
    svSession: state.security.svSession,
})

PersonInfo.contextTypes = {
    intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(PersonInfo)