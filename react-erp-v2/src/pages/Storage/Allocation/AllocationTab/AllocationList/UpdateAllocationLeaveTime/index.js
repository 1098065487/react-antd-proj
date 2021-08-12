/*
 * @Author: wjw
 * @Date: 2020-09-23 16:50:37
 * @LastEditTime: 2020-10-15 13:41:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Allocation\AllocationTab\DeleteConfirm\index.js
 */
import React, { useState, useImperativeHandle, useRef, useEffect } from 'react';
import { message, Modal, DatePicker } from 'antd';
import { connect } from 'dva';
import moment from 'moment';

let defaultLeave_Time = moment().format('YYYY-MM-DD');

const UpdateAllocationLeaveTime = props => {
  const { cref, dispatch, confirmLoading, updateStatusSuccess } = props;
  const [currentAllocation, setcurrentAllocation] = useState({});
  const allocationRef = useRef();

  useEffect(() => {
    allocationRef.current = currentAllocation;
  }, [currentAllocation]);

  useImperativeHandle(cref, () => ({
    setcurrentAllocation,
  }));

  const handleCancel = () => {
    setcurrentAllocation({});
  };

  const handleOk = () => {
    if (defaultLeave_Time) {
      allocationRef.current = { ...currentAllocation, leave_time: defaultLeave_Time };
    }
    dispatch({
      type: 'allocation/updateAllocationLeaveTime',
      payload: {
        id: allocationRef.current.id,
        leave_time: allocationRef.current.leave_time,
      },
      callback: response => {
        const { status } = response;
        if (status === 'ok') {
          message.success('修改成功');
          updateStatusSuccess(allocationRef.current);
          handleCancel();
          defaultLeave_Time = moment().format('YYYY-MM-DD');
        } else {
          message.success('修改失败');
        }
      },
    });
  };

  const onChange = (date, dateString) => {
    defaultLeave_Time = '';
    setcurrentAllocation(preCurrentAllocation => ({
      ...preCurrentAllocation,
      leave_time_moment: date,
      leave_time: dateString || defaultLeave_Time,
    }));
  };

  return (
    <Modal
      width="400px"
      title="离岸时间"
      visible={!!currentAllocation.id}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      <DatePicker
        style={{ width: '100%' }}
        onChange={onChange}
        value={currentAllocation.leave_time_moment}
      />
    </Modal>
  );
};

export default connect(({ loading }) => ({
  confirmLoading: loading.effects['allocation/updateAllocationLeaveTime'],
}))(UpdateAllocationLeaveTime);
