import React from 'react'
import { DatetimeColumn } from 'ccms-core'
import { IDatetimeColumn } from 'ccms-core/dist/src/components/tableColumns/datetime'
import moment from 'moment'

export default class DatetimeColumnComponent extends DatetimeColumn {
  renderComponent = (props: IDatetimeColumn) => {
    const {
      value
    } = props
    return (
      <React.Fragment>{moment(value)}</React.Fragment>
    )
  }
}
