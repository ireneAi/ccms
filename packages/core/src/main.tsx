import React from 'react'
import marked from 'marked'
import Step, { StepProps } from './steps/common'
import StepComponents, { StepConfigs } from './steps'
import { RichStringConfig } from './interface'

/**
 * 页面配置文件格式定义
 * - basic: 页面基本配置
 * - - title: 页面标题
 * - - description: 页面描述
 * - steps: 页面流转步骤
 */
export interface CCMSConfig {
  basic?: BasicConfig
  steps?: StepConfigs[]
}

export interface BasicConfig {
  title?: string
  description?: RichStringConfig
}

/**
 * 页面组件 - UI渲染方法 - 入参格式
 * - title: 页面标题
 * - description: 页面描述
 * - children: 页面内容
 */
export interface ICCMS {
  title: string
  description: React.ReactNode
  children: React.ReactNode
}

/**
 * 页面组件 - 入参格式
 * - config: 页面配置文件
 * - sourceData: 传入数据
 */
export interface CCMSProps {
  config: CCMSConfig
  sourceData: any
  checkPageAuth: (pageID: any) => Promise<boolean>
  loadPageURL: (pageID: any) => Promise<string>
  loadPageFrameURL: (pageID: any) => Promise<string>
  loadPageConfig: (pageID: any) => Promise<CCMSConfig>
  callback: () => void
  onMount?: () => void
}

/**
 * 页面组件 - 状态
 * - realStep: 数据当前所在步骤
 * - viewStep: 界面当前所在步骤
 * - data: 各步骤数据
 */
interface CCMSState {
  realStep: number
  viewStep: number[]
  data: any[]
}

/**
 * 页面组件
 */
export default class CCMS extends React.Component<CCMSProps, CCMSState> {
  getStepComponent = (key: string) => StepComponents[key]

  /**
   * 各步骤所使用的UI组件的实例
   */
  steps: (Step<any> | null)[] = []

  /**
   * 是否已经首次挂载
   */
  mounted: boolean = false

  /**
   * 初始化
   * @param props 页面组件 - 入参
   *
   * 数据当前所在步骤 初始为 0
   * 界面当前所在步骤 初始为 -1 - 界面0需要在数据0执行结束（componentDidMount）后展示
   * 各步骤数据 初始为 sourceData
   */
  constructor (props: CCMSProps) {
    super(props)
    this.state = {
      realStep: 0,
      viewStep: [],
      data: [props.sourceData]
    }
  }

  /**
   * 执行界面0的挂载
   */
  componentDidMount () {
    this.steps[0]?.willMount()
  }

  /**
   * 处理页面步骤的提交事件
   * @param step 当前页面所在步骤
   * @param result 当前页面所在步骤所提交的数据
   */
  handleSubmit = async (step: number, result: any, unmountView: boolean = true) => {
    const {
      config: {
        steps = []
      },
      callback
    } = this.props

    const {
      viewStep
    } = this.state

    if (step < steps.length - 1) {
      const {
        data
      } = this.state

      data[step + 1] = result

      await this.setState({
        realStep: step + 1,
        viewStep: unmountView ? viewStep.filter((_step) => _step !== step || steps[step].type === 'fetch') : viewStep,
        data
      })

      const nextStep = this.steps[step + 1]
      if (nextStep) {
        nextStep.willMount()
      }
    } else {
      callback()
    }
  }

  /**
   * 处理页面步骤的界面切换事件
   * @param step 目标页面所在步骤
   */
  handleMount = async (step: number) => {
    const {
      config: {
        steps = []
      },
      callback
    } = this.props
    const {
      viewStep
    } = this.state
    if (step >= 0 && step < steps.length) {
      viewStep.push(step)
      this.setState({
        viewStep
      })

      if (!this.mounted) {
        this.mounted = true
        this.props.onMount && this.props.onMount()
      }
    } else {
      callback()
    }
  }

  /**
   * 处理页面步骤的界面后退时间
   */
  handleUnmount = async (step: number, reload: boolean = false) => {
    const {
      config: {
        steps = []
      },
      callback
    } = this.props

    const {
      viewStep
    } = this.state

    const _viewStep = viewStep.filter((_step) => _step !== step)

    this.setState({
      viewStep: _viewStep
    })

    if (step > 0 && step <= steps.length) {
      if (reload) {
        const nextStep = this.steps[step - 1]
        if (nextStep) {
          nextStep.willMount()
        }
      } else {
        _viewStep.push(step - 1)
        this.setState({
          viewStep: _viewStep
        })
      }
    } else {
      callback()
    }
  }

  /**
   * 页面组件 - UI渲染方法
   * 各UI库需重写该方法
   * @param props 页面组件 - UI渲染方法 - 入参
   */
  renderComponent = (props: ICCMS) => {
    return (
      <React.Fragment>您当前使用的UI版本没有实现CCMS组件。</React.Fragment>
    )
  }

  render () {
    // 处理配置文件默认值
    const {
      config: {
        basic: {
          title = '',
          description: {
            type: descriptionType = 'none',
            content: descriptionContent = ''
          } = {}
        } = {},
        steps = []
      },
      checkPageAuth,
      loadPageURL,
      loadPageFrameURL,
      loadPageConfig
    } = this.props

    const {
      realStep,
      viewStep,
      data
    } = this.state

    // 处理页面描述
    let description: React.ReactNode = descriptionContent
    switch (descriptionType) {
      case 'markdown':
        description = <div dangerouslySetInnerHTML={{ __html: marked(descriptionContent) }}></div>
        break
      case 'html':
        description = <div dangerouslySetInnerHTML={{ __html: descriptionContent }}></div>
        break
    }

    // 调用UI渲染方法
    return (
      <React.Fragment>
        {this.renderComponent({
          title,
          description,
          children: (steps.map((currentStep, index) => {
            if (index <= realStep) {
              const props: StepProps<any> = {
                ref: (e) => { this.steps[index] = e },
                data,
                step: index,
                onSubmit: (data: any, unmountView: boolean = true) => this.handleSubmit(index, data, unmountView),
                onMount: () => this.handleMount(index),
                onUnmount: (reload: boolean = false) => this.handleUnmount(index, reload),
                config: currentStep,
                checkPageAuth,
                loadPageURL,
                loadPageFrameURL,
                loadPageConfig
              }

              const StepComponent = this.getStepComponent(currentStep.type)
              const children = (
                StepComponent ? <StepComponent {...props} /> : <React.Fragment>您当前使用的UI版本没有实现{currentStep.type}步骤组件。</React.Fragment>
              )
              return (
                <div key={index} style={{ display: viewStep.includes(index) ? 'block' : 'none' }}>{children}</div>
              )
            } else {
              return <React.Fragment key={index}></React.Fragment>
            }
          }))
        })}
      </React.Fragment>
    )
  }
}