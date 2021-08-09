import React from "react";
import { NumberField } from 'ccms';
import { InputNumber } from 'antd';
import { INumberField, NumberFieldConfig } from "ccms/dist/src/components/formFields/number";
import 'antd/lib/input-number/style/index.css'

export const PropsType = (props: NumberFieldConfig) => { };

export default class NumberFieldComponent extends NumberField {
    renderComponent = (props: INumberField) => {
        const {
            value,
            onChange,
            step
        } = props
        return (
            <InputNumber
                style={{ width: '100%' }}
                {...props}
                value={value}
                step={step}
                onChange={async (e) => {
                    await onChange(e)
                }}
            />
        )
    }
}