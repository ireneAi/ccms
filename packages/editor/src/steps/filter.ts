import { FormConfig } from 'ccms/dist/src/steps/form'
import { FilterConfig } from 'ccms/dist/src/steps/filter'

export const Config: FormConfig = {
  type: 'form',
  fields: [
    {
      field: 'type',
      label: '类型',
      type: 'hidden',
      defaultValue: {
        source: 'static',
        value: 'filter'
      }
    },
    {
      field: 'columns.enable',
      label: '分栏配置',
      type: 'switch'
    },
    {
      field: 'columns',
      label: '分栏配置',
      type: 'import_subform',
      interface: {
        url: '${configDomain}/common/ColumnsConfig.json',
        urlParams: [
          {
            field: 'version',
            data: {
              source: 'source',
              field: 'version'
            }
          },
          {
            field: 'configDomain',
            data: {
              source: 'source',
              field: 'configDomain'
            }
          }
        ],
        method: 'GET',
        cache: {
          global: 'CCMS_CONFIG_common_ColumnsConfig'
        }
      },
      condition: {
        template: '${enable} === true',
        params: [
          {
            field: 'enable',
            data: {
              source: 'record',
              field: 'columns.enable'
            }
          }
        ]
      }
    },
    {
      field: 'columns.gap',
      label: '分栏边距',
      type: 'number',
      defaultValue: {
        source: 'static',
        value: 32
      },
      condition: {
        template: '${enable} === true',
        params: [
          {
            field: 'enable',
            data: {
              source: 'record',
              field: 'columns.enable'
            }
          }
        ]
      }
    },
    {
      field: 'columns.rowGap',
      label: '分栏下边距',
      type: 'number',
      defaultValue: {
        source: 'static',
        value: 0
      },
      condition: {
        template: '${enable} === true',
        params: [
          {
            field: 'enable',
            data: {
              source: 'record',
              field: 'columns.enable'
            }
          }
        ]
      }
    },
    {
      field: 'fields',
      label: '表单项',
      type: 'form',
      primaryField: 'label',
      canInsert: true,
      canRemove: true,
      canSort: true,
      canCollapse: true,
      fields: [
        {
          field: 'label',
          label: '字段描述',
          type: 'text'
        },
        {
          field: 'field',
          label: '字段名',
          type: 'text'
        },
        {
          field: '',
          label: '',
          type: 'import_subform',
          interface: {
            url: '${configDomain}/form/index.json',
            urlParams: [
              {
                field: 'version',
                data: {
                  source: 'source',
                  field: 'version'
                }
              },
              {
                field: 'configDomain',
                data: {
                  source: 'source',
                  field: 'configDomain'
                }
              }
            ],
            method: 'GET',
            cache: {
              global: 'CCMS_CONFIG_form'
            }
          }
        }
      ],
      initialValues: {
        label: ''
      }
    },
    {
      field: 'hiddenSubmit',
      label: '是否隐藏确定按钮',
      type: 'switch'
    },
    {
      field: 'submitText',
      label: '确定按钮文案',
      type: 'text'
    },
    {
      field: 'hiddenReset',
      label: '是否隐藏重置按钮',
      type: 'switch'
    },
    {
      field: 'resetText',
      label: '重置按钮文案',
      type: 'text'
    }
  ],
  defaultValue: {
    source: 'data',
    field: ''
  },
  actions: [],
  rightTopActions: []
}

export const Template: FilterConfig = {
  type: 'filter'
}
