import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { updateStore, createStore, getSiteList } from '../service';

interface StoreFormProps {
  visible: boolean;
  record: any;
  handleVisible: (flag: boolean, record: any, refresh?: boolean) => void;
}

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const StoreForm: React.FC<StoreFormProps> = (props) => {
  const [form] = Form.useForm();
  const [siteList, setSiteList] = useState<any[]>([]);

  const { visible, record, handleVisible } = props;
  // 判断创建或更新依据
  const hasCurrent = record && Object.keys(record).length !== 0;

  useEffect(() => {
    (async () => {
      const res = await getSiteList();
      if (res.status === 'ok') {
        setSiteList(res.data);
        return;
      }
      message.error('获取站点列表失败！');
      return;
    })();
  }, []);

  // 创建或更新提交
  const handleSubmit = async (value: any) => {
    const {
      proxy,
      region,
      endpoint,
      role_arn,
      client_id,
      access_key,
      secret_key,
      client_secret,
      refresh_token,
      marketplace_id,
    } = value;
    if (hasCurrent) {
      const res = await updateStore(record.id, {
        ...value,
        dynamic: {
          proxy,
          region,
          endpoint,
          role_arn,
          client_id,
          access_key,
          secret_key,
          client_secret,
          refresh_token,
          marketplace_id,
        },
      });
      if (res.status === 'ok') {
        handleVisible(false, {}, true);
        message.success('更新信息成功！');
        return;
      }
      message.error('更新信息失败！');
      return;
    } else {
      const res = await createStore({
        ...value,
        dynamic: {
          proxy,
          region,
          endpoint,
          role_arn,
          client_id,
          access_key,
          secret_key,
          client_secret,
          refresh_token,
          marketplace_id,
        },
      });
      if (res.status === 'ok') {
        handleVisible(false, {}, true);
        message.success('创建成功！');
        return;
      }
      message.error('创建失败！');
      return;
    }
  };

  return (
    <Modal
      destroyOnClose
      title={hasCurrent ? '编辑店铺' : '新建店铺'}
      width={600}
      visible={visible}
      okText="保存"
      onOk={() => form.submit()}
      onCancel={() => handleVisible(false, {})}
    >
      <Form
        scrollToFirstError
        onFinish={handleSubmit}
        initialValues={{
          name: record?.name,
          site_ids: hasCurrent ? record.sites.map((e: any) => e.id) : undefined,
          proxy: hasCurrent ? record.dynamic?.proxy : undefined,
          region: hasCurrent ? record.dynamic?.region : undefined,
          endpoint: hasCurrent ? record.dynamic?.endpoint : undefined,
          role_arn: hasCurrent ? record.dynamic?.role_arn : undefined,
          client_id: hasCurrent ? record.dynamic?.client_id : undefined,
          access_key: hasCurrent ? record.dynamic?.access_key : undefined,
          secret_key: hasCurrent ? record.dynamic?.secret_key : undefined,
          client_secret: hasCurrent ? record.dynamic?.client_secret : undefined,
          refresh_token: hasCurrent ? record.dynamic?.refresh_token : undefined,
          marketplace_id: hasCurrent ? record.dynamic?.marketplace_id : undefined,
          description: record?.description,
        }}
        form={form}
      >
        <FormItem
          label="店铺名称"
          {...formLayout}
          name="name"
          rules={[{ required: true, message: '请输入店铺名称' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem label="站点" {...formLayout} name="site_ids">
          <Select mode="multiple" allowClear placeholder="请选择">
            {siteList.map((e) => (
              <Option key={e.id} value={e.id}>
                {e.name}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem label="代理" {...formLayout} name="proxy">
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          label="地区"
          {...formLayout}
          name="region"
          rules={[{ required: true, message: '请输入地区' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          label="终端"
          {...formLayout}
          name="endpoint"
          rules={[{ required: true, message: '请输入终端' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          label="角色"
          {...formLayout}
          name="role_arn"
          rules={[{ required: true, message: '请输入角色' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          label="应用程序ID"
          {...formLayout}
          name="client_id"
          rules={[{ required: true, message: '请输入应用程序ID' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          label="访问密钥"
          {...formLayout}
          name="access_key"
          rules={[{ required: true, message: '请输入访问密钥' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          label="授权密钥"
          {...formLayout}
          name="secret_key"
          rules={[{ required: true, message: '请输入授权密钥' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          label="客户端密钥"
          {...formLayout}
          name="client_secret"
          rules={[{ required: true, message: '请输入客户端密钥' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          label="刷新Token"
          {...formLayout}
          name="refresh_token"
          rules={[{ required: true, message: '请输入刷新Token' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          label="市场编号"
          {...formLayout}
          name="marketplace_id"
          rules={[{ required: true, message: '请输入市场编号' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem label="店铺描述" {...formLayout} name="description">
          <TextArea rows={3} placeholder="请输入" />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default StoreForm;
