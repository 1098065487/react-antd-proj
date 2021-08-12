import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useModel } from "umi";
import { PageContainer } from '@ant-design/pro-layout';
import { updateUserInfo } from '@/services/user';
import globalStyles from '@/global.less';
import styles from './index.less';

const { Item } = Form;
const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const Setting: React.FC<{}> = () => {
  const [ form ] = Form.useForm();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [ current ] = useState<any>(initialState?.currentUser);

  // 在其他页面需要单独请求数据这样写
  // useEffect(() => {
  //   (async () => {
  //     const info = await queryUserInfo();
  //     setCurrent(info.body);
  //   })();
  // }, []);


  const handleSubmit = async (value: object) => {
    Object.keys(value).forEach(e => {
      if (value[e] === undefined) {
        delete value[e];
      }
    });
    const res = await updateUserInfo(value);
    if (res.status === 'ok' && initialState) {
      message.success('更新个人信息成功！');
      const currentUser = await initialState?.fetchUserInfo();
      setInitialState({
        ...initialState,
        currentUser,
      });
    } else {
      message.error('更新个人信息失败！');
    }
  };

  return (
    <PageContainer
      className={globalStyles.blank_header}
      header={{
        title: undefined,
        breadcrumb: undefined,
      }}
    >
      <div className={styles.form_content}>
        <Form
          scrollToFirstError
          onFinish={handleSubmit}
          initialValues={current}
          form={form}>
          <Item
            label='用户名'
            name='name'
            {...formLayout}
            rules={[ { required: true, message: '请输入用户名' } ]}
          >
            <Input placeholder="请输入" />
          </Item>
          <Item
            label='邮箱'
            name='email'
            {...formLayout}
            rules={[
              { required: true, message: '请输入用户邮箱' },
              { type: 'email', message: '请输入有效的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入" />
          </Item>
          <Item
            label={Object.keys(current).length !== 0 ? "新密码" : '密码'}
            {...formLayout}
            name='password'
            rules={[
              { required: Object.keys(current).length === 0, message: '请输入登录密码' }
            ]}
          >
            <Input.Password
              placeholder={Object.keys(current).length !== 0 ? '如不填写，则不修改密码' : '请填写登录密码'}
              autoComplete="new-password"
            />
          </Item>
          <Item
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
          </Item>
          <Item wrapperCol={{ span: 13, offset: 7 }} style={{ marginTop: 30 }}>
            <Button type="primary" htmlType="submit">
              确认修改
            </Button>
          </Item>
        </Form>
      </div>
    </PageContainer>
  );
};

export default Setting;
