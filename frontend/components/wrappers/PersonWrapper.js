import {
    React,
    connect,
    utils,
} from "perun-core";
const { setInputFilter } = utils

const { useState, useEffect } = React

const PersonWrapper = (props) => {
    const [personalIdNumberInputField, setPersonalIdNumberInputField] = useState(undefined)

    useEffect(() => {
        const personalIdNumberInput = document.getElementById('root_ID_NO')
        if (personalIdNumberInput) {
            setPersonalIdNumberInputField(personalIdNumberInput)
        }
    }, [])

    useEffect(() => {
        if (personalIdNumberInputField) {
            // Allow only a     maximum amount of 13 characters
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

export default connect(mapStateToProps)(PersonWrapper);
