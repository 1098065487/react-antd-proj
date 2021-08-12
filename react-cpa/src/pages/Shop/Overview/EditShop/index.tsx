/*
 * @Author: wjw
 * @Date: 2020-09-03 17:25:01
 * @LastEditTime: 2021-01-08 17:39:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Inventory\Vendibility\Matched\Edit.js
 */
import React, { useState } from 'react';
import { Modal, Form, Input, message as Message } from 'antd';
import { editShop } from './service';
import { EditShopProps } from './editShop';
import styles from './index.less';

const EditShop: React.FC<EditShopProps> = (props) => {
  const [form] = Form.useForm();
  const [saveLoading, setSaveLoading] = useState(false);
  const { editInfo, setEditInfo, editSuccess } = props;

  // 取消
  const handleCancel = () => {
    setEditInfo({ shopId: undefined, name: '' });
    form.resetFields();
  };

  // 添加
  const handleOk = () => {
    form
      .validateFields()
      .then(async ({ name }) => {
        setSaveLoading(true);
        const { status, message: resMessage } = await editShop({ name, shopId: editInfo.shopId });
        setSaveLoading(false);
        if (status === 'ok') {
          Message.success('修改成功');
          editSuccess();
          handleCancel();
        } else if (status === 'error') {
          Message.error(resMessage);
        }
      })
      .catch((errorFields) => {
        console.log(errorFields);
      });
  };

  return (
    <Modal
      width={290}
      title="编辑店铺"
      visible={!!editInfo.shopId}
      onOk={handleOk}
      confirmLoading={saveLoading}
      onCancel={handleCancel}
      centered
      bodyStyle={{ padding: '10px 20px' }}
    >
      <Form className={styles.addForm} form={form}>
        <Form.Item
          label="店铺名"
          name="name"
          initialValue={editInfo.name}
          rules={[
            {
              required: true,
              message: '店铺名不能为空',
            },
          ]}
          className={styles.addFormItem}
        >
          <Input style={{ width: '250px' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditShop;
