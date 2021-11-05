import React from 'react'
import { setValue, getValue } from '../../../util/value'
import { Field, FieldConfig, FieldError, FieldProps, IField } from '../common'
import getALLComponents, { FieldConfigs } from '../'
import { IFormItem } from '../../../steps/form'
import { cloneDeep } from 'lodash'
import ConditionHelper from '../../../util/condition'

export interface GroupFieldConfig extends FieldConfig {
  type: 'group'
  fields: FieldConfigs[]
}

export interface IGroupField {
  children: React.ReactNode[]
}

interface IGroupFieldState {
  formData: { status: 'normal' | 'error' | 'loading', message?: string }[]
}

export default class GroupField extends Field<GroupFieldConfig, IGroupField, any, IGroupFieldState> implements IField<string> {
  // 各表单项对应的类型所使用的UI组件的类
  getALLComponents = (type: any): typeof Field => getALLComponents[type]

  formFields: Array<Field<FieldConfigs, {}, any> | null> = []
  formFieldsMounted: Array<boolean> = []

  constructor (props: FieldProps<GroupFieldConfig, any>) {
    super(props)

    this.state = {
      formData: []
    }
  }

  validate = async (value: any): Promise<true | FieldError[]> => {
    const errors: FieldError[] = []

    let childrenError = 0

    const formData = cloneDeep(this.state.formData)

    for (const fieldIndex in (this.props.config.fields || [])) {
      const formItem = this.formFields[fieldIndex]
      if (formItem !== null && formItem !== undefined) {
        const validation = await formItem.validate(getValue(value, (this.props.config.fields || [])[fieldIndex].field))

        if (validation === true) {
          formData[fieldIndex] = { status: 'normal' }
        } else {
          childrenError++
          formData[fieldIndex] = { status: 'error', message: validation[0].message }
        }
      }
    }

    await this.setState({
      formData
    })

    if (childrenError > 0) {
      errors.push(new FieldError(`子项中存在${childrenError}个错误。`))
    }

    return errors.length ? errors : true
  }

  get = async () => {
    let data: any = {};

    if (Array.isArray(this.props.config.fields)) {
      for (const formFieldIndex in this.props.config.fields) {
        const formFieldConfig = this.props.config.fields[formFieldIndex]
        if (!ConditionHelper(formFieldConfig.condition, { record: this.props.value, data: this.props.data, step: this.props.step })) {
          continue
        }
        const formField = this.formFields[formFieldIndex]
        if (formField) {
          const value = await formField.get()
          data = setValue(data, formFieldConfig.field, value)
        }
      }
    }
    
    return data
  }

  handleMount = async (formFieldIndex: number) => {
    if (this.formFieldsMounted[formFieldIndex]) {
      return true
    }
    
    this.formFieldsMounted[formFieldIndex] = true

    if (this.formFields[formFieldIndex]) {
      const formField = this.formFields[formFieldIndex]
      if (formField) {
        const formFieldConfig = this.props.config.fields[formFieldIndex]

        let value = getValue(this.props.value, formFieldConfig.field)
        if ((formFieldConfig.defaultValue) && value === undefined) {
          value = await formField.reset()
          this.props.onValueSet(formFieldConfig.field, value, true)
        }

        if (value !== undefined) {
          const validation = await formField.validate(value)
          if (validation === true) {
            await this.setState(({ formData }) => {
              formData[formFieldIndex] = { status: 'normal' }
              return { formData: cloneDeep(formData) }
            })
          } else {
            await this.setState(({ formData }) => {
              formData[formFieldIndex] = { status: 'error', message: validation[0].message }
              return { formData: cloneDeep(formData) }
            })
          }
        }
        
      }
    }
  }

  handleChange = async (formFieldIndex: number, value: any) => {
    // const formField = this.formFields[formFieldIndex]
    // const formFieldConfig = this.props.config.fields[formFieldIndex]

    // const formData = cloneDeep(this.state.formData)

    // if (formField && formFieldConfig) {
    //   if (this.props.onChange) {
    //     if (formFieldConfig.field === '') {
    //       await this.props.onChange(value)
    //     } else {
    //       const changeValue = setValue({}, formFieldConfig.field, value)
    //       await this.props.onChange(changeValue)
    //     }
    //   }

    //   const validation = await formField.validate(value)
    //   if (validation === true) {
    //     formData[formFieldIndex] = { value, status: 'normal' }
    //   } else {
    //     formData[formFieldIndex] = { value, status: 'error', message: validation[0].message }
    //   }

    //   await this.setState({
    //     formData
    //   })
    // }
  }

  handleValueSet = async (formFieldIndex: number, path: string, value: any, validation: true | FieldError[]) => {
    const formFieldConfig = (this.props.config.fields || [])[formFieldIndex]
    if (formFieldConfig) {
      const fullPath = formFieldConfig.field === '' || path === '' ? `${formFieldConfig.field}${path}` : `${formFieldConfig.field}.${path}`
      await this.props.onValueSet(fullPath, value, true)
      
      const formData = cloneDeep(this.state.formData)
      if (validation === true) {
        formData[formFieldIndex] = { status: 'normal' }
      } else {
        formData[formFieldIndex] = { status: 'error', message: validation[0].message }
      }

      this.setState({
        formData
      })
    }
  }

