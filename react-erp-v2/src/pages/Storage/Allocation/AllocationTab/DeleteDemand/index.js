/*
 * @Author: your name
 * @Date: 2020-09-23 16:50:37
 * @LastEditTime: 2020-10-13 13:39:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Allocation\AllocationTab\DeleteConfirm\index.js
 */
import React, { useState, useImperativeHandle } from 'react';
import { Modal, message } from 'antd';
import { connect } from 'dva';

const DeleteDemand = props => {
  const { cref, dispatch, confirmLoading, pagination, setPagination } = props;
  const [deleteId, setDeleteId] = useState('');

  useImperativeHandle(cref, () => ({
    setDeleteId,
  }));

  const handleCancel = () => {
    setDeleteId('');
  };

  const handleOk = () => {
    dispatch({
      type: 'allocation/deleteDemand',
      payload: {
        demandId: deleteId,
      },
      callback: response => {
        const { status } = response;
        if (status === 'ok') {
          message.success('删除成功');
          handleCancel();
          setPagination({ ...pagination, current: 1 });
        } else {
          message.success('删除失败');
        }
      },
    });
  };

  return (
    <Modal
      width="300px"
      visible={!!deleteId}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      <p>确认要删除吗?</p>
    </Modal>
  );
};

export default connect(({ loading }) => ({
  confirmLoading: loading.effects['allocation/deleteDemand'],
}))(DeleteDemand);
