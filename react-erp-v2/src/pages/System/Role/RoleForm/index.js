import React, { PureComponent } from 'react';
import { Form, Input } from 'antd';

const { Item } = Form;
const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

class RoleForm extends PureComponent {
  constructor(props) {
    super(props);
    const { current } = props;
    this.state = { current };
  }

  componentDidMount() {}

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    const { current } = this.state;
    return (
      <Form>
        <Item label="Name" {...formLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please input role name' }],
            initialValue: current.name,
          })(<Input placeholder="input role name" />)}
        </Item>
        <Item label="Description" {...formLayout}>
          {getFieldDecorator('description', {
            rules: [],
            initialValue: current.description,
          })(<TextArea placeholder="input role description" />)}
        </Item>
      </Form>
    );
  }
}

export default RoleForm;
