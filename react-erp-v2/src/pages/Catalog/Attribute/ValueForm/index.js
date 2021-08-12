import React, { PureComponent } from 'react';
import { Form, Input, Modal, message } from 'antd';
import { connect } from 'dva';

const { Item } = Form;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

@Form.create()
@connect(({ attribute }) => ({
  attribute,
}))
class ValueEditForm extends PureComponent {
  constructor(props) {
    super(props);
    const { current } = props;
    this.state = { current };
  }

  handleChangeComplete = obj => {
    const { form } = this.props;
    const { current } = this.state;
    this.setState({ current: { ...current, value_alias: obj.hex } });
    form.setFieldsValue({ value_alias: obj.hex });
  };

  onCancel = () => {
    const { showForm } = this.props;
    showForm(false);
  };

  // 数据提交
  handleFormSubmit = () => {
    const { dispatch, form, current, id } = this.props;
    const cId = current ? current.id : null;
    form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      if (cId) {
        dispatch({
          type: 'attribute/updateValue',
          payload: { id: cId, data: { ...fieldsValue, attribute_id: id } },
          callback: () => this.handelSuccessSubmit(),
        });
      } else {
        dispatch({
          type: 'attribute/createValue',
          payload: { ...fieldsValue, attribute_id: id },
          callback: () => this.handelSuccessSubmit(),
        });
      }
    });
  };

  // 表单成功提交后
  handelSuccessSubmit = () => {
    const { showForm } = this.props;
    message.success('success');
    showForm(false, {}, true);
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      current,
    } = this.props;

    return (
      <Modal
        title={Object.keys(current).length ? '编辑属性值' : '新增属性值'}
        visible={visible}
        destroyOnClose
        onCancel={this.onCancel}
        onOk={this.handleFormSubmit}
      >
        <Item label="Value" {...formLayout}>
          {getFieldDecorator('value', {
            rules: [{ required: true, message: 'Please input value' }],
            initialValue: current.value,
          })(<Input placeholder="input value" />)}
        </Item>
        <Item label="Value Alias" {...formLayout}>
          {getFieldDecorator('value_alias', {
            rules: [],
            initialValue: current.value_alias,
          })(<Input placeholder="input value alias" />)}
        </Item>
      </Modal>
    );
  }
}

export default ValueEditForm;
