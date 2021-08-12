import React, { useState } from 'react';
import { Space, Divider, Form, Button, Input, message, Alert } from 'antd';
import { GlobalOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { useModel, history, History } from 'umi';
import loginImg from '@/assets/login-img.png';
import { login, LoginParamsType } from "@/services/login";
import { LoginInfo, setLoginCookie } from "@/utils/utils";
import styles from './styles.less';

const Login: React.FC = () => {
  const [ form ] = Form.useForm();
  const [ submitting, setSubmitting ] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [ userLoginStatus, setUserLoginStatus ] = useState('');

  /**
   * 此方法会跳转到 redirect 参数所在的位置
   */
  const replaceGoto = () => {
    setTimeout(() => {
      const { query } = history.location;
      const { redirect } = query as { redirect: string };
      if (!redirect) {
        history.replace('/');
        return;
      }
      (history as History).replace(redirect);
    }, 10);
  };

  const handleSubmit = async (values: LoginParamsType) => {
    setSubmitting(true);
    try {
      // 登录
      const msg = await login(values);
      if (msg.status === 'ok' && initialState) {
        message.success('登录成功！');
        setLoginCookie(msg.body as LoginInfo);
        const currentUser = await initialState?.fetchUserInfo();
        setInitialState({
          ...initialState,
          currentUser,
        });
        replaceGoto();
        return;
      }
      if (msg.status === 'error') {
        // 自己写登录失败提示
        setUserLoginStatus('error')
      }
    } catch (error) {
      message.error('登录失败，请重试！');
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.login_bg}>
      <div className={styles.login_content}>
        <div className={styles.login_img}>
          <img src={loginImg} alt='crm' />
        </div>
        <div className={styles.login_form}>
          <Space className={styles.title}>
            <GlobalOutlined style={{ fontSize: 25, color: '#4065E0', display: 'block' }} />
            <Divider type="vertical" style={{ border: '1px solid #4065E0', fontSize: 30, display: 'block', top: 0 }} />
            <p>CRM管理系统</p>
          </Space>
          <Form
            scrollToFirstError
            onFinish={handleSubmit}
            form={form}
            style={{ position: 'relative' }}
          >
            {userLoginStatus === 'error' ? (
              <Alert
                style={{
                  position: 'absolute',
                  top: '-60px',
                  width: '100%',
                  margin: '12px 0'
                }}
                message='账户或密码错误'
                type="error"
                showIcon
              />
            ) : null}
            <div className={styles.form}>
              <Form.Item
                wrapperCol={{ span: 24 }}
                name='name'
                rules={[
                  { required: true, message: '输入账号或邮箱' }
                ]}
                style={{ marginBottom: '2.56vh' }}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="输入账号或邮箱"
                  bordered={false}
                />
              </Form.Item>
              <Form.Item
                wrapperCol={{ span: 24 }}
                name='password'
                rules={[
                  { required: true, message: '输入密码' },
                ]}
                style={{ marginBottom: '0.52vh' }}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder='输入密码'
                  bordered={false}
                  onPressEnter={() => form.submit()}
                />
              </Form.Item>
              <Button onClick={() => form.submit()} loading={submitting} type='primary'
                      style={{ width: '100%', marginTop: '3.7vh', fontSize: 16, height: 40 }}>登 录</Button>
            </div>
          </Form>
          <div className={styles.company}>苏州华尔英赛信息技术有限公司</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
