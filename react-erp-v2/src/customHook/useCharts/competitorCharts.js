/*
 * @Author: wjw
 * @Date: 2020-08-10 09:57:22
 * @LastEditTime: 2020-09-21 09:38:27
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
    payload: { filters, sorter, productId },
  } = props;
  // 用于判断组件是否卸载 从而是否需要触发setState
  const isUnMountedRef = useIsUnMountedRef();
  const [chartData, setChartData] = useState([]);
  useEffect(() => {
    if (filters?.range?.length && productId) {
      const getChart = () => {
        dispatch({
          type,
          payload: {
            filters,
            sorter,
            productId,
          },
          callback: data => {
            if (!isUnMountedRef.current) {
              setChartData(data);
            }
          },
        });
      };
      getChart();
    }
  }, [dispatch, filters, type, sorter, isUnMountedRef, productId]);
  return chartData;
};

export default useCharts;
