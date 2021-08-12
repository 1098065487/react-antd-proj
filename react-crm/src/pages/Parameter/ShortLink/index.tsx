import React, { useRef, useState } from 'react';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { EditOutlined } from '@ant-design/icons';
import { Button, Modal, message } from "antd";
import globalStyles from "@/global.less";
import { queryShortLink, updateShortLink } from "./service";
import { TableListItem } from './data.d';

const ShortLink: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState({});

  const handleEditVisible = (flag: boolean, record: any) => {
    setEditVisible(flag);
    setCurrent(record);
  };

  const columns: ProColumns<TableListItem>[] = [
    {
      title: '系统编号',
      dataIndex: 'id',
      hideInForm: true,
    },
    {
      title: 'Short Link',
      dataIndex: 'link',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '请输入short link！',
          },
        ],
      },
      // fieldProps: current,
      // renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
      //   if (type !== 'form') {
      //     return null;
      //   }
      //   return (
      //     <div style={{display: "flex", flexFlow: "row nowrap", alignItems: "center"}}>
      //       <Input
      //         {...rest} // rest里面已经包含了onChange，其实可以不用配置onChange了
      //         style={{width: 328}}
      //         placeholder='请输入'
      //         defaultValue={item?.fieldProps?.name}
      //         // onChange={e => form.setFieldsValue({name: e.target.value})}
      //       />
      //       <div>&nbsp;&nbsp;/</div>
      //     </div>
      //   );
      // },
      // render: (_, record) => record.name + '/',
      // copyable: true,   // 不可和render同用，render改变了输出
    },
    {
      title: '操作',
      dataIndex: 'action',
      valueType: 'option',
      hideInForm: true,
      search: false,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleEditVisible(true, record as any)}
        >
          <EditOutlined />
        </Button>
      ),
    },
  ];

  const handleQueryShortLink = async (params: any) => {
    const res = await queryShortLink(params);
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
        headerTitle='品牌参数列表'
        actionRef={actionRef}
        rowKey='id'
        search={false}
        columns={columns}
        request={((params, sorter, filter) => handleQueryShortLink({ params, sorter, filter }))}
      />
      {editVisible ? (
        <Modal
          destroyOnClose
          title={Object.keys(current).length !== 0 ? '编辑short link参数' : '新建short link参数'}
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
              const { id } = current as any;
              const res = await updateShortLink(id, value);
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

export default ShortLink;
