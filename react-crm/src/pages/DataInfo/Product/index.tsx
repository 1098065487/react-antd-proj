import React, { useRef, useState } from 'react';
import { Button, Form, Input, Space, message, Modal } from "antd";
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from "@ant-design/pro-table";
import { EditOutlined, CloudUploadOutlined, CloudDownloadOutlined, PlusOutlined } from '@ant-design/icons';
import globalStyles from '@/global.less';
import ImportAndExport from '@/components/ImportAndExport';
import { IOType, handleIOMethod } from '@/components/ImportAndExport/data.d';
import { systemExport } from '@/components/ImportAndExport/service';
import ErrorInfo from "@/components/ErrorInfo";
import { TableListItem } from './data.d';
import { queryProducts, createProduct, updateProduct } from './service';

const Product: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();

  const [extra, setExtra] = useState({ keywords: undefined });

  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState({});

  const [ioVisible, setIoVisible] = useState(false);
  const [ioType, setIoType] = useState<IOType>('import');
  const [importVisible, setImportVisible] = useState(false);

  const [errors, setErrors] = useState({});

  const handleVisible = (flag: boolean, record: any) => {
    setVisible(flag);
    setCurrent(record);
    if (!flag) {
      setErrors({});
    }
  };

  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '请输入SKU！',
          },
        ],
      },
    },
    { title: '名称', dataIndex: 'title' },
    {
      title: '操作',
      dataIndex: 'action',
      valueType: 'option',
      hideInForm: true,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleVisible(true, record as any)}
        >
          <EditOutlined />
        </Button>
      ),
    }
  ];

  const handleQueryProducts = async (params: any) => {
    let renderParams: any;
    if (Object.keys(params.sorter).length !== 0) {
      renderParams = params;
    } else {
      renderParams = { ...params, sorter: { updated_at: 'descend' } }
    }
    const res = await queryProducts(renderParams);
    if (res.status === 'ok') {
      return { success: true, ...(res.body) };
    }
    message.warning('列表数据请求失败！');
    return { success: false, data: [] };
  };

  const handleSearch = (value: any) => {
    const { keywords } = value;
    setExtra({ keywords });
  };

  const handleReset = () => {
    form.resetFields(['keywords']);
    setExtra({ keywords: undefined });
  };

  const handleIoVisible: handleIOMethod = (flag, key, show) => {
    setIoVisible(flag);
    if (key) {
      setIoType(key);
    }
    if (show !== undefined) {
      setImportVisible(show);
    }
    if(!flag && key === 'import') {
      if(actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  const handleExport = async () => {
    const res = await systemExport({ type: 'product', dynamic: extra });
    if (res.status === 'ok') {
      handleIoVisible(true, 'export');
    } else {
      message.error('导出失败！')
    }
  };

  return (
    <PageContainer
      className={globalStyles.blank_header}
      header={{
        title: undefined,
        breadcrumb: undefined
      }}
    >
      <ProTable<TableListItem>
        headerTitle={
          <Form
            colon={false}
            form={form}
            layout='horizontal'
            onFinish={handleSearch}
            key='search'
            style={{ display: 'inline-block' }}
          >
            <Space>
              <Form.Item
                wrapperCol={{ span: 24 }}
                name='keywords'
                style={{ marginBottom: 0, width: 200 }}
              >
                <Input placeholder='SKU、名称综合搜索' />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form>
        }
        toolBarRender={() => [
          <Button key='import' type="primary" onClick={() => handleIoVisible(true, 'import', true)}>
            <CloudUploadOutlined /> 导入
          </Button>,
          <Button key='export' onClick={handleExport}>
            <CloudDownloadOutlined /> 导出
          </Button>,
          <Button key='add' type="primary" onClick={() => handleVisible(true, {})}>
            <PlusOutlined /> 新建商品
          </Button>,
        ]}
        actionRef={actionRef}
        rowKey='id'
        search={false}
        columns={columns}
        params={extra}
        request={((params, sorter, filter) => handleQueryProducts({ params, sorter, filter }))}
      />
      {visible ? (
        <Modal
          destroyOnClose
          title={
            <>
              {Object.keys(current).length !== 0 ? '编辑商品' : '新建商品'}
              &nbsp;&nbsp;&nbsp;&nbsp;
              {Object.keys(errors).length !== 0 ? (<ErrorInfo key='errors' errors={errors} />) : null}
            </>
          }
          visible={visible}
          onCancel={() => handleVisible(false, {})}
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
                res = await updateProduct(id, value);
              } else {
                res = await createProduct(value)
              }
              if (res.status === 'ok') {
                message.success(Object.keys(current).length !== 0 ? '更新成功！' : '创建成功！')
                handleVisible(false, {});
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              } else {
                message.error(Object.keys(current).length !== 0 ? '更新失败！' : '创建失败！');
                setErrors(res.body.errors);
              }
            }}
          />
        </Modal>
      ) : null}
      {ioVisible ? (
        <ImportAndExport
          visible={ioVisible}
          type={ioType}
          importVisible={importVisible}
          importType='product'
          handleDrawerVisible={handleIoVisible}
        />
      ) : null}
    </PageContainer>
  )
};

export default Product;
