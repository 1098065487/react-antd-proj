/*
 * @Author: wjw
 * @Date: 2020-08-06 09:33:30
 * @LastEditTime: 2020-09-23 17:28:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\ReviewDetail\index.js
 */

import React, { useEffect, useMemo, useImperativeHandle, cref } from 'react';
import { connect } from 'dva';
import { Card, Popover } from 'antd';
import useInitTable from '@/customHook/useInitTable';
// 表格公用组件
import StandardTable from '@/components/StandardTable';
// 获取跳转连接公共方法
import { getLinkSuffix } from '@/utils/utils';
import styles from './index.less';

const rating = [
  { text: '1', value: '1' },
  { text: '2', value: '2' },
  { text: '3', value: '3' },
  { text: '4', value: '4' },
  { text: '5', value: '5' },
];

const setFilterList = list => {
  return list.map(item => ({ text: item, value: item }));
};

const ReviewDetail = props => {
  const { dispatch, loading, reviewList, watchProductId, dateRange, sizeList, colorList } = props;
  const initTableData = useMemo(() => ({}), []);
  const {
    pagination,
    setPagination,
    filters,
    setFilters,
    sorter,
    setSorter,
    getTableList,
    handleStandardTableChange,
  } = useInitTable(initTableData); // 自定义table hook

  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(cref, () => ({
    // setPagination 就是暴露给父组件的方法
    setPagination,
  }));

  // 当选中的产品或者时间范围变化时
  useEffect(() => {
    setFilters({ range: dateRange, product: watchProductId });
    setPagination(prePagination => ({ ...prePagination, current: 1 }));
    setSorter({});
  }, [dateRange, watchProductId, setFilters, setPagination, setSorter]);

  // 获取评论列表
  useEffect(() => {
    if (filters?.product && filters?.range?.length) {
      getTableList({
        dispatch,
        type: 'competitor/getReviewList',
        payload: { pagination, filters, sorter, with: 'product' },
      });
    }
  }, [dispatch, getTableList, pagination, sorter, filters]);

  useEffect(() => {
    if (watchProductId) {
      // 获取尺码列表
      dispatch({
        type: 'competitor/getProductSizeList',
        payload: {
          filters: { product: watchProductId },
        },
      });
      // 获取颜色列表
      dispatch({
        type: 'competitor/getProductColorList',
        payload: {
          filters: { product: watchProductId },
        },
      });
    }
  }, [dispatch, watchProductId]);

  const columns = [
    {
      title: '星评',
      dataIndex: 'rating',
      filters: rating,
      filteredValue: filters.rating || [],
      align: 'center',
    },
    {
      title: '标题',
      dataIndex: 'title',
      align: 'center',
      render: (text, record) => {
        const {
          product: { platform_id, asin },
          detail_link,
        } = record;
        if (detail_link) {
          return (
            <a href={detail_link} target="_blank" rel="noopener noreferrer">
              {text}
            </a>
          );
        }
        const { suffix, flag } = getLinkSuffix(platform_id, asin);
        return flag ? (
          <a
            href={`https://www.amazon.${suffix}/dp/${asin}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {text}
          </a>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: '留言人',
      dataIndex: 'username',
      align: 'center',
    },
    {
      title: '时间',
      dataIndex: 'date',
      align: 'center',
      sorter: true,
      sortOrder: sorter.columnKey === 'date' && sorter.order,
    },
    {
      title: '尺寸',
      dataIndex: 'size',
      align: 'center',
      filters: setFilterList(sizeList),
      filteredValue: filters.size || [],
    },
    {
      title: '颜色',
      dataIndex: 'color',
      align: 'center',
      filters: setFilterList(colorList),
      filteredValue: filters.color || [],
    },
    {
      title: '内容',
      dataIndex: 'content',
      width: '400px',
      align: 'center',
      render: text => (
        <Popover content={<div className={styles.popWrap}>{text}</div>}>
          <span className={styles.ellipsis}>{text}</span>
        </Popover>
      ),
    },
  ];

  return (
    <Card bodyStyle={{ padding: '10px' }} style={{ marginTop: '20px' }}>
      <h4 style={{ fontWeight: '600', fontSize: '18px', color: 'rgba(0,0,0,0.75)' }}>评论详情</h4>
      <StandardTable
        columns={columns}
        dataSource={reviewList}
        loading={loading}
        onChange={handleStandardTableChange}
      />
    </Card>
  );
};

export default connect(({ loading, competitor: { reviewList, sizeList, colorList } }) => ({
  loading: loading.effects['competitor/getReviewList'],
  reviewList,
  sizeList,
  colorList,
}))(ReviewDetail);
