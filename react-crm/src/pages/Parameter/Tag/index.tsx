import React, { useRef, useState } from 'react';
import ProTable, { ActionType, ProColumns } from "@ant-design/pro-table";
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Divider, message, Modal, Radio, Select } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import globalStyles from "@/global.less";
import { TableListItem } from './data.d';
import { queryTags, createTag, updateTag, removeTag } from "./service";

const { Option } = Select;

const Tag: React.FC<TableListItem> = () => {
  const actionRef = useRef<ActionType>();
  const [extraParam, setExtraParam] = useState({ level: 1 });
  const [editVisible, setEditVisible] = useState(false);
  const [current, setCurrent] = useState({});

  const handleEditVisible = (flag: boolean, record: any) => {
    setEditVisible(flag);
    setCurrent(record);
  };

  const handleRemove = async (record: TableListItem) => {
    const res = await removeTag(record.id);
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
      title: '分类',
      dataIndex: 'level',
      hideInTable: true,
      formItemProps: {
        rules: [
          { required: true, message: '请选择分类' }
        ]
      },
      fieldProps: current,
      renderFormItem: (item, { type, defaultRender, ...rest }) => {
        if (type !== 'form') {
          return null;
        }
        return (
          <Select
            {...rest}
            placeholder='请选择'
            disabled={Object.keys(current).length !== 0}
            style={{ width: 328 }}
          >
            <Option value={1}>一级</Option>
            <Option value={2}>二级</Option>
            <Option value={3}>其他</Option>
          </Select>
        );
      },
    },
    {
      title: 'Tag',
      dataIndex: 'tag',
      formItemProps: {
        rules: [
          { required: true, message: '请输入Tag名称' }
        ]
      }
    },
    {
      title: "操作",
      dataIndex: 'action',
      valueType: 'option',
      hideInForm: true,
      search: false,
      render: (_, record) => (
        <>
          <Button
            type="primary"
            size="small"
            onClick={() => handleEditVisible(true, record)}
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

  const handleQueryTags = async (params: any) => {
    const res = await queryTags(params);
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
        headerTitle={
          <Radio.Group defaultValue={extraParam.level} buttonStyle="solid"
                       onChange={e => setExtraParam({ level: e.target.value })}>
            <Radio.Button value={1}>一级</Radio.Button>
            <Radio.Button value={2}>二级</Radio.Button>
            <Radio.Button value={3}>其他</Radio.Button>
          </Radio.Group>
        }
        actionRef={actionRef}
        rowKey='id'
        search={false}
        toolBarRender={() => [
          <Button key='add' type="primary" onClick={() => handleEditVisible(true, {})}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        columns={columns}
        params={extraParam}
        request={((params, sorter, filter) => handleQueryTags({ params, sorter, filter }))}
      />
      {editVisible ? (
        <Modal
          destroyOnClose
          title={Object.keys(current).length !== 0 ? '编辑Tag参数' : '新建Tag参数'}
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
                res = await updateTag(id, { ...value });
              } else {
                res = await createTag({ ...value })
              }
              if (res.status === 'ok') {
                message.success(Object.keys(current).length !== 0 ? '更新成功！' : '创建成功！')
                handleEditVisible(false, {});
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              } else {
                message.error(Object.keys(current).length !== 0 ? '更新失败！' : '创建失败！')
              }
            }}
          />
        </Modal>
      ) : null}
    </PageContainer>
  );
};

export default Tag;
