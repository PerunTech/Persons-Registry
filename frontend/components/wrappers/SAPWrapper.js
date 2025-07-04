import {
    React,
    connect,
    elements,
    utils,
    ComponentManager,
    PropTypes,
    axios,
    ExportableGrid,
    GridManager
} from "perun-core";
const { alertUserResponse, alertUserV2, Dropdown } = elements
const { useState, useEffect } = React;
const { ReactBootstrap } = elements;
const { Modal } = ReactBootstrap;
const { labelsManager } = utils;
import { iconManager } from '../../assets/svg/svgHolder';

let linkType
const SAPWrapper = (props, context) => {
    const [show, setShow] = useState(false);
    const [gridFlag, setGridFlag] = useState(false);
    const [canRender, setCanRender] = useState(false);
    const [formData, setFormData] = useState(undefined)
    const [dropDown, setDD] = useState(undefined)
    const [personObjId, setPerson] = useState('')
    useEffect(() => {
        handleInputs();
        return () => {
            ComponentManager.cleanComponentReducerState(`AUTH_${personObjId}`);
        }
    }, []);

    const handleInputs = () => {
        const { formid } = props;
        const objId = ComponentManager.getStateForComponent(formid, "objId");
        const uiSchema = ComponentManager.getStateForComponent(formid, 'uischema')
        if (uiSchema) {
            uiSchema.TAX_NO = { 'ui:widget': 'hidden' }
            ComponentManager.setStateForComponent(formid, 'uischema', uiSchema)
            props.formInstance.setState({ uischema: uiSchema })
        }
        setPerson(objId)
        ComponentManager.setStateForComponent(formid, "addSaveFunction", handleWrapperSave);
        props.formInstance.setState({ addSaveFunction: handleWrapperSave });
        setCanRender(true)
    };
    const handleWrapperSave = () => {
        const { formid } = props;
        const formData = ComponentManager.getStateForComponent(
            formid,
            "formTableData"
        );
        if (Object.keys(formData).length > 0) {
            setShow(true);
            if (formData['NAME']) {
                formData['NAME'] = formData['NAME'].toUpperCase()
            }
            axios({
                method: "post",
                data: encodeURIComponent(JSON.stringify(formData)),
                url: window.server + `/ReactElements/searchTable/${props.svSession}/PERSON/1000`,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }).then(res => {
                if (res.data) {
                    setFormData(res.data)
                    ComponentManager.setStateForComponent(props.formid, null, { saveExecuted: false })
                    setGridFlag(true)
                }
            }).catch(err => {
                console.error(err)
                alertUserResponse({ response: err })
            });
        } else {
            alertUserV2({
                type: 'info',
                title: labelsManager('search_value', 'persons_registry', context),
                onConfirm: () => ComponentManager.setStateForComponent(props.formid, null, { saveExecuted: false }),
            })
        }
    };

    const onRowClick = (_id, _rowIdx, row) => {
        generateDD(row['PERSON.OBJECT_ID'], row['PERSON.NAME'])
    }
    const generateDD = (obj, name) => {
        let showDropdown = undefined
        const url = window.server + '/SvPersonRegistry/getLinkTypeOptions/' + props.svSession
        axios({
            method: 'get',
            url: url,
        }).then(res => {
            if (res.data.data.length > 0) {
                showDropdown = (<div className={'authorizedperson-dd-container'}>
                    <button className="authorizedperson-dd-back btn-success btn_save_form" onClick={() => { setGridFlag(true), setDD(undefined), linkType = undefined }}>{iconManager.getIcon('back')} {labelsManager('back', context, 'persons_registry')}</button>
                    <div className={'authorizedperson-dd-holder'}><p>{labelsManager('your_selection', context, 'persons_registry')} <strong>{name}</strong></p>
                        <p>{labelsManager('connection_type', context, 'persons_registry')}</p>
                        <Dropdown
                            id={'setAuthPerson'}
                            name={'setAuthPerson'}
                            onChange={onChange}
                            className={'pr-drop-down'}
                            options={res.data.data}
                        />
                    </div>
                    <button className="authorizedperson-dd-submit btn-success btn_save_form" type='button' onClick={() => {
                        alertUserV2({
                            type: 'info',
                            title: labelsManager('confirm_btn_action', context, 'persons_registry'),
                            onConfirm: () => saveAuthPerson(obj),
                            confirmButtonText: labelsManager('yes', context, 'persons_registry'),
                            showCancel: true,
                            cancelButtonText: labelsManager('no', context, 'persons_registry')
                        })
                    }}>{labelsManager('save', context, 'persons_registry')}</button></div >)
                setDD(showDropdown)
                setGridFlag(false)
            }
        }).catch(err => {
            console.error(err)
            alertUserResponse({ response: err })
        });
    }

    const saveAuthPerson = (obj) => {
        const { svSession } = props
        if (obj && linkType) {
            let params = { 'objId1': obj, 'objId2': personObjId, 'linkName': linkType }
            const url = window.server + '/SvPersonRegistry/linkTwoPersons/' + svSession
            axios({
                method: 'post',
                url: url,
                data: JSON.stringify(params),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }).then(res => {
                if (res?.data) {
                    alertUserResponse({ response: res.data, onConfirm: resetFunc })
                }
            }).catch(err => {
                console.error(err)
                alertUserResponse({ response: err })
            });
        } else {
            alertUserV2({
                type: 'info',
                title: labelsManager('missing_dd_value', context, 'person-registry'),
                message: labelsManager('please_choose_dd', context, 'person-registry')
            })
        }
    }

    const resetFunc = () => {
        setShow(false)
        linkType = ''
        ComponentManager.cleanComponentReducerState(`AUTH_${personObjId}`);
        setGridFlag(undefined)
        setDD(undefined)
        const closeModalFunc = ComponentManager.getStateForComponent(
            props.formid,
            "closeModalFunc"
        );
        const tableNameId = ComponentManager.getStateForComponent(props.formid, 'tableNameId')
        GridManager.reloadGridData(tableNameId + personObjId)
        closeModalFunc()
        setFormData(undefined)
    }


    const onChange = (e) => {
        linkType = e.target.value
    }

    const generateGrid = () => {
        let grid = <ExportableGrid gridType={'SEARCH_GRID_DATA'} key={`AUTH_${personObjId}`}
            id={`AUTH_${personObjId}`}
            configTableName={"/ReactElements/getTableFieldList/%session/PERSON"}
            dataTableName={formData}
            onRowClickFunct={onRowClick}
            defaultHeight={false}
            heightRatio={0.55}
        />
        return grid
    }


    return (
        <>
            {canRender && props.children}
            {show && (
                <Modal className={"person-registry-modal"} show={show} onHide={() => {
                    resetFunc()
                }}>
                    <Modal.Header className={"person-registry-modal-header"} closeButton>
                    </Modal.Header>
                    <Modal.Body className={"person-registry-modal-body"}>
                        {gridFlag && generateGrid()}
                        {dropDown}
                    </Modal.Body>
                    <Modal.Footer className={"person-registry-modal-footer"}></Modal.Footer>
                </Modal>
            )}
        </>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});
SAPWrapper.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(SAPWrapper);
