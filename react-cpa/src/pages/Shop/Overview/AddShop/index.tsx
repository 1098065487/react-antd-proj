/*
 * @Author: wjw
 * @Date: 2020-09-03 17:25:01
 * @LastEditTime: 2021-01-08 16:51:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Inventory\Vendibility\Matched\Edit.js
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, message as Message } from 'antd';
import { addShop } from './service';
import { AddShopProps } from './addShop';
import styles from './index.less';
import { getSiteList } from '../../../BusinessParameters/SiteManagement/service';
import { Site } from '../../../BusinessParameters/SiteManagement/siteManagement';

const AddShop: React.FC<AddShopProps> = (props) => {
  const [form] = Form.useForm();
  const [saveLoading, setSaveLoading] = useState(false);
  const [sites, setSites] = useState<[Site]>();
  const { visible, setVisible, addSuccess } = props;

  useEffect(() => {
    const fetchSiteList = async () => {
      const { data, status } = await getSiteList({ current: 1, pageSize: 10 });
      if (status === 'ok') {
        setSites(data);
      }
    };
    fetchSiteList();
  }, []);

  // 取消
  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  // 添加
  const handleOk = () => {
    form
      .validateFields()
      .then(async ({ site_id, asin, name }) => {
        setSaveLoading(true);
        const { status, message: resMessage } = await addShop({ site_id, asin, name });
        setSaveLoading(false);
        if (status === 'ok') {
          Message.success('添加成功');
          addSuccess();
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
      title="添加店铺"
      visible={visible}
      onOk={handleOk}
      confirmLoading={saveLoading}
      onCancel={handleCancel}
      centered
      bodyStyle={{ padding: '10px 20px' }}
    >
      <Form className={styles.addForm} form={form}>
        <Form.Item
          label="站点"
          name="site_id"
          rules={[
            {
              required: true,
              message: '站点不能为空',
            },
          ]}
          className={styles.addFormItem}
        >
          <Select
            placeholder="请选择站点"
            filterOption={false}
            showSearch
            style={{ width: '250px' }}
          >
            {sites &&
              sites.map((site) => {
                const { id, name } = site;
                return (
                  <Select.Option value={id} key={id}>
                    {name}
                  </Select.Option>
                );
              })}
          </Select>
        </Form.Item>
        <Form.Item
          label="ASIN"
          name="asin"
          rules={[
            {
              required: true,
              message: 'ASIN不能为空',
            },
          ]}
          className={styles.addFormItem}
        >
          <Input style={{ width: '250px' }} />
        </Form.Item>
        <Form.Item
          label="店铺名"
          name="name"
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

export default AddShop;
