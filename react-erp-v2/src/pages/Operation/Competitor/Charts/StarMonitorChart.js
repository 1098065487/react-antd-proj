/*
 * @Author: wjw
 * @Date: 2020-08-21 14:57:43
 * @LastEditTime: 2020-08-25 10:33:11
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\Detail\Charts\StarMonitorChart.js
 */
import React from 'react';
import { Chart, Tooltip, Facet, Axis } from 'bizcharts';

const StarMonitorChart = props => {
  const {
    dataSource: { data },
    attr,
  } = props;
  const scale = {
    rating_str: {
      sync: true,
    },
    num: {
      alias: '评论数量',
    },
  };
  const title = {
    textStyle: {
      fontSize: '13', // 文本大小
      fill: 'rgba(0, 0, 0, 0.65)',
    },
  };
  return (
    <Chart height={200} data={data} forceFit padding={[10, 50, 50, 50]} scale={scale}>
      <h3 style={{ paddingLeft: '50px' }}>{attr}</h3>
      <Tooltip />
      <Axis name="num" title={title} />
      <Facet
        type="list"
        fields={['rating_str']}
        cols={5}
        padding={20}
        eachView={view => {
          view
            .point()
            .position('date*num')
            .color('rating_str', ['#3aa1ff', '#36cbcb', '#4ecb73', '#fbd437', '#f2637b'])
            .shape('circle')
            .opacity(0.8)
            .size(3);
        }}
      />
    </Chart>
  );
};

export default StarMonitorChart;
