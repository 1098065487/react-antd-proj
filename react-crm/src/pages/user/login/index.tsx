import { AlipayCircleOutlined, TaobaoCircleOutlined, WeiboCircleOutlined } from '@ant-design/icons';
import { Alert, Checkbox, message } from 'antd';
import React, { useState } from 'react';
import { Link, SelectLang, useModel, history, History } from 'umi';
import logo from '@/assets/logo.svg';
import { LoginParamsType, login } from '@/services/login';
import { setLoginCookie, LoginInfo } from '@/utils/utils';
import Footer from '@/components/Footer';
import LoginFrom from './components/Login';
import styles from './style.less';

const { Tab, Username, Password, Mobile, Captcha, Submit } = LoginFrom;

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

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

const Login: React.FC<{}> = () => {
  const [ userLoginState, setUserLoginState ] = useState<API.LoginStateType>({});
  const [ submitting, setSubmitting ] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [ autoLogin, setAutoLogin ] = useState(true);
  const [ type, setType ] = useState<string>('account');
  const handleSubmit = async (values: LoginParamsType) => {
    setSubmitting(true);
    try {
      // 登录
      const msg = await login({ ...values, type });
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
        const errors = msg.body?.errors;
        if (errors) {
          if (Object.values(errors).length !== 0) {
            const errorInfo = Object.values(errors)[0];
            setUserLoginState({ status: "error", 'errorInfo': errorInfo as string, 'type': type });
            // message.error(errorInfo as string);
          }
        }
      }
    } catch (error) {
      message.error('登录失败，请重试！');
    }
    setSubmitting(false);
  };

  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <div className={styles.lang}>
        <SelectLang />
      </div>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <img alt="logo" className={styles.logo} src={logo} />
              <span className={styles.title}>LTG CRM</span>
            </Link>
          </div>
          <div className={styles.desc}>LTG CRM 华尔英赛独立站客户关系管理系统</div>
        </div>

        <div className={styles.main}>
          <LoginFrom activeKey={type} onTabChange={setType} onSubmit={handleSubmit}>
            <Tab key="account" tab="账户密码登录">
              {status === 'error' && loginType === 'account' && !submitting && (
                <LoginMessage content='账户或密码错误' />
              )}

              <Username
                name="name"
                placeholder="请输入用户名"
                rules={[
                  {
                    required: true,
                    message: '请输入用户名!',
                  },
                ]}
              />
              <Password
                name="password"
                placeholder="请输入密码"
                rules={[
                  {
                    required: true,
                    message: '请输入密码！',
                  },
                ]}
              />
            </Tab>
            <Tab key="mobile" tab="手机号登录">
              {status === 'error' && loginType === 'mobile' && !submitting && (
                <LoginMessage content="验证码错误" />
              )}
              <Mobile
                name="mobile"
                placeholder="手机号"
                rules={[
                  {
                    required: true,
                    message: '请输入手机号！',
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: '手机号格式错误！',
                  },
                ]}
              />
              <Captcha
                name="captcha"
                placeholder="验证码"
                countDown={120}
                getCaptchaButtonText=""
                getCaptchaSecondText="秒"
                rules={[
                  {
                    required: true,
                    message: '请输入验证码！',
                  },
                ]}
              />
            </Tab>
            <div>
              <Checkbox checked={autoLogin} onChange={(e) => setAutoLogin(e.target.checked)}>
                自动登录
              </Checkbox>
              <a
                style={{
                  float: 'right',
                }}
              >
                忘记密码
              </a>
            </div>
            <Submit loading={submitting}>登录</Submit>
            <div className={styles.other}>
              其他登录方式
              <AlipayCircleOutlined className={styles.icon} />
              <TaobaoCircleOutlined className={styles.icon} />
              <WeiboCircleOutlined className={styles.icon} />
              <Link className={styles.register} to="/user/register">
                注册账户
              </Link>
            </div>
          </LoginFrom>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
