import React, { PureComponent } from 'react';
import { Form, Input, Modal, InputNumber, message } from 'antd';
import { connect } from 'dva';

const { Item } = Form;
const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@connect(({ product, factory }) => ({
  product,
  factory,
}))
@Form.create()
class ProductForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      color: props.current ? props.current.color : '',
      size: props.current ? props.current.size : ''
    };
  }

  handleSubmit = () => {
    const { dispatch, form, current, factory_product_id, showForm, spu } = this.props;
    const { color, size } = this.state;
    form.validateFieldsAndScroll((err, fieldValues) => {
      if (err) {
        return;
      }
      if (current && Object.keys(current).length !== 0) {
        const { id } = current;
        dispatch({
          type: 'factory/updateProduct',
          payload: { id, data: { ...fieldValues, 'factory_product_id': factory_product_id, sku: spu + color + size } },
          callback: (res) => {
            if(res.status === 'ok') {
              message.success('更新成功！');
              showForm(false, {}, true);
            } else {
              message.error('更新失败！')
            }
          }
        });
      } else {
        dispatch({
          type: 'factory/createProduct',
          payload: { ...fieldValues, 'factory_product_id': factory_product_id, sku: spu + color + size },
          callback: (res) => {
            if (res.status === 'ok') {
              message.success('添加成功！');
              showForm(false, {}, true);
            } else {
              message.error('添加失败！')
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

  renderColor = () => {
    const { form } = this.props;
    const value = form.getFieldValue('color');
    this.setState({
      color: value
    })
  };

  renderSize = () => {
    const { form } = this.props;
    const value = form.getFieldValue('size');
    this.setState({
      size: value
    })
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      spu,
      current = {},
    } = this.props;

    const { color, size } = this.state;

    return (
      <Modal
        visible={visible}
        destroyOnClose
        width={600}
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
      >
        <Item {...formLayout} label="货号">
          {getFieldDecorator('spu', {
            initialValue: spu,
          })(<Input disabled />)}
        </Item>
        <Item {...formLayout} label="颜色">
          {getFieldDecorator('color', {
            rules: [{ required: true, message: '请输入颜色！' }],
            initialValue: current.color,
          })(<Input placeholder="请输入颜色" onBlur={this.renderColor} />)}
        </Item>
        <Item {...formLayout} label="尺码">
          {getFieldDecorator('size', {
            rules: [{ required: true, message: '请输入尺码！' }],
            initialValue: current.size,
          })(<Input placeholder="请输入尺码" onBlur={this.renderSize} />)}
        </Item>
        <div style={{ marginTop: -20, marginBottom: 14, fontSize: 15, marginLeft: 138 }}>工厂Sku：{spu + color + size}</div>
        <Item {...formLayout} label="中文成分">
          {getFieldDecorator('composition', {
            initialValue: current.composition,
          })(<Input placeholder="请输入中文成分" />)}
        </Item>
        <Item {...formLayout} label="成本（￥）">
          {getFieldDecorator('price', {
            initialValue: current.price,
          })(<InputNumber style={{width: '100%'}} precision={2} />)}
        </Item>
        <Item {...formLayout} label="中文卖点">
          {getFieldDecorator('feature', {
            initialValue: current.feature ? (current.feature).replace(new RegExp('↵', 'gm'), '\n') : null,
          })(<TextArea rows={4} placeholder="请输入中文卖点" />)}
        </Item>
      </Modal>
    );
  }
}

export default ProductForm;
