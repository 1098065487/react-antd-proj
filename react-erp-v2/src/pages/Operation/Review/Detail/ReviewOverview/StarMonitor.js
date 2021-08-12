/*
 * @Author: your name
 * @Date: 2020-08-21 15:20:30
 * @LastEditTime: 2020-08-25 10:44:43
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\Detail\ReviewOverview\StarMonitor.js
 */
import React, { useState, useEffect, lazy, useImperativeHandle } from 'react';
import { Pagination, Card } from 'antd';
import { connect } from 'dva';
import useIsUnMountedRef from '@/customHook/useIsUnMountedRef';

const StarMonitorChart = lazy(() => import('../Charts/StarMonitorChart.js'));
const StarMonitor = props => {
  // 用于判断组件是否卸载 从而是否需要触发setState
  const isUnMountedRef = useIsUnMountedRef();
  const { dispatch, filters, currentId, loading, cref } = props;
  const defaultCurrent = 1;
  const defaultPageSize = 10;
  const pageSizeOption = ['10', '20', '30', '40'];
  const [pagination, setPagination] = useState({
    current: defaultCurrent,
    pageSize: defaultPageSize,
  });
  const [starMonitorList, setStarMonitorList] = useState({});
  useEffect(() => {
    if (currentId) {
      const getChartList = () => {
        dispatch({
          type: 'review/getStarMonitor',
          payload: {
            filters,
            currentId,
            pagination,
          },
          callback: data => {
            if (!isUnMountedRef.current) {
              setStarMonitorList(data);
            }
          },
        });
      };
      getChartList();
    }
  }, [dispatch, filters, currentId, pagination, isUnMountedRef]);

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
    <Card bordered={false} bodyStyle={{ padding: 0 }} loading={loading}>
      {starMonitorList?.data?.length > 0 ? (
        <>
          <h2 style={{ padding: '10px 0 0 50px' }}>星评监控</h2>
          {starMonitorList?.data.map(product => (
            <StarMonitorChart key={product.attr} dataSource={product} attr={product.attr} />
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
      ) : null}
    </Card>
  );
};

export default connect(({ loading }) => ({ loading: loading.effects['review/getStarMonitor'] }))(
  StarMonitor
);
