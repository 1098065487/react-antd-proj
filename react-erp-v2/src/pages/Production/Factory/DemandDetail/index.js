/*
 * @Author: wjw
 * @Date: 2020-07-27 17:15:39
 * @LastEditTime: 2020-08-11 17:11:53
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Production\_Factory\DemandDetail\index.js
 */

import React, { useEffect, useState, useImperativeHandle, useMemo } from 'react';
import { connect } from 'dva';
import { Input, Button, Card } from 'antd';
// 表格公用组件
import StandardTable from '@/components/StandardTable';
import useInitTable from '@/customHook/useInitTable';

const { Search } = Input;
// props子组件中需要接受ref
const DemandDetail = props => {
  const [searchValue, setSearchValue] = useState();
  const {
    loading,
    demandDetail: { id: demandId = '', sn: demandSn = '' },
    setDemandDetail,
    demandDetailList,
    dispatch,
    cref,
  } = props;
  const initTableData = useMemo(() => ({}), [])
  const {
    pagination,
    setPagination,
    filters,
    setFilters,
    getTableList,
    handleStandardTableChange,
  } = useInitTable(initTableData); // 自定义table hook

  useEffect(() => {
    if (demandId) {
      getTableList({
        dispatch,
        type: '_factory/getDemandDetail',
        payload: { demandDetail: demandId, pagination, filters },
      });
    }
  }, [demandId, pagination, filters, getTableList, dispatch]);

  /**
   * @description: 关闭详情页 初始化所有数据
   * @return: void
   */
  const closeDetail = () => {
    setDemandDetail({});
    setPagination({ current: 1, pageSize: 20 });
    setFilters({});
    setSearchValue();
    dispatch({
      type: '_factory/save',
      payload: { demandDetailList: {} }
    })
  };

  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(cref, () => ({
    // closeDemandDetail 就是暴露给父组件的方法
    closeDetail,
  }));

  // 渲染表格列
  const columns = [
    { title: '需求单号', dataIndex: 'sn' },
    { title: '单品sku', dataIndex: 'sku' },
    { title: '下单数量', dataIndex: 'factory_qty' },
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
          placeholder="单品SKU"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onSearch={value => setFilters({ keywords: value })}
        />
      </header>
      <Card>
        <StandardTable
          scroll={{
            y: window.innerHeight - 65 - 52 - 24 * 4 - 44.5 - 59,
          }}
          loading={loading}
          columns={columns}
          dataSource={demandDetailList}
          rowSelection={null}
          onChange={handleStandardTableChange}
        />
      </Card>

      <footer style={{ textAlign: 'right', marginTop: '20px' }}>
        <Button size="large" onClick={closeDetail}>
          取消
        </Button>
      </footer>
    </>
  );
};

// DemandDetail = forwardRef(DemandDetail)

export default connect(({ loading, _factory: { demandDetailList } }) => ({
  demandDetailList,
  loading: loading.effects['_factory/getDemandDetail'],
}))(DemandDetail);
