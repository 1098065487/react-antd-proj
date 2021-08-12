/*
 * @Author: wjw
 * @Date: 2020-08-07 09:18:10
 * @LastEditTime: 2020-09-21 16:35:59
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\Detail\Charts\LineChart.js
 */

import React, { useMemo } from 'react';
import { Card, Empty } from 'antd';
import { Chart, Axis, Tooltip, Geom, Legend } from 'bizcharts';
import useCharts from '@/customHook/useCharts/competitorCharts';
import { connect } from 'dva';

const LineChart = props => {
  const { dispatch, loading, dateRange, watchProductId } = props;
  const filters = useMemo(() => {
    return { range: dateRange };
  }, [dateRange]);
  const trendData = useCharts({
    dispatch,
    type: 'competitor/getLineChart',
    payload: {
      filters,
      productId: watchProductId,
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
    second_rank: {
      alias: '二级分类排名',
      min: 0,
    },
    price: {
      alias: '售价',
      min: 0,
    },
  };
  return (
    <Card bordered={false} bodyStyle={{ padding: 0 }}>
      <h4
        style={{
          fontWeight: '600',
          fontSize: '18px',
          color: 'rgba(0,0,0,0.75)',
          padding: '5px 10px',
        }}
      >
        评论,星评,二级分类排名,售价统计图
      </h4>
      <Card bordered={false} bodyStyle={{ padding: 0 }} loading={loading}>
        {trendData.length > 0 ? (
          <div>
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
              <Axis name="second_rank" tickLine={null} label={null} />
              <Axis name="price" tickLine={null} label={null} />
              <Tooltip />
              <Geom type="line" position="date*comments" size={2} color="#1890ff" />
              <Geom type="line" position="date*rating" size={2} color="#F91F18" />
              <Geom type="line" position="date*second_rank" size={2} color="#13c2c2" />
              <Geom
                type="area"
                position="date*price"
                size={2}
                color="#4ecb73"
                opacity={0.5}
                shape="smooth"
              />
            </Chart>
          </div>
        ) : (
          <Empty />
        )}
      </Card>
    </Card>
  );
};

export default connect(({ loading }) => ({ loading: loading.effects['competitor/getLineChart'] }))(
  LineChart
);
