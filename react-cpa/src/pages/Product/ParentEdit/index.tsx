import React, { useState } from 'react';
import { Form, Input, message, Modal, Switch } from 'antd';
import Children from './Children';
import { UpdateParent, CreateParent } from './service';
import type { EditParentProps } from './data.d';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const EditParent: React.FC<EditParentProps> = (props) => {
  const [form] = Form.useForm();

  // 父组件传入默认值，可见状态，处理可见方法
  const { store, site, record, visible, handleVisible } = props;

  // 判断添加还是编辑，true为编辑
  const hasCurrent = record && Object.keys(record).length !== 0;

  // 默认值中取出子产品列表，表单子产品项为自定义组件，不用form提取
  const [childList, setChildList] = useState(hasCurrent ? record.items : []);

  const [displayCheck, setDisplayCheck] = useState(hasCurrent ? record.display_status === 1 : true);

  const handleSubmit = async (value: any) => {
    if (hasCurrent) {
      const res = await UpdateParent(record.id, {
        ...value,
        store_id: store,
        site_id: site,
        item_ids: childList.map((e: any) => e.id),
        display_status: displayCheck ? 1 : 0,
      });
      if (res.status === 'ok') {
        handleVisible(false, {}, true);
        message.success('更新信息成功！');
        return;
      }
      message.error('更新信息失败！');
      return;
    } else {
      const res = await CreateParent({
        ...value,
        store_id: store,
        site_id: site,
        item_ids: childList.map((e: any) => e.id),
        display_status: displayCheck ? 1 : 0,
      });
      if (res.status === 'ok') {
        handleVisible(false, {}, true);
        message.success('添加成功！');
        return;
      }
      message.error('添加失败！');
      return;
    }
  };

  return (
    <Modal
      destroyOnClose
      title={hasCurrent ? '编辑父产品' : '添加父产品'}
      width={660}
      visible={visible}
      okText="保存"
      onOk={() => form.submit()}
      onCancel={() => handleVisible(false, {})}
    >
      <Form
        scrollToFirstError
        onFinish={handleSubmit}
        initialValues={{
          sku: record?.sku,
          asin: record?.asin,
          ids: hasCurrent ? record.items : [],
        }}
        form={form}
      >
        <FormItem
          label="父SKU"
          {...formLayout}
          name="sku"
          rules={[{ required: true, message: '请输入父SKU' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          label="父ASIN"
          {...formLayout}
          name="asin"
          rules={[{ required: true, message: '请输入父ASIN' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem label="报表显示" {...formLayout}>
          <Switch checked={displayCheck} onChange={(checked) => setDisplayCheck(checked)} />
        </FormItem>
        <FormItem label="子产品" {...formLayout} name="ids">
          <Children store={store} site={site} data={childList} handleChange={setChildList} />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default EditParent;
