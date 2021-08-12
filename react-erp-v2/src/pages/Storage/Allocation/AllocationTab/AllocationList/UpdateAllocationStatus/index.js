/*
 * @Author: wjw
 * @Date: 2020-09-23 16:50:37
 * @LastEditTime: 2020-10-16 17:14:24
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Allocation\AllocationTab\DeleteConfirm\index.js
 */
import React, { useState, useImperativeHandle } from 'react';
import { message, Modal, Select } from 'antd';
import { connect } from 'dva';

const { Option } = Select;
const allocationStatuses = [
  { status: 'order', text: '已下单' },
  { status: 'prepare', text: '备货中' },
  { status: 'submit', text: '提交物流' },
  { status: 'shipped', text: '已发货' },
  { status: 'finish', text: '接收完成' },
];
const getValue = status =>
  allocationStatuses.find(allocationStatus => allocationStatus.status === status)?.text;

const UpdateAllocationStatus = props => {
  const { cref, dispatch, confirmLoading, updateStatusSuccess } = props;
  const [currentAllocation, setcurrentAllocation] = useState({});

  useImperativeHandle(cref, () => ({
    setcurrentAllocation,
  }));

  const handleCancel = () => {
    setcurrentAllocation({});
  };

  const handleOk = () => {
    dispatch({
      type: 'allocation/updateAllocationStatus',
      payload: {
        status: currentAllocation.status,
        id: currentAllocation.id,
      },
      callback: response => {
        const { status } = response;
        if (status === 'ok') {
          message.success('修改成功');
          updateStatusSuccess(currentAllocation);
          handleCancel();
        } else {
          message.success('修改失败');
        }
      },
    });
  };

  return (
    <Modal
      width="400px"
      title="调拨单状态"
      visible={!!currentAllocation.id}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      <Select
        style={{ width: '100%' }}
        value={getValue(currentAllocation.status)}
        onChange={status => {
          setcurrentAllocation({ ...currentAllocation, status });
        }}
      >
        {allocationStatuses.map(allocation => {
          const { status, text } = allocation;
          return (
            <Option value={status} key={status}>
              {text}
            </Option>
          );
        })}
      </Select>
    </Modal>
  );
};

export default connect(({ loading }) => ({
  confirmLoading: loading.effects['allocation/updateAllocationStatus'],
}))(UpdateAllocationStatus);
