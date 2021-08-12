import React, { memo } from 'react';
import { Card, DatePicker } from 'antd';
import { FormattedMessage } from 'umi-plugin-react/locale';
import numeral from "numeral";
import { Pie } from '@/components/Charts';
import styles from './index.less';

const { RangePicker } = DatePicker;

const ProportionSales = memo(
  ({ loading, platformTotal, salesPieData, isActive, selectDate, rangePickerValue, handleRangePickerChange }) => (
    <Card
      loading={loading}
      className={styles.salesCard}
      bordered={false}
      title='销售渠道占比'
      bodyStyle={{ padding: 24 }}
      extra={
        <div className={styles.salesCardExtra}>
          <div className={styles.salesExtraWrap}>
            <div className={styles.salesExtra}>
              <a className={isActive('today')} onClick={() => selectDate('today')}>
                <FormattedMessage id="app.analysis.all-day" defaultMessage="All Day" />
              </a>
              <a className={isActive('week')} onClick={() => selectDate('week')}>
                <FormattedMessage id="app.analysis.all-week" defaultMessage="All Week" />
              </a>
              <a className={isActive('month')} onClick={() => selectDate('month')}>
                <FormattedMessage id="app.analysis.all-month" defaultMessage="All Month" />
              </a>
              <a className={isActive('year')} onClick={() => selectDate('year')}>
                <FormattedMessage id="app.analysis.all-year" defaultMessage="All Year" />
              </a>
            </div>
            <RangePicker
              value={rangePickerValue}
              onChange={handleRangePickerChange}
              style={{ width: 256 }}
            />
          </div>
        </div>
      }
      style={{ marginTop: 24 }}
    >
      <div className={styles.salesCard}>
        <h4 style={{ marginTop: 10, marginBottom: 32 }}>
          <FormattedMessage id="app.analysis.sales" defaultMessage="Sales" />
        </h4>
        <Pie
          hasLegend
          subTitle={<FormattedMessage id="app.analysis.sales" defaultMessage="Sales" />}
          total={`￥${numeral(platformTotal).format('0,0.00')}`}
          data={salesPieData}
          valueFormat={value => `￥${numeral(value).format('0,0.00')}`}
          height={270}
          lineWidth={4}
          style={{ padding: '8px 0' }}
        />
      </div>
    </Card>
  )
);

export default ProportionSales;
