/*
 * @Author: wjw
 * @Date: 2020-09-03 17:25:01
 * @LastEditTime: 2020-09-27 14:10:23
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Inventory\Vendibility\Matched\Edit.js
 */
import React, { useState } from 'react';
import { connect } from 'dva';
import { Drawer, Select, Row, Col, Input, Icon, Button, Spin, message } from 'antd';
import debounce from 'lodash/debounce';
import useIsUnMountedRef from '@/customHook/useIsUnMountedRef';

const blankReg = /\S/;
const initList = [{ id: 1, asin: '', brand_name: '', category_name: '' }];

const AddProduct = props => {
  // 用于判断组件是否卸载 从而是否需要触发setState
  const isUnMountedRef = useIsUnMountedRef();
  const [brandList, setBrandList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [newProductList, setNewProductList] = useState(initList);
  const { dispatch } = props;
  const { searchBrandLoading, searchCategoryLoading, saveLoading } = props;
  const { isShowAdd, setIsShowAdd, pagination, setPagination } = props;

  // 关闭
  const closeEdit = () => {
    setIsShowAdd(false);
    setNewProductList([{ id: 1, asin: '', brand_name: '', category_name: '' }]);
    setBrandList([]);
    setCategoryList([]);
  };

  // 确定添加
  const confirmAddCompetitiveProduct = () => {
    let flag = true;
    const asinArr = [];
    if (newProductList.length) {
      newProductList.forEach(item => {
        const { asin } = item;
        asinArr.push(asin);
        if (!asin || !blankReg.test(asin)) {
          flag = false;
          message.warning('竞品asin不可为空');
        }
      });
    } else {
      flag = false;
      message.warning('请至少添加一个竞品');
    }
    if (new Set(asinArr).size !== asinArr.length) {
      flag = false;
      message.warning('竞品中存在相同ASIN');
    }
    if (flag) {
      dispatch({
        type: 'competitor/addCompetitiveProduct',
        payload: newProductList,
        callback: response => {
          if (!isUnMountedRef.current) {
            const { status } = response;
            if (status === 'ok') {
              message.success('保存成功');
              closeEdit();
              // 设置页数重新获取数据
              setPagination({ ...pagination, current: 1 });
            } else {
              message.success('保存失败');
            }
          }
        },
      });
    }
  };

  // 添加新的竞品
  const addNewProduct = () => {
    const product = {
      id: newProductList.length + 1,
      asin: '',
      brand_name: '',
      category_name: '',
    };
    setNewProductList(preNewProductList => [...preNewProductList, product]);
  };

  // 删除某竞品
  const deleteNewProduct = key => {
    setNewProductList(preNewProductList => preNewProductList.filter((_, index) => index !== key));
  };

  // 设置竞品属性
  const setProductAttribute = (value, key, attribute) => {
    setNewProductList(preNewProductList => {
      const myPreNewProductList = [...preNewProductList];
      myPreNewProductList[key][attribute] = value;
      return myPreNewProductList;
    });
  };

  // 修改ASIN
  const setASIN = (value, key) => {
    setProductAttribute(value, key, 'asin');
  };

  // 选中品牌
  const selectBrand = (value, key) => {
    setProductAttribute(value, key, 'brand_name');
  };

  // 选中类型
  const selectCategory = (value, key) => {
    setProductAttribute(value, key, 'category_name');
  };

  // 获取品牌列表
  const getBrand = name => {
    dispatch({
      type: 'competitor/getBrand',
      payload: { filters: { name } },
      callback: list => {
        if (!isUnMountedRef.current) {
          const index = list.findIndex(item => item.name === name);
          if (index !== -1) {
            setBrandList(list);
          } else if (blankReg.test(name)) {
            setBrandList([...list, { id: list.length + 1, name }]);
          } else {
            setBrandList(list);
          }
        }
      },
    });
  };

  // 获取分类列表
  const getCategory = name => {
    dispatch({
      type: 'competitor/getCategory',
      payload: { filters: { name } },
      callback: list => {
        if (!isUnMountedRef.current) {
          const index = list.findIndex(item => item.name === name);
          if (index !== -1) {
            setCategoryList(list);
          } else if (blankReg.test(name)) {
            setCategoryList([...list, { id: list.length + 1, name }]);
          } else {
            setCategoryList(list);
          }
        }
      },
    });
  };

  return (
    <Drawer
      title="新建"
      width="80%"
      closable={false}
      placement="right"
      visible={isShowAdd}
      onClose={closeEdit}
    >
      <Row gutter={16}>
        <Col span={7}>ASIN</Col>
        <Col span={7}>品牌</Col>
        <Col span={7}>分类</Col>
        <Col span={3} />
      </Row>
      <Spin
        spinning={saveLoading === undefined ? false : saveLoading}
        style={{ margin: '20px auto', width: '100%' }}
      >
        {newProductList.map((product, index) => {
          const { id, asin, brand_name, category_name } = product;
          return (
            <Row gutter={16} type="flex" align="middle" style={{ margin: '20px 0' }} key={id}>
              <Col span={7}>
                <Input
                  value={asin}
                  placeholder="请输入ASIN"
                  onChange={e => setASIN(e.target.value, index)}
                />
              </Col>
              <Col span={7}>
                <Select
                  value={brand_name}
                  loading={searchBrandLoading}
                  placeholder="请选择品牌"
                  filterOption={false}
                  onSelect={name => selectBrand(name, index)}
                  showSearch
                  style={{ width: '100%' }}
                  onSearch={debounce(getBrand, 1000)}
                >
                  {brandList.map(brand => {
                    const { id: brandId, name } = brand;
                    return (
                      <Select.Option
                        key={brandId}
                        // 方便选中后获取值
                        value={name}
                      >
                        {name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Col>
              <Col span={7}>
                <Select
                  value={category_name}
                  loading={searchCategoryLoading}
                  placeholder="请选择分类"
                  filterOption={false}
                  onSelect={name => selectCategory(name, index)}
                  showSearch
                  style={{ width: '100%' }}
                  onSearch={debounce(getCategory, 1000)}
                >
                  {categoryList.map(category => {
                    const { id: categoryId, name } = category;
                    return (
                      <Select.Option
                        key={categoryId}
                        // 方便选中后获取值
                        value={name}
                      >
                        {name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Col>
              <Col span={3}>
                <Icon
                  type="minus-circle"
                  theme="filled"
                  style={{ fontSize: '20px', cursor: 'pointer' }}
                  onClick={() => deleteNewProduct(index)}
                />
              </Col>
            </Row>
          );
        })}
        <Row gutter={9}>
          <Col span={3} offset={21}>
            <Icon
              type="plus-circle"
              theme="filled"
              style={{ fontSize: '20px', cursor: 'pointer' }}
              onClick={addNewProduct}
            />
          </Col>
        </Row>
        <Row type="flex" style={{ marginTop: '20px' }}>
          <Col span={7} />
          <Col span={7} />
          <Col span={3} offset={4} style={{ textAlign: 'right', transform: 'translateX(30px)' }}>
            <Button
              type="primary"
              style={{ marginRight: '20px' }}
              onClick={confirmAddCompetitiveProduct}
            >
              保存
            </Button>
            <Button onClick={closeEdit}>取消</Button>
          </Col>
        </Row>
      </Spin>
    </Drawer>
  );
};

export default connect(({ loading }) => ({
  saveLoading: loading.effects['competitor/addCompetitiveProduct'],
  searchBrandLoading: loading.effects['competitor/getBrand'],
  searchCategoryLoading: loading.effects['competitor/getCategory'],
}))(AddProduct);
