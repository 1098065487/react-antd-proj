import React, { PureComponent } from 'react';
import { Button, Card, Form, Input, Cascader, Select, Skeleton, Icon, message, } from 'antd';
import router from 'umi/router';
import { connect } from 'dva';
import FooterToolbar from '@/components/FooterToolbar';
import ErrorInfo from "@/components/ErrorInfo";

const { Item } = Form;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};

const statusList = [
  { key: 1, label: '在售', value: 1, },
  { key: 0, label: '淘汰', value: 0 },
];

@connect(({ brand, category, unit, attribute, product, loading, }) => ({
  brand,
  category,
  unit,
  attribute,
  product,
  loading: loading.effects['product/fetchOne'],
}))
@Form.create()
class Info extends PureComponent {
  constructor(props) {
    super(props);
    const { match: { params } } = props;
    this.state = {
      params,
      submittingAndNext: false,
      submittingAndBack: false,
      errors: {}
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { params: { id } } = this.state;
    dispatch({ type: 'category/fetchOptions' });
    dispatch({ type: 'brand/fetchOptions' });
    dispatch({ type: 'unit/fetchOptions' });
    if (id && id !== 'create') {
      dispatch({
        type: 'product/fetchOne',
        payload: { id, params: {} },
      });
    }

  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({ type: 'product/save', payload: { current: {} } });
  }

  handleProductSubmit = flag => {
    this.setState({
      errors: {}
    });
    const { params: { id } } = this.state;
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      if(flag === 'next') {
        this.setState({ submittingAndNext: true });
      }
      if(flag === 'back') {
        this.setState({ submittingAndBack: true });
      }
      if (id && id !== 'create') {
        dispatch({
          type: 'product/update',
          payload: { id, params: { ...values } },
          callback: res => {
            if(res.status === 'error') {
              this.setState({
                submittingAndNext: false,
                submittingAndBack: false,
                errors: res.body.errors || {}
              });
              message.error('保存失败！');
            } else {
              if(flag === 'next') {
                this.setState({ submittingAndNext: false });
                this.next(res.body.id);
              }
              if(flag === 'back') {
                this.setState({ submittingAndBack: false });
                router.push('/products/product');
              }
            }
          },
        });
      } else {
        dispatch({
          type: 'product/create',
          payload: { ...values },
          callback: res => {
            if(res.status === 'error') {
              this.setState({
                submittingAndNext: false,
                submittingAndBack: false,
                errors: res.body.errors || {}
              });
              message.error('保存失败！');
            } else {
              if(flag === 'next') {
                this.setState({ submittingAndNext: false });
                this.next(res.body.id);
              }
              if(flag === 'back') {
                this.setState({ submittingAndBack: false });
                router.push('/products/product');
              }
            }
          },
        });
      }
    });
  };

  next = id => {
    router.push(`/products/product/${id}/items`);
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator },
      product: { current },
      category: { options: categoryOptions },
      brand: { options: brandOptions },
      unit: { options: unitOptions },
    } = this.props;
    const { submittingAndBack, submittingAndNext, errors } = this.state;

    return (
      <Skeleton active loading={loading}>
        <Form>
          <Card style={{ width: '60%', margin: '0 auto' }}>
            <Item label="货号" {...formLayout}>
              {getFieldDecorator('spu', {
                rules: [{ required: true, message: '请输入货号' }],
                initialValue: current.spu,
              })(<Input placeholder="请输入货号" />)}
            </Item>
            <Item label="品牌" {...formLayout}>
              {getFieldDecorator('brand_id', {
                initialValue: current.brand_id,
              })(
                <Select allowClear placeholder="请选择品牌" style={{ width: '100%' }}>
                  {brandOptions.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
                </Select>,
              )}
            </Item>
            <Item label="产品分类" {...formLayout}>
              {getFieldDecorator('category_id', {
                initialValue: current.category_path,
              })(<Cascader options={categoryOptions} style={{ width: '100%' }} placeholder="请选择产品分类" />)}
            </Item>
            <Item label="单位" {...formLayout}>
              {getFieldDecorator('unit_id', {
                initialValue: current.unit_id,
              })(
                <Select allowClear placeholder="请选择单位" style={{ width: '100%' }}>
                  {unitOptions.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
                </Select>,
              )}
            </Item>
            <Item label="产品状态" {...formLayout}>
              {getFieldDecorator('selling_status', {
                initialValue: current.selling_status || current.selling_status === 0 ? current.selling_status : 1,
              })(
                <Select placeholder="请选择产品状态" style={{ width: '100%' }}>
                  {statusList.map(item => <Option key={item.key} value={item.key}>{item.label}</Option>)}
                </Select>,
              )}
            </Item>
          </Card>
        </Form>
        <FooterToolbar>
          <ErrorInfo key='errors' errors={errors} />
          <Button
            onClick={() => router.push('/products/product')}
            style={{ width: 80 }}
          >
            返回
          </Button>
          <Button
            loading={submittingAndBack}
            type="primary"
            onClick={() => this.handleProductSubmit('back')}
            style={{ width: 140 }}
          >
            <Icon type="left" />保存并返回
          </Button>
          <Button
            loading={submittingAndNext}
            type="primary"
            onClick={() => this.handleProductSubmit('next')}
            style={{ width: 140 }}
          >
            保存并下一步<Icon type="right" />
          </Button>
        </FooterToolbar>
      </Skeleton>
    );
  }
}

export default Info;
