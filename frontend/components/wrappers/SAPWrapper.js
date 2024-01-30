import {
    React,
    connect,
    elements,
    ComponentManager,
    PropTypes,
    axios,
    GenericGrid
} from "perun-core";
const { alertUser } = elements
import { labelsManager } from '../../utils/LabelsExport';
const { useState, useEffect, useReducer } = React;
const { ReactBootstrap } = elements;
const { Modal } = ReactBootstrap;

let gridId;
const SAPWrapper = (props, context) => {
    const [show, setShow] = useState(false);
    const [test, setTest] = useState(false);
    const [canRender, setCanRender] = useState(false);
    const [formData, setFormData] = useState(undefined)
    useEffect(() => {
        handleInputs();
    }, []);

    const handleInputs = () => {
        console.log('aaa');
        const { formid } = props;

        ComponentManager.setStateForComponent(formid, "addSaveFunction", handleShow);
        props.formInstance.setState({ addSaveFunction: handleShow });
        setCanRender(true)
    };
    const handleShow = () => {
        setShow(!show);
        const { formid } = props;
        const formData = ComponentManager.getStateForComponent(
            formid,
            "formTableData"
        );

        if (Object.keys(formData).length > 0) {
            axios({
                method: "post",
                data: formData,
                url: window.server + `/ReactElements/searchTable/${props.svSession}/PERSON/1000`,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }).then(res => {
                if (res.data) {
                    setFormData(res.data)
                    setTest(true)
                }
            }).catch(err => {
                console.error(err)
                const title = err.response?.data?.title || err
                const msg = err.response?.data?.message || ''
                alertUser(true, "error", title, msg);
            });
        }


        ComponentManager.setStateForComponent(props.formid, null, { saveExecuted: false })
    };

    const onRowClick = () => {
        console.log('test');
    }

    const generateGrid = () => {
        let grid = <GenericGrid gridType={'SEARCH_GRID_DATA'} key={'test'}
            id={'test'}
            configTableName={"/ReactElements/getTableFieldList/%session/PERSON"}
            dataTableName={formData}
            onRowClickFunct={onRowClick}
            defaultHeight={false}
            heightRatio={0.7}
        />
        return grid

    }



    return (
        <>
            {canRender && props.children}
            {show && (
                <Modal className={"person-registry-modal"} show={show} onHide={() => { setShow(false) }}>
                    <Modal.Header className={"person-registry-modal-header"} closeButton>
                    </Modal.Header>
                    <Modal.Body className={"person-registry-modal-body"}>
                        {test && generateGrid()}

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
