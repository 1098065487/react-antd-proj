/*
 * @Author: wjw
 * @Date: 2020-08-06 09:33:30
 * @LastEditTime: 2020-10-28 14:58:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\ReviewDetail\index.js
 */

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { connect } from 'dva';
import { Card, Form, Button, Table, Input, Select, Steps, Icon } from 'antd';
import router from 'umi/router';
import useInitTable from '@/customHook/useInitTable';
// 滑动插件
import scrollIntoView from 'scroll-into-view';
import moment from 'moment';
// 判断组件是否被卸载
import useIsUnMountedRef from '@/customHook/useIsUnMountedRef';
import UpdateAllocationStatus from './UpdateAllocationStatus';
import UpdateAllocationLeaveTime from './UpdateAllocationLeaveTime';
import UpdatePackageStatus from './UpdatePackageStatus';
import destinationList from '../../destinationList';
import styles from './index.less';

const { Option } = Select;
const { Step } = Steps;

const sorter = { field: 'transfer_id', order: 'desc' };

// 发货仓
const deliveryWarehouse = [
  { id: 1, value: 'CN' },
  { id: 2, value: 'LB' },
  { id: 3, value: 'LG' },
];

// 调拨单状态
const allocationStatuses = [
  { current: 0, status: 'order', text: '已下单' },
  { current: 1, status: 'prepare', text: '备货中' },
  { current: 2, status: 'submit', text: '提交物流' },
  { current: 3, status: 'shipped', text: '已发货' },
  { current: 4, status: 'finish', text: '接收完成' },
];

// package状态
const packageStatuses = [
  { id: 0, status: 'leave', text: '离岸', color: '#D9001B' },
  { id: 1, status: 'to_amazon', text: '到亚马逊仓', color: '#F59A23' },
  { id: 2, status: 'receiving', text: '正在接收中', color: '#BFBF00' },
  { id: 3, status: 'storage', text: '已入库', color: '#70B603' },
  { id: 4, status: 'error', text: '接收异常', color: '#000000' },
];

