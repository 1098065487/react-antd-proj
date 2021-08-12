/*
 * @Author: your name
 * @Date: 2020-08-21 15:20:30
 * @LastEditTime: 2020-09-23 18:23:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\Detail\ReviewOverview\StarMonitor.js
 */
import React, { useState, useEffect, lazy, useImperativeHandle, useRef } from 'react';
import { Pagination, Card, Empty } from 'antd';
import { connect } from 'dva';
import useIsUnMountedRef from '@/customHook/useIsUnMountedRef';

const StarMonitorChart = lazy(() => import('./Charts/StarMonitorChart.js'));
const StarMonitor = props => {
  const currentIdRef = useRef();
  // 用于判断组件是否卸载 从而是否需要触发setState
  const isUnMountedRef = useIsUnMountedRef();
  const { dispatch, dateRange, watchProductId, loading, cref } = props;
  const defaultCurrent = 1;
  const defaultPageSize = 10;
  const pageSizeOption = ['10', '20', '30', '40'];
  const [pagination, setPagination] = useState({
    current: defaultCurrent,
    pageSize: defaultPageSize,
  });
  const [starMonitorList, setStarMonitorList] = useState({});

  // 每当watchProductId改变时 修改ref的值  用于判断请求时的id和当前id是否相同 用ref是因为函数组件是闭包
  useEffect(() => {
    currentIdRef.current = watchProductId;
  }, [watchProductId]);

  useEffect(() => {
    if (dateRange.length && watchProductId) {
      const getChartList = () => {
        dispatch({
          type: 'competitor/getStarMonitorChart',
          payload: {
            filters: { range: dateRange },
            productId: watchProductId,
            pagination,
          },
          callback: data => {
            if (!isUnMountedRef.current) {
              // 如果参数的id等于当前的id
              if (watchProductId === currentIdRef.current) {
                setStarMonitorList(data);
              }
            }
          },
        });
      };
      getChartList();
    }
  }, [dispatch, watchProductId, pagination, dateRange, isUnMountedRef]);

  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(cref, () => ({
    // setPagination 就是暴露给父组件的方法
    setPagination,
  }));

  const handleSizeChange = (current, pageSize) => {
    setPagination({ current, pageSize });
  };

  const handleCurrentChange = (current, pageSize) => {
    setPagination({ current, pageSize });
  };

  return (
    <Card bordered={false} bodyStyle={{ padding: 0 }}>
      <h4
        style={{
          fontWeight: '600',
          fontSize: '18px',
          color: 'rgba(0,0,0,0.75)',
          padding: '5px 10px',
        }}
      >
        星评监控
      </h4>
      <Card bordered={false} bodyStyle={{ padding: 0 }} loading={loading}>
        {starMonitorList?.data?.length > 0 ? (
          <>
            {starMonitorList?.data.map((product, index) => (
              <StarMonitorChart
                key={product.attr + index}
                dataSource={product}
                attr={product.attr}
              />
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination
                size="small"
                total={starMonitorList?.meta?.pagination?.total}
                showTotal={total => <span>总计: {total}条</span>}
                showSizeChanger
                onShowSizeChange={handleSizeChange}
                onChange={handleCurrentChange}
                current={pagination.current}
                defaultCurrent={defaultCurrent}
                pageSize={pagination.pageSize}
                defaultPageSize={defaultPageSize}
                pageSizeOptions={pageSizeOption}
              />
            </div>
          </>
        ) : (
          <Empty />
        )}
      </Card>
    </Card>
  );
};

export default connect(({ loading }) => ({
  loading: loading.effects['competitor/getStarMonitorChart'],
}))(StarMonitor);
