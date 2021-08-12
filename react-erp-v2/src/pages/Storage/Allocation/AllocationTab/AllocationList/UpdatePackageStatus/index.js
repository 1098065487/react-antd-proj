/*
 * @Author: wjw
 * @Date: 2020-09-23 16:50:37
 * @LastEditTime: 2020-10-28 14:59:27
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Allocation\AllocationTab\DeleteConfirm\index.js
 */
import React, { useState, useImperativeHandle, useRef, useEffect } from 'react';
import { message, Modal, DatePicker, Select } from 'antd';
import { connect } from 'dva';
import moment from 'moment';

const { Option } = Select;

let defaultDate = moment().format('YYYY-MM-DD');

const packageStatuses = [
  { id: 0, status: 'leave', text: '离岸' },
  { id: 1, status: 'to_amazon', text: '到亚马逊仓' },
  { id: 2, status: 'receiving', text: '正在接收中' },
  { id: 3, status: 'storage', text: '已入库' },
  { id: 4, status: 'error', text: '接收异常' },
];

const getValue = status => packageStatuses.find(item => item.status === status)?.text;

const UpdatePackageStatus = props => {
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
    if (defaultDate) {
      allocationRef.current = { ...currentAllocation, date: defaultDate };
    }
    dispatch({
      type: 'allocation/updatePackageStatus',
      payload: {
        fba_code: allocationRef.current.fba_code,
        status: allocationRef.current.status,
        date: allocationRef.current.date,
      },
      callback: response => {
        const { status } = response;
        if (status === 'ok') {
          message.success('修改成功');
          updateStatusSuccess(allocationRef.current);
          handleCancel();
          defaultDate = moment().format('YYYY-MM-DD');
        } else {
          message.success('修改失败');
        }
      },
    });
  };

  const onChange = (date, dateString) => {
    defaultDate = '';
    setcurrentAllocation(preCurrentAllocation => ({
      ...preCurrentAllocation,
      date_moment: date,
      date: dateString || defaultDate,
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
      <div style={{ display: 'flex' }}>
        <div style={{ width: '50%', padding: '0 10px' }}>
          <p>FBA状态</p>
          <Select
            style={{ width: '100%' }}
            value={getValue(currentAllocation.status)}
            onChange={status => {
              setcurrentAllocation({ ...currentAllocation, status });
            }}
          >
            {packageStatuses.map(item => {
              const { id, status, text } = item;
              return (
                <Option value={status} key={id}>
                  {text}
                </Option>
              );
            })}
          </Select>
        </div>
        <div style={{ width: '50%', padding: '0 10px' }}>
          <p>到仓日期</p>
          <DatePicker
            style={{ width: '100%' }}
            onChange={onChange}
            value={currentAllocation.date_moment}
          />
        </div>
      </div>
    </Modal>
  );
};

export default connect(({ loading }) => ({
  confirmLoading: loading.effects['allocation/updatePackageStatus'],
}))(UpdatePackageStatus);
