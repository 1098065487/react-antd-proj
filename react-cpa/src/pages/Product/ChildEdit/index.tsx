import React, { useState } from 'react';
import { Form, Input, message, Modal, Select } from 'antd';
import debounce from 'lodash/debounce';
import { getParentList, updateChild, createChild } from './service';

interface EditChildProps {
  store: number;
  site: number;
  visible: boolean;
  record: any;
  parent: any;
  handleVisible: (flag: boolean, item: any, record: any, refresh?: boolean) => void;
}

const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};

const EditChild: React.FC<EditChildProps> = (props) => {
  const [form] = Form.useForm();

  const { store, site, visible, record, parent, handleVisible } = props;

  // 判断添加还是编辑，true为编辑
  const hasCurrent = record && Object.keys(record).length !== 0;

  const [list, setList] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSubmit = async (value: any) => {
    const { parent = [] } = value;
    if (hasCurrent) {
      const res = await updateChild(record.id, {
        ...value,
        store_product_id: parent.value,
        store_id: store,
        site_id: site,
      });
      if (res.status === 'ok') {
        handleVisible(false, {}, {}, true);
        message.success('更新信息成功！');
        return;
      }
      message.error('更新信息失败！');
      return;
    } else {
      const res = await createChild({
        ...value,
        store_product_id: parent.value,
        store_id: store,
        site_id: site,
      });
      if (res.status === 'ok') {
        handleVisible(false, {}, {}, true);
        message.success('添加成功！');
        return;
      }
      message.error('添加失败！');
      return;
    }
  };

  const searchSku = async (sku: string) => {
    setSearchLoading(true);
    const res = await getParentList({ filters: { store, site, sku } });
    setSearchLoading(false);
    if (res.status === 'ok') {
      setList(res.data);
      return;
    }
    message.error('查询父产品失败！');
    return;
  };

  return (
    <Modal
      destroyOnClose
      title={hasCurrent ? '编辑子产品' : '添加子产品'}
      width={600}
      visible={visible}
      okText="保存"
      onOk={() => form.submit()}
      onCancel={() => handleVisible(false, {}, {})}
    >
      <Form
        scrollToFirstError
        onFinish={handleSubmit}
        initialValues={{
          sku: record?.sku,
          asin: record?.asin,
          parent:
            parent && Object.keys(parent).length !== 0
              ? { label: parent.sku, value: parent.id }
              : undefined,
        }}
        form={form}
      >
        <FormItem
          label="子SKU"
          {...formLayout}
          name="sku"
          rules={[{ required: true, message: '请输入父SKU' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          label="子ASIN"
          {...formLayout}
          name="asin"
          rules={[{ required: true, message: '请输入父ASIN' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem label="父产品SKU" {...formLayout} name="parent">
          <Select
            labelInValue
            placeholder="请查询选择"
            filterOption={false}
            showSearch
            loading={searchLoading}
            onSearch={debounce(searchSku, 1000)}
          >
            {list.map((e: any) => (
              <Option key={e.id} value={e.id}>
                {e.sku}
              </Option>
            ))}
          </Select>
        </FormItem>
      </Form>
    </Modal>
  );
};

export default EditChild;
