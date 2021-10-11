import React from "react";
import { GroupField } from 'ccms';
import { IGroupField, GroupFieldConfig } from "ccms/dist/src/components/formFields/group";
import { IFormItem } from "ccms/dist/src/steps/form";
import { Form } from "antd"
import getALLComponents from '../'
import styles from './index.less'
import { formItemLayout } from "../common";

export const PropsType = (props: GroupFieldConfig) => { };

export default class GroupFieldComponent extends GroupField {
  getALLComponents = (type: any) => getALLComponents[type]

  renderComponent = (props: IGroupField) => {
    const {
      children
    } = props
    return (
      <div>
        {children}
      </div>
    )
  }

  renderItemComponent = (props: IFormItem) => {
    const {
      layout,
      label,
      status,
      message,
      fieldType,
      children
    } = props

    return (
      <Form.Item
        label={label}
        {...formItemLayout(layout, fieldType, label)}
        validateStatus={status === 'normal' ? undefined : status === 'error' ? 'error' : 'validating'}
        help={fieldType === 'import_subform' || fieldType === 'group' || message === '' ? null : message}
        className={styles[`ccms-antd-mini-form-${fieldType}`]}
      >
        {children}
      </Form.Item>
    )
  }
}