/*
 * @Author: wjw
 * @Date: 2020-09-03 17:25:01
 * @LastEditTime: 2020-09-11 09:22:21
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Inventory\Vendibility\Matched\Edit.js
 */
import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Drawer, Select, Row, Col, Input, Icon, Button, Spin, message } from 'antd';
import debounce from 'lodash/debounce';
import useIsUnMountedRef from '@/customHook/useIsUnMountedRef';

const SingleItemEdit = props => {
  // 用于判断组件是否卸载 从而是否需要触发setState
  const isUnMountedRef = useIsUnMountedRef();
  const [inflowNewRelation, setInflowNewRelation] = useState([]);
  const [cnNewRelation, setCNNewRelation] = useState([]);
  const {
    manageId,
    setManageId,
    dispatch,
    inflowBindingRelation,
    cnBindingRelation,
    inflowStorageSKU,
    cnStorageSKU,
    initLoading,
    saveLoading,
    searchInflowLoading,
    searchCNLoading,
    setPagination,
    pagination,
  } = props;

  // 关闭
  const closeEdit = () => {
    setManageId('');
    setInflowNewRelation([]);
    setCNNewRelation([]);
    dispatch({
      type: 'storage/save',
      payload: {
        inflowBindingRelation: [],
        cnBindingRelation: [],
        inflowStorageSKU: [],
        cnStorageSKU: [],
      },
    });
  };

  // 保存
  const saveRelation = () => {
    let flag = true;
    const newRelation = [
      ...inflowNewRelation,
      ...inflowBindingRelation,
      ...cnNewRelation,
      ...cnBindingRelation,
    ];
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
    if (flag) {
      dispatch({
        type: 'storage/saveSingleItemBindingRelation',
        payload: {
          manageId,
          cn_inventories: [...cnBindingRelation, ...cnNewRelation],
          inflow_inventories: [...inflowBindingRelation, ...inflowNewRelation],
        },
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
  const deleteBindingRelation = (key, storageType) => {
    let newBindingRelation;
    if (storageType === 'inflow') {
      newBindingRelation = inflowBindingRelation.filter((_, index) => index !== key);
      dispatch({
        type: 'storage/save',
        payload: { inflowBindingRelation: newBindingRelation },
      });
    } else if (storageType === 'cn') {
      newBindingRelation = cnBindingRelation.filter((_, index) => index !== key);
      dispatch({
        type: 'storage/save',
        payload: { cnBindingRelation: newBindingRelation },
      });
    }
  };

  // 设置已绑定关系的库存量
  const setBindingQuantity = (quantity, key, storageType) => {
    const quantityValue = quantity.replace(/[^\d]+/g, '');
    const newBindingRelation =
      storageType === 'inflow' ? [...inflowBindingRelation] : [...cnBindingRelation];
    newBindingRelation[key].quantity = quantityValue;
    if (storageType === 'inflow') {
      dispatch({
        type: 'storage/save',
        payload: { inflowBindingRelation: newBindingRelation },
      });
    } else if (storageType === 'cn') {
      dispatch({
        type: 'storage/save',
        payload: { cnBindingRelation: newBindingRelation },
      });
    }
  };

  // 添加新的绑定关系
  const addNewRelation = storageType => {
    const relation = {
      sku: '',
      warehouse_type: '',
      warehouse_name: '',
      quantity: '',
    };
    if (storageType === 'inflow') {
      relation.id = inflowNewRelation.length;
      setInflowNewRelation(preNewRelation => [...preNewRelation, relation]);
    } else if (storageType === 'cn') {
      relation.id = cnNewRelation.length;
      setCNNewRelation(preNewRelation => [...preNewRelation, relation]);
    }
  };

  // 修改新的绑定关系的库存量
  const setNewQuantity = (quantity, key, storageType) => {
    const quantityValue = quantity.replace(/[^\d]+/g, '');
    const setNewRelation = storageType === 'inflow' ? setInflowNewRelation : setCNNewRelation;
    setNewRelation(preNewRelation => {
      const myPreNewRelation = [...preNewRelation];
      myPreNewRelation[key].quantity = quantityValue;
      return myPreNewRelation;
    });
  };

  // 删除新的绑定关系
  const deleteNewRelation = (key, storageType) => {
    const setNewRelation = storageType === 'inflow' ? setInflowNewRelation : setCNNewRelation;
    setNewRelation(preNewRelation => preNewRelation.filter((_, index) => index !== key));
  };

  // 选中绑定关系
  const selectNewRelation = (value, storageType) => {
    // select option的value值用了|线划分
    const [id, sku, warehouse_type, warehouse_name, quantity, key] = value.split('|');
    const setNewRelation = storageType === 'inflow' ? setInflowNewRelation : setCNNewRelation;
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

  // 获取仓库SKU;
  const getStorageSKU = (sku, storageType) => {
    let type;
    let filters;
    if (storageType === 'inflow') {
      type = 'storage/getInflowStorageSKU';
      filters = {
        is_match: 'no',
        inflow_sku: sku,
      };
    } else if (storageType === 'cn') {
      type = 'storage/getCNStorageSKU';
      filters = {
        is_match: 'no',
        sku,
      };
    }
    dispatch({
      type,
      payload: {
        filters,
      },
    });
  };

  // 获取infow以及cn绑定关系列表
  useEffect(() => {
    const getInflowBindingRelation = () => {
      dispatch({
        type: 'storage/getInflowBindingRelation',
        payload: {
          manageId,
        },
      });
    };
    const getCNBindingRelation = () => {
      dispatch({
        type: 'storage/getCNBindingRelation',
        payload: {
          manageId,
        },
      });
    };
    if (manageId) {
      getInflowBindingRelation();
      getCNBindingRelation();
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
        <div style={{ marginTop: '20px' }}>Inflow</div>
        {inflowBindingRelation.length > 0
          ? inflowBindingRelation.map((item, index) => {
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
                        setBindingQuantity(e.target.value, index, 'inflow');
                      }}
                    />
                  </Col>
                  <Col span={3}>
                    <Icon
                      type="minus-circle"
                      theme="filled"
                      style={{ fontSize: '20px', cursor: 'pointer' }}
                      onClick={() => {
                        deleteBindingRelation(index, 'inflow');
                      }}
                    />
                  </Col>
                </Row>
              );
            })
          : null}

        {inflowNewRelation.length > 0
          ? inflowNewRelation.map((item, index) => {
              const { id, sku, warehouse_type, warehouse_name, quantity } = item;
              return (
                <Row gutter={16} type="flex" align="middle" style={{ margin: '20px 0' }} key={id}>
                  <Col span={6}>
                    <Select
                      value={sku}
                      loading={searchInflowLoading}
                      placeholder="仓库SKU搜索"
                      filterOption={false}
                      onSelect={value => {
                        selectNewRelation(value, 'inflow');
                      }}
                      showSearch
                      style={{ width: '100%' }}
                      onSearch={debounce(value => {
                        getStorageSKU(value, 'inflow');
                      }, 1000)}
                    >
                      {inflowStorageSKU.map(skuItem => {
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
                        setNewQuantity(e.target.value, index, 'inflow');
                      }}
                    />
                  </Col>
                  <Col span={3}>
                    <Icon
                      type="minus-circle"
                      theme="filled"
                      style={{ fontSize: '20px', cursor: 'pointer' }}
                      onClick={() => deleteNewRelation(index, 'inflow')}
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
              onClick={() => {
                addNewRelation('inflow');
              }}
            />
          </Col>
        </Row>
        <div style={{ marginTop: '20px' }}>CN</div>
        {cnBindingRelation.length > 0
          ? cnBindingRelation.map((item, index) => {
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
                        setBindingQuantity(e.target.value, index, 'cn');
                      }}
                    />
                  </Col>
                  <Col span={3}>
                    <Icon
                      type="minus-circle"
                      theme="filled"
                      style={{ fontSize: '20px', cursor: 'pointer' }}
                      onClick={() => {
                        deleteBindingRelation(index, 'cn');
                      }}
                    />
                  </Col>
                </Row>
              );
            })
          : null}

        {cnNewRelation.length > 0
          ? cnNewRelation.map((item, index) => {
              const { id, sku, warehouse_type, warehouse_name, quantity } = item;
              return (
                <Row gutter={16} type="flex" align="middle" style={{ margin: '20px 0' }} key={id}>
                  <Col span={6}>
                    <Select
                      value={sku}
                      loading={searchCNLoading}
                      placeholder="仓库SKU搜索"
                      filterOption={false}
                      onSelect={value => {
                        selectNewRelation(value, 'cn');
                      }}
                      showSearch
                      style={{ width: '100%' }}
                      onSearch={debounce(value => {
                        getStorageSKU(value, 'cn');
                      }, 1000)}
                    >
                      {cnStorageSKU.map(skuItem => {
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
                        setNewQuantity(e.target.value, index, 'cn');
                      }}
                    />
                  </Col>
                  <Col span={3}>
                    <Icon
                      type="minus-circle"
                      theme="filled"
                      style={{ fontSize: '20px', cursor: 'pointer' }}
                      onClick={() => deleteNewRelation(index, 'cn')}
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
              onClick={() => {
                addNewRelation('cn');
              }}
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
  ({
    storage: { inflowBindingRelation, cnBindingRelation, inflowStorageSKU, cnStorageSKU },
    loading,
  }) => ({
    inflowBindingRelation,
    cnBindingRelation,
    inflowStorageSKU,
    cnStorageSKU,
    initLoading:
      loading.effects['storage/getInflowBindingRelation'] ||
      loading.effects['storage/getCNBindingRelation'],
    saveLoading: loading.effects['storage/saveSingleItemBindingRelation'],
    searchInflowLoading: loading.effects['storage/getInflowStorageSKU'],
    searchCNLoading: loading.effects['storage/getCNStorageSKU'],
  })
)(SingleItemEdit);
