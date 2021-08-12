import React, { PureComponent } from 'react';
import { SketchPicker } from 'react-color';
import { Form, Input, Row, Col, Modal, message } from 'antd';
import { connect } from 'dva';

const { Item } = Form;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

@Form.create()
@connect(({ spec }) => ({
  spec,
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
          type: 'spec/updateValue',
          payload: { id: cId, data: { ...fieldsValue, spec_id: id } },
          callback: () => this.handelSuccessSubmit(),
        });
      } else {
        dispatch({
          type: 'spec/createValue',
          payload: { ...fieldsValue, spec_id: id },
          callback: (res) => this.handelSuccessSubmit(res),
        });
      }
    });
  };

  // 表单成功提交后
  handelSuccessSubmit = (res) => {
    if (res.status === 'error') {
      message.error('数据填写错误，请重新填写后提交！');
    } else {
      const { showForm } = this.props;
      message.success('success');
      showForm(false, {}, true);
    }
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      current,
      type,
    } = this.props;

    return (
      <Modal
        title={Object.keys(current).length ? '编辑规格值' : '新增规格值'}
        visible={visible}
        destroyOnClose
        onCancel={this.onCancel}
        onOk={this.handleFormSubmit}
      >
        <Item label="英文值" {...formLayout}>
          {getFieldDecorator('value', {
            rules: [{ required: true, message: 'Please input value' }],
            initialValue: current.value,
          })(<Input placeholder="input value" />)}
        </Item>
        <Item label="中文值" {...formLayout}>
          {getFieldDecorator('value_cn', {
            initialValue: current.value_cn,
          })(<Input placeholder="输入中文值" />)}
        </Item>
        <Item label="别名" {...formLayout} help="如果需要，请填写">
          {getFieldDecorator('value_alias', {
            rules: [],
            initialValue: current.value_alias,
          })(<Input placeholder="input value alias" />)}
        </Item>
        <Row>
          <Col span={13} offset={7}>
            {type === 'Color' ? (
              <SketchPicker
                color={current.value_alias || ''}
                onChangeComplete={this.handleChangeComplete}
              />
            ) : null}
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default ValueEditForm;
