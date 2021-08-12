/*
 * @Author: wjw
 * @Date: 2020-08-07 10:37:16
 * @LastEditTime: 2020-09-18 15:26:36
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\Detail\Charts\RatingDistributionChart.js
 */

import React, { useMemo } from 'react';
import { Card, Empty } from 'antd';
import { Chart, Geom, Axis, Tooltip, Coord, Label, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
import { connect } from 'dva';
import useCharts from '@/customHook/useCharts/competitorCharts';
import { KeepDecimals } from '@/utils/utils';

const RatingDistributionChart = props => {
  const { dispatch, loading, dateRange, watchProductId } = props;
  const filters = useMemo(() => {
    return { range: dateRange };
  }, [dateRange]);
  const ratingDistributionData = useCharts({
    dispatch,
    type: 'competitor/getRatingDistribution',
    payload: {
      filters,
      productId: watchProductId,
    },
  });
  const { DataView } = DataSet;
  const dv = new DataView();
  dv.source(ratingDistributionData).transform({
    type: 'percent',
    field: 'num',
    dimension: 'rating_str',
    as: 'percent',
  });

  const cols = {
    percent: {
      formatter: val => KeepDecimals(val),
    },
  };
  function getXY(c, { index: idx = 0, field = 'percent', radius = 0.5 }) {
    const d = c.get('data');
    if (idx > d.length) {
      return false;
    }
    const scales = c.get('scales');
    let sum = 0;
    for (let i = 0; i < idx + 1; i += 1) {
      let val = d[i][field];
      if (i === idx) {
        val /= 2;
      }
      sum += val;
    }
    const pt = {
      y: scales[field].scale(sum),
      x: radius,
    };
    const coord = c.get('coord');
    const xy = coord.convert(pt);
    return xy;
  }
  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: 0 }}
      style={{ width: '100%' }}
      loading={loading}
    >
      {ratingDistributionData.length > 0 ? (
        <Chart
          height={300}
          data={dv}
          scale={cols}
          padding={[0, 0, 80]}
          forceFit
          onGetG2Instance={c => {
            const xy = getXY(c, { index: 0 });
            c.showTooltip(xy);
          }}
        >
          <Coord type="theta" radius={0.75} />
          <Axis name="percent" />
          <Legend />
          <Tooltip
            showTitle={false}
            itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{rating_str}: {value}</li>'
          />
          <Geom
            type="intervalStack"
            position="percent"
            color={['rating_str', ['#3aa1ff', '#36cbcb', '#4ecb73', '#fbd437', '#f2637b']]}
            tooltip={[
              'rating_str*percent',
              (rating_str, percent) => ({
                rating_str,
                value: KeepDecimals(percent),
              }),
            ]}
            style={{
              lineWidth: 1,
              stroke: '#fff',
            }}
          >
            <Label
              content="percent"
              formatter={(val, rating_str) => `${rating_str.point.rating_str}: ${val}`}
            />
          </Geom>
        </Chart>
      ) : (
        <Empty />
      )}
    </Card>
  );
};

export default connect(({ loading }) => ({
  loading: loading.effects['competitor/getRatingDistribution'],
}))(RatingDistributionChart);
