import {
  React,
  ComponentManager, utils,
  connect, GenericForm, axios, PropTypes
} from "perun-core";
const { labelsManager, setInputFilter } = utils
const { useState, useEffect } = React

const PersonIdNoFieldFormWrapper = (props, context) => {
  const [personalIdNumberInputField, setPersonalIdNumberInputField] = useState(undefined)
  const [isAddForm, setisAddForm] = useState(undefined)

  useEffect(() => {
    // Get the form classNames
    const formClassNames = ComponentManager.getStateForComponent(props.formid, 'className')
    // Append a dot to each of them, so we can use them to get the needed input
    const finalFormClassNames = formClassNames?.split(' ')?.map(value => `.${value}`)?.join('') || ''
    // Get the needed input
    const input = document.querySelectorAll(`${finalFormClassNames} #root_ID_NO`)
    if (input) {
      const personalIdNumberInput = input[0]
      if (personalIdNumberInput) {
        setPersonalIdNumberInputField(personalIdNumberInput)
      }
    }
  }, [])

  useEffect(() => {
    if (personalIdNumberInputField) {
      // Allow only a maximum amount of 13 characters
      setInputFilter(personalIdNumberInputField, function (value) {
        return /^.{0,13}$/.test(value)
      })
    }
  }, [personalIdNumberInputField])

  useEffect(() => {
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

PersonIdNoFieldFormWrapper.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(PersonIdNoFieldFormWrapper);
