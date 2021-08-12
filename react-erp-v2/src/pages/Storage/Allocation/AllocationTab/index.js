/*
 * @Author: wjw
 * @Date: 2020-08-06 09:33:30
 * @LastEditTime: 2020-10-23 10:03:41
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\ReviewDetail\index.js
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'dva';
import { Card, Form, DatePicker, Button } from 'antd';
import useInitTable from '@/customHook/useInitTable';
import router from 'umi/router';
// 表格公用组件
import StandardTable from '@/components/StandardTable';
// 删除需求单组件
import DeleteDemand from './DeleteDemand';
// 增加需求单组件
import AddDemand from './AddDemand';
// 调拨单列表组件
import AllocationList from './AllocationList';
// 需求单详情组件
import DemandDetail from './DemandDetail';
// 目的地仓库list
import destinationList from '../destinationList';
import styles from './index.less';

const AllocationTab = props => {
  const isFirstMount = useRef(true);
  const deleteDemandRef = useRef();
  const addDemandRef = useRef();
  const [currentAllocationType, setCurrentAllocationType] = useState('');
  // 当前选中的需求单的id
  const [currentDemandId, setCurrentDemandId] = useState('');
  // 当前页所有需求单的id组成的数组
  const [demandsId, setDemandsId] = useState([]);
  const { dispatch, loading, demandList } = props;
  const initTableData = useMemo(
    () => ({
      initSorter: { field: 'id', order: 'desc' },
    }),
    []
  );
  const {
    pagination,
    setPagination,
    filters,
    sorter,
    getTableList,
    handleSearch,
    handleStandardTableChange,
  } = useInitTable(initTableData); // 自定义table hook

  // 获取需求单列表
  useEffect(() => {
    getTableList({
      dispatch,
      type: 'allocation/getDemandList',
      payload: { pagination, filters, sorter },
    });
  }, [dispatch, getTableList, pagination, sorter, filters]);

  // 如果需求单列表变化，那么需要重新获取调拨单列表和详情
  useEffect(() => {
    // 如果是第一次加载则直接返回，防止在tab切换时出现问题
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const { data } = demandList;
    if (data?.length > 0) {
      // 设置需求单的id数组
      setDemandsId(data.map(demand => demand.id));
      // 将第一条需求单的id设置为当前值
      setCurrentDemandId(data[0].id);
    }
  }, [demandList]);

  // 点击行设置当前需求单id
  const handleClickRow = id => {
    setCurrentDemandId(id);
  };

  // 处理管理点击事件
  const handleManage = ({ key, id }) => {
    if (key === 'export') {
      dispatch({
        type: 'system/createAnExport',
        payload: {
          type: 'transfer',
          dynamic: { id },
        },
      });
    } else if (key === 'delete') {
      deleteDemandRef.current.setDeleteId(id);
    }
  };

  // 重置表格
  const reset = () => {
    const {
      form: { validateFieldsAndScroll, resetFields },
    } = props;
    handleSearch('reset', validateFieldsAndScroll, resetFields);
  };

  // 渲染搜索表单
  const renderSearch = () => {
    const {
      form: { getFieldDecorator, validateFieldsAndScroll },
    } = props;
    return (
      <Form layout="inline">
        <Form.Item style={{ marginRight: '0' }}>
          {getFieldDecorator('range')(<DatePicker placeholder="下需求单日期" />)}
          <Button
            style={{ marginLeft: 8 }}
            type="primary"
            htmlType="submit"
            onClick={() => {
              handleSearch('submit', validateFieldsAndScroll);
            }}
          >
            搜索
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={reset}>
            重置
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => {
              addDemandRef.current.setVisible(true);
            }}
          >
            新建
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => {
              router.push('/excel/imports/create?type=transfer');
            }}
          >
            导入
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const columns = [
    {
      title: '需求单编号',
      dataIndex: 'id',
      align: 'center',
      width: '100px',
    },
    {
      title: '目的地仓库',
      dataIndex: 'warehouse_id',
      align: 'center',
      render: (_, record) => {
        return record?.warehouse?.name;
      },
      filters: destinationList,
      filteredValue: filters.warehouse_id || [],
      width: '110px',
    },
    {
      title: 'SKU总数',
      dataIndex: 'sku_num',
      align: 'center',
      width: '80px',
    },
    {
      title: '需求总数',
      dataIndex: 'quantity',
      align: 'center',
      width: '80px',
    },
    {
      title: '下单日期',
      dataIndex: 'date',
      align: 'center',
      width: '100px',
    },
    {
      align: 'center',
      width: '130px',
      render: (_, record) => {
        const { id } = record;
        return (
          <div>
            <span
              style={{
                cursor: 'pointer',
                padding: '0 10px',
                borderRight: '1px solid #bfbfbf',
                color: 'rgb(24, 144, 255)',
              }}
              onClick={e => {
                e.stopPropagation();
                handleManage({ key: 'export', id });
              }}
            >
              导出
            </span>
            <span
              style={{ cursor: 'pointer', padding: '0 10px', color: 'rgb(247, 81, 90)' }}
              onClick={e => {
                e.stopPropagation();
                handleManage({ key: 'delete', id });
              }}
            >
              删除
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div style={{ display: 'flex' }}>
        <Card bodyStyle={{ padding: '10px', width: '640px' }}>
          <DeleteDemand
            cref={deleteDemandRef}
            setPagination={setPagination}
            pagination={pagination}
          />
          <AddDemand cref={addDemandRef} reset={reset} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <h4
              style={{
                fontWeight: '600',
                fontSize: '18px',
                color: 'rgba(0,0,0,0.75)',
                marginBottom: '0',
              }}
            >
              需求单
            </h4>
            {renderSearch()}
          </div>

          <StandardTable
            scroll={{ y: 600, scrollToFirstRowOnChange: true }}
            columns={columns}
            dataSource={demandList}
            loading={loading}
            rowClassName={record => (record.id === currentDemandId ? `${styles.highlight}` : '')}
            onChange={handleStandardTableChange}
            onRow={record => {
              let flag = true;
              let startPosition;
              const { id } = record;
              return {
                onClick: () => {
                  if (flag) {
                    handleClickRow(id);
                  }
                },
                onMouseDown: event => {
                  // react事件池  出于性能考虑 如需异步访问事件 需要此操作
                  event.persist();
                  const { pageX, pageY } = event;
                  startPosition = { startX: pageX, startY: pageY };
                },
                onMouseUp: event => {
                  event.persist();
                  const { pageX, pageY } = event;
                  const { startX, startY } = startPosition;
                  if (startX !== pageX || startY !== pageY) {
                    flag = false;
                  }
                },
              };
            }}
          />
        </Card>
        <div style={{ marginLeft: '20px', width: 'calc(100% - 662px)' }}>
          <AllocationList
            demandsId={demandsId}
            currentDemandId={currentDemandId}
            setCurrentAllocationType={setCurrentAllocationType}
          />
        </div>
      </div>
      <DemandDetail
        currentDemandId={currentDemandId}
        currentAllocationType={currentAllocationType}
      />
    </>
  );
};

export default connect(({ loading, allocation: { demandList } }) => ({
  loading: loading.effects['allocation/getDemandList'],
  demandList,
}))(Form.create()(AllocationTab));
