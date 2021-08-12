/*
 * @Author: wjw
 * @Date: 2020-11-02 14:46:18
 * @LastEditTime: 2020-11-18 11:18:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\erp\react-erp-v2\src\pages\Operation\Competitor\FeatureRateChart\idnex.js
 */
import React from 'react';
import { Chart, Geom, Axis, Tooltip, Label } from 'bizcharts';
import DataSet from '@antv/data-set';
import { Empty } from 'antd';
import { FeatureRateChartProps } from './featureRateChart.d'

const FeatureRateChart: React.FC<FeatureRateChartProps> = ({ featureRateChartData }) => {
  const ds = new DataSet();
  const dv = ds.createView().source(featureRateChartData);
  return (
    <div style={{ width: '35%', marginRight: 20 }}>
      <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 0 }}>Feature Rate</p>
      {featureRateChartData?.length ? (
        <Chart data={dv} height={240} padding='auto' appendPadding={[20, 0, 20, 0]} autoFit>
          <Axis name="name" />
          <Axis name="rating" />
          <Tooltip />
          <Geom
            type="interval"
            position="name*rating"
            tooltip={[
              'rating',
              rating => {
                return {
                  name: '平均评分',
                  value: rating,
                };
              },
            ]}
          >
            <Label content="rating" offset={5} />
          </Geom>
        </Chart>
      ) : <Empty style={{ marginTop: 20 }} />}
    </div>
  );
};

export default FeatureRateChart;
