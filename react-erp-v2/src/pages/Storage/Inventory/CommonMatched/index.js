/*
 * @Author: wjw
 * @Date: 2020-09-01 17:57:56
 * @LastEditTime: 2020-09-10 14:10:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Inventory\Vendibility\Matched.js
 */
import React, { useEffect, useImperativeHandle, useState } from 'react';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import { Modal, message } from 'antd';
import useIsUnMountedRef from '@/customHook/useIsUnMountedRef';
import VendibilityEdit from './VendibilityEdit';
import SingleItemEdit from './SingleItemEdit';

const CommonMatched = props => {
  const isUnMountedRef = useIsUnMountedRef();
  const [manageId, setManageId] = useState('');
  const [isShowClearModal, setIsShowClearModal] = useState(false);
  const [clearRelationId, setClearRelationId] = useState('');
  const [clearRelationLoading, setClearRelationLoading] = useState(false);
  const {
    categoryOptions,
    loading,
    dispatch,
    searchSku,
    list,
    cref,
    whichComponent,
    scroll,
  } = props;

  const {
    pagination,
    setPagination,
    filters,
    setFilters,
    handleStandardTableChange,
    columns,
  } = props;

  // 获取产品线过滤数组
  const getFilterCategoryOptions = () => {
    let filterCategoryOptions = [];
    if (categoryOptions.length) {
      filterCategoryOptions = categoryOptions.map(fatherOption => ({
        text: fatherOption.label,
        value: fatherOption.value,
        children: fatherOption.children.map(childOption => ({
          text: childOption.label,
          value: childOption.value,
        })),
      }));
    }
    return filterCategoryOptions;
  };

  // 点击搜索或者重置
  const startSearch = ({ type }) => {
    setPagination({ ...pagination, current: 1 });
    if (type === 'search') {
      setFilters({ ...filters, keyword: searchSku });
    } else {
      setFilters({});
    }
  };

  // 管理
  const handleManage = ({ key, id }) => {
    if (key === 'edit') {
      setManageId(id);
    } else {
      setClearRelationId(id);
      setIsShowClearModal(true);
    }
  };

  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(cref, () => ({
    startSearch,
    getFilterCategoryOptions,
    handleManage,
    category: filters.category,
  }));

  // 获取产品分类
  useEffect(() => {
    dispatch({ type: 'category/fetchOptions' });
  }, [dispatch]);

  // 确认清除关系
  const clearRelation = () => {
    setClearRelationLoading(true);
    const type =
      whichComponent === 'Vendibility'
        ? 'storage/clearVendibilityBindingRelation'
        : 'storage/clearSingleItemBindingRelation';
    dispatch({
      type,
      payload: {
        manageId: clearRelationId,
      },
      callback: response => {
        if (!isUnMountedRef.current) {
          setClearRelationLoading(false);
          setIsShowClearModal(false);
          const { status } = response;
          if (status === 'ok') {
            // 重新获取数据
            message.success('清空成功');
            setPagination({ ...pagination });
          } else {
            message.success('清空失败');
          }
        }
      },
    });
  };

  return (
    <>
      <StandardTable
        scroll={scroll || undefined}
        columns={columns}
        bordered
        dataSource={list}
        loading={loading}
        onChange={handleStandardTableChange}
      />
      {whichComponent === 'Vendibility' ? (
        <VendibilityEdit
          manageId={manageId}
          setManageId={setManageId}
          setPagination={setPagination}
          pagination={pagination}
        />
      ) : (
        <SingleItemEdit
          manageId={manageId}
          setManageId={setManageId}
          setPagination={setPagination}
          pagination={pagination}
        />
      )}

      <Modal
        width="400px"
        centered
        confirmLoading={clearRelationLoading}
        visible={isShowClearModal}
        onOk={clearRelation}
        onCancel={() => {
          setIsShowClearModal(false);
          setClearRelationId('');
        }}
        okText="确认"
        cancelText="取消"
      >
        <p>确定要清空绑定关系吗?</p>
      </Modal>
    </>
  );
};

export default connect(({ category: { options: categoryOptions } }) => ({ categoryOptions }))(
  CommonMatched
);
