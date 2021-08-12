import { connect } from 'dva';
import React, { PureComponent } from 'react';
import { Form, Input, Select } from 'antd';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};
const genders = ['保密', '男', '女'];

@connect(({ user, loading }) => ({
  user,
  loading: loading.effects['user/fetchAllRoles'],
}))
class UserForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      form: { getFieldDecorator },
      current,
    } = this.props;
    const hasCurrent = current && Object.keys(current).length > 0;

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem label="用户名" {...formLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入用户名' }],
            initialValue: current.name,
          })(<Input placeholder="请输入" disabled={hasCurrent} />)}
        </FormItem>
        <FormItem label="邮箱" {...formLayout}>
          {getFieldDecorator('email', {
            rules: [{ type: 'email', required: true, message: '请输入用户邮箱' }],
            initialValue: current.email,
          })(<Input placeholder="请输入" disabled={hasCurrent} />)}
        </FormItem>
        <FormItem label="手机号" {...formLayout}>
          {getFieldDecorator('mobile', {
            rules: [{ required: true, message: '请输入用户手机号' }],
            initialValue: current.mobile,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem label="性别" {...formLayout}>
          {getFieldDecorator('gender', {
            rules: [{ required: true, message: '请选择用户性别' }],
            initialValue: current.gender,
          })(
            <Select placeholder="请选择">
              {genders.map((label, key) => (
                <Option key value={key}>
                  {label}
                </Option>
              ))}
            </Select>,
          )}
        </FormItem>
        <FormItem label="新密码" {...formLayout}>
          {getFieldDecorator('password', {
            rules: [{ required: !hasCurrent, message: '请输入登录密码' }],
            initialValue: '',
          })(
            <Input
              type="password"
              placeholder={hasCurrent ? '如不填写，则不修改密码' : '请填写登录密码'}
              autoComplete="new-password"
            />,
          )}
        </FormItem>
        <FormItem label="确认密码" {...formLayout}>
          {getFieldDecorator('password_confirmation', {
            initialValue: '',
          })(<Input type="password" placeholder="确认密码" />)}
        </FormItem>
        <FormItem label="个性签名" {...formLayout}>
          {getFieldDecorator('signature', {
            rules: [{ message: '请输入至少五个字符的个性签名！' }],
            initialValue: current.signature,
          })(<TextArea rows={4} placeholder="请输入个性签名" />)}
        </FormItem>
      </Form>
    );
  }
}

export default UserForm;
