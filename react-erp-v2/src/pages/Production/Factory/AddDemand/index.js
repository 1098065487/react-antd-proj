/*
 * @Author: wjw
 * @Date: 2020-07-21 13:30:48
 * @LastEditTime: 2020-08-07 09:34:10
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Production\_Factory\AddDemand\index.js
 */
import React from 'react';
import { Modal, Button } from 'antd';
import { router } from 'umi';

const AddDemand = props => {
  const { newDemandId, setNewDemandId, getTableList, dispatch } = props;
  const handleFooterAction = type => {
    setNewDemandId();
    if (type === 'import') {
      router.push('/excel/imports/create?type=factory_order_product_item');
    } else {
      getTableList({ dispatch, type: '_factory/getDemandList' });
    }
  };
  // 自定义对话框footer
  const footer = (
    <>
      <Button
        type="primary"
        onClick={() => {
          handleFooterAction('import');
        }}
      >
        导入
      </Button>
      <Button
        onClick={() => {
          handleFooterAction('finish');
        }}
      >
        完成
      </Button>
    </>
  );
  return (
    <Modal title="新建需求单" closable={false} visible={!!newDemandId} footer={footer} centered>
      <p>
        新建需求单号为<span style={{ color: '#1890FF', fontSize: '18px' }}>{newDemandId}</span>
        ,现在就导入数据吗?
      </p>
    </Modal>
  );
};
export default AddDemand;
