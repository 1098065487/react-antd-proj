/*
 * @Author: wjw
 * @Date: 2020-07-21 15:17:28
 * @LastEditTime: 2020-09-15 17:05:59
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Production\_Factory\ProductionDetail\index.js
 */
import React, { useState, useEffect, useImperativeHandle, useMemo } from 'react';
import { connect } from 'dva';
import { Input, Button, Card, Popover } from 'antd';
// 表格公用组件
import StandardTable from '@/components/StandardTable';
// 自定义table hook
import useInitTable from '@/customHook/useInitTable';
// 修改记录详情组件
import UpdateRecord from './UpdateRecord';
import styles from './index.less';

const { Search } = Input;
const ProductionDetail = props => {
  // const [currProductionOrder, setCurrProductionOrder] = useState(); // 当前生产单号
  const [searchValue, setSearchValue] = useState();
  const {
    loading,
    productionDetail: { id: demandId = '', sn: demandSn = '' },
    setProductionDetail,
    productionDetailList,
    dispatch,
    cref,
  } = props;
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

  useEffect(() => {
    if (demandId) {
      getTableList({
        dispatch,
        type: '_factory/getProductionDetail',
        payload: { productionDetail: demandId, pagination, filters, sorter },
      });
    }
  }, [demandId, pagination, filters, sorter, dispatch, getTableList]);

  /**
   * @description: 处理查看修改记录
   * @return: void
   */
  // const handleActions = type => {
  //   if (type === 'updateRecord') {
  //     dispatch({
  //       type: '_factory/getNewDemand',
  //       payload: {},
  //       callback: () => {
  //         setProductionDetail(11121);
  //       },
  //     });
  //   }
  // };

  /**
   * @description: 关闭详情页 初始化所有数据
   * @return: void
   */
  const closeDetail = () => {
    setProductionDetail({});
    setPagination({ current: 1, pageSize: 20 });
    setFilters({});
    setSorter({});
    setSearchValue();
    dispatch({
      type: '_factory/save',
      payload: { productionDetailList: {} },
    });
  };
  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(cref, () => ({
    // closeDemandDetail 就是暴露给父组件的方法
    closeDetail,
  }));
  // 渲染表格列
  const columns = [
    {
      title: '生产单号',
      dataIndex: 'sn',
      // sorter: true,
      // sortOrder: sorter.columnKey === 'sn' && sorter.order,
      width: '150px',
      fixed: true,
    },
    {
      title: '单品sku',
      dataIndex: 'product_item_sku',
      // sorter: true,
      // sortOrder: sorter.columnKey === 'product_item_sku' && sorter.order,
      width: '220px',
    },
    {
      title: '产品线',
      dataIndex: 'category_name',
      // sorter: true,
      // sortOrder: sorter.columnKey === 'category_name' && sorter.order,
      width: '150px',
    },
    {
      title: '状态',
      dataIndex: 'status_str',
      render: text => {
        let color = '#1890FF';
        if (text === '待生产') {
          color = '#a7a7a7';
        } else if (text === '生产完成') {
          color = '#20c5c5';
        } else if (text === '生产终止') {
          color = '#f7515a';
        }
        return <span style={{ color }}>{text}</span>;
      },
      // sorter: true,
      // sortOrder: sorter.columnKey === 'status_str' && sorter.order,
      width: '100px',
    },
    {
      title: '实际完成量/下单数量',
      dataIndex: 'factory_rate_str',
      // sorter: true,
      // sortOrder: sorter.columnKey === 'factory_rate_str' && sorter.order,
      width: '180px',
    },
    {
      title: '实际完成量/接单数量',
      dataIndex: 'finished_rate_str',
      // sorter: true,
      // sortOrder: sorter.columnKey === 'finished_rate_str' && sorter.order,
      width: '180px',
    },
    { title: '下单数量', dataIndex: 'factory_qty', width: '100px' },
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
    { title: '下单日期', dataIndex: 'order_date', width: '130px' },
    {
      title: '预计交付日',
      dataIndex: 'expect_finished_at',
      // sorter: true,
      // sortOrder: sorter.columnKey === 'expect_finished_at' && sorter.order,
      width: '130px',
    },
    { title: '逾期天数', dataIndex: 'over_time', width: '100px' },
    { title: '更新时间', dataIndex: 'updated_at', width: '170px' },
    {
      title: '完成时间',
      dataIndex: 'actual_finished_at',
      // sorter: true,
      // sortOrder: sorter.columnKey === 'actual_finished_at' && sorter.order,
      width: '170px',
    },
    { title: '工厂SKU', dataIndex: 'factory_product_item_sku', width: '130px' },
    { title: '生产车间', dataIndex: 'workshop', width: '150px' },
    { title: '品牌', dataIndex: 'brand_name', width: '100px' },
    { title: '品名', dataIndex: 'title', width: '100px' },
    {
      title: '备注',
      dataIndex: 'remark',
      width: '300px',
      align: 'center',
      render: text => (
        <Popover content={<div className={styles.popWrap}>{text}</div>}>
          <span className={styles.ellipsis}>{text}</span>
        </Popover>
      ),
    },
    // {
    //   title: '修改记录',
    //   render: (_, record) => (
    //     <Button
    //       size="small"
    //       icon="eye"
    //       title="查看详情"
    //       onClick={() => handleActions('updateRecord')}
    //     />
    //   ),
    //   width: '200px',
    // },
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
        <span style={{ fontSize: '20px' }}>{demandSn}</span>
        <Search
          style={{ width: '300px' }}
          placeholder="单品SKU、工厂SKU搜索"
          value={searchValue}
          onChange={e => {
            setSearchValue(e.target.value);
          }}
          onSearch={value => setFilters({ sku: value })}
        />
      </header>
      <Card>
        <StandardTable
          scroll={{
            y: window.innerHeight - 65 - 52 - 24 * 4 - 44.5 - 59,
            x: '150vw',
            scrollToFirstRowOnChange: true,
          }}
          loading={loading}
          columns={columns}
          dataSource={productionDetailList}
          rowSelection={null}
          onChange={handleStandardTableChange}
        />
        <UpdateRecord />
      </Card>

      <footer style={{ textAlign: 'right', marginTop: '20px' }}>
        <Button size="large" onClick={closeDetail}>
          取消
        </Button>
      </footer>
    </>
  );
};

export default connect(({ loading, _factory: { productionDetailList } }) => ({
  productionDetailList,
  loading: loading.effects['_factory/getProductionDetail'],
}))(ProductionDetail);
