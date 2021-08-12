/*
 * @Author: wjw
 * @Date: 2020-08-07 09:18:10
 * @LastEditTime: 2020-08-28 09:38:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\Detail\Charts\LineChart.js
 */

import React, { useMemo } from 'react';
import { Card } from 'antd';
import { Chart, Axis, Tooltip, Geom, Legend } from 'bizcharts';
import useCharts from '@/customHook/useCharts';
import { connect } from 'dva';

const TrendChart = props => {
  const { dispatch, filters, currentId, loading } = props;
  const trendData = useCharts({
    dispatch,
    type: 'review/getTrendChart',
    payload: {
      filters,
      currentId,
    },
  });
  const axisInterval = useMemo(() => {
    if (trendData.length) {
      const scoreList = trendData.map(item => item.rating);
      const min = Math.floor(Math.min(...scoreList));
      const max = Math.ceil(Math.max(...scoreList));
      return { min, max };
    }
    return { min: 0, max: 5 };
  }, [trendData]);
  const paddingBottom = trendData.length === 0 ? 20 : 100;
  const cols = {
    date: {
      alias: '日期',
      type: 'time',
    },
    comments: {
      alias: '评论',
      min: 0,
    },
    rating: {
      alias: '星评',
      min: axisInterval.min,
      max: axisInterval.max,
    },
    amount: {
      alias: '销售额',
      min: 0,
    },
  };
  return (
    <Card bordered={false} bodyStyle={{ padding: 0 }} loading={loading}>
      <Chart
        height={300}
        data={trendData}
        scale={cols}
        forceFit
        padding={[10, 30, paddingBottom, 30]}
      >
        <Legend />
        <Axis
          name="date"
          tickLine={trendData.length === 0 ? null : {}}
          label={trendData.length === 0 ? null : {}}
        />
        <Axis name="comments" tickLine={null} label={null} />
        <Axis name="rating" tickLine={null} label={null} />
        <Axis name="amount" tickLine={null} label={null} />
        <Tooltip />
        <Geom type="line" position="date*comments" size={2} color="#1890ff" />
        <Geom type="line" position="date*rating" size={2} color="#F91F18" />
        <Geom type="line" position="date*amount" size={2} color="#13c2c2" />
      </Chart>
    </Card>
  );
};

export default connect(({ loading }) => ({ loading: loading.effects['review/getTrendChart'] }))(
  TrendChart
);
