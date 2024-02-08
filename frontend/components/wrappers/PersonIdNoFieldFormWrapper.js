import {
  React,
  ComponentManager,
  connect,
} from "perun-core";
import { setInputFilter } from '../../utils/utils'

const { useState, useEffect } = React

const PersonIdNoFieldFormWrapper = (props) => {
  const [personalIdNumberInputField, setPersonalIdNumberInputField] = useState(undefined)

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

  return (
    <>
      {props.children}
    </>
  );
};

const mapStateToProps = (state) => ({
  svSession: state.security.svSession,
});

export default connect(mapStateToProps)(PersonIdNoFieldFormWrapper);
