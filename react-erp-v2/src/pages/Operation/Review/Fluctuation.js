/*
 * @Author: wjw
 * @Date: 2020-08-05 15:09:52
 * @LastEditTime: 2020-09-08 16:35:38
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\Fluctuation.js
 */

import React, { useMemo } from 'react';
import { Chart, Axis, Tooltip, Geom } from 'bizcharts';

const label = {
  rotate: 0,
  autoRotate: false,
};

const title = {
  offset: 35, // 设置标题 title 距离坐标轴线的距离
  textStyle: {
    fill: 'rgba(0, 0, 0, 0.65)',
  }, // 坐标轴文本属性配置
};

const Fluctuation = props => {
  const { data, height, width } = props;
  const axisInterval = useMemo(() => {
    if (data.length) {
      const scoreList = data.map(item => item.score);
      const min = Math.floor(Math.min(...scoreList));
      const max = Math.ceil(Math.max(...scoreList));
      return { min, max };
    }
    return { min: 0, max: 5 };
  }, [data]);
  const cols = {
    num: {
      alias: '评论数量',
      min: 0,
    },
    score: {
      alias: '平均评分',
      min: axisInterval.min,
      max: axisInterval.max,
    },
    date: {
      alias: '日期',
      type: 'time',
    },
  };
  return (
    <Chart height={height} data={data} scale={cols} width={width} padding={[10, 45]}>
      <Axis name="date" label={null} tickLine={null} />
      <Axis name="score" title={title} label={label} />
      <Axis name="num" title={title} label={label} />
      <Tooltip />
      <Geom type="line" shape="smooth" position="date*score" size={1} color="#F91F18" />
      <Geom type="line" shape="smooth" position="date*num" size={1} color="#1890ff" />
      <Geom type="point" position="date*score" size={2} shape="circle" color="#F91F18" />
      <Geom type="point" position="date*num" size={2} shape="circle" color="#1890ff" />
    </Chart>
  );
};

export default Fluctuation;
