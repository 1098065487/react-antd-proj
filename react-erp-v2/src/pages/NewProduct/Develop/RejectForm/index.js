import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'antd';
import { connect } from "dva";

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
class RejectForm extends PureComponent {
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
      dispatch({
        type: 'newProduct/submitToNext',
        payload: { 'id': id, data: { payload: fieldValues, action: 'reject' } },
        callback: res => {
          if (res.status === 'ok') {
            onCancel(false);
            Modal.success({
              title: '提示',
              content: '驳回成功！返回列表。',
              okText: '确定',
              onOk: () => goBack(),
            });
          }
        },
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
        <Item label="驳回原因" {...formLayout}>
          {getFieldDecorator('reason', {
            rules: [{ required: true, message: '请输入驳回原因！' }],
          })(<TextArea />)}
        </Item>
      </Modal>
    );
  }
}

export default RejectForm;
