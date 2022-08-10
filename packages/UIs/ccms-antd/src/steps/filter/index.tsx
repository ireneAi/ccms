import React from 'react'
import { FilterStep } from 'ccms'
import { IFilter, IFilterItem, FilterConfig } from 'ccms/dist/src/steps/filter'
import { Button, Form, Space } from 'antd'
import getALLComponents from '../../components/formFields'
import { computedGapStyle, computedItemStyle } from '../../components/formFields/common'
import styles from './index.less'

export default class FilterStepComponent extends FilterStep {
  getALLComponents = (type: any) => getALLComponents[type]

  renderComponent = (props: IFilter) => {
    const { onSubmit, onReset, submitText, resetText, children, columns } = props
    const gapStyle = computedGapStyle(columns, 'row')

    return (
      <Form layout="inline" style={{ marginBottom: 16 }}>
        <div style={gapStyle} className={styles['ccms-antd-mini-form-row']}>
          {children}
        </div>
        {(onSubmit || onReset) && (
          <Form.Item>
            <Space>
              {onSubmit && (
                <Button type="primary" onClick={() => onSubmit()}>
                  {submitText || '确定'}
                </Button>
              )}
              {onReset && <Button onClick={() => onReset()}>{resetText || '重置'}</Button>}
            </Space>
          </Form.Item>
        )}
      </Form>
    )
  }

  renderItemComponent = (props: IFilterItem) => {
    const { visitable, label, status, message, children, columns, fieldType } = props

    const colStyle = computedItemStyle(columns, '', visitable)
    const itemStyle = visitable ? {} : { overflow: 'hidden', width: 0, height: 0, margin: 0, padding: 0 }
    if (columns?.type === 'width' && columns?.value && columns.wrap) {
      Object.assign(itemStyle, { width: columns.value })
    }
    return (
      <div
        style={colStyle}
        className={[
          styles['form-col'],
          styles[`form-col-${fieldType}`],
          styles[`form-col-${columns?.type || 'span'}`]
        ].join(' ')}
      >
        <Form.Item
          style={itemStyle}
          label={label}
          validateStatus={status === 'normal' ? undefined : status === 'error' ? 'error' : 'validating'}
          help={message}
        >
          {children}
        </Form.Item>
      </div>
    )
  }
}
export const PropsType = (props: FilterConfig) => { }
