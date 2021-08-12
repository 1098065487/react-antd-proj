/*
 * @Author: wjw
 * @Date: 2020-08-07 14:34:06
 * @LastEditTime: 2020-09-16 14:10:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\Detail\Charts\ColorSizeChart.js
 */

import React from 'react';
import { Card } from 'antd';
import { Chart, Geom, Tooltip, Coord, Label, Legend, Axis } from 'bizcharts';
import DataSet from '@antv/data-set';
import useCharts from '@/customHook/useCharts';
import { connect } from 'dva';
import KeepDecimals from './KeepDecimals';

const ColorSizeChart = props => {
  const { dispatch, filters, currentId, loading } = props;
  const colorSizeData = useCharts({
    dispatch,
    type: 'review/getColorSizeChart',
    payload: {
      filters,
      currentId,
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
    <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ width: '50%', display: 'inline-block' }} loading={loading}>
      {colorSizeData.length > 0 ? (
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '0' }}>颜色尺码组合分布</h2>
          <Chart
            height={500}
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
        </div>
      ) : null}
    </Card>
  );
};

export default connect(({ loading }) => ({ loading: loading.effects['review/getColorSizeChart'] }))(
  ColorSizeChart
);
