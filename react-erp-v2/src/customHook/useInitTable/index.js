/*
 * @Author: wjw
 * @Date: 2020-07-28 11:10:40
 * @LastEditTime: 2020-09-15 17:04:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Production\_Factory\useTable\index.js
 */

import { useState, useCallback, useMemo } from 'react';

const useInitTable = ({ initPagination, initFilters, initSorter }) => {
  const memoPagination = useMemo(() => ({ current: 1, pageSize: 20 }), []);
  const memoFilters = useMemo(() => ({}), []);
  const memoSorter = useMemo(() => ({}), []);
  const tablePagination = initPagination || memoPagination;
  const tableFilters = initFilters || memoFilters;
  const tableSorter = initSorter || memoSorter;
  const [pagination, setPagination] = useState(tablePagination); // 分页属性
  const [filters, setFilters] = useState(tableFilters); // 过滤属性
  const [sorter, setSorter] = useState(tableSorter); // 排序属性

  /**
   * @description: 获取表格数据
   * @return: void
   */
  const getTableList = useCallback(({ dispatch, type, payload }) => {
    dispatch({
      type,
      payload,
    });
  }, []);

  /**
   * @description: 表格current,pageSize,sorter,filter变化 会触发该方法
   * @param {object} pagination 当前分页属性
   * @param {object} sorters 当前排序
   * @return: void
   */
  const handleStandardTableChange = useCallback(
    (newPagination, newFilters, newSorter) => {
      const { column } = newSorter;
      setPagination(prePagination => {
        // 当页码或者pageSize变的时候代表是分页触发了  当页码没变代表排序或者筛选触发了  则把页码变到第一页
        const { current: preCurrent, pageSize: prePageSize } = prePagination;
        const { current: nowCurrent, pageSize: nowPageSize } = newPagination;
        if (preCurrent === nowCurrent && prePageSize === nowPageSize) {
          return { ...prePagination, current: 1 };
        }
        return { ...prePagination, ...newPagination };
      });

      // 判断是否存在filter变化
      if (Object.keys(newFilters).length) {
        setFilters(preFilters => {
          // 如果filter没变那么直接返回原来的filters即可
          if (JSON.stringify(preFilters) === JSON.stringify(newFilters)) {
            return preFilters;
          }
          return { ...preFilters, ...newFilters };
        });
      }

      // 判断是否存在排序
      if (column) {
        setSorter(preSorter => ({ ...preSorter, ...newSorter }));
      } else {
        setSorter(tableSorter);
      }
    },
    [tableSorter]
  );

  /**
   * @description: 处理搜索
   * @param {string} type 用于判断是搜索还是重置
   * @return: void
   */
  const handleSearch = useCallback(
    (searchType, validateFieldsAndScroll, resetFields) => {
      setPagination(prePagination => ({ ...prePagination, current: 1 }));
      if (searchType === 'submit') {
        validateFieldsAndScroll((err, values) => {
          if (err) {
            return;
          }
          setFilters(preFilters => ({ ...preFilters, ...values }));
        });
      } else if (searchType === 'reset') {
        resetFields();
        setSorter(tableSorter);
        setFilters(tableFilters);
      }
    },
    [tableFilters, tableSorter]
  );

  return {
    pagination,
    setPagination,
    filters,
    setFilters,
    sorter,
    setSorter,
    getTableList,
    handleStandardTableChange,
    handleSearch,
  };
};

export default useInitTable;
