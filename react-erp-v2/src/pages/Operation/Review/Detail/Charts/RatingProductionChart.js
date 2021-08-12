/*
 * @Author: wjw
 * @Date: 2020-08-07 16:47:45
 * @LastEditTime: 2020-09-08 17:36:33
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\Detail\Charts\RatingProduction.js
 */

import React, { useState } from 'react';
import { Radio, Button, Empty, Card } from 'antd';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
import { connect } from 'dva';
import useCharts from '@/customHook/useCharts';
import KeepDecimals from './KeepDecimals';

const RatingProductionChart = props => {
  const { dispatch, filters, currentId, loading } = props;
  const [sorter, setSorter] = useState({});
  const ratingProductionData = useCharts({
    dispatch,
    type: 'review/getRatingProduction',
    payload: {
      filters,
      currentId,
      sorter,
    },
  });
  const ds = new DataSet();
  const dv = ds
    .createView()
    .source(ratingProductionData)
    .transform({
      type: 'percent',
      field: 'num', // 统计的值
      dimension: 'rating_str', // 每星的占比rating_str
      groupBy: ['name'], // 以不同产品类别为分组，每个分组内部各自统计占比
      as: 'percent', // 结果存储在percent字段
    });
  const cols = {
    percent: {
      formatter: val => KeepDecimals(val),
    },
  };
  return (
    <Card bordered={false} bodyStyle={{ padding: 0 }} loading={loading}>
      {ratingProductionData.length > 0 ? (
        <>
          <div style={{ padding: '0 0 20px 50px' }}>
            <h2>评论、星评统计</h2>
            <div>
              <Radio.Group
                value={sorter.field}
                onChange={e => setSorter({ field: e.target.value })}
                buttonStyle="solid"
              >
                <Radio.Button value="all">评论总数</Radio.Button>
                <Radio.Button value="5星">5星评数</Radio.Button>
                <Radio.Button value="4星">4星评数</Radio.Button>
                <Radio.Button value="3星">3星评数</Radio.Button>
                <Radio.Button value="2星">2星评数</Radio.Button>
                <Radio.Button value="1星">1星评数</Radio.Button>
              </Radio.Group>
              <Button style={{ marginLeft: '20px' }} onClick={() => setSorter({})}>
                重置
              </Button>
            </div>
          </div>
          <Chart height={400} data={dv} scale={cols} forceFit padding={[20, 50, 70]}>
            <Legend clickable={false} hoverable={false} />
            <Axis name="name" />
            <Axis name="percent" />
            <Tooltip
              useHtml
              htmlContent={(title, list) => {
                const [fiveStar, fourStar, threeStar, twoStar, oneStar] = list;
                const {
                  point: {
                    _origin: { avg_rating, all_num, num: fiveNum, percent: fivePercent },
                  },
                } = fiveStar;
                const {
                  point: {
                    _origin: { num: fourNum, percent: fourPercent },
                  },
                } = fourStar;
                const {
                  point: {
                    _origin: { num: threeNum, percent: threePercent },
                  },
                } = threeStar;
                const {
                  point: {
                    _origin: { num: twoNum, percent: twoPercent },
                  },
                } = twoStar;
                const {
                  point: {
                    _origin: { num: oneNum, percent: onePercent },
                  },
                } = oneStar;

                return `
                <div style='position: absolute; visibility: hidden; z-index: 8; transition: visibility 0.2s cubic-bezier(0.23, 1, 0.32, 1) 0s, left 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s, top 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s; background-color: rgba(255, 255, 255, 0.9); box-shadow: rgb(174, 174, 174) 0px 0px 10px; border-radius: 3px; color: rgb(87, 87, 87); font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimSun, sans-serif; line-height: 20px; padding: 10px 10px 6px; left: 264px; top: 283.609px; display: none;'>
                  <p>${title}</p>
                  <p style='margin: 5px 0'>平均星评: ${avg_rating}</p>
                  <p style='margin: 5px 0'>评论总数: ${all_num}</p>
                  <ul style='padding: 0'>
                    <li style='margin: 5px 0'>
                      <span style='width: 8px; height: 8px; background-color: #3aa1ff; display: inline-block;'></span>
                      <span style='margin-left: 5px'>5星: </span>
                      <span style='margin-left: 5px'>${fiveNum}</span>
                      <span style='margin-left: 5px'>${KeepDecimals(fivePercent)}</span>
                    </li>
                    <li style='margin: 5px 0'>
                      <span style='width: 8px; height: 8px; background-color: #36cbcb; display: inline-block;'></span>
                      <span style='margin-left: 5px'>4星: </span>
                      <span style='margin-left: 5px'>${fourNum}</span>
                      <span style='margin-left: 5px'>${KeepDecimals(fourPercent)}</span>
                    </li>
                    <li style='margin: 5px 0'>
                      <span style='width: 8px; height: 8px; background-color: #4ecb73; display: inline-block;'></span>
                      <span style='margin-left: 5px'>3星: </span>
                      <span style='margin-left: 5px'>${threeNum}</span>
                      <span style='margin-left: 5px'>${KeepDecimals(threePercent)}</span>
                    </li>
                    <li style='margin: 5px 0'>
                      <span style='width: 8px; height: 8px; background-color: #fbd437; display: inline-block;'></span>
                      <span style='margin-left: 5px'>2星: </span>
                      <span style='margin-left: 5px'>${twoNum}</span>
                      <span style='margin-left: 5px'>${KeepDecimals(twoPercent)}</span>
                    </li>
                    <li style='margin: 5px 0'>
                      <span style='width: 8px; height: 8px; background-color: #f2637b; display: inline-block;'></span>
                      <span style='margin-left: 5px'>1星: </span>
                      <span style='margin-left: 5px'>${oneNum}</span>
                      <span style='margin-left: 5px'>${KeepDecimals(onePercent)}</span>
                    </li>
                  </ul>
                </div>
              `;
              }}
            />
            <Geom
              type="intervalStack"
              position="name*num"
              color={['rating_str', ['#3aa1ff', '#36cbcb', '#4ecb73', '#fbd437', '#f2637b']]}
            >
              {/* <Label
                content="all_num"
                formatter={(text, item) => {
                  const {
                    point: { avg_rating, rating },
                  } = item;
                  if (rating !== 5) {
                    return null;
                  }
                  return `平均星评: ${avg_rating}\r\n评论总数: ${text}`;
                }}
              /> */}
            </Geom>
          </Chart>
        </>
      ) : (
        <Empty />
      )}
    </Card>
  );
};

export default connect(({ loading }) => ({
  loading: loading.effects['review/getRatingProduction'],
}))(RatingProductionChart);
