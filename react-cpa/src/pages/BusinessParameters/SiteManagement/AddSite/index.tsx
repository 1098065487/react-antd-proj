import React, { useState } from 'react'
import { Form, Modal, message as Message, Input, Switch } from 'antd'
import { AddSiteProps } from './addSite.d'
import { addSite, updateSite, updateSiteConfig } from './service'
import styles from './index.less'

const { TextArea } = Input;
const AddSite: React.FC<AddSiteProps> = ({ visible, setVisible, addSuccess, site, setSite }) => {
  const type = site?.id ? '修改' : '新建';
  const [form] = Form.useForm();
  const [saveLoading, setSaveLoading] = useState(false);
  // 取消
  const handleCancel = () => {
    setVisible(false);
    setSite(undefined)
    form.resetFields();
  };

  // 提交完成后
  const handleSubmitDown = (status: string) => {
    setSaveLoading(false)
    if (status === 'ok') {
      Message.success(`${type}成功`)
      handleCancel()
      addSuccess()
    }
  }

  // 提交
  const handleSubmit = async ({ name, short_name, domain, config, status: siteStatus }: { name: string; short_name: string; domain: string; config: string; status: boolean }) => {
    setSaveLoading(true)
    let status
    if (site?.id) {
      Promise.all([
        updateSite({ id: site.id, name, short_name, domain, status: siteStatus ? 'On' : 'Off' }),
        updateSiteConfig({ id: site.id, config })
      ]).then(res => {
        const [{ status: updateSiteStatus }, { status: updateSiteConfigStatus }] = res
        status = updateSiteStatus === 'ok' && updateSiteConfigStatus === 'ok' ? 'ok' : 'error'
        handleSubmitDown(status)
      })
    } else {
      const response = await addSite({ name, short_name, domain, status: siteStatus ? 'On' : 'Off' })
      status = response.status
      handleSubmitDown(status)
    }
  }

  return (
    <Modal
      width={440}
      getContainer={false}
      title={`${type}站点`}
      visible={visible}
      onOk={() => form.submit()}
      confirmLoading={saveLoading}
      onCancel={handleCancel}
      centered
      bodyStyle={{ padding: '10px 20px' }}
    >
      <Form className={styles.addForm} form={form} onFinish={handleSubmit} initialValues={{
        name: site?.name,
        short_name: site?.short_name,
        domain: site?.domain,
        config: site?.config?.config && JSON.stringify(site.config.config),
        status: site?.status === 'On'
      }} >
        <Form.Item label="站点名称" name='name' rules={[{
          required: true,
          message: '站点名称不能为空',
        },]} className={styles.addFormItem}>
          <Input style={{ width: '400px' }} />
        </Form.Item>
        <Form.Item label="短名" name='short_name' rules={[{
          required: true,
          message: '短名不能为空',
        },]} className={styles.addFormItem}>
          <Input style={{ width: '400px' }} />
        </Form.Item>
        <Form.Item label="域名" name='domain' rules={[{
          required: true,
          message: '域名不能为空',
        },]} className={styles.addFormItem}>
          <Input style={{ width: '400px' }} />
        </Form.Item>
        <Form.Item label="状态" name='status' valuePropName='checked' className={styles.addFormItem}>
          <Switch />
        </Form.Item>
        {site?.id &&
          <Form.Item label="配置" name='config' rules={[{
            required: true,
            message: '配置项不能为空',
          },]} className={styles.addFormItem}>
            <TextArea style={{ width: '400px' }} autoSize={{ minRows: 4, maxRows: 10 }} />
          </Form.Item>
        }
      </Form>
    </Modal >
  )
}

export default AddSite