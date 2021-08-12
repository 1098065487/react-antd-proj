/*
 * @Author: wjw
 * @Date: 2020-07-20 13:15:30
 * @LastEditTime: 2020-08-03 10:11:18
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Production\_Factory\Statistics\index.js
 */
import React from 'react';
import style from './index.less';

const Statistics = props => {
  const {
    dataStatistics: { leftData, rightData },
  } = props;
  return leftData ? (
    <>
      <div className={style.statistics}>
        <div className={style['statistics-left']}>
          {leftData.map(item => (
            <div key={item.name}>
              <p className={style['statistics-info']}>{item.value}</p>
              <p className={style['statistics-info']}>{item.name}</p>
            </div>
          ))}
        </div>
        <div className={style['statistics-right']}>
          <div>
            {rightData.map(item => (
              <div key={item.name}>
                <p className={style['statistics-info']}>{item.value}</p>
                <p className={style['statistics-info']}>{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  ) : null;
};
export default Statistics;
