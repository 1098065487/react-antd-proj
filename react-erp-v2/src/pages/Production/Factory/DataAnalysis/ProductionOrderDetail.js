/*
 * @Author: wjw
 * @Date: 2020-07-22 14:20:55
 * @LastEditTime: 2020-09-15 17:07:02
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Production\_Factory\DataAnalysis\Production.js
 */
import React, { useEffect } from 'react';
import { connect } from 'dva';
// 表格公用组件
import StandardTable from '@/components/StandardTable';

const ProductionOrderDetail = props => {
  const {
    pagination,
    filters,
    sorter,
    loading,
    _productionDetailList,
    getTableList,
    handleStandardTableChange,
    dispatch,
  } = props;

  useEffect(() => {
    getTableList({
      dispatch,
      type: '_factory/get_ProductionDetail',
      payload: { pagination, filters, sorter },
    });
  }, [pagination, filters, sorter, getTableList, dispatch]);

  const statusList = [
    { status: 'create', value: '待生产' },
    { status: 'producting', value: '生产中' },
    { status: 'finished', value: '生产完成' },
    { status: 'cancelled', value: '生产终止' },
  ];

  // 渲染表格列
  const columns = [
    {
      title: '需求单号',
      dataIndex: 'demandSn',
      render: (_, record) => record.factory_order?.sn,
      // sorter: true,
      // sortOrder: sorter.columnKey === 'demandSn' && sorter.order,
      width: '150px',
      fixed: true,
    },
    {
      title: '生产单号',
      dataIndex: 'productionSn',
      render: (_, record) => record.production?.sn,
      // sorter: true,
      // sortOrder: sorter.columnKey === 'productionSn' && sorter.order,
      width: '150px',
    },
    {
      title: '单品sku',
      dataIndex: 'product_item_sku',
      render: (_, record) => record.product_item?.sku,
      // sorter: true,
      // sortOrder: sorter.columnKey === 'product_item_sku' && sorter.order,
      width: '220px',
    },
    {
      title: '产品线',
      dataIndex: 'category_name',
      render: (_, record) => record.category?.name,
      // sorter: true,
      // sortOrder: sorter.columnKey === 'category_name' && sorter.order,
      width: '150px',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: text => {
        const { value } = statusList.find(item => item.status === text) || { value: '' };
        let color = '#1890FF';
        if (value === '待生产') {
          color = '#a7a7a7';
        } else if (value === '生产完成') {
          color = '#20c5c5';
        } else if (value === '生产终止') {
          color = '#f7515a';
        }
        return <span style={{ color }}>{value}</span>;
      },
      // sorter: true,
      // sortOrder: sorter.columnKey === 'status' && sorter.order,
      width: '100px',
    },
    {
      title: '实际完成量/下单数量',
      dataIndex: 'actual_qty_div_order_qty',
      render: text => `${Math.round(text * 100)}%`,
      // sorter: true,
      // sortOrder: sorter.columnKey === 'actual_qty_div_order_qty' && sorter.order,
      width: '180px',
    },
    {
      title: '实际完成量/接单数量',
      dataIndex: 'finished_rate',
      render: text => `${Math.round(text * 100)}%`,
      // sorter: true,
      // sortOrder: sorter.columnKey === 'finished_rate' && sorter.order,
      width: '180px',
    },
    { title: '下单数量', dataIndex: 'order_qty', width: '100px' },
    { title: '接单数量', dataIndex: 'qty', width: '100px' },
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
    { title: '实际完成量', dataIndex: 'finished_qty', width: '100px' },
    {
      title: '下单日期',
      dataIndex: 'order_date',
      render: (_, record) => record?.factory_order?.order_date,
      width: '130px',
    },
    {
      title: '预计交付日',
      dataIndex: 'expect_finished_at',
      // sorter: true,
      // sortOrder: sorter.columnKey === 'expect_finished_at' && sorter.order,
      width: '130px',
    },
    { title: '逾期天数', dataIndex: 'over_days', width: '100px' },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      // sorter: true,
      // sortOrder: sorter.columnKey === 'updated_at' && sorter.order,
      width: '170px',
    },
    {
      title: '完成时间',
      dataIndex: 'actual_finished_at',
      // sorter: true,
      // sortOrder: sorter.columnKey === 'actual_finished_at' && sorter.order,
      width: '170px',
    },
    {
      title: '工厂SKU',
      dataIndex: 'factory_product_item_sku',
      render: (_, record) => record.factory_product_item?.sku,
      width: '130px',
    },
    { title: '生产车间', dataIndex: 'workshop', width: '150px' },
    { title: '品牌', dataIndex: 'brand', width: '100px' },
    { title: '品名', dataIndex: 'title', width: '100px' },
  ];

  return (
    <>
      <StandardTable
        scroll={{
          y: 700,
          x: '150vw',
          scrollToFirstRowOnChange: true,
        }}
        loading={loading}
        columns={columns}
        dataSource={_productionDetailList}
        rowSelection={null}
        onChange={handleStandardTableChange}
      />
    </>
  );
};

export default connect(({ loading, _factory: { _productionDetailList } }) => ({
  _productionDetailList,
  loading: loading.effects['_factory/get_ProductionDetail'],
}))(ProductionOrderDetail);
