import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { Button, Form, Input, List, message, Modal } from 'antd';
// import { getTimeDistance } from '@/utils/utils';

const passwordStrength = {
  strong: (
    <font className="strong">
      <FormattedMessage id="app.settings.security.strong" defaultMessage="Strong" />
    </font>
  ),
  medium: (
    <font className="medium">
      <FormattedMessage id="app.settings.security.medium" defaultMessage="Medium" />
    </font>
  ),
  weak: (
    <font className="weak">
      <FormattedMessage id="app.settings.security.weak" defaultMessage="Weak" />
      Weak
    </font>
  ),
};

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

@connect(({ user, loading }) => ({
  currentUser: user.currentUser,
  submitting: loading.effects['user/updateAuthPassword'],
}))
@Form.create()
class SecurityView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      passwordModel: false,
      confirmDirty: false,
    };
  }

  renderPasswordStrength = (passwordSecurity) => {
    return passwordStrength[passwordSecurity];
  };

  changePassword = flag => {
    this.setState({ passwordModel: !!flag });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('密码不一致！');
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    const { confirmDirty } = this.state;
    if (value && confirmDirty) {
      form.validateFields(['password_confirmation'], { force: true });
    }
    callback();
  };

  // 修改密码
  handleSubmitPassword = () => {
    const { dispatch, form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'user/updateAuthPassword',
          payload: values,
          callback: () => {
            this.setState({
                passwordModel: false,
              }, () => {
                message.success('密码修改成功！');
              },
            );
          },
        });
      }
    });
  };

  getData = (user) => {
    const { password_security } = user;
    return [
      {
        title: formatMessage({ id: 'app.settings.security.password' }, {}),
        description: (
          <Fragment>
            {formatMessage({ id: 'app.settings.security.password-description' })}：
            {this.renderPasswordStrength(password_security)}
          </Fragment>
        ),
        actions: [
          <Button type='link' onClick={() => this.changePassword(true)}>
            <FormattedMessage id="app.settings.security.modify" defaultMessage="Modify" />
          </Button>,
        ],
      },
      {
        title: formatMessage({ id: 'app.settings.security.phone' }, {}),
        description: `${formatMessage(
          { id: 'app.settings.security.phone-description' },
          {},
        )}：${user.mobile}`,
        actions: [
          <Button type='link'>
            <FormattedMessage id="app.settings.security.modify" defaultMessage="Modify" />
          </Button>,
        ],
      },
      {
        title: formatMessage({ id: 'app.settings.security.question' }, {}),
        description: formatMessage({ id: 'app.settings.security.question-description' }, {}),
        actions: [
          <Button type='link'>
            <FormattedMessage id="app.settings.security.set" defaultMessage="Set" />
          </Button>,
        ],
      },
    ];
  };

  render() {
    const { currentUser, submitting, form: { getFieldDecorator } } = this.props;
    const { passwordModel } = this.state;

    return (
      <Fragment>
        <List
          itemLayout="horizontal"
          dataSource={this.getData(currentUser)}
          renderItem={item => (
            <List.Item actions={item.actions}>
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
        <Modal
          destroyOnClose
          visible={passwordModel}
          title="修改密码"
          onCancel={() => this.changePassword(false)}
          footer={[
            <Button key="back" onClick={() => this.changePassword(false)}>
              取消
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={submitting}
              onClick={() => this.handleSubmitPassword()}
            >
              提交
            </Button>,
          ]}
        >
          <Form>
            <Form.Item {...formItemLayout} label="新密码">
              {getFieldDecorator('password', {
                rules: [
                  { required: true, message: '请输入登录密码' },
                  { min: 6, message: '密码长度不能小于6位' },
                  { max: 18, message: '密码长度不能大于18位' },
                  { validator: this.validateToNextPassword },
                ],
              })(
                <Input.Password
                  placeholder='请填写登录密码'
                  autoComplete='new-password'
                />,
              )}
            </Form.Item>
            <Form.Item {...formItemLayout} label="确认密码" hasFeedback>
              {getFieldDecorator('password_confirmation', {
                rules: [{
                  required: true,
                  message: '请二次确认密码!',
                }, {
                  validator: this.compareToFirstPassword,
                }],
              })(<Input.Password placeholder="确认密码" />)}
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

export default SecurityView;
