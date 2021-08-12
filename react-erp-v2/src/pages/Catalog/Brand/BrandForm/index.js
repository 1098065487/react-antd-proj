import React, { PureComponent } from 'react';
import { Form, Input } from 'antd';

const { Item } = Form;
const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

class BrandForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      form: { getFieldDecorator },
      current = {},
    } = this.props;
    return (
      <Form>
        <Item label="Name" {...formLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please input name' }],
            initialValue: current.name,
          })(<Input placeholder="input name" />)}
        </Item>
        <Item label="Description" {...formLayout}>
          {getFieldDecorator('description', {
            rules: [],
            initialValue: current.description,
          })(<TextArea />)}
        </Item>
      </Form>
    );
  }
}

export default BrandForm;
