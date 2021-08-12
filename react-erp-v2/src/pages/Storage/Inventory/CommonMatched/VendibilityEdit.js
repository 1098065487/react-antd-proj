/*
 * @Author: wjw
 * @Date: 2020-09-03 17:25:01
 * @LastEditTime: 2020-09-11 09:22:31
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Inventory\Vendibility\Matched\Edit.js
 */
import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Drawer, Select, Row, Col, Input, Icon, Button, Spin, message } from 'antd';
import debounce from 'lodash/debounce';
import useIsUnMountedRef from '@/customHook/useIsUnMountedRef';

const VendibilityEdit = props => {
  // 用于判断组件是否卸载 从而是否需要触发setState
  const isUnMountedRef = useIsUnMountedRef();
  const [newRelation, setNewRelation] = useState([]);
  const {
    manageId,
    setManageId,
    dispatch,
    vendibilityBindingRelation,
    initLoading,
    vendibilityStorageSKU,
    saveLoading,
    searchLoading,
    setPagination,
    pagination,
  } = props;

  // 关闭
  const closeEdit = () => {
    setManageId('');
    setNewRelation([]);
    dispatch({
      type: 'storage/save',
      payload: { vendibilityBindingRelation: [], vendibilityStorageSKU: [] },
    });
  };

  // 保存
  const saveRelation = () => {
    let flag = true;
    if (newRelation.length) {
      newRelation.forEach(item => {
        const { sku, quantity } = item;
        if (flag && !sku) {
          flag = false;
          message.warning('存在未选择的库存SKU');
        }
        if (flag && quantity === '') {
          flag = false;
          message.warning('存在不正确库存量');
        }
      });
    }
    if (vendibilityBindingRelation.length) {
      vendibilityBindingRelation.forEach(item => {
        const { quantity } = item;
        if (quantity === '') {
          flag = false;
          message.warning('存在不正确库存量');
        }
      });
    }
    if (flag) {
      dispatch({
        type: 'storage/saveVendibilityBindingRelation',
        payload: { manageId, inventories: [...vendibilityBindingRelation, ...newRelation] },
        callback: response => {
          if (!isUnMountedRef.current) {
            const { status } = response;
            if (status === 'ok') {
              message.success('保存成功');
              closeEdit();
              // 设置页数重新获取数据
              setPagination({ ...pagination });
            } else {
              message.success('保存失败');
            }
          }
        },
      });
    }
  };

  // 解除已绑定关系
  const deleteBindingRelation = key => {
    const newBindingRelation = vendibilityBindingRelation.filter((_, index) => index !== key);
    dispatch({
      type: 'storage/save',
      payload: { vendibilityBindingRelation: newBindingRelation },
    });
  };

  // 设置已绑定关系的库存量
  const setBindingQuantity = (quantity, key) => {
    const quantityValue = quantity.replace(/[^\d]+/g, '');
    const newBindingRelation = [...vendibilityBindingRelation];
    newBindingRelation[key].quantity = quantityValue;
    dispatch({
      type: 'storage/save',
      payload: { vendibilityBindingRelation: newBindingRelation },
    });
  };

  // 添加新的绑定关系
  const addNewRelation = () => {
    const relation = {
      id: newRelation.length,
      sku: '',
      warehouse_type: '',
      warehouse_name: '',
      quantity: '',
    };
    setNewRelation(preNewRelation => [...preNewRelation, relation]);
  };

  // 修改新的绑定关系的库存量
  const setNewQuantity = (quantity, key) => {
    const quantityValue = quantity.replace(/[^\d]+/g, '');
    setNewRelation(preNewRelation => {
      const myPreNewRelation = [...preNewRelation];
      myPreNewRelation[key].quantity = quantityValue;
      return myPreNewRelation;
    });
  };

  // 删除新的绑定关系
  const deleteNewRelation = key => {
    setNewRelation(preNewRelation => preNewRelation.filter((_, index) => index !== key));
  };

  // 选中绑定关系
  const selectNewRelation = value => {
    // select option的value值用了|线划分
    const [id, sku, warehouse_type, warehouse_name, quantity, key] = value.split('|');
    // 设置新绑定关系
    setNewRelation(preNewRelation => {
      const flag = preNewRelation.findIndex(({ id: relationId }) => relationId === id);
      if (flag !== -1) {
        message.warning('不可选择重复的仓库sku');
        return preNewRelation;
      }
      const myPreNewRelation = [...preNewRelation];
      myPreNewRelation[key] = { id, sku, warehouse_type, warehouse_name, quantity };
      return myPreNewRelation;
    });
  };

  // 获取可售仓库SKU;
  const getVendibilityStorageSKU = sku => {
    dispatch({
      type: 'storage/getVendibilityStorageSKU',
      payload: {
        filters: {
          is_match: 'no',
          inflow_sku: sku,
        },
      },
    });
  };

  // 获取可售绑定关系列表
  useEffect(() => {
    const getVendibilityBindingRelation = () => {
      dispatch({
        type: 'storage/getVendibilityBindingRelation',
        payload: {
          manageId,
        },
      });
    };
    if (manageId) {
      getVendibilityBindingRelation();
    }
  }, [manageId, dispatch]);

  return (
    <Drawer
      title="编辑"
      width="80%"
      closable={false}
      placement="right"
      visible={!!manageId}
      onClose={closeEdit}
    >
      <Row gutter={16}>
        <Col span={6}>仓库SKU</Col>
        <Col span={6}>仓库</Col>
        <Col span={6}>库位</Col>
        <Col span={3}>库存</Col>
        <Col span={3} />
      </Row>
      <Spin
        spinning={
          (saveLoading === undefined ? false : saveLoading) ||
          (initLoading === undefined ? false : initLoading)
        }
        style={{ margin: '20px auto', width: '100%' }}
      >
        {vendibilityBindingRelation.length > 0
          ? vendibilityBindingRelation.map((item, index) => {
              const { id, sku, warehouse_type, warehouse_name, quantity } = item;
              return (
                <Row gutter={16} type="flex" align="middle" style={{ margin: '20px 0' }} key={id}>
                  <Col span={6}>
                    <Input value={sku} disabled />
                  </Col>
                  <Col span={6}>
                    <Input value={warehouse_type} disabled />
                  </Col>
                  <Col span={6}>
                    <Input value={warehouse_name} disabled />
                  </Col>
                  <Col span={3}>
                    <Input
                      value={quantity}
                      placeholder="请输入库存"
                      onInput={e => {
                        setBindingQuantity(e.target.value, index);
                      }}
                    />
                  </Col>
                  <Col span={3}>
                    <Icon
                      type="minus-circle"
                      theme="filled"
                      style={{ fontSize: '20px', cursor: 'pointer' }}
                      onClick={() => {
                        deleteBindingRelation(index);
                      }}
                    />
                  </Col>
                </Row>
              );
            })
          : null}

        {newRelation.length > 0
          ? newRelation.map((item, index) => {
              const { id, sku, warehouse_type, warehouse_name, quantity } = item;
              return (
                <Row gutter={16} type="flex" align="middle" style={{ margin: '20px 0' }} key={id}>
                  <Col span={6}>
                    <Select
                      value={sku}
                      loading={searchLoading}
                      placeholder="仓库SKU搜索"
                      filterOption={false}
                      onSelect={selectNewRelation}
                      showSearch
                      style={{ width: '100%' }}
                      onSearch={debounce(getVendibilityStorageSKU, 1000)}
                    >
                      {vendibilityStorageSKU.map(skuItem => {
                        const {
                          id: selectId,
                          sku: selectSku,
                          warehouse_type: selectWarehouse_type,
                          warehouse_name: selectWarehouse_name,
                          quantity: selectQuantity,
                        } = skuItem;
                        return (
                          <Select.Option
                            key={selectId}
                            // 方便选中后获取值
                            value={`${selectId}|${selectSku}|${selectWarehouse_type}|${selectWarehouse_name}|${selectQuantity}|${index}`}
                          >
                            {selectSku}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Input value={warehouse_type} disabled />
                  </Col>
                  <Col span={6}>
                    <Input value={warehouse_name} disabled />
                  </Col>
                  <Col span={3}>
                    <Input
                      disabled={!sku}
                      value={quantity}
                      placeholder="请输入库存"
                      onInput={e => {
                        setNewQuantity(e.target.value, index);
                      }}
                    />
                  </Col>
                  <Col span={3}>
                    <Icon
                      type="minus-circle"
                      theme="filled"
                      style={{ fontSize: '20px', cursor: 'pointer' }}
                      onClick={() => deleteNewRelation(index)}
                    />
                  </Col>
                </Row>
              );
            })
          : null}
        <Row gutter={9}>
          <Col span={3} offset={21}>
            <Icon
              type="plus-circle"
              theme="filled"
              style={{ fontSize: '20px', cursor: 'pointer' }}
              onClick={addNewRelation}
            />
          </Col>
        </Row>
        <Row type="flex" justify="end" gutter={16} style={{ marginTop: '20px' }}>
          <Col pull={2}>
            <Button type="primary" style={{ marginRight: '20px' }} onClick={saveRelation}>
              保存
            </Button>
            <Button onClick={closeEdit}>取消</Button>
          </Col>
        </Row>
      </Spin>
    </Drawer>
  );
};

export default connect(
  ({ storage: { vendibilityBindingRelation, vendibilityStorageSKU }, loading }) => ({
    vendibilityBindingRelation,
    vendibilityStorageSKU,
    initLoading: loading.effects['storage/getVendibilityBindingRelation'],
    saveLoading: loading.effects['storage/saveVendibilityBindingRelation'],
    searchLoading: loading.effects['storage/getVendibilityStorageSKU'],
  })
)(VendibilityEdit);
