import React, { useImperativeHandle } from 'react';
import { Form, Input, message } from 'antd';
import { createUser, updateUser } from '../service';
import { UserFormProps } from '../data.d';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const UserForm: React.FC<UserFormProps> = props => {

  const [ form ] = Form.useForm();
  const { cRef, current, handleVisible, actionRef } = props;
  const hasCurrent = !!(current && Object.keys(current).length > 0);

  const fakeSubmit = () => {
    form.validateFields()
      .then(async values => {
        // const loading = message.loading(hasCurrent ? '创建中' : '更新中');
        if (hasCurrent) {
          const res = await updateUser(current.id, values);
          // loading();
          if (res.status === 'ok') {
            message.success('更新成功！');
            handleVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          } else {
            message.error('更新失败！')
          }
        } else {
          const res = await createUser(values);
          if (res.status === 'ok') {
            message.success('创建成功！');
            handleVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          } else {
            message.error('创建失败！')
          }
        }
      })
      .catch(errors => {
      })
  };

  useImperativeHandle(cRef, () => ({
    fakeSubmit,
  }));

  return (
    <Form
      scrollToFirstError
      onFinish={fakeSubmit}
      initialValues={{
        name: current?.name,
        email: current?.email,
        mobile: current?.mobile,
        gender: current?.gender,
        signature: current?.signature
      }}
      form={form}
    >
      <FormItem
        label="用户名"
        {...formLayout}
        name='name'
        rules={[
          { required: true, message: '请输入用户名' }
        ]}
      >
        <Input placeholder="请输入" />
      </FormItem>
      <FormItem
        label="邮箱"
        {...formLayout}
        name='email'
        rules={[
          { required: true, message: '请输入用户邮箱' },
          { type: 'email', message: '请输入有效的邮箱格式' }
        ]}
      >
        <Input placeholder="请输入" />
      </FormItem>
      <FormItem
        label={hasCurrent ? "新密码" : '密码'}
        {...formLayout}
        name='password'
        rules={[
          { required: !hasCurrent, message: '请输入登录密码' }
        ]}
      >
        <Input.Password
          placeholder={hasCurrent ? '如不填写，则不修改密码' : '请填写登录密码'}
          autoComplete="new-password"
        />
      </FormItem>
      <FormItem
        label="确认密码"
        {...formLayout}
        name='password_confirmation'
        hasFeedback
        rules={[
          ({ getFieldValue }) => ({
            validator(rule, value) {
              if (getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject('两次密码不匹配');
            },
          }),
        ]}
      >
        <Input.Password placeholder="确认密码" />
      </FormItem>
    </Form>
  );
};

export default UserForm;
