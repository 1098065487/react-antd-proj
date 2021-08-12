import React, { memo } from 'react';
import { Row, Col, Icon, Tooltip } from 'antd';
import numeral from 'numeral';
import { ChartCard, MiniBar, Field } from '@/components/Charts';

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 8,
  style: { marginBottom: 24 },
};

const IntroduceRow = memo(({ weeklyOrderLoading, salesDateLoading, monthlyTotal, dailyTotal, weeklyTotal, weeklyOrder, weeklySale }) => (
  <Row gutter={24}>
    <Col {...topColResponsiveProps}>
      <ChartCard
        bordered={false}
        title='本月销售总额'
        action={
          <Tooltip
            title='展示本月销售总额及当日销售额'
          >
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        loading={salesDateLoading}
        total={`￥${numeral(monthlyTotal).format('0,0.00')}`}
        footer={
          <Field
            label='日销售总额'
            value={`￥${numeral(dailyTotal).format('0,0.00')}`}
          />
        }
        contentHeight={14}
      />
    </Col>
    <Col {...topColResponsiveProps}>
      <ChartCard
        bordered={false}
        loading={weeklyOrderLoading}
        title='周订单总量'
        action={
          <Tooltip
            title='展示最近连续一周的订单总量趋势'
          >
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        // total={weeklyTotal ? numeral(weeklyTotal).format('0,0') : null}
        footer={
          null
        }
        contentHeight={84}
      >
        <MiniBar data={weeklyOrder} />
      </ChartCard>
    </Col>
    <Col {...topColResponsiveProps}>
      <ChartCard
        bordered={false}
        loading={weeklyOrderLoading}
        title='周销售额'
        action={
          <Tooltip
            title='展示最近连续一周的销售额趋势'
          >
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        footer={
          null
        }
        contentHeight={84}
      >
        <MiniBar data={weeklySale} />
      </ChartCard>
    </Col>
  </Row>
));

export default IntroduceRow;
