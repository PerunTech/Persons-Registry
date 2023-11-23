import {
    React,
    connect,
    GenericForm
} from "perun-core";
import { EditFormWrapper } from './wrappers';
const EditForm = (props) => {
    const generateForm = () => {
        const { objId, personType } = props
        return <GenericForm
            params={"READ_URL"}
            key={`PERSON_FORM`}
            id={`PERSON_FORM`}
            addDeleteFunction={props.setPersonName}
            method={`/SvPersonRegistry/getTableJSONSchemaPerson/${props.svSession}/PERSON/${personType}`}
            uiSchemaConfigMethod={`/SvPersonRegistry/getTableUISchemaPerson/${props.svSession}/PERSON/${personType}`}
            tableFormDataMethod={`/SvPersonRegistry/getPerson/${props.svSession}/${objId}/${personType}`}
            addSaveFunction={props.savePerson}
            hideBtns={'closeAndDelete'}
            className={'form-test person-registry-forms person-registration-form'}
            inputWrapper={EditFormWrapper}
        />
    }
    return (
        <>
            {generateForm()}
        </>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,

});

export default connect(mapStateToProps)(EditForm);
