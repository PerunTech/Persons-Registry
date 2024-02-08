import { React, axios, connect, Loading, ComponentManager, GenericForm, PropTypes, elements, Modal, createHashHistory } from 'perun-core'
const { alertUser } = elements
const { useEffect, useState } = React
import { iconManager } from '../assets/svg/svgHolder'
import style from '../assets/style/registration.module.css'
import CustomButtons from './CustomButtons'
import { labelsManager } from '../utils/LabelsExport'
let hashHistory = createHashHistory();
const PersonInfo = (props, context) => {
    const [configuration, setConfig] = useState([])
    const [loading, setLoading] = useState(false)
    const [activeElement, setElement] = useState('SEARCH')
    const [activeChild, setChild] = useState('')
    const [activeParent, setParent] = useState('')
    const [comp, setComp] = useState(undefined)
    const [defaultCountry, setDeafultCountry] = useState(undefined)
    hashHistory = createHashHistory();
    useEffect(() => {
        let url = window.server + `/WsConf/params/get/sys/DEFAULT_COUNTRY`
        axios.get(url).then(res => {
            if (res.data.VALUE) {
                setDeafultCountry(res.data.VALUE)
            }
        }).catch(err => {
            setLoading(false)
            console.error(err)
            const title = err.response?.data?.title || err
            const msg = err.response?.data?.message || ''
            alertUser(true, "error", title, msg);
        });
        getConfiguration()
    }, [])

    const redirectBack = () => {
        let href = '/main/persons-registry'
        hashHistory.push(href)
    }


    const getConfiguration = () => {
        setLoading(true)
        let url = window.server + `/custom-menu/get-configuration/sid/${props.svSession}/component-name/menu-person-${props.match.params.personType.toLowerCase()}/object-id/${props.match.params.objId}/object-type/PERSON`
        axios.get(url).then(res => {
            setConfig(res.data)
            setLoading(false)
            res.data.data.map(el => {
                let modifiedID = el.ID.replace(/\d/g, '').replace(/_$/, '').replaceAll(' ', '');
                if (modifiedID === 'PERSON') {
                    onButtonClick(el);
                }
            })
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
                let modifiedID = el.ID.replace(/\d/g, '').replace(/_$/, '').replaceAll(' ', '');
                return (
                    <>
                        <button
                            className={`btn_sub pr-btn-reg-info  ${activeElement === el.ID && !el.data && 'pr-active-tab'}`}
                            onClick={() => (el.data ? setActive(el) : onButtonClick(el))}
                        >
                            <span className={'dynamic-comp-icon-holder'}>{iconManager.getIcon(modifiedID)}</span><p>{el.label}</p>
                        </button>
                        {el.data && <div className={el.ID === activeParent ? 'sub-menu-sub-item-active' : 'sub-menu-sub-item-hidden'}>
                            {el.data.map(sub => {
                                modifiedID = sub.ID.replace(/\d/g, '').replace(/_$/, '')
                                return < button
                                    className={`btn_sub ${activeChild === sub.ID && 'pr-active-tab'}`
                                    }
                                    onClick={() => (onButtonClick(sub, true))}
                                >
                                    <span className={'dynamic-comp-icon-holder'}>{iconManager.getIcon(modifiedID)}</span><p>{sub.label}</p>
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
        const splitID = id.replace(/\d/g, '').replace(/_$/, '').replaceAll(' ', '');
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
            defaultCountry: defaultCountry,//change
            getConfiguration: (objId) => getConfiguration(objId)
        }
        comp = <CustomButtons {...customButtonsProps} />
        setComp(comp)
    }

    return (
        <>
            {loading && <Loading />}
            <div className='pr-background'>
                <div className='pr-holder-info'>
                    <div className='pr-main-btn-holder'>
                        <div className='pr-info-btn-holder'> <button id='back' type={'button'} onClick={() => redirectBack()} className='pr-btn-back'> {iconManager.getIcon('back')} {labelsManager.importLabel('back', 'persons_registry', context)} </button>
                            <div className='pr-selected-user'><p>{iconManager.getIcon('user')}{labelsManager.importLabel('selected_user', 'persons_registry', context)} : <b>{props.match.params.name.replaceAll('_', ' ')}</b></p></div>
                        </div >
                        <div className='pr-btn-holder-info'>
                            <div className='pr-btn-container'>
                                {generateCustomButtons()}
                            </div>
                        </div>
                    </div>
                    <div className='pr-content-info'>
                        <div className='pr-content-inner'>
                            {comp}
                        </div>
                    </div>
                </div>

            </div>


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