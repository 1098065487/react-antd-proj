import React, { useRef, useState } from 'react';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Modal, message, Input } from "antd";
import globalStyles from "@/global.less";
import { queryBrands, updateBrand, createBrand, removeBrand } from "./service";
import { TableListItem } from './data.d';

const Brand: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState({});

  const handleEditVisible = (flag: boolean, record: any) => {
    setEditVisible(flag);
    setCurrent(record);
  };

  const handleRemove = async (record: any) => {
    const { id } = record;
    const res = await removeBrand(id);
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
      title: '品牌页名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '请输入品牌页名称！',
          },
        ],
      },
    },
    {
      title: '品牌页网址',
      dataIndex: 'site',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '请输入品牌页网址！',
          },
        ],
      },
      fieldProps: current,
      // renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
      renderFormItem: (item, { type, defaultRender, ...rest }) => {
        if (type !== 'form') {
          return null;
        }
        return (
          <div style={{ display: "flex", flexFlow: "row nowrap", alignItems: "center" }}>
            <Input
              {...rest} // rest里面已经包含了onChange，其实可以不用配置onChange了
              style={{ width: 328 }}
              placeholder='请输入'
              defaultValue={item?.fieldProps?.site}    // 外面多套了一层div，form元素无法直接接到初值，需显式赋值
              // onChange={e => form.setFieldsValue({ site: e.target.value })}
            />
            <div>&nbsp;&nbsp;/</div>
          </div>
        );
      },
      render: (_, record) => `${record.site}/`,
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
    },
  ];

  const handleQueryBrands = async (params: any) => {
    const res = await queryBrands(params);
    if (res.status === 'ok') {
      return { success: true, ...(res.body) }
    }
    message.error('数据请求失败！');
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
        headerTitle='品牌参数列表'
        actionRef={actionRef}
        rowKey='id'
        search={false}
        toolBarRender={() => [
          <Button key='add' type="primary" onClick={() => handleEditVisible(true, {})}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        columns={columns}
        request={((params, sorter, filter) => handleQueryBrands({ params, sorter, filter }))}
      />
      {editVisible ? (
        <Modal
          destroyOnClose
          title={Object.keys(current).length !== 0 ? '编辑品牌参数' : '新建品牌参数'}
          visible={editVisible}
          onCancel={() => handleEditVisible(false, {})}
          footer={false}
        >
          <ProTable<TableListItem>
            type='form'
            rowKey='id'
            columns={columns}
            form={{ initialValues: current }}
            // submitButtonLoading={true}
            onSubmit={async (value) => {
              let res: any;
              if (Object.keys(current).length !== 0) {
                const { id } = current as any;
                res = await updateBrand(id, value);
              } else {
                res = await createBrand(value)
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

export default Brand;
