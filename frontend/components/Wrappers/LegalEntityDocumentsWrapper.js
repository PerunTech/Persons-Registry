import {
    React,
    connect,
    ComponentManager,
    PropTypes,
} from "perun-core";
import SaveFormAndAttachments from '../../utils_tools/SaveFormAndAttachments';

const LegalEntityDocumentsWrapper = (props) => {
    const handleSelected = () => {
        const { formid } = props;
        const formTableData = ComponentManager.getStateForComponent(formid, "formTableData");
        const objectId = formTableData?.['OBJECT_ID']
        return (
            <>
                <SaveFormAndAttachments formid={formid} tableName={'LEGAL_ENTITY_DOCUMENTS'} objId={objectId} />
            </>
        );
    }

    return (
        <>
            {props.children}
            {props.formInstance.state.formDataLoaded && handleSelected()}
        </>
    );
};

const mapStateToProps = (state) => ({
    svSession: state.security.svSession,
});
LegalEntityDocumentsWrapper.contextTypes = {
    intl: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(LegalEntityDocumentsWrapper);
