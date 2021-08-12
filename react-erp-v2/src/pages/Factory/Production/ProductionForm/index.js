import React, { PureComponent } from 'react';
import { Form, Input, Modal, DatePicker } from 'antd';
import { connect } from 'dva';
import moment from 'moment';

const { Item } = Form;
const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@connect(({ factory, loading }) => ({
  factory,
  loading: loading.effects['factory/fetchWarehouseInventory'],
}))
@Form.create()
class InventoryForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSubmit = () => {
    const { dispatch, form, current, showForm } = this.props;
    form.validateFieldsAndScroll((err, fieldValues) => {
      if (err) {
        return;
      }
      const { expect_finished_at } = fieldValues;
      if (current && Object.keys(current).length !== 0) {
        const { id } = current;
        dispatch({
          type: 'factory/updateProduction',
          payload: {
            id,
            data: { ...fieldValues, expect_finished_at: moment(expect_finished_at).format('YYYY-MM-DD') },
          },
          callback: () => showForm(false, {}, true),
        });
      } else {
        dispatch({
          type: 'factory/createProduction',
          payload: { ...fieldValues, expect_finished_at: moment(expect_finished_at).format('YYYY-MM-DD') },
          callback: (res) => {
            if (res.status === 'ok') {
              showForm(false, {}, true);
            }
          },
        });
      }
    });
  };

  handleCancel = () => {
    const { showForm } = this.props;
    showForm(false);
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      current = {},
    } = this.props;

    const disabled = current && Object.keys(current).length !== 0;

    return (
      <Modal
        title={Object.keys(current).length ? '编辑生产单' : '新增生产单'}
        visible={visible}
        destroyOnClose
        width={600}
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
      >
        {disabled ? (
          <Item label="订单号" {...formLayout}>
            {getFieldDecorator('sn', {
              initialValue: current.sn,
            })(<Input disabled />)}
          </Item>
        ) : null}
        <Item label="预计交付日期" {...formLayout}>
          {getFieldDecorator('expect_finished_at', {
            rules: [{ required: true, message: '请选择预计交付日期' }],
            initialValue: current.expect_finished_at ? moment(current.expect_finished_at) : null,
          })(
            <DatePicker
              showTime
              placeholder="请选择"
              format='YYYY-MM-DD'
              style={{ width: '100%' }}
            />,
          )}
        </Item>
        <Item {...formLayout} label="备注信息">
          {getFieldDecorator('remark', {
            initialValue: current.remark,
          })(<TextArea rows={4} placeholder="请输入备注信息" />)}
        </Item>
      </Modal>
    );
  }
}

export default InventoryForm;
