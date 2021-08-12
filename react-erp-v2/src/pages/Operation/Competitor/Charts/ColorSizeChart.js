/*
 * @Author: wjw
 * @Date: 2020-08-07 14:34:06
 * @LastEditTime: 2020-09-18 15:58:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\Detail\Charts\ColorSizeChart.js
 */

import React, { useMemo } from 'react';
import { Card, Empty } from 'antd';
import { Chart, Geom, Tooltip, Coord, Label, Legend, Axis } from 'bizcharts';
import DataSet from '@antv/data-set';
import useCharts from '@/customHook/useCharts/competitorCharts';
import { connect } from 'dva';
import { KeepDecimals } from '@/utils/utils';

const ColorSizeChart = props => {
  const { dispatch, loading, dateRange, watchProductId } = props;
  const filters = useMemo(() => {
    return { range: dateRange };
  }, [dateRange]);
  const colorSizeData = useCharts({
    dispatch,
    type: 'competitor/getColorSizeChart',
    payload: {
      filters,
      productId: watchProductId,
    },
  });
  const { DataView } = DataSet;
  const dv = new DataView();
  dv.source(colorSizeData).transform({
    type: 'percent',
    field: 'num',
    dimension: 'name',
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
    <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ width: '100%' }} loading={loading}>
      {colorSizeData.length > 0 ? (
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
            itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
          />
          <Geom
            type="intervalStack"
            position="percent"
            color="name"
            tooltip={[
              'name*percent',
              (name, percent) => ({
                name,
                value: KeepDecimals(percent),
              }),
            ]}
            style={{
              lineWidth: 1,
              stroke: '#fff',
            }}
          >
            <Label content="percent" formatter={(val, name) => `${name.point.name}: ${val}`} />
          </Geom>
        </Chart>
      ) : (
        <Empty />
      )}
    </Card>
  );
};

export default connect(({ loading }) => ({ loading: loading.effects['competitor/getColorSizeChart'] }))(
  ColorSizeChart
);
