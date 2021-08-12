/*
 * @Author: wjw
 * @Date: 2020-11-02 14:46:18
 * @LastEditTime: 2020-11-18 11:18:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\erp\react-erp-v2\src\pages\Operation\Competitor\ReviewNumCharts\idnex.js
 */
import React from 'react';
import { Chart, Geom, Axis, Tooltip, Coord, Label } from 'bizcharts';
import DataSet from '@antv/data-set';
import { Empty } from 'antd';
import { ReviewNumChartProps } from './reviewNumChart.d'

const ReviewNumCharts: React.FC<ReviewNumChartProps> = ({ reviewNumChartData }) => {
  const ds = new DataSet();
  const dv = ds.createView().source(reviewNumChartData);
  return (
    <div style={{ width: '35%', marginRight: 20 }}>
      <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 0 }}>Review数量</p>
      {reviewNumChartData?.length ? (<Chart data={dv} height={240} padding="auto" appendPadding={[10, 50, 0, 0]} autoFit>
        <Coord transpose />
        <Axis name="name" />
        <Axis name="reviews" visible={false} />
        <Tooltip />
        <Geom
          type="interval"
          position="name*reviews"
          tooltip={[
            'reviews',
            reviews => {
              return {
                name: '评论数量',
                value: reviews,
              };
            },
          ]}
        >
          <Label content="reviews" offset={5} />
        </Geom>
      </Chart>) : <Empty style={{ marginTop: 20 }} />}
    </div>
  );
};

export default ReviewNumCharts;
