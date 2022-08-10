import React from 'react'
import { cloneDeep } from 'lodash'
import { setValue, getValue } from '../../../util/value'
import { DetailField, DetailFieldConfig, DetailFieldProps, IDetailField } from '../common'
import getALLComponents, { DetailFieldConfigs } from '../'
import { IDetailItem } from '../../../steps/detail'
import ConditionHelper from '../../../util/condition'
import { ColumnsConfig } from '../../../interface'

export interface GroupFieldConfig extends DetailFieldConfig {
  type: 'group'
  fields: DetailFieldConfigs[]
  childColumns?: ColumnsConfig
}

export interface IGroupField {
  columns?: ColumnsConfig
  styles?: object
  children: React.ReactNode[]
}

interface IGroupFieldState {
}

export default class GroupField extends DetailField<GroupFieldConfig, IGroupField, any, IGroupFieldState> implements IDetailField<string> {
  // 各表单项对应的类型所使用的UI组件的类
  getALLComponents = (type: any): typeof DetailField => getALLComponents[type]

  detailFields: Array<DetailField<DetailFieldConfigs, {}, any> | null> = []
  detailFieldsMounted: Array<boolean> = []

  constructor(props: DetailFieldProps<GroupFieldConfig, any>) {
    super(props)

    this.state = {}
  }

  get = async () => {
    let data: any = {}

    if (Array.isArray(this.props.config.fields)) {
      for (const detailFieldIndex in this.props.config.fields) {
        const detailFieldConfig = this.props.config.fields[detailFieldIndex]
        if (!ConditionHelper(detailFieldConfig.condition, { record: this.props.value, data: this.props.data, step: this.props.step })) {
          continue
        }
        const detailField = this.detailFields[detailFieldIndex]
        if (detailField) {
          const value = await detailField.get()
          data = setValue(data, detailFieldConfig.field, value)
        }
      }
    }

    return data
  }

