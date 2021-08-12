/*
 * @Author: wjw
 * @Date: 2020-07-22 14:21:36
 * @LastEditTime: 2020-08-07 10:21:24
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Production\_Factory\DataAnalysis\SkuDetail.js
 */
import React, { useEffect } from 'react';
import { connect } from 'dva';
// 表格公用组件
import StandardTable from '@/components/StandardTable';

const SkuDetail = props => {
  const {
    pagination,
    filters,
    loading,
    skuDetailList,
    getTableList,
    handleStandardTableChange,
    dispatch,
  } = props;

  useEffect(() => {
    getTableList({ dispatch, type: '_factory/getSkuDetail', payload: { pagination, filters } });
  }, [pagination, filters, dispatch, getTableList]);

  // 渲染表格列
  const columns = [
    { title: '单品sku', dataIndex: 'sku', width: '220px', fixed: true },
    { title: '产品线', dataIndex: 'category', width: '150px' },
    {
      title: '实际完成量/下单数量',
      dataIndex: 'actual_qty_div_order_qty',
      render: text => `${Math.round(text * 100)}%`,
      width: '180px',
    },
    {
      title: '实际完成量/接单数量',
      dataIndex: 'actual_qty_div_pick_qty',
      render: text => `${Math.round(text * 100)}%`,
      width: '180px',
    },
    { title: '需求单数量', dataIndex: 'order_count', width: '100px' },
    { title: '生产单数量', dataIndex: 'production_count', width: '100px' },
    { title: '生产车间数量', dataIndex: 'workshop_count', width: '110px' },
    { title: '下单数量', dataIndex: 'order_qty', width: '100px' },
    { title: '接单数量', dataIndex: 'pick_qty', width: '100px' },
    {
      title: '短溢装数量',
      dataIndex: 'lack_over_qty',
      width: '100px',
      render: text => {
        let color = 'rgba(0,0,0,0.65)';
        if (text > 0) {
          color = '#20c5c5';
        } else if (text < 0) {
          color = '#f7515a';
        }
        return <span style={{ color }}>{text}</span>;
      },
    },
    { title: '生产未完成量', dataIndex: 'unfinished_qty', width: '110px' },
    { title: '实际完成量', dataIndex: 'actual_qty', width: '100px' },
    { title: '品牌', dataIndex: 'brand', width: '100px' },
    { title: '品名', dataIndex: 'title', width: '100px' },
  ];

  return (
    <>
      <StandardTable
        scroll={{
          y: 700,
          x: '100vw',
          scrollToFirstRowOnChange: true,
        }}
        loading={loading}
        columns={columns}
        dataSource={skuDetailList}
        rowSelection={null}
        rowKey="sku"
        onChange={handleStandardTableChange}
      />
    </>
  );
};

export default connect(({ loading, _factory: { skuDetailList } }) => ({
  skuDetailList,
  loading: loading.effects['_factory/getSkuDetail'],
}))(SkuDetail);
