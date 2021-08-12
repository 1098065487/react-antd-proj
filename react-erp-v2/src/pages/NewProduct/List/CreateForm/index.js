import React, { PureComponent } from 'react';
import { Cascader, DatePicker, Form, Input, Modal, Select } from 'antd';
import { connect } from 'dva';
import moment from 'moment';

const { Item } = Form;
const { TextArea } = Input;
const SelectOption = Select.Option;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

@connect(({ newProduct }) => ({
  newProduct,
}))
@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSubmit = () => {
    const { dispatch, form, onCancel } = this.props;
    form.validateFieldsAndScroll((err, fieldValues) => {
      if (err) {
        return;
      }
      const { expected_start_time, expected_order_time } = fieldValues;
      const expectStartAt = moment(expected_start_time).format('YYYY-MM-DD');
      const expectEndAt = moment(expected_order_time).format('YYYY-MM-DD');
      dispatch({
        type: 'newProduct/create',
        payload: {
          workflow_name: 'new-product',
          payload: { ...fieldValues, expected_start_time: expectStartAt, expected_order_time: expectEndAt },
        },
        callback: () => onCancel(false, true),
      });
    });
  };

  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel(false);
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      categories,
    } = this.props;
    return (
      <Modal
        title="发起新品开发流程"
        visible={visible}
        destroyOnClose
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
      >
        <Item label="标题" {...formLayout}>
          {getFieldDecorator('title', {
            rules: [{ required: true, message: '请输入标题' }],
          })(<Input placeholder="请输入" />)}
        </Item>
        <Item label="产品分类" {...formLayout}>
          {getFieldDecorator('category_id', {
            rules: [{ required: true, message: '请选择产品分类' }],
          })(
            <Cascader
              options={categories}
              placeholder="请选择产品分类"
              style={{ width: '100%' }}
            />,
          )}
        </Item>
        <Item label="开发类型" {...formLayout}>
          {getFieldDecorator('develop_type')(
            <Select placeholder="请选择" style={{ width: '100%' }}>
              <SelectOption value='new'>新品开发</SelectOption>
              <SelectOption value='old'>老品改良</SelectOption>
            </Select>,
          )}
        </Item>
        <Item label="预计开始时间" {...formLayout}>
          {getFieldDecorator('expected_start_time')(
            <DatePicker
              showTime
              placeholder="请选择"
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
            />,
          )}
        </Item>
        <Item label="预计下单时间" {...formLayout}>
          {getFieldDecorator('expected_order_time')(
            <DatePicker
              showTime
              placeholder="请选择"
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
            />,
          )}
        </Item>
        <Item label="备注" {...formLayout}>
          {getFieldDecorator('remark')(<TextArea />)}
        </Item>
      </Modal>
    );
  }
}

export default CreateForm;
