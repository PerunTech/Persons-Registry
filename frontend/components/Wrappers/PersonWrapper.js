import {
  React,
  ComponentManager,
  connect, GenericForm, axios, PropTypes, utils
} from "perun-core";
const { useState, useEffect } = React
const { labelsManager } = utils
const PersonWrapper = (props, context) => {

  const [isAddForm, setisAddForm] = useState(undefined)


  useEffect(() => {
    console.log('test');

    const isAddForm = ComponentManager.getStateForComponent(
      props.formid,
      "isAddForm"
    );
    setisAddForm(isAddForm)

  }, []);

  const saveMultipleForms = async (addressData) => {
    const saveHoldingFunc = ComponentManager.getStateForComponent(
      props.formid,
      "addSaveFunction"
    );

    const formData = ComponentManager.getStateForComponent(
      props.formid,
      "formTableData"
    );

    const resultId = await saveHoldingFunc(formData);
    if (resultId) {
      saveAddress(addressData, resultId);
    }
  };

  const saveAddress = (addressData, resultId) => {
    if (addressData) {
      addressData['IS_DEFAULT'] = 1
    }
    const url = `/ReactElements/createTableRecordFormData/${props.svSession}/ADDRESS/${resultId}`
    const contentType = 'application/x-www-form-urlencoded'
    const reqConfig = { method: 'post', url: `${window.server}${url}`, data: JSON.stringify(addressData), headers: { 'Content-Type': contentType } }

    axios(reqConfig).then(res => {
      if (res?.data) {
      }
    }).catch(err => {
      console.error(err)
    })

  }
  return (
    <>
      {props.children}
      <div>
        {isAddForm && <GenericForm
          className={`form-test custom-farm-registry-form aims-forms holding-address register-person-address`}
          params={'READ_URL'}
          key={`ADDRESS`}
          id={`ADDRESS`}
          method={`/ReactElements/getTableJSONSchema/${props.svSession}/ADDRESS`}
          uiSchemaConfigMethod={`/ReactElements/getTableUISchema/${props.svSession}/ADDRESS`}
          tableFormDataMethod={`/ReactElements/getTableFormData/${props.svSession}/0/ADDRESS`}
          addSaveFunction={(e) => saveMultipleForms(e.formData)}
          customSaveButtonName={labelsManager('save', context, 'persons_registry')}
          hideBtns={'closeAndDelete'}
          customSave={true}
        />}
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
});

PersonWrapper.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(PersonWrapper);
