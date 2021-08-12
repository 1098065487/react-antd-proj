/*
 * @Author: wjw
 * @Date: 2020-07-20 10:07:34
 * @LastEditTime: 2020-09-02 18:12:46
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Logistic\Warehouse\WarehouseForm\index.js
 */
import React, { PureComponent } from 'react';
import { Form, Input, Select } from 'antd';

const { Item } = Form;
const { TextArea } = Input;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

class WarehouseForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      form: { getFieldDecorator },
      current = {},
    } = this.props;
    const disabled = current && Object.keys(current).length !== 0;
    return (
      <Form>
        <Item label="仓库名称" {...formLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入仓库名称' }],
            initialValue: current.name,
          })(<Input placeholder="请输入" disabled={disabled} />)}
        </Item>
        <Item label="仓库类型" {...formLayout}>
          {getFieldDecorator('type', {
            rules: [{ required: true, message: '请选择仓库类型' }],
            initialValue: current.type,
          })(
            <Select onChange={this.handleChange}>
              <Option value="LG">LG</Option>
              <Option value="LB">LB</Option>
            </Select>
          )}
        </Item>
        <Item label="仓库地址" {...formLayout}>
          {getFieldDecorator('address', {
            rules: [{ required: true, message: '请输入仓库地址' }],
            initialValue: current.address,
          })(<Input placeholder="请输入" />)}
        </Item>
        <Item label="仓库描述" {...formLayout}>
          {getFieldDecorator('description', {
            initialValue: current.description,
          })(<TextArea placeholder="请输入" />)}
        </Item>
      </Form>
    );
  }
}

export default WarehouseForm;