  handleValueUnset = async (formFieldIndex: number, path: string, validation: true | FieldError[]) => {
    const formFieldConfig = (this.props.config.fields || [])[formFieldIndex]
    if (formFieldConfig) {
      const fullPath = formFieldConfig.field === '' || path === '' ? `${formFieldConfig.field}${path}` : `${formFieldConfig.field}.${path}`
      await this.props.onValueUnset(fullPath, true)
      
      const formData = cloneDeep(this.state.formData)
      if (validation === true) {
        formData[formFieldIndex] = { status: 'normal' }
      } else {
        formData[formFieldIndex] = { status: 'error', message: validation[0].message }
      }

      this.setState({
        formData
      })
    }
  }

  handleValueListAppend = async (formFieldIndex: number, path: string, value: any, validation: true | FieldError[]) => {
    const formFieldConfig = (this.props.config.fields || [])[formFieldIndex]
    if (formFieldConfig) {
      const fullPath = formFieldConfig.field === '' || path === '' ? `${formFieldConfig.field}${path}` : `${formFieldConfig.field}.${path}`
      await this.props.onValueListAppend(fullPath, value, true)
      
      const formData = cloneDeep(this.state.formData)
      if (validation === true) {
        formData[formFieldIndex] = { status: 'normal' }
      } else {
        formData[formFieldIndex] = { status: 'error', message: validation[0].message }
      }

      this.setState({
        formData
      })
    }
  }

  handleValueListSplice = async (formFieldIndex: number, path: string, index: number, count: number, validation: true | FieldError[]) => {
    const formFieldConfig = (this.props.config.fields || [])[formFieldIndex]
    if (formFieldConfig) {
      const fullPath = formFieldConfig.field === '' || path === '' ? `${formFieldConfig.field}${path}` : `${formFieldConfig.field}.${path}`
      await this.props.onValueListSplice(fullPath, index, count, true)
      
      const formData = cloneDeep(this.state.formData)
      if (validation === true) {
        formData[formFieldIndex] = { status: 'normal' }
      } else {
        formData[formFieldIndex] = { status: 'error', message: validation[0].message }
      }

      this.setState({
        formData
      })
    }
  }

  renderComponent = (props: IGroupField) => {
    return <React.Fragment>
      您当前使用的UI版本没有实现GroupField组件。
    </React.Fragment>
  }

  /**
   * 表单项组件 - UI渲染方法
   * 各UI库需重写该方法
   * @param props
   */
  renderItemComponent = (props: IFormItem) => {
    return <React.Fragment>
      您当前使用的UI版本没有实现FormItem组件。
    </React.Fragment>
  }

  render = () => {
    const {
      config,
      formLayout,
      value,
      record,
      data,
      step
    } = this.props

    return (
      <React.Fragment>
        {this.renderComponent({
          children: (this.props.config.fields || []).map((formFieldConfig, formFieldIndex) => {
            if (!ConditionHelper(formFieldConfig.condition, { record: value, data: this.props.data, step: this.props.step })) {
              return null
            }
            let hidden: boolean = true
            let display: boolean = true

            if (formFieldConfig.type === 'hidden') {
              hidden = true
              display = false
            }

            if (formFieldConfig.display === 'none') {
              hidden = true
              display = false
            }

            const FormField = this.getALLComponents(formFieldConfig.type) || Field

            const renderData = {
              label: formFieldConfig.label,
              status: (this.state.formData[formFieldIndex] || {}).status || 'normal',
              message: (this.state.formData[formFieldIndex] || {}).message || '',
              layout: formLayout,
              visitable: display,
              fieldType: formFieldConfig.type,
              children: (
                  <FormField
                    key={formFieldIndex}
                    ref={(formField: Field<FieldConfigs, any, any> | null) => {
                      if (formFieldIndex !== null) {
                        this.formFields[formFieldIndex] = formField
                        this.handleMount(formFieldIndex)
                      }
                    }}
                    formLayout={formLayout}
                    value={getValue(value, formFieldConfig.field)}
                    record={record}
                    data={cloneDeep(data)}
                    step={step}
                    config={formFieldConfig}
                    onChange={async (value: any) => { await this.handleChange(formFieldIndex, value) }}
                    onValueSet={async (path, value, validation) => this.handleValueSet(formFieldIndex, path, value, validation)}
                    onValueUnset={async (path, validation) => this.handleValueUnset(formFieldIndex, path, validation)}
                    onValueListAppend={async (path, value, validation) => this.handleValueListAppend(formFieldIndex, path, value, validation)}
                    onValueListSplice={async (path, index, count, validation) => this.handleValueListSplice(formFieldIndex, path, index, count, validation)}
                    loadDomain={async (domain: string) => await this.props.loadDomain(domain)}
                  />
              )
            }
            // 渲染表单项容器
            return (
              hidden
                ? this.renderItemComponent(renderData)
                : <React.Fragment key={formFieldIndex} />
            )
          })
        })}
      </React.Fragment>
    )
  }
}