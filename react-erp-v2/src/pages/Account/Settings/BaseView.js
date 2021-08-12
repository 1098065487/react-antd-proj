import React, { Component } from 'react';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Upload, Button, Row, Col, message } from 'antd';
import { connect } from 'dva';
import styles from './BaseView.less';
import { getUploadProps } from '@/utils/utils';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

@connect(({ user, loading }) => ({
  currentUser: user.currentUser,
  submitting: loading.effects['user/updateAuthInfo'],
}))
@Form.create()
class BaseView extends Component {
  componentDidMount() {
    this.setBaseInfo();
  }

  setBaseInfo = () => {
    const { currentUser, form } = this.props;
    Object.keys(form.getFieldsValue()).forEach(key => {
      const obj = {};
      obj[key] = currentUser[key] || null;
      form.setFieldsValue(obj);
    });
  };

  getAvatarURL() {
    const { currentUser } = this.props;
    if (currentUser.avatar) {
      return currentUser.avatar;
    }
    return 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';
  }

  getViewDom = ref => {
    this.view = ref;
  };

  // 可以把 onChange 的参数（如 event）转化为控件的值
  handleUpload = e => {
    const { dispatch } = this.props;
    const { file: { response } } = e;
    if (response) {
      dispatch({
        type: 'user/saveCurrentUser',
        payload: response,
      });
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'user/updateAuthInfo',
          payload: values,
          callback: () => {
            message.success('更新成功');
          },
        });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      submitting,
    } = this.props;
    const uploadProps = getUploadProps('api/auth/avatar');
    const avatar = this.getAvatarURL();

    return (
      <div className={styles.baseView}>
        <Row gutter={24}>
          <Col lg={16} md={24}>
            <Form onSubmit={this.handleSubmit}>
              <FormItem {...formItemLayout} label={formatMessage({ id: 'app.settings.basic.email' })}>
                {getFieldDecorator('email', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'app.settings.basic.email-message' }, {}),
                    },
                  ],
                })(<Input disabled />)}
              </FormItem>
              <FormItem {...formItemLayout} label={formatMessage({ id: 'app.settings.basic.nickname' })}>
                {getFieldDecorator('name', {
                  rules: [{
                    required: true,
                    message: formatMessage({ id: 'app.settings.basic.nickname-message' }, {}),
                  }],
                })(<Input />)}
              </FormItem>
              <FormItem {...formItemLayout} label={formatMessage({ id: 'app.settings.basic.profile' })}>
                {getFieldDecorator('signature', {
                  rules: [{
                    required: true,
                    message: formatMessage({ id: 'app.settings.basic.profile-message' }, {}),
                  }],
                })(
                  <Input.TextArea
                    placeholder={formatMessage({ id: 'app.settings.basic.profile-placeholder' })}
                    rows={4}
                  />,
                )}
              </FormItem>
              <FormItem wrapperCol={{ span: 16, offset: 4 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                >
                  <FormattedMessage
                    id="app.settings.basic.update"
                    defaultMessage="Update Information"
                  />
                </Button>
              </FormItem>
            </Form>
          </Col>
          <Col lg={8} md={24}>
            <div className={styles.avatar}>
              <img src={avatar} alt="avatar" />
            </div>
            <Upload {...uploadProps} onChange={this.handleUpload}>
              <div className={styles.button_view}>
                <Button icon="upload">
                  <FormattedMessage id="app.settings.basic.change-avatar" defaultMessage="Change avatar" />
                </Button>
              </div>
            </Upload>
          </Col>
        </Row>
      </div>
    );
  }
}

export default BaseView;