  handleMount = async (detailFieldIndex: number) => {
    if (this.detailFieldsMounted[detailFieldIndex]) {
      return true
    }

    this.detailFieldsMounted[detailFieldIndex] = true

    if (this.detailFields[detailFieldIndex]) {
      const detailField = this.detailFields[detailFieldIndex]
      if (detailField) {
        await detailField?.didMount()
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

  handleValueSet = async (detailFieldIndex: number, path: string, value: any, options?: { noPathCombination?: boolean }) => {
    const detailFieldConfig = (this.props.config.fields || [])[detailFieldIndex]
    if (detailFieldConfig) {
      const fullPath = options && options.noPathCombination ? path : (detailFieldConfig.field === '' || path === '' ? `${detailFieldConfig.field}${path}` : `${detailFieldConfig.field}.${path}`)
      await this.props.onValueSet(fullPath, value)
    }
  }

  handleValueUnset = async (detailFieldIndex: number, path: string, options?: { noPathCombination?: boolean }) => {
    const detailFieldConfig = (this.props.config.fields || [])[detailFieldIndex]
    if (detailFieldConfig) {
      const fullPath = options && options.noPathCombination ? path : (detailFieldConfig.field === '' || path === '' ? `${detailFieldConfig.field}${path}` : `${detailFieldConfig.field}.${path}`)
      await this.props.onValueUnset(fullPath)
    }
  }

  handleValueListAppend = async (detailFieldIndex: number, path: string, value: any, options?: { noPathCombination?: boolean }) => {
    const detailFieldConfig = (this.props.config.fields || [])[detailFieldIndex]
    if (detailFieldConfig) {
      const fullPath = options && options.noPathCombination ? path : (detailFieldConfig.field === '' || path === '' ? `${detailFieldConfig.field}${path}` : `${detailFieldConfig.field}.${path}`)
      await this.props.onValueListAppend(fullPath, value)
    }
  }

  handleValueListSplice = async (detailFieldIndex: number, path: string, index: number, count: number, options?: { noPathCombination?: boolean }) => {
    const detailFieldConfig = (this.props.config.fields || [])[detailFieldIndex]
    if (detailFieldConfig) {
      const fullPath = options && options.noPathCombination ? path : (detailFieldConfig.field === '' || path === '' ? `${detailFieldConfig.field}${path}` : `${detailFieldConfig.field}.${path}`)
      await this.props.onValueListSplice(fullPath, index, count)
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
  renderItemComponent = (props: IDetailItem) => {
    return <React.Fragment>
      您当前使用的UI版本没有实现DetailItem组件。
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
          columns: config?.columns?.enable ? config.columns : undefined,
          children: (this.props.config.fields || []).map((detailFieldConfig, detailFieldIndex) => {
            if (!ConditionHelper(detailFieldConfig.condition, { record: value, data: this.props.data, step: this.props.step })) {
              this.detailFieldsMounted[detailFieldIndex] = false
              return null
            }
            let hidden: boolean = true
            let display: boolean = true

            // if (detailFieldConfig.type === 'hidden') {
            //   hidden = true
            //   display = false
            // }

            if (detailFieldConfig.display === 'none') {
              hidden = true
              display = false
            }

            const DetailFieldComponent = this.getALLComponents(detailFieldConfig.type) || DetailField

            const computedColumns = {
              type: detailFieldConfig.columns?.type || config.childColumns?.type || 'span',
              value: detailFieldConfig.columns?.value || config.childColumns?.value || 1,
              wrap: detailFieldConfig.columns?.wrap || config.childColumns?.wrap || false,
              gap: config.columns?.gap || 0,
              rowGap: config.columns?.rowGap || 0
            }
            if (computedColumns.type === 'width') {
              computedColumns.value = `${config.childColumns?.value}${config.childColumns?.unit || ''}`
            }

            const renderData = {
              key: detailFieldIndex,
              label: detailFieldConfig.label,
              columns: config.columns?.enable
                ? computedColumns
                : undefined,
              styles: detailFieldConfig.styles,
              layout: formLayout,
              visitable: display,
              fieldType: detailFieldConfig.type,
              children: (
                <DetailFieldComponent
                  checkPageAuth={this.props.checkPageAuth}
                  loadPageURL={this.props.loadPageURL}
                  loadPageFrameURL={this.props.loadPageFrameURL}
                  loadPageConfig={this.props.loadPageConfig}
                  loadPageList={this.props.loadPageList}
                  handlePageRedirect={this.props.handlePageRedirect}
                  onUnmount={this.props.onUnmount}
                  key={detailFieldIndex}
                  ref={(detailField: DetailField<DetailFieldConfigs, any, any> | null) => {
                    if (detailFieldIndex !== null) {
                      this.detailFields[detailFieldIndex] = detailField
                      this.handleMount(detailFieldIndex)
                    }
                  }}
                  formLayout={formLayout}
                  value={getValue(value, detailFieldConfig.field)}
                  record={record}
                  data={cloneDeep(data)}
                  step={step}
                  config={detailFieldConfig}
                  detail={this.props.detail}
                  onChange={async (value: any) => { await this.handleChange(detailFieldIndex, value) }}
                  onValueSet={async (path, value, options) => this.handleValueSet(detailFieldIndex, path, value, options)}
                  onValueUnset={async (path, options) => this.handleValueUnset(detailFieldIndex, path, options)}
                  onValueListAppend={async (path, value, options) => this.handleValueListAppend(detailFieldIndex, path, value, options)}
                  onValueListSplice={async (path, index, count, options) => this.handleValueListSplice(detailFieldIndex, path, index, count, options)}
                  baseRoute={this.props.baseRoute}
                  loadDomain={async (domain: string) => await this.props.loadDomain(domain)}
                />
              )
            }
            // 渲染表单项容器
            return (
              hidden
                ? this.renderItemComponent(renderData)
                : <React.Fragment key={detailFieldIndex} />
            )
          })
        })}
      </React.Fragment>
    )
  }
}
