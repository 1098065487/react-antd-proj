import React, { useState, useRef } from 'react';
import { Button, Divider, message, Modal } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import globalStyles from "@/global.less";
import { TableListItem } from './data.d';
import { queryUsers, removeUser } from './service';
import UserForm from './components/UserForm';

const Users: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const childRef = useRef<any>();
  const [ editVisible, setEditVisible ] = useState(false);
  const [ current, setCurrent ] = useState<any>({});

  const handleEditVisible = (flag: boolean, record = null) => {
    setEditVisible(flag);
    setCurrent(record);
  };

  const handleEditConfirm = () => {
    childRef.current?.fakeSubmit();
  };

  const handleRemove = async (record: any) => {
    const { id } = record;
    const res = await removeUser(id);
    if (res.status === 'ok') {
      message.success('删除成功！');
      if (actionRef.current) {
        actionRef.current.reload();
      }
    } else {
      message.error('删除失败！');
    }
  };

  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'text',
      hideInForm: true,
    },
    {
      title: '用户名',
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '操作',
      dataIndex: 'action',
      hideInForm: true,
      search: false,
      render: (_, record) => (
        <>
          <Button
            type="primary"
            size="small"
            onClick={() => handleEditVisible(true, record as any)}
          >
            <EditOutlined />
          </Button>
          <Divider type="vertical" />
          <Button
            type="primary"
            danger
            size="small"
            onClick={() => handleRemove(record)}
          >
            <DeleteOutlined />
          </Button>
        </>
      ),
    },
  ];

  const handleQueryUsers = async (params: any) => {
    const result = await queryUsers(params);
    if (result.status === 'ok') {
      return { success: true, ...(result.body) }
    }
    message.error("数据请求失败！");
    return { success: false, data: [] }
  };

  return (
    <PageContainer
      className={globalStyles.blank_header}
      header={{
        title: undefined,
        breadcrumb: undefined,
      }}
    >
      <ProTable<TableListItem>
        headerTitle="用户列表"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button key='add' type="primary" onClick={() => handleEditVisible(true)}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={(params, sorter, filter) => handleQueryUsers({ params, sorter, filter })}
        columns={columns}
      />
      <Modal
        destroyOnClose
        title={(current && Object.keys(current).length !== 0) ? '编辑用户' : '新建用户'}
        width={600}
        visible={editVisible}
        okText="保存"
        onOk={handleEditConfirm}
        onCancel={() => handleEditVisible(false)}
      >
        <UserForm cRef={childRef} current={current} handleVisible={handleEditVisible} actionRef={actionRef} />
      </Modal>
    </PageContainer>
  );
};

export default Users;
