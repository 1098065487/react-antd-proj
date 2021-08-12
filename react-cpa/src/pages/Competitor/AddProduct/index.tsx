/*
 * @Author: wjw
 * @Date: 2020-09-03 17:25:01
 * @LastEditTime: 2021-01-07 18:16:59
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Inventory\Vendibility\Matched\Edit.js
 */
import React, { useState } from 'react';
import { Modal, Form, Select, Input, message as Message } from 'antd';
import debounce from 'lodash/debounce';
import { AddProductProps, BrandAndCategory } from './addProduct.d'
import { addAsin, putAsin, getBrand, getCategory } from './service'
import styles from './index.less';

const blankReg = /\S/;
const AddProduct: React.FC<AddProductProps> = (props) => {
  const [form] = Form.useForm();
  const [brandList, setBrandList] = useState<BrandAndCategory[]>([]);
  const [categoryList, setCategoryList] = useState<BrandAndCategory[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false)
  const [searchBrandLoading, setSearchBrandLoading] = useState(false);
  const [searchCategoryLoading, setSearchCategoryLoading] = useState(false);
  const [message, setMessage] = useState('')
  const {
    visible,
    setVisible,
    addSuccess
  } = props;

  // 取消
  const handleCancel = () => {
    setMessage('')
    setVisible(false);
    setCategoryList([]);
    setBrandList([]);
    form.resetFields();
  };

  // 添加
  const handleOk = () => {
    form.validateFields().then(async ({ name, asin, category, brand }) => {
      setSaveLoading(true)
      const { status, message: resMessage } = await addAsin({ name, asin, category, brand })
      setSaveLoading(false)
      if (status === 'ok') {
        Message.success('新建成功')
        addSuccess()
        handleCancel()
      } else if (status === 'error') {
        setMessage(resMessage)
      }
    }).catch(errorFields => {
      console.log(errorFields)
    })
  };

  // 更新
  const updateAsin = () => {
    form.validateFields().then(async ({ name, asin, category, brand }) => {
      setUpdateLoading(true)
      const { status } = await putAsin({ name, asin, category, brand })
      setUpdateLoading(false)
      if (status === 'ok') {
        Message.success('更新成功')
        handleCancel()
      }
    }).catch(errorFields => {
      console.log(errorFields)
    })
  }

  // 获取品牌列表
  const fetchBrand = async (name: string) => {
    setSearchBrandLoading(true)
    const { status, data } = await getBrand({ filters: { name } })
    if (status === 'ok') {
      const index = data.findIndex((brand: BrandAndCategory) => brand.name === name);
      if (index !== -1) {
        setBrandList(data);
      } else if (blankReg.test(name)) {
        setBrandList([...data, { id: data.length + 1, name }]);
      } else {
        setBrandList(data);
      }
    }
    setSearchBrandLoading(false)
  };

  // 获取分类列表
  const fetchCategory = async (name: string) => {
    setSearchCategoryLoading(true)
    const { status, data } = await getCategory({ filters: { name } })
    if (status === 'ok') {
      const index = data.findIndex((category: BrandAndCategory) => category.name === name);
      if (index !== -1) {
        setCategoryList(data);
      } else if (blankReg.test(name)) {
        setCategoryList([...data, { id: data.length + 1, name }]);
      } else {
        setCategoryList(data);
      }
    }

    setSearchCategoryLoading(false)
  };

  return (
    <Modal
      width={290}
      title="添加ASIN"
      visible={visible}
      onOk={handleOk}
      confirmLoading={saveLoading}
      onCancel={handleCancel}
      centered
      bodyStyle={{ padding: '10px 20px' }}
    >
      <Modal
        width={250}
        title='更新'
        onCancel={() => setMessage('')}
        visible={!!message}
        onOk={updateAsin}
        confirmLoading={updateLoading}
        centered
      >
        <p style={{ marginBottom: 0 }}>{`${message} ,是否更新该asin?`}</p>
      </Modal>
      <Form className={styles.addForm} form={form}>
        <Form.Item label="品名" name='name' className={styles.addFormItem}>
          <Input style={{ width: '250px' }} />
        </Form.Item>
        <Form.Item label="ASIN" name='asin' rules={[{
          required: true,
          message: 'ASIN不能为空',
        },]} className={styles.addFormItem}>
          <Input style={{ width: '250px' }} />
        </Form.Item>
        <Form.Item label="品牌" name='brand' className={styles.addFormItem}>
          <Select
            loading={searchBrandLoading}
            placeholder="请选择品牌"
            filterOption={false}
            showSearch
            style={{ width: '250px' }}
            onSearch={debounce(fetchBrand, 1000)}
          >
            {brandList.map((brand) => {
              const { id, name } = brand;
              return (
                <Select.Option value={name} key={id}>
                  {name}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item label="分类" name='category' className={styles.addFormItem}>
          <Select
            loading={searchCategoryLoading}
            placeholder="请选择分类"
            filterOption={false}
            showSearch
            style={{ width: '250px' }}
            onSearch={debounce(fetchCategory, 1000)}
          >
            {categoryList.map((category) => {
              const { id, name } = category;
              return (
                <Select.Option value={name} key={id}>
                  {name}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProduct;
