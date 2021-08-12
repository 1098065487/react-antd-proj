import React, { PureComponent } from 'react';
import { DatePicker, Form, Input, Modal } from 'antd';
import { connect } from "dva";
import moment from 'moment';

const { Item } = Form;
const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

@connect(({ newProduct }) => ({
  newProduct,
}))
@Form.create()
class ProofingForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSubmit = () => {
    const { dispatch, form, onCancel, id, goBack } = this.props;
    form.validateFieldsAndScroll((err, fieldValues) => {
      if (err) {
        return;
      }
      const { expected_start_time, expected_end_time } = fieldValues;
      const expectStartAt = moment(expected_start_time).format('YYYY-MM-DD');
      const expectEndAt = moment(expected_end_time).format('YYYY-MM-DD');
      dispatch({
        type: 'newProduct/submitToNext',
        payload: { 'id': id,
          data: {
            payload: { ...fieldValues, expected_start_time: expectStartAt, expected_end_time: expectEndAt },
            action: 'submit'
          }
        },
        callback: res => {
          if (res.status === 'ok') {
            onCancel(false);
            Modal.success({
              title: '提示',
              content: '提交成功！返回列表。',
              okText: '确定',
              onOk: () => goBack(),
            });
          }
        }
      })
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
    } = this.props;
    return (
      <Modal
        title='打样信息'
        visible={visible}
        destroyOnClose
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
      >
        <Item label="计划开始时间" {...formLayout}>
          {getFieldDecorator('expected_start_time', {
            rules: [{ required: true, message: '请选择计划开始时间' }],
          })(
            <DatePicker
              showTime
              placeholder="请选择"
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
            />
          )}
        </Item>
        <Item label="计划结束时间" {...formLayout}>
          {getFieldDecorator('expected_end_time', {
            rules: [{ required: true, message: '请选择计划结束时间' }],
          })(
            <DatePicker
              showTime
              placeholder="请选择"
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
            />
          )}
        </Item>
        <Item label="备注" {...formLayout}>
          {getFieldDecorator('remark')(<TextArea />)}
        </Item>
      </Modal>
    );
  }
}

export default ProofingForm;
