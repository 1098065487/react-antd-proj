/*
 * @Author: wjw
 * @Date: 2020-07-20 13:15:30
 * @LastEditTime: 2021-01-05 14:06:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Production\_Factory\Statistics\index.js
 */
import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { keepOne } from '@/utils/utils';
import { StatisticsProps } from './statistics.d';
import styles from './index.less';

const getTrend = (value: number) => {
  if (value > 0) {
    return (
      <div
        className={styles.trend}
        style={{ color: 'var(--up-color)', backgroundColor: 'var(--up-bgc)' }}
      >
        <ArrowUpOutlined style={{ color: 'var(--up-color)' }} />
        <span>{keepOne(Math.abs(value))}</span>
      </div>
    );
  }
  return value < 0 ? (
    <div
      className={styles.trend}
      style={{ color: 'var(--down-color)', backgroundColor: 'var(--down-bgc)' }}
    >
      <ArrowDownOutlined style={{ color: 'var(--down-color)' }} />
      <span>{keepOne(Math.abs(value))}</span>
    </div>
  ) : null;
};

const Statistics: React.FC<StatisticsProps> = ({ statisticsData }) => {
  return (
    <div className={styles.statistics}>
      <div className={styles.statisticsItem}>
        <p>星评</p>
        <div className={styles.itemInfo}>
          {statisticsData?.rate_list?.length &&
            statisticsData.rate_list.map(({ rating, rating_change }, index) => {
              return (
                <div key={index}>
                  <span>{rating}</span>
                  {getTrend(rating_change)}
                </div>
              );
            })}
        </div>
      </div>

      <div className={styles.statisticsItem}>
        <p>评论数量</p>
        <div className={styles.itemInfo}>
          {statisticsData?.reviews_list?.length &&
            statisticsData.reviews_list.map(({ reviews, reviews_change }, index) => {
              return (
                <div key={index}>
                  <span>{reviews}</span>
                  {getTrend(reviews_change)}
                </div>
              );
            })}
        </div>
      </div>

      <div className={styles.statisticsItem}>
        <p>上架时间</p>
        <div className={styles.itemInfo}>
          {statisticsData?.available_date_list?.length &&
            statisticsData.available_date_list.map(({ available_date }, index) => {
              return (
                <div key={index}>
                  <span>{available_date}</span>
                </div>
              );
            })}
        </div>
      </div>

      <div className={styles.statisticsItem}>
        <p style={{ marginBottom: 10 }}>分类排名</p>
        {statisticsData?.rank_list?.length &&
          statisticsData.rank_list.map(({ classify_rank }, rankIndex) => {
            const rankRes =
              classify_rank?.length &&
              classify_rank.map((item, index) => {
                return <div key={index}>{item}</div>;
              });
            return <div key={rankIndex}>{rankRes || '暂无排名'}</div>;
          })}
      </div>

      <div className={styles.statisticsItem}>
        <p>Q&A数量</p>
        {statisticsData?.qa_list?.length &&
          statisticsData.qa_list.map(({ questions, answers }, index) => {
            return (
              <div key={index} className={styles.itemInfo}>
                {/* <div style={{ alignItems: 'flex-start' }}>Q数量: <span style={{ fontSize: 22, marginLeft: 4 }}>{question}</span></div>
                <div style={{ alignItems: 'flex-start' }}>A数量: <span style={{ fontSize: 22, marginLeft: 4 }}>{answer}</span></div> */}
                {questions}&{answers}
              </div>
            );
          })}
      </div>
    </div>
  );
};
export default Statistics;
