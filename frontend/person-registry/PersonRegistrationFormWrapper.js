import {
  React,
  connect,
} from "perun-core";
import { setInputFilter } from '../utils/utils'

const { useState, useEffect } = React

const PersonRegistrationFormWrapper = (props) => {
  const [personalIdNumberInputField, setPersonalIdNumberInputField] = useState(undefined)

  useEffect(() => {
    const input = document.querySelectorAll('.person-registration-form #root_ID_NO')
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

  return (
    <>
      {props.children}
    </>
  );
};

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
});

export default connect(mapStateToProps)(PersonRegistrationFormWrapper);
