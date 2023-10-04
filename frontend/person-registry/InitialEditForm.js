import {
    React,
    connect,
    PropTypes,
    Form,
    axios,
    elements,
    ExportableGrid,
    Loading,
    ComponentManager,
} from "perun-core";
import { labelsManager } from './components/LabelsExport'
const { useEffect, useState } = React;
const { alertUser } = elements
const InitialEditForm = (props, context) => {
    const [form, setForm] = useState(undefined)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getSchema()
    }, [])


    const getSchema = () => {
        setLoading(true)
        const { svSession } = props
        const { objId, personType } = props
        let schema = {}
        let formData = {}
        let uiSchema = {
            "PERSON_TYPE": { "ui:widget": "hidden" },
            "MUNICIPALITY": { "ui:widget": "hidden" },
            "CITY_VILLAGE": { "ui:widget": "hidden" }
        }
        let url = window.server + '/SvPersonRegistry/getTableJSONSchemaPerson/' + svSession + '/PERSON/' + personType
        axios.get(url).then(res => {
            schema = res.data.data
            let url = window.server + '/SvPersonRegistry/getPerson/' + svSession + '/' + objId + '/' + personType
            axios.get(url).then((res) => {
                formData = res.data
                props.setPersonName(formData.NAME, formData.FIRST_NAME, formData.LAST_NAME)
                renderForm(schema, formData, uiSchema)
            }).catch(err => {
                console.error(err)
                alertUser(true, 'error', err.response.data.title, err.response.data.message)
                setLoading(false)
            })
        }).catch(err => {
            console.error(err)
            alertUser(true, 'error', err.response.data.title, err.response.data.message)
            setLoading(false)
        })
    }
    const renderForm = (schema, formData, uiSchema) => {
        setLoading(false)
        let form = (<Form
            schema={schema}
            key={'EDIT_PERSON'}
            className={`form-test person-registry-forms person-registration-form`}
            uiSchema={uiSchema}
            formData={formData}
            onSubmit={props.savePerson}

        >
            <div id="btnSeparator" style={{ width: 'auto', float: 'right' }}>
                <button id='submit_btn' type='submit' className={'btn-success btn_save_form'}> {labelsManager.importLabel('save', 'persons_registry', context)} </button>
            </div>
        </Form>)
        setForm(form)
    }
    return (
        <>
            {loading && <Loading />}
            {form}
        </>
    );
};

InitialEditForm.contextTypes = {
    intl: PropTypes.object.isRequired
}
const mapStateToProps = (state) => ({
    svSession: state.security.svSession,

});

export default connect(mapStateToProps)(InitialEditForm);
