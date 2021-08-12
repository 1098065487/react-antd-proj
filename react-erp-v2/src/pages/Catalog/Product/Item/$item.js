import React, { PureComponent } from 'react';
import { Button, Card, Form, Checkbox, Input, InputNumber, Skeleton, Divider, Row, Col, message, Select } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import SingleImageUpload from '@/components/SingleImageUpload';
import FooterToolbar from '@/components/FooterToolbar';
import _ from 'lodash'
const { Option } = Select;

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};
const colFormLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 },
};

@connect(({ product, factory, loading }) => ({
  product,
  factory,
  loading: loading.effects['product/fetchAnItem'],
}))
@Form.create()
class Item extends PureComponent {
  constructor(props) {
    super(props);
    const { match: { params } } = this.props;
    this.state = {
      params,
      current: {},
      submitting: false,
      loading: true,
      factorySkuList: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { params: { item } } = this.state;
    dispatch({
      type: 'product/fetchAnItem',
      payload: { id: item, params: { with: ['product.images', 'images', 'factoryProductItems'] } },
      callback: current => this.setState({ current, loading: false }),
    });
  }

  handleItemSubmit = () => {
    const { params: { item } } = this.state;
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      dispatch({
        type: 'product/updateItem',
        payload: { id: item, data: values },
        callback: () => message.success('更新成功！'),
      });
    });
  };

  searchFactorySku = label => {
    const { dispatch } = this.props;
    dispatch({
      type: 'factory/getFactorySkuOptions',
      payload: { filters: { factorySku: label } },
      callback: res => this.setState({
        factorySkuList: res.data || [],
      })
    });
  };

  renderSelectFactorySku = list => {
    if(Object.keys(list).length !== 0) {
      const arr = [];
      list.forEach(item => arr.push(item.sku));
      return arr;
    }
    return [];
  };

  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { current, submitting, loading, factorySkuList } = this.state;
    const { images = [], factory_product_items = [] } = current;
    const selectedImages = images.map(i => i.id);

    return (
      <PageHeaderWrapper
        title="产品变体编辑"
      >
        <Skeleton active loading={loading}>
          <Form>
            <Card>
              <Form.Item label="SKU" {...formLayout}>
                {getFieldDecorator('sku', {
                  rules: [{ required: true, message: 'SKU不能为空' }],
                  initialValue: current.sku,
                })(<Input placeholder="请填写SKU" />)}
              </Form.Item>
              <Form.Item label="选择变体关联图" {...formLayout}>
                {getFieldDecorator('images', {
                  initialValue: selectedImages,
                })(
                  <Checkbox.Group className="image-checked">
                    {Object.keys(current).length && current.product.images.map(i => (
                      <Checkbox key={i.id} value={i.id}>
                        <img src={i.url} alt={i.alt} width={90} height={120} />
                      </Checkbox>
                    ))}
                  </Checkbox.Group>,
                )}
              </Form.Item>
              <Form.Item label="工厂SKU" {...formLayout}>
                {getFieldDecorator('factory_sku', {
                  rules: [{ required: true, message: '工厂SKU不能为空' }],
                  initialValue: this.renderSelectFactorySku(factory_product_items),
                })(
                  <Select
                    showSearch
                    allowClear
                    mode='multiple'
                    placeholder='请查询选择工厂SKU'
                    style={{ width: '100%' }}
                    filterOption={false}
                    onSearch={_.debounce(this.searchFactorySku, 500)}
                  >
                    {Object.keys(factorySkuList).length !== 0 ? factorySkuList.map(item => <Option key={item.id} value={item.sku}>{item.sku}</Option>) : null}
                  </Select>,
                )}
              </Form.Item>
              <Divider />
              <Row gutter={24}>
                <Col lg={12} md={12} sm={24}>
                  <Form.Item label="建议售价" {...colFormLayout}>
                    {getFieldDecorator('price', {
                      rules: [{ required: true, message: '建议售价不能为空' }],
                      initialValue: current.price,
                    })(<InputNumber precision={2} placeholder="请填写建议售价" />)}
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={24}>
                  <Form.Item label="成本价" {...colFormLayout}>
                    {getFieldDecorator('cost_price', {
                      rules: [{ required: true, message: '成本价不能为空' }],
                      initialValue: current.cost_price,
                    })(<InputNumber precision={2} placeholder="请填写成本价" />)}
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={24}>
                  <Form.Item label="库存量" {...colFormLayout}>
                    {getFieldDecorator('qty', {
                      rules: [{ required: true, message: '库存量不能为空' }],
                      initialValue: current.qty,
                    })(<InputNumber placeholder="请填写库存量" />)}
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={24}>
                  <Form.Item label="预警库存量" {...colFormLayout}>
                    {getFieldDecorator('min_warning_qty', {
                      rules: [{ required: true, message: '预警库存不能为空' }],
                      initialValue: current.min_warning_qty,
                    })(<InputNumber placeholder="请填写预警库存量" />)}
                  </Form.Item>
                </Col>
              </Row>
            </Card>
            <FooterToolbar>
              <Button
                loading={submitting}
                type="primary"
                onClick={() => this.handleItemSubmit()}
                style={{ width: 90 }}
              >
                保存
              </Button>
            </FooterToolbar>
          </Form>
        </Skeleton>
      </PageHeaderWrapper>
    );
  }
}

export default Item;