const AllocationList = props => {
  const isUnMountedRef = useIsUnMountedRef();
  const updateAllocationStatusRef = useRef();
  const updateAllocationLeaveTimeRef = useRef();
  const updatePackageStatusRef = useRef();
  const [currentAllocationId, setCurrentAllocationId] = useState('');
  const {
    dispatch,
    loading,
    allocationList,
    demandsId,
    currentDemandId,
    setCurrentAllocationType,
  } = props;
  const initTableData = useMemo(() => ({}), []);
  const { filters, handleSearch, handleStandardTableChange } = useInitTable(initTableData); // 自定义table hook

  // 获取调拨单列表
  useEffect(() => {
    const getAllocationList = () => {
      dispatch({
        type: 'allocation/getAllocationList',
        payload: {
          filters: { ...filters, transfer: demandsId },
          with: 'statuses',
          sorter,
        },
        callback: list => {
          // 获取调拨单列表之后，将需求单列表中选中的需求单下的第一张调拨单设置为当前调拨单
          // 判断当前组件还没有卸载并且调拨单列表不为空
          if (!isUnMountedRef.current && list.length) {
            const choosedAllocation = list.find(
              allocation => allocation.transfer_id === currentDemandId
            );
            setCurrentAllocationId(choosedAllocation?.id);
            setCurrentAllocationType(choosedAllocation?.type);
          }
        },
      });
    };
    // 如果需求单列表为空，则不发请求获取调拨单列表
    if (demandsId.length) {
      getAllocationList();
    }
  }, [demandsId, dispatch, filters]);

  // 当点击需求单列表中某一条需求单后，将该需求单下的第一张调拨单设置为当前调拨单
  useEffect(() => {
    // 判断当前需求单id不为空，并且当前调拨单列表不为空
    if (currentDemandId && allocationList.length) {
      const choosedAllocation = allocationList.find(
        allocation => allocation.transfer_id === currentDemandId
      );
      setCurrentAllocationId(choosedAllocation?.id);
      setCurrentAllocationType(choosedAllocation?.type);
    }
  }, [currentDemandId]);

  // 控制滚动
  useEffect(() => {
    const handleScroll = () => {
      // 获取滚动元素
      const scrollRow = document.querySelector(`.${styles.scrollRow}`);
      if (scrollRow) {
        scrollIntoView(scrollRow, {
          align: {
            top: 0,
            left: 0,
          },
          // eslint-disable-next-line consistent-return
          isScrollable(target) {
            if (target.className) {
              return target.className.indexOf('scrollable');
            }
          },
        });
      }
    };
    if (currentAllocationId) {
      handleScroll();
    }
  }, [currentAllocationId]);

  // 导出调拨单
  const exportAllocation = dynamic => {
    dispatch({
      type: 'system/createAnExport',
      payload: {
        type: 'transfer_order',
        dynamic,
      },
    });
  };

  // 重置
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
        <Form.Item>
          {getFieldDecorator('keyword')(<Input placeholder="调拨单号,需求单号搜索" />)}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('type')(
            <Select style={{ width: '174px' }} placeholder="发货仓" allowClear mode="multiple">
              {deliveryWarehouse.map(storage => {
                const { id, value } = storage;
                return (
                  <Option value={value} key={id}>
                    {value}
                  </Option>
                );
              })}
            </Select>
          )}
        </Form.Item>
        <Form.Item style={{ marginRight: '0' }}>
          {getFieldDecorator('warehouse')(
            <Select style={{ width: '174px' }} placeholder="收货仓" allowClear mode="multiple">
              {destinationList.map(storage => {
                const { text, value } = storage;
                return (
                  <Option value={value} key={value}>
                    {text}
                  </Option>
                );
              })}
            </Select>
          )}
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
              router.push('/excel/imports/create?type=transfer_order');
            }}
          >
            导入
          </Button>
        </Form.Item>
      </Form>
    );
  };

  // 修改调拨单状态
  const updateAllocationStatus = (id, status) => {
    updateAllocationStatusRef.current.setcurrentAllocation({ id, status });
  };

  // 修改调拨单离岸时间
  const updateAllocationLeaveTime = (id, leave_time) => {
    updateAllocationLeaveTimeRef.current.setcurrentAllocation({
      id,
      leave_time_moment: moment(leave_time || new Date()),
      leave_time,
    });
  };

  // 修改package状态以及到仓日期
  const updatePackageStatus = (fba_code, id, status, date) => {
    updatePackageStatusRef.current.setcurrentAllocation({
      fba_code,
      id,
      status,
      date_moment: moment(date || new Date()),
    });
  };

  // 确认修改成功后的回调
  const updateStatusSuccess = currentAllocation => {
    const newAllocationList = [...allocationList];
    // 遍历调拨单
    newAllocationList.forEach((item, index) => {
      // eslint不能直接修改item
      const myItem = item;
      const { id } = currentAllocation;
      // 找到修改的调拨单
      if (item.id === id) {
        // 修改了调拨单离岸时间
        if (currentAllocation.leave_time !== undefined) {
          // 代表离岸那个状态
          myItem.statuses[3].dynamic.leave_time = currentAllocation.leave_time;
        } else if (currentAllocation.date !== undefined) {
          // 修改调拨单下package状态
          const { fba_code, status, date } = currentAllocation;
          myItem.transfer_order_items.forEach((packageItem, packageIndex) => {
            // 遍历对应调拨单下的package
            if (packageItem.fba_code === fba_code) {
              // 找到修改的package
              myItem.transfer_order_items[packageIndex] = {
                ...myItem.transfer_order_items[packageIndex],
                ...{ status, date },
              };
            }
          });
        } else {
          // 修改调拨单状态 注意这里不能用myItem，并不会改变数组中那一项的值，需要用索引的方式才能生效
          newAllocationList[index] = { ...newAllocationList[index], ...currentAllocation };
        }
      }
    });
    dispatch({
      type: 'allocation/save',
      payload: {
        allocationList: newAllocationList,
      },
    });
  };

  const columns = [
    {
      title: '调拨单编号',
      dataIndex: 'code',
      align: 'center',
      width: '100px',
      fixed: 'left',
    },
    {
      title: '需求单编号',
      dataIndex: 'transfer_id',
      align: 'center',
      width: '100px',
    },
    {
      dataIndex: 'status',
      width: '800px',
      render: (_, record) => {
        const { id, status, statuses } = record;
        return (
          <div style={{ position: 'relative', width: '800px' }}>
            <Steps
              progressDot
              current={allocationStatuses.find(item => item.status === status)?.current ?? null}
              size="small"
            >
              {statuses.map(item => {
                const { id: statusid, status: itemStatus, date, dynamic } = item;
                const quantity = dynamic?.quantity;
                const true_quantity = dynamic?.true_quantity;
                const leave_time = dynamic?.leave_time;
                const text = allocationStatuses.find(
                  allocationStatus => allocationStatus.status === itemStatus
                )?.text;
                const subTitle = <p style={{ height: '21px' }}>{date}</p>;
                let discription = '';
                if (text === '已下单') {
                  discription = `下单数量: ${quantity}`;
                } else if (text === '已发货') {
                  discription = (
                    <div style={{ width: '150px' }}>
                      <p>实际发货数量: {true_quantity}</p>
                      <p style={{ position: 'relative' }}>
                        <span>离岸时间: {leave_time}</span>
                        <Icon
                          style={{
                            position: 'absolute',
                            cursor: 'pointer',
                            top: '2px',
                            fontSize: '16px',
                            zIndex: 1,
                          }}
                          type="edit"
                          onClick={e => {
                            e.stopPropagation();
                            updateAllocationLeaveTime(id, leave_time);
                          }}
                        />
                      </p>
                    </div>
                  );
                }
                return (
                  <Step key={statusid} title={text} subTitle={subTitle} description={discription} />
                );
              })}
            </Steps>
            <Icon
              style={{
                position: 'absolute',
                cursor: 'pointer',
                right: '40px',
                top: '-5px',
                fontSize: '16px',
              }}
              type="edit"
              onClick={e => {
                e.stopPropagation();
                updateAllocationStatus(id, status);
              }}
            />
          </div>
        );
      },
    },
    {
      title: '提交物流-离岸时长(天)',
      dataIndex: 'submit_day',
      align: 'center',
      width: '80px',
    },
    {
      title: '调拨总时长(天)',
      dataIndex: 'all_day',
      align: 'center',
      width: '80px',
    },
    {
      title: 'package',
      dataIndex: 'transfer_order_items',
      align: 'center',
      width: '240px',
      render: (text, record) => {
        let packageJSX;
        const { id } = record;
        if (text.length) {
          packageJSX = (
            <div>
              {text.map(item => {
                const { id: packageId, fba_code, status, quantity, date, fba_address } = item;
                const { text: statusText, color } = packageStatuses.find(
                  packageStatus => packageStatus.status === status
                );
                return fba_code ? (
                  <div style={{ color, marginBottom: '10px', textAlign: 'left' }} key={packageId}>
                    <p>FBA货件码: {fba_code}</p>
                    <p>
                      状态: {statusText}
                      <Icon
                        style={{
                          cursor: 'pointer',
                          fontSize: '16px',
                          margin: '5px',
                          color: '#595959',
                        }}
                        type="edit"
                        onClick={e => {
                          e.stopPropagation();
                          updatePackageStatus(fba_code, id, status, date);
                        }}
                      />
                      <Icon
                        style={{
                          cursor: 'pointer',
                          fontSize: '16px',
                          color: '#595959',
                        }}
                        type="download"
                        onClick={e => {
                          e.stopPropagation();
                          exportAllocation({ id, fba_code });
                        }}
                      />
                    </p>
                    <p>数量： {quantity}</p>
                    <p>到仓日期: {date}</p>
                    <p>FBA Address: {fba_address}</p>
                  </div>
                ) : null;
              })}
            </div>
          );
        } else {
          packageJSX = '';
        }
        return packageJSX;
      },
    },
    {
      align: 'center',
      width: '80px',
      render: (_, record) => {
        const { id } = record;
        return (
          <span
            style={{ cursor: 'pointer', color: '#1890ff' }}
            onClick={e => {
              e.stopPropagation();
              exportAllocation({ id });
            }}
          >
            导出
          </span>
        );
      },
    },
  ];

  return (
    <Card bodyStyle={{ padding: '10px', width: '100%' }}>
      <UpdateAllocationStatus
        cref={updateAllocationStatusRef}
        updateStatusSuccess={updateStatusSuccess}
      />
      <UpdateAllocationLeaveTime
        cref={updateAllocationLeaveTimeRef}
        updateStatusSuccess={updateStatusSuccess}
      />

      <UpdatePackageStatus
        cref={updatePackageStatusRef}
        updateStatusSuccess={updateStatusSuccess}
      />
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
          调拨单
        </h4>
        {renderSearch()}
      </div>
      <Table
        size="small"
        className="scrollable"
        scroll={{ x: '1280px', y: '600px', scrollToFirstRowOnChange: true }}
        rowKey="id"
        columns={columns}
        dataSource={allocationList}
        loading={loading}
        pagination={false}
        rowClassName={record => {
          const { id } = record;
          if (currentAllocationId === id) {
            return styles.scrollRow;
          }
          return '';
        }}
        onChange={handleStandardTableChange}
        onRow={record => {
          let flag = true;
          let startPosition;
          const { id, transfer_id, type } = record;
          return {
            onClick: () => {
              if (flag && transfer_id === currentDemandId) {
                console.log('点击', id, type);
                setCurrentAllocationId(id);
                setCurrentAllocationType(type);
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
  );
};

export default connect(({ loading, allocation: { allocationList } }) => ({
  loading: loading.effects['allocation/getAllocationList'],
  allocationList,
}))(Form.create()(AllocationList));
