import {
    React,
    connect,
    elements,
    ComponentManager,
    PropTypes,
    axios,
    GenericGrid,
    GridManager
} from "perun-core";
const { alertUser, Dropdown } = elements
const { useState, useEffect } = React;
const { ReactBootstrap } = elements;
const { Modal } = ReactBootstrap;
import { iconManager } from '../../assets/svg/svgHolder';
import { labelsManager } from '../../utils/LabelsExport';

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
                data: formData,
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
                const title = err.response?.data?.title || err
                const msg = err.response?.data?.message || ''
                alertUser(true, "error", title, msg);
            });
        } else {
            alertUser(true, 'info', labelsManager.importLabel('search_value', 'persons_registry', context), '', () => {
                ComponentManager.setStateForComponent(props.formid, null, { saveExecuted: false })

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
                    <button className="authorizedperson-dd-back btn-success btn_save_form" onClick={() => { setGridFlag(true), setDD(undefined), linkType = undefined }}>{iconManager.getIcon('back')} {labelsManager.importLabel('back', 'persons_registry', context)}</button>
                    <div className={'authorizedperson-dd-holder'}><p>{labelsManager.importLabel('your_selection', 'persons_registry', context)} <strong>{name}</strong></p>
                        <p>{labelsManager.importLabel('connection_type', 'persons_registry', context)}</p>
                        <Dropdown
                            id={'setAuthPerson'}
                            name={'setAuthPerson'}
                            onChange={onChange}
                            className={'pr-drop-down'}
                            options={res.data.data}
                        />
                    </div>
                    <button className="authorizedperson-dd-submit btn-success btn_save_form" type='button' onClick={() =>
                        alertUser(true, 'info', labelsManager.importLabel('confirm_btn_action', 'persons_registry', context), '', () => { saveAuthPerson(obj) }, () => { }, true, labelsManager.importLabel('yes', 'persons_registry', context), labelsManager.importLabel('no', 'persons_registry', context))}>{labelsManager.importLabel('save', 'persons_registry', context)}</button></div >)
                setDD(showDropdown)
                setGridFlag(false)
            }
        }).catch(err => {
            console.error(err)
            const title = err.response?.data?.title || err
            const msg = err.response?.data?.message || ''
            alertUser(true, "error", title, msg, () => resetFormSaveState());
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
                data: params,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            })
                .then(res => {
                    alertUser(true, res.data.type.toLowerCase(), res.data.message, res.data.title, () => resetFunc())
                })
                .catch(err => {
                    console.error(err)
                    const title = err.response?.data?.title || err
                    const msg = err.response?.data?.message || ''
                    alertUser(true, "error", title, msg);
                });
        } else {
            alertUser(true, 'info', labelsManager.importLabel('missing_dd_value', 'person-registry', context), labelsManager.importLabel('please_choose_dd', 'person-registry', context))
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
        let grid = <GenericGrid gridType={'SEARCH_GRID_DATA'} key={`AUTH_${personObjId}`}
            id={`AUTH_${personObjId}`}
            configTableName={"/ReactElements/getTableFieldList/%session/PERSON"}
            dataTableName={formData}
            onRowClickFunct={onRowClick}
            defaultHeight={false}
            heightRatio={0.58}
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
