/* reUsed and addapted component from internet f.r */
import {
    React,
    elements,
} from 'perun-core'
const { SchemaField } = elements
export const CustomOnchangeFunction = function (props) {
    const customProps = {};

    //Only process if we are dealing with a field, not the parent object
    if (props.name) {

        const formContext = props.registry.formContext;
        //Store the original onChange event provided to the SchemaField
        //as well as the name of the field
        const { onChange, name } = props;

        //Provide a new onChange event for the SchemaField
        customProps.onChange = function (fieldData) {

            //Call the custom handler provided in the formContext, if it exists,
            //with the field name and new value
            if (formContext && formContext.onFieldChange &&
                typeof formContext.onFieldChange === 'function') {
                formContext.onFieldChange(name, fieldData);
            }

            //Call the original onChange handler
            onChange(fieldData);
        };

    }

    return (
        <SchemaField {...props} {...customProps} />
    );
};

