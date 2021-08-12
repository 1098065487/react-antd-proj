/*
 * @Author: wjw
 * @Date: 2020-09-01 17:58:05
 * @LastEditTime: 2020-09-10 15:39:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Inventory\Vendibility\UnMatch.js
 */
import React, { useEffect, useMemo, useState } from 'react';
import StandardTable from '@/components/StandardTable';
import { connect } from 'dva';
import useInitTable from '@/customHook/useInitTable';
import { Button, Form, Input, Card, Modal, message } from 'antd';
import useIsUnMountedRef from '@/customHook/useIsUnMountedRef';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

const typeList = [
  { text: '单品', value: '2' },
  { text: '可售', value: '1' },
];

const storages = [
  {
    text: 'LB',
    value: 'LB',
  },
  {
    text: 'LG',
    value: 'LG',
  },
  {
    text: 'CN',
    value: 'CN',
  },
];

const BlackList = props => {
  const isUnMountedRef = useIsUnMountedRef();
  const [selectedRowList, setSelectedRowList] = useState([]); // 选中的行
  const [whiteId, setWhiteId] = useState(''); // 当前恢复白名单id
  const [isShowAddWhite, setIsShowAddWhite] = useState(false); // 恢复白名单Modal弹框
  const { loading, dispatch, blackList, addWhiteLoading } = props;
  const initTableData = useMemo(() => ({}), []);
  const {
    pagination,
    setPagination,
    filters,
    getTableList,
    handleSearch,
    handleStandardTableChange,
  } = useInitTable(initTableData); // 自定义table hook

  // 编辑完成后获取数据
  const saveCallback = () => {
    setPagination({ ...pagination, current: 1 });
  };

  // 关闭弹框
  const closeModal = () => {
    setWhiteId('');
    setSelectedRowList([]);
    setIsShowAddWhite(false);
  };

  // 点击恢复白名单
  const addWhite = id => {
    setWhiteId(id);
    setIsShowAddWhite(true);
  };

  // 确认恢复白名单
  const confirmAddWhite = () => {
    dispatch({
      type: 'storage/addWhite',
      payload: {
        ids: whiteId || selectedRowList.join(),
      },
      callback: response => {
        if (!isUnMountedRef.current) {
          const { status } = response;
          if (status === 'ok') {
            // 恢复成功把弹框关闭 并重新获取数据
            closeModal();
            saveCallback();
            message.success('恢复成功');
          } else {
            message.success('恢复失败');
          }
        }
      },
    });
  };

  // 获取表格列表
  useEffect(() => {
    setSelectedRowList([]);
    getTableList({
      dispatch,
      type: 'storage/getBlackList',
      payload: { pagination, filters },
    });
  }, [pagination, filters, dispatch, getTableList]);

  // 定义表格选择框
  const rowSelection = {
    onChange: selectedRowKeys => {
      setSelectedRowList(selectedRowKeys);
    },
    selectedRowKeys: selectedRowList,
  };

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      align: 'center',
      render: (_, record) => record.type_str,
      filters: typeList,
      filterMultiple: false,
      filteredValue: filters.type || [],
    },
    {
      title: '仓库SKU',
      dataIndex: 'sku',
      align: 'center',
    },
    {
      title: '仓库',
      dataIndex: 'warehouse_type',
      align: 'center',
      filters: storages,
      filterMultiple: false,
      filteredValue: filters.warehouse_type || [],
    },
    {
      title: '操作',
      dataIndex: 'options',
      align: 'center',
      render: (_, record) => {
        const { id } = record;
        return (
          <span
            style={{ cursor: 'pointer', color: '#40a9ff', textDecorationLine: 'underline' }}
            onClick={() => {
              addWhite(id);
            }}
          >
            恢复白名单
          </span>
        );
      },
    },
  ];

  const renderSearchForm = () => {
    const {
      form: { getFieldDecorator, validateFieldsAndScroll, resetFields },
    } = props;
    return (
      <Form layout="inline">
        <Form.Item>
          {getFieldDecorator('keyword')(<Input placeholder="仓库SKU综合搜索" />)}
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => {
              handleSearch('submit', validateFieldsAndScroll);
            }}
          >
            查询
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => {
              handleSearch('reset', validateFieldsAndScroll, resetFields);
            }}
          >
            重置
          </Button>
        </Form.Item>
      </Form>
    );
  };

  return (
    <PageHeaderWrapper title="黑名单">
      {renderSearchForm()}
      <Card style={{ marginTop: '20px' }}>
        <StandardTable
          columns={columns}
          bordered
          dataSource={blackList}
          rowSelection={rowSelection}
          loading={loading}
          onChange={handleStandardTableChange}
        />
        <Button
          className={styles.deleteBlackList}
          disabled={!selectedRowList.length}
          onClick={() => setIsShowAddWhite(true)}
        >
          批量恢复白名单
        </Button>
      </Card>
      <Modal
        width="400px"
        centered
        confirmLoading={addWhiteLoading}
        visible={isShowAddWhite}
        onOk={confirmAddWhite}
        onCancel={closeModal}
        okText="确认"
        cancelText="取消"
      >
        <p>确定要恢复黑名单吗?</p>
      </Modal>
    </PageHeaderWrapper>
  );
};

export default connect(({ loading, storage: { blackList } }) => ({
  loading: loading.effects['storage/getBlackList'],
  addWhiteLoading: loading.effects['storage/addWhite'],
  blackList,
}))(Form.create()(BlackList));
