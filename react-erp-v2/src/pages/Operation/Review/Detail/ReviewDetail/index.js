/*
 * @Author: wjw
 * @Date: 2020-08-06 09:33:30
 * @LastEditTime: 2020-09-23 17:34:14
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\ReviewDetail\index.js
 */

import React, { useEffect, useState, useMemo } from 'react';
import { connect } from 'dva';
import { DatePicker, Button, Card, Popover } from 'antd';
import useInitTable from '@/customHook/useInitTable';
// 表格公用组件
import StandardTable from '@/components/StandardTable';
import moment from 'moment';
// 获取跳转连接公共方法
import { getLinkSuffix } from '@/utils/utils';
import TrendChart from '../Charts/TrendChart';
import styles from './index.less';

const limitSelectDate = {
  min: moment().subtract(3, 'months'),
  max: moment(),
};

const { RangePicker } = DatePicker;
const ReviewDetail = props => {
  const [dateRange, setDateRange] = useState([limitSelectDate.min, limitSelectDate.max]);
  const {
    dispatch,
    loading,
    reviewDetailList,
    currentId,
    currentSku,
    platform_id,
    platform_sn,
  } = props;
  const initTableData = useMemo(
    () => ({
      initFilters: { range: [limitSelectDate.min, limitSelectDate.max] },
      initSorter: { field: 'date', order: 'desc' },
    }),
    []
  );
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

  useEffect(() => {
    if (currentId) {
      getTableList({
        dispatch,
        type: 'review/getReviewDetail',
        payload: { currentId, pagination, filters, sorter },
      });
    }
  }, [dispatch, getTableList, currentId, pagination, filters, sorter]);

  const columns = [
    {
      title: '星评',
      dataIndex: 'rating',
      sorter: true,
      sortOrder: sorter.columnKey === 'rating' && sorter.order,
      align: 'center',
    },
    {
      title: '标题',
      dataIndex: 'title',
      align: 'center',
      render: (text, record) => {
        const { detail_link } = record;
        if (detail_link) {
          return (
            <a href={detail_link} target="_blank" rel="noopener noreferrer">
              {text}
            </a>
          );
        }
        const { suffix, flag } = getLinkSuffix(platform_id, platform_sn);
        return flag ? (
          <a
            href={`https://www.amazon.${suffix}/dp/${platform_sn}`}
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
    },
    {
      title: '尺寸',
      dataIndex: 'size',
      align: 'center',
    },
    {
      title: '颜色',
      dataIndex: 'color',
      align: 'center',
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
    <>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '15px 0',
        }}
      >
        <h3>{currentSku}</h3>
        <div>
          <RangePicker
            allowClear={false}
            value={dateRange}
            onChange={dates => {
              setFilters({ range: dates });
              setDateRange(dates);
              setPagination({ ...pagination, current: 1 });
            }}
          />
          <Button
            style={{ marginLeft: '20px' }}
            onClick={() => {
              setFilters({ range: [limitSelectDate.min, limitSelectDate.max] });
              setDateRange([limitSelectDate.min, limitSelectDate.max]);
              setPagination({ current: 1, pageSize: 20 });
              setSorter({ field: 'date', order: 'desc' });
            }}
          >
            重置
          </Button>
        </div>
      </header>
      <TrendChart filters={filters} currentId={currentId} />
      <Card>
        <StandardTable
          columns={columns}
          dataSource={reviewDetailList}
          loading={loading}
          onChange={handleStandardTableChange}
        />
      </Card>
    </>
  );
};

export default connect(({ loading, review: { reviewDetailList } }) => ({
  loading: loading.effects['review/getReviewDetail'],
  reviewDetailList,
}))(ReviewDetail);
