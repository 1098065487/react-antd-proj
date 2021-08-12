import { connect } from 'dva';
import React, { Component } from 'react';
import { Card, Form, Input, Button, Row, Col, message, Drawer, Skeleton, Icon, Select } from 'antd';

import FooterToolbar from '@/components/FooterToolbar';
import ErrorInfo from '@/components/ErrorInfo';
import BaseProduct from '@/components/BaseProduct';
import ImageList from "./ImageList";

const { Item } = Form;
const { Option } = Select;
const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};
const statusList = [
  { label: '在售', value: 'selling' },
  { label: '观察中', value: 'observing' },
  { label: '待提升', value: 'improving' },
  { label: '淘汰', value: 'eliminated' }
];

@connect(({ sellerProduct }) => ({
  sellerProduct,
}))
@Form.create()
class EditDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      product: {},
      newSku: [],
      errors: {},
      loading: true,
      hideButton: false,
    };
  }

  componentDidMount() {
    const { current = {} } = this.props;
    if (Object.keys(current).length !== 0) {
      // 查询已存在的
      const { dispatch } = this.props;
      const { id } = current;
      dispatch({
        type: 'sellerProduct/fetchAnItem',
        payload: { 'id': id, params: { with: 'images' } },
        callback: product => {
          this.setState({ product, loading: false });
        },
      });
    } else {
      this.setState({ loading: false });
    }
  }

  handelSelectedChange = items => {
    const { dispatch } = this.props;
    const { product } = this.state;
    if (items.length) {
      dispatch({
        type: 'sellerProduct/generateSku',
        payload: { items },
        callback: res => {
          if (res.status_code === 422) {
            message.error(res.message, 5);
            const newProduct = { ...product, spu: '', cost_price: 0.00 };
            this.setState({ product: newProduct, hideButton: true });
          } else {
            const newProduct = { ...product, spu: res.spu, cost_price: res.cost_price };
            this.setState({ product: newProduct, hideButton: false });
          }
        },
      });
    }
  };

  handleSubmit = () => {
    const {
      form,
      dispatch,
      showDrawer,
      current = {}
    } = this.props;
    const { validateFieldsAndScroll } = form;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      if (Object.keys(current).length !== 0) {
        dispatch({
          type: 'sellerProduct/updateItem',
          payload: { id: current.id, params: values },
          callback: res => {
            if(res.status === 'ok') {
              message.success('更新成功！');
              showDrawer(false, {}, true);
            }
            if(res.status === 'error') {
              this.setState({
                errors: res.body.errors || {}
              });
              message.error('更新失败！')
            }
          },
        });
      } else {
        dispatch({
          type: 'sellerProduct/createItem',
          payload: values,
          callback: res => {
            if (res.status === 'ok') {
              message.success('添加成功！');
              showDrawer(false, {}, true);
            }
            if(res.status === 'error') {
              this.setState({
                errors: res.body.errors || {}
              });
              message.error('添加失败！')
            }
          },
        });
      }
    });
  };

  handleActions = (key, record) => {
    if (key === 'delete') {
      const { newSku } = this.state;
      const skuList = newSku.filter(item => {
        return item.seller_sku !== record.seller_sku;
      });
      this.setState({ newSku: skuList });
    }
  };

  closeDrawer = () => {
    const { showDrawer } = this.props;
    showDrawer(false);
  };

  render() {
    const { form: { getFieldDecorator }, visible, spu } = this.props;
    const {
      product,
      submitting,
      errors,
      loading,
      hideButton,
    } = this.state;

    return (
      <Drawer
        destroyOnClose
        title='组合可售商品'
        width="100%"
        placement='left'
        visible={visible}
        onClose={this.closeDrawer}
      >
        <Card bordered={false}>
          <Skeleton loading={loading}>
            <Form style={{ width: "70%", margin: '0 auto'}}>
              <div style={{ marginBottom: 60 }}>
                <Item {...formLayout} label="父商品SKU">
                  {getFieldDecorator('spu', {
                    initialValue: spu,
                  })(<Input hidden />)}
                  {spu}
                </Item>
                <Item {...formLayout} label="可售产品组合">
                  {getFieldDecorator('items', {
                    rules: [{ required: true, message: '请选择要组合的产品' }],
                    initialValue: product.items || [],
                  })(<BaseProduct onItemChange={this.handelSelectedChange} />)}
                </Item>
                <Item {...formLayout} label="SKU">
                  {getFieldDecorator('sku', {
                    rules: [{ required: true, message: '请填写要变体SKU' }],
                    initialValue: product.sku,
                  })(<Input placeholder="请填写可售商品变体SKU" />)}
                </Item>
                <Item {...formLayout} label="EAN码">
                  {getFieldDecorator('ean_code', {
                    initialValue: product.ean_code,
                  })(<Input placeholder="请填写可售商品EAN码" />)}
                </Item>
                <Item {...formLayout} label="标题">
                  {getFieldDecorator('title', {
                    initialValue: product.title,
                  })(<Input placeholder="请填写可售商品标题" />)}
                </Item>
                <Item {...formLayout} label="成分">
                  {getFieldDecorator('material', {
                    initialValue: product.material,
                  })(<Input placeholder="请填写可售商品成分" />)}
                </Item>
                <Item {...formLayout} label="图片链接">
                  {getFieldDecorator('images', {
                    initialValue: product.images || [],
                  })(<ImageList />)}
                </Item>
                <Item {...formLayout} label="商品状态">
                  {getFieldDecorator('status', {
                    initialValue: product.status || undefined,
                  })(
                    <Select placeholder="请选择商品状态">
                      {statusList.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
                    </Select>,
                  )}
                </Item>
                <Item {...formLayout} label="备注">
                  {getFieldDecorator('remark', {
                    initialValue: product.remark || null,
                  })(
                    <TextArea rows={4} placeholder="备注信息" />
                  )}
                </Item>
              </div>
              <FooterToolbar maximum={1}>
                <ErrorInfo errors={errors} />
                <Button
                  onClick={this.closeDrawer}
                  style={{ width: 80 }}
                >
                  <Icon type="left" />返回
                </Button>
                <Button
                  loading={submitting}
                  type="primary"
                  onClick={() => this.handleSubmit()}
                  disabled={hideButton}
                >
                  保存
                </Button>
              </FooterToolbar>
            </Form>
          </Skeleton>
        </Card>
      </Drawer>
    );
  }
}

export default EditDrawer;
