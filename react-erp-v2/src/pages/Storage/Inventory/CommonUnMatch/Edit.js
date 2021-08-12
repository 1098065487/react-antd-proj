/*
 * @Author: your name
 * @Date: 2020-09-04 17:26:06
 * @LastEditTime: 2020-09-17 13:17:46
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Inventory\Vendibility\UnMatch\Edit.js
 */
import React, { useState } from 'react';
import { connect } from 'dva';
import { Select, Modal, Spin, message } from 'antd';
import debounce from 'lodash/debounce';
import useIsUnMountedRef from '@/customHook/useIsUnMountedRef';

const Edit = props => {
  const isUnMountedRef = useIsUnMountedRef();
  const [selectedSKU, setSelectedSKU] = useState({});
  const {
    manageId,
    setManageId,
    dispatch,
    saveLoading,
    unMatchedSKUList,
    singleItemUnMatchedSKU,
    searchLoading,
    saveCallback,
    witchComponent,
  } = props;

  // 关闭
  const closeModal = () => {
    setManageId('');
    setSelectedSKU({});
    dispatch({
      type: 'storage/save',
      payload: { unMatchedSKUList: [], singleItemUnMatchedSKU: [] },
    });
  };

  // 保存绑定关系
  const confirmSave = () => {
    const { sku } = selectedSKU;
    let params;
    if (witchComponent === 'vendibility') {
      params = {
        type: 'storage/setUnMatchedRelation',
        payload: {
          manageId,
          type: '1',
          seller_product_item_id: selectedSKU.id,
        },
      };
    } else if (witchComponent === 'singleItem_inflow') {
      params = {
        type: 'storage/setInflowUnMatchedRelation',
        payload: {
          manageId,
          type: '2',
          seller_product_item_id: selectedSKU.id,
        },
      };
    } else if (witchComponent === 'singleItem_cn') {
      params = {
        type: 'storage/setCNUnMatchedRelation',
        payload: {
          manageId,
          product_item_id: selectedSKU.id,
          sku,
        },
      };
    }
    if (!sku) {
      message.warning('SKU不能未空');
    } else {
      params.callback = response => {
        if (!isUnMountedRef.current) {
          const { status } = response;
          if (status === 'ok') {
            // 保存成功把弹框关闭 并重新获取数据
            closeModal();
            saveCallback();
            message.success('保存成功');
          } else {
            message.success('保存失败');
          }
        }
      };
      dispatch(params);
    }
  };

  // 获取SKU列表;
  const getUnMatchedSKUList = sku => {
    let params;
    let type;
    if (witchComponent === 'vendibility') {
      type = 'storage/getUnMatchedVendibilitySKU';
      params = {
        filters: {
          sku,
        },
      };
    } else {
      type = 'storage/getUnMatchedSingleItemSKU';
      params = {
        filters: {
          sku,
        },
      };
    }
    dispatch({
      type,
      payload: params,
    });
  };

  return (
    <Modal title="编辑" visible={!!manageId} onOk={confirmSave} onCancel={closeModal}>
      <Spin
        spinning={saveLoading === undefined ? false : saveLoading}
        style={{ margin: '20px auto', width: '100%' }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ flex: 1 }}>
            对应{witchComponent === 'vendibility' ? '可售' : '单品'}SKU:{' '}
          </span>
          <Select
            value={selectedSKU?.sku}
            loading={searchLoading}
            placeholder="请选择SKU"
            filterOption={false}
            onSelect={value => {
              setSelectedSKU(JSON.parse(value));
            }}
            showSearch
            style={{ flex: 2 }}
            onSearch={debounce(getUnMatchedSKUList, 1000)}
          >
            {unMatchedSKUList.length > 0 || singleItemUnMatchedSKU.length > 0
              ? [...unMatchedSKUList, ...singleItemUnMatchedSKU].map(skuItem => {
                  const { id: selectId } = skuItem;
                  return (
                    <Select.Option value={JSON.stringify(skuItem)} key={selectId}>
                      {skuItem?.sku}
                    </Select.Option>
                  );
                })
              : null}
          </Select>
        </div>
      </Spin>
    </Modal>
  );
};

export default connect(({ loading, storage: { unMatchedSKUList, singleItemUnMatchedSKU } }) => ({
  saveLoading:
    loading.effects['storage/setUnMatchedRelation'] ||
    loading.effects['storage/setInflowUnMatchedRelation'] ||
    loading.effects['storage/setCNUnMatchedRelation'],
  searchLoading:
    loading.effects['storage/getUnMatchedVendibilitySKU'] ||
    loading.effects['storage/getUnMatchedSingleItemSKU'],
  unMatchedSKUList,
  singleItemUnMatchedSKU,
}))(Edit);
