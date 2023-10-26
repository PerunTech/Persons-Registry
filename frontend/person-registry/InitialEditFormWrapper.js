import {
    React,
    connect,
    elements,
    GenericGrid,
    ComponentManager,
    PropTypes,
    axios,
    GridManager,
    GenericForm,
} from "perun-core";
const { useEffect } = React
const InitialEditFormWrapper = (props, context) => {
    useEffect(() => {
        const setPersonName = ComponentManager.getStateForComponent(
            'PERSON_FORM',
            "addDeleteFunction"
        );
        const formData = ComponentManager.getStateForComponent(
            'PERSON_FORM',
            "formTableData"
        );
        setPersonName(formData.NAME, formData.FIRST_NAME, formData.LAST_NAME)
    }, [])

    return (
        <>
            {props.children}
        </>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});


export default connect(mapStateToProps)(InitialEditFormWrapper);
