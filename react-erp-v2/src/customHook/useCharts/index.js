/*
 * @Author: wjw
 * @Date: 2020-08-10 09:57:22
 * @LastEditTime: 2020-08-25 09:43:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\customHook\useCharts\index.js
 */

import { useState, useEffect } from 'react';
import useIsUnMountedRef from '@/customHook/useIsUnMountedRef';

const useCharts = props => {
  const {
    dispatch,
    type,
    payload: { currentId, filters, sorter },
  } = props;
  // 用于判断组件是否卸载 从而是否需要触发setState
  const isUnMountedRef = useIsUnMountedRef();
  const [chartData, setChartData] = useState([]);
  useEffect(() => {
    if (currentId) {
      const getTrendChart = () => {
        dispatch({
          type,
          payload: {
            filters,
            currentId,
            sorter,
          },
          callback: data => {
            if (!isUnMountedRef.current) {
              setChartData(data);
            }
          },
        });
      };
      getTrendChart();
    }
  }, [dispatch, currentId, filters, type, sorter, isUnMountedRef]);
  return chartData;
};

export default useCharts;
