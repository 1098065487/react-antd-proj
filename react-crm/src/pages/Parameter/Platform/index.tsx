import React, { useRef, useState } from 'react';
import { Button, Divider, message, Modal } from "antd";
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from "@ant-design/pro-table";
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import globalStyles from "@/global.less";
import { TableListItem } from './data.d';
import { createPlatform, updatePlatform, queryPlatforms, removePlatform } from './service';

const Platform: React.FC<TableListItem> = () => {
  const actionRef = useRef<ActionType>();
  const [editVisible, setEditVisible] = useState(false);
  const [current, setCurrent] = useState({});

  const handleEditVisible = (flag: boolean, record: any) => {
    setEditVisible(flag);
    setCurrent(record);
  };

  const handleRemove = async (record: TableListItem) => {
    const res = await removePlatform(record.id);
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
      title: '系统编号',
      dataIndex: 'id',
      hideInForm: true,
    },
    {
      title: '平台',
      dataIndex: 'name',
      formItemProps: {
        rules: [
          { required: true, message: '请输入平台名称' }
        ],
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueEnum: {
        'public': '开放平台',
        'blog': '博客',
      },
      formItemProps: {
        rules: [
          { required: true, message: '请选择类型' }
        ]
      }
    },
    {
      title: '频道',
      dataIndex: 'channel',
    },
    {
      title: 'Post',
      dataIndex: 'prefix',
    },
    {
      title: 'API KEY',
      dataIndex: 'app_key',
    },
    {
      title: 'API SECRET',
      dataIndex: 'app_secret',
    },
    {
      title: '操作',
      dataIndex: 'action',
      valueType: 'option',
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
    }
  ];

  const handleQueryPlatforms = async (params: any) => {
    const res = await queryPlatforms(params);
    if (res.status === 'ok') {
      return { success: true, ...(res.body) };
    }
    message.error('数据请求失败！');
    return { success: false, data: [] };
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
        headerTitle='平台参数列表'
        rowKey='id'
        actionRef={actionRef}
        search={false}
        columns={columns}
        toolBarRender={() => [
          <Button key='add' type="primary" onClick={() => handleEditVisible(true, {})}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={(params, sorter, filter) => handleQueryPlatforms({ params, sorter, filter })}
      />
      {editVisible ? (
        <Modal
          destroyOnClose
          title={Object.keys(current).length !== 0 ? '编辑平台参数' : '新增平台参数'}
          visible={editVisible}
          onCancel={() => handleEditVisible(false, {})}
          footer={false}
        >
          <ProTable<TableListItem>
            type='form'
            rowKey='id'
            columns={columns}
            form={{ initialValues: current }}
            onSubmit={async (value) => {
              let res: any;
              if (Object.keys(current).length !== 0) {
                const { id } = current as any;
                res = await updatePlatform(id, value);
              } else {
                res = await createPlatform(value);
              }
              if (res.status === 'ok') {
                message.success(Object.keys(current).length !== 0 ? '更新成功！' : '新增成功！');
                handleEditVisible(false, {});
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              } else {
                message.error(Object.keys(current).length !== 0 ? '更新失败！' : '新增失败！');
              }
            }}
          />
        </Modal>
      ) : null}
    </PageContainer>
  );
};

export default Platform;
