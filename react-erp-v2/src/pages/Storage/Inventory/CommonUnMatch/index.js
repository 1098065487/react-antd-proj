/*
 * @Author: wjw
 * @Date: 2020-09-01 17:58:05
 * @LastEditTime: 2020-09-17 16:13:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Inventory\Vendibility\UnMatch.js
 */
import React, { useState, useImperativeHandle } from 'react';
import StandardTable from '@/components/StandardTable';
import { connect } from 'dva';
import { Menu, Dropdown, Button, Icon, Modal, message } from 'antd';
import useIsUnMountedRef from '@/customHook/useIsUnMountedRef';
import styles from './index.less';
import Edit from './Edit';

const UnMatch = props => {
  const isUnMountedRef = useIsUnMountedRef();
  const [manageId, setManageId] = useState('');
  const [selectedRowList, setSelectedRowList] = useState([]); // 选中的行
  const [blackId, setBlackId] = useState(''); // 当前加入黑名单id
  const [isShowAddBlack, setIsShowAddBlack] = useState(false); // 加入黑名单Modal弹框
  const {
    loading,
    list,
    searchSku,
    cref,
    storages,
    saveCallback,
    witchComponent,
    dispatch,
    addBlackLoading,
  } = props;
  const { pagination, setPagination, filters, setFilters, handleStandardTableChange } = props;

  // 点击搜索或者重置
  const startSearch = ({ type }) => {
    setPagination({ ...pagination, current: 1 });
    if (type === 'search') {
      if (witchComponent === 'singleItem_cn') {
        setFilters({ ...filters, sku: searchSku });
      } else {
        setFilters({ ...filters, inflow_sku: searchSku });
      }
    } else {
      setFilters({ is_match: 'no' });
    }
  };

  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(cref, () => ({
    startSearch,
    setSelectedRowList,
  }));

  // 定义表格选择框
  const rowSelection = {
    onChange: selectedRowKeys => {
      setSelectedRowList(selectedRowKeys);
    },
    selectedRowKeys: selectedRowList,
  };

  // 关闭弹框
  const closeModal = () => {
    setIsShowAddBlack(false);
    setBlackId('');
    setSelectedRowList([]);
  };

  // 确认加入黑名单
  const confirmAddBlackList = () => {
    const type =
      witchComponent === 'singleItem_cn' ? 'storage/addCNBlackList' : 'storage/addInflowBlackList';
    dispatch({
      type,
      payload: {
        ids: blackId || selectedRowList.join(),
        type: witchComponent === 'vendibility' ? '1' : '2',
      },
      callback: response => {
        if (!isUnMountedRef.current) {
          const { status } = response;
          if (status === 'ok') {
            // 加入成功把弹框关闭 并重新获取数据
            closeModal();
            saveCallback();
            message.success('加入成功');
          } else {
            message.success('加入失败');
          }
        }
      },
    });
  };

  // 管理
  const handleManage = ({ key, id }) => {
    if (key === 'edit') {
      setManageId(id);
    } else if (key === 'addBlackList') {
      setBlackId(id);
      setIsShowAddBlack(true);
    }
  };

  // 批量加入黑名单
  const handlePatchJoin = () => {
    setIsShowAddBlack(true);
  };

  const columns = [
    {
      title: 'SKU',
      dataIndex: witchComponent === 'singleItem_cn' ? 'sku' : 'inflow_sku',
      align: 'center',
    },
    {
      title: '仓库',
      dataIndex: 'type',
      align: 'center',
      render: (_, record) => record?.warehouse?.type,
      filters: storages,
      filteredValue: filters.type || [],
    },
    {
      title: '库位',
      dataIndex: 'warehouse_name',
      align: 'center',
      render: (_, record) => record?.warehouse?.name,
    },
    {
      title: '库存',
      dataIndex: witchComponent === 'singleItem_cn' ? 'qty' : 'quantity',
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'options',
      align: 'center',
      render: (_, record) => {
        const { id } = record;
        const menu = (
          <Menu
            onClick={({ key }) => {
              handleManage({ key, id });
            }}
          >
            <Menu.Item key="edit">
              <span>编辑</span>
            </Menu.Item>
            <Menu.Item key="addBlackList">
              <span>加入黑名单</span>
            </Menu.Item>
          </Menu>
        );
        return (
          <Dropdown overlay={menu}>
            <Button>
              管理
              <Icon type="down" />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <StandardTable
        columns={columns}
        bordered
        rowSelection={rowSelection}
        dataSource={list}
        loading={loading}
        onChange={handleStandardTableChange}
      />
      <Button
        className={styles.joinBlackList}
        onClick={handlePatchJoin}
        disabled={!selectedRowList.length}
      >
        批量加入黑名单
      </Button>
      <Edit
        manageId={manageId}
        setManageId={setManageId}
        saveCallback={saveCallback}
        witchComponent={witchComponent}
      />
      <Modal
        width="400px"
        centered
        confirmLoading={addBlackLoading}
        visible={isShowAddBlack}
        onOk={confirmAddBlackList}
        onCancel={closeModal}
        okText="确认"
        cancelText="取消"
      >
        <p>确定要加入黑名单吗?</p>
      </Modal>
    </>
  );
};

export default connect(({ loading }) => ({
  addBlackLoading:
    loading.effects['storage/addInflowBlackList'] || loading.effects['storage/addCNBlackList'],
}))(UnMatch);
