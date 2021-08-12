import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, Select, message } from 'antd';

const { Item } = Form;
const { Option } = Select;
const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};
const types = [
  { value: 'Radio', text: '单选' },
  { value: 'Checkbox', text: '多选' },
  { value: 'Color', text: '颜色' },
  { value: 'Select', text: '下拉单选' },
  { value: 'MultipleSelect', text: '下拉多选' },
];

@Form.create()
@connect(({ attribute }) => ({
  attribute,
}))
class EditForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onCancel = () => {
    const { showForm } = this.props;
    showForm(false);
  };

  // 数据提交
  handleFormSubmit = () => {
    const { dispatch, form, current } = this.props;
    const id = current ? current.id : null;
    form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      if (id) {
        dispatch({
          type: 'attribute/update',
          payload: { id, data: { ...fieldsValue } },
          callback: () => this.handelSuccessSubmit(),
        });
      } else {
        dispatch({
          type: 'attribute/create',
          payload: { ...fieldsValue },
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
      current = {},
      visible,
    } = this.props;
    return (
      <Modal
        title={Object.keys(current).length ? '编辑属性' : '新增属性'}
        visible={visible}
        destroyOnClose
        onCancel={this.onCancel}
        onOk={this.handleFormSubmit}
      >
        <Item label="属性" {...formLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please input name' }],
            initialValue: current.name,
          })(<Input placeholder="input name" />)}
        </Item>
        <Item label="描述" {...formLayout}>
          {getFieldDecorator('description', {
            rules: [{ required: true, message: 'Please input description' }],
            initialValue: current.description,
          })(<TextArea placeholder="input description" />)}
        </Item>
        <Item label="类型" {...formLayout}>
          {getFieldDecorator('type', {
            rules: [],
            initialValue: current.type,
          })(
            <Select placeholder="select type" style={{ width: '100%' }}>
              {types.map(item => (
                <Option key={item.value} value={item.value}>
                  {item.text}
                </Option>
              ))}
            </Select>,
          )}
        </Item>
      </Modal>
    );
  }
}

export default EditForm;
