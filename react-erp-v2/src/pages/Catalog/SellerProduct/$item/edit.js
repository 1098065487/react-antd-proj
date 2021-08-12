import React, { PureComponent } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Result, Col, Row, message, InputNumber,
  Skeleton,
} from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import ErrorInfo from '@/components/ErrorInfo';
import BaseProduct from '@/components/BaseProduct';
import MultiImageUpload from '@/components/MultiImageUpload/index';

const { Item } = Form;

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};


@connect(({ product, sellerProduct, loading }) => ({
  product,
  sellerProduct,
  searchLoading: loading.effects['product/fetch'],
}))
@Form.create()
class EditForm extends PureComponent {
  constructor(props) {
    super(props);
    const { match: { params } } = props;
    this.state = {
      submitting: false,
      isDone: false,
      product: {},
      newSku: [],
      ...params,
      errors: {},
      loading: true,
      hideButton: false,
    };
  }

  componentDidMount() {
    const { item } = this.state;
    if (item && item !== 'new') {
      // 查询已存在的
      const { dispatch } = this.props;
      dispatch({
        type: 'sellerProduct/fetchAnItem',
        payload: { id: item },
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
            const newProduct = { ...product, sku: '', spu: '', cost_price: 0.00 };
            this.setState({ product: newProduct, hideButton: true });
          } else {
            const newProduct = { ...product, sku: res.sku, spu: res.spu, cost_price: res.cost_price };
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
    } = this.props;
    const { item } = this.state;
    const { validateFieldsAndScroll } = form;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      if (item && item !== 'new') {
        dispatch({
          type: 'sellerProduct/updateItem',
          payload: { id: item, params: { ...values } },
          callback: res => {
            const { errors } = res;
            if (errors) {
              this.setState({ errors });
            } else {
              this.setState({ isDone: true });
            }
          },
        });
      } else {
        dispatch({
          type: 'sellerProduct/createItem',
          payload: { ...values },
          callback: res => {
            const { errors } = res;
            if (errors) {
              this.setState({ errors });
            } else {
              this.setState({ isDone: true });
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

  back = () => {
    router.goBack();
  };

  render() {
    const { form: { getFieldDecorator } } = this.props;
    const {
      product,
      submitting,
      isDone,
      errors,
      loading,
      hideButton,
    } = this.state;
    return (
      <PageHeaderWrapper
        title="组合可售商品"
        extra={
          <Button type="link" icon="left" onClick={this.back}>
            返回列表
          </Button>
        }
      >
        {isDone ? (
          <Result
            status="success"
            title="添加成功"
            description="可售商品库已更新"
            extra={[
              <Button
                key="list"
                type="primary"
                icon="left"
                onClick={() => router.push('/products/sellers')}
              >
                返回列表
              </Button>,
              <Button
                key="back"
                type="primary"
                icon="rollback"
                onClick={() => {
                  window.location.href = '/products/sellers/items/new/edit';
                }}
              >
                继续新加
              </Button>,
            ]}
          />
        ) : (
          <Card bordered={false}>
            <Skeleton loading={loading}>
              <Form>
                <Row gutter={24} type="flex" justify="space-around" align="top">
                  <Col span={16}>
                    <div style={{ marginBottom: 60 }}>
                      <Item {...formLayout} label="父商品SKU">
                        {getFieldDecorator('spu', {
                          rules: [{ required: true, message: '请填写父商品SKU' }],
                          initialValue: product.spu,
                        })(<Input placeholder="父商品SKU" />)}
                      </Item>
                      <Item {...formLayout} label="产品组合">
                        {getFieldDecorator('items', {
                          rules: [{ required: true, message: '请选择要组合的产品' }],
                          initialValue: product.items || [],
                        })(<BaseProduct onItemChange={this.handelSelectedChange} />)}
                      </Item>
                      <Item {...formLayout} label="变体SKU">
                        {getFieldDecorator('sku', {
                          rules: [{ required: true, message: '请填写要变体SKU' }],
                          initialValue: product.sku,
                        })(<Input placeholder="请填写可售商品变体SKU" />)}
                      </Item>
                      <Item {...formLayout} label="建议售价">
                        {getFieldDecorator('price', {
                          rules: [{ required: true, message: 'Please input price' }],
                          initialValue: 0,
                        })(<InputNumber style={{ width: 200 }} precision={2} placeholder="请填写可售商品售价" />)}
                      </Item>
                      <Item {...formLayout} label="成本价">
                        {getFieldDecorator('cost_price', {
                          rules: [{ required: true, message: 'Please input cost price' }],
                          initialValue: product.cost_price || 0,
                        })(<InputNumber style={{ width: 200 }} precision={2} placeholder="请填写可售商品成本价" />)}
                      </Item>
                      <Item {...formLayout} label="最小库存">
                        {getFieldDecorator('min_warning_qty', {
                          rules: [{ required: true, message: 'Please input min warning qty' }],
                          initialValue: 0,
                        })(<InputNumber style={{ width: 200 }} placeholder="请填写最小预警库存" />)}
                      </Item>
                      <Item {...formLayout} label="最大库存">
                        {getFieldDecorator('max_warning_qty', {
                          rules: [{ required: true, message: 'Please input max warning qty' }],
                          initialValue: 0,
                        })(<InputNumber style={{ width: 200 }} placeholder="请填写最大预警库存" />)}
                      </Item>
                      <Item {...formLayout} label="图集">
                        {getFieldDecorator('images', {
                          initialValue: product.images || [],
                        })(<MultiImageUpload params={{ type: 'seller_product', url: true }} />)}
                      </Item>
                    </div>
                  </Col>
                  <Col span={8}>
                    <p>第一步：选择要组合的基准产品</p>
                    <p>第二部：定义产品组合的数量</p>
                    <p>第三部：填写商品基本信息</p>
                  </Col>
                </Row>
                <FooterToolbar maximum={1}>
                  <ErrorInfo errors={errors} />
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
        )}
      </PageHeaderWrapper>
    );
  }
}

export default EditForm;
