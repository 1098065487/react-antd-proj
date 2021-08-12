import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'antd';
import { connect } from 'dva';

const { Item } = Form;
const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

@connect(({ logistic, loading }) => ({
  logistic,
  loading: loading.effects['logistic/fetchWarehouseInventory'],
}))
@Form.create()
class BoxForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSubmit = () => {
    const { dispatch, form, current, inventory, onCancel } = this.props;
    form.validateFieldsAndScroll((err, fieldValues) => {
      if (err) {
        return;
      }
      if (current && Object.keys(current).length !== 0) {
        const { id, warehouse_inventory_id } = current;
        dispatch({
          type: 'logistic/updateBox',
          payload: { id, data: { warehouse_inventory_id, ...fieldValues } },
          callback: () => onCancel(false, {}, {}, true),
        });
      } else {
        const { id } = inventory;
        dispatch({
          type: 'logistic/createBox',
          payload: { warehouse_inventory_id: id, ...fieldValues },
          callback: () => onCancel(false, {}, {}, true),
        });
      }
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
      current = {},
    } = this.props;

    return (
      <Modal
        title={Object.keys(current).length ? '编辑箱号' : '新建箱号'}
        visible={visible}
        destroyOnClose
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
      >
        <Item label="箱号" {...formLayout}>
          {getFieldDecorator('box', {
            rules: [{ required: true, message: '请输入箱号' }],
            initialValue: current.box,
          })(<Input placeholder="请输入" />)}
        </Item>
        <Item label="数量" {...formLayout}>
          {getFieldDecorator('quantity', {
            rules: [{ required: true, message: '请输入数量' }],
            initialValue: current.quantity,
          })(<Input placeholder="请输入" />)}
        </Item>
      </Modal>

    );
  }
}

export default BoxForm;
