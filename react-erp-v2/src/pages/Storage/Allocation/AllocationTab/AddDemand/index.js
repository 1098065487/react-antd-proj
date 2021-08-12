/*
 * @Author: your name
 * @Date: 2020-09-23 16:50:37
 * @LastEditTime: 2020-10-13 10:09:35
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Allocation\AllocationTab\DeleteConfirm\index.js
 */
import React, { useState, useImperativeHandle } from 'react';
import { message, Modal, Select } from 'antd';
import { connect } from 'dva';
import destinationList from '../../destinationList';

const { Option } = Select;

const AddDemand = props => {
  const { cref, dispatch, confirmLoading, reset } = props;
  const [visible, setVisible] = useState(false);
  const [currentStorage, setCurrentStorage] = useState(destinationList[0]);

  useImperativeHandle(cref, () => ({
    setVisible,
  }));

  const handleCancel = () => {
    setVisible(false);
    setCurrentStorage(destinationList[0]);
  };

  const handleOk = () => {
    dispatch({
      type: 'allocation/addDemand',
      payload: {
        warehouse_id: currentStorage.value,
      },
      callback: response => {
        const { status } = response;
        if (status === 'ok') {
          message.success('新建成功');
          handleCancel();
          reset();
        } else {
          message.success('新建失败');
        }
      },
    });
  };

  return (
    <Modal
      width="350px"
      title="目的地仓库"
      visible={visible}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      <Select
        style={{ width: '100%' }}
        value={currentStorage.text}
        onChange={value => {
          setCurrentStorage(destinationList.find(item => item.value === value));
        }}
      >
        {destinationList.map(storage => {
          const { text, value } = storage;
          return (
            <Option value={value} key={value}>
              {text}
            </Option>
          );
        })}
      </Select>
    </Modal>
  );
};

export default connect(({ loading }) => ({
  confirmLoading: loading.effects['allocation/addDemand'],
}))(AddDemand);
