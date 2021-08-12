import React, { PureComponent } from 'react';
import { Button, Card, Form, Input, Skeleton, message, Select, Cascader } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import router from 'umi/router';

const { Option } = Select;

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

@connect(({ sellerProduct, category, brand, unit, loading }) => ({
  sellerProduct,
  category,
  brand,
  unit,
  loading: loading.effects['sellerProduct/fetchOne'],
}))
@Form.create()
class EditSellerProduct extends PureComponent {
  constructor(props) {
    super(props);
    const { match: { params } } = props;
    this.state = {
      current: {},
      loading: true,
      submitting: false,
      ...params,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = this.state;
    dispatch({ type: 'category/fetchOptions' });
    dispatch({ type: 'brand/fetchOptions' });
    dispatch({ type: 'unit/fetchOptions' });
    if (id && id !== 'new') {
      dispatch({
        type: 'sellerProduct/fetchOne',
        payload: { 'id': id, params: { with: 'category' } },
        callback: current => this.setState({ current, loading: false }),
      });
    } else {
      this.setState({ loading: false });
    }
  }

  handleItemSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      location: { state: { current: { id } } },
    } = this.props;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      dispatch({
        type: 'sellerProduct/updateOne',
        payload: { 'id': id, params: values },
        callback: res => {
          if(res.status_code === 422) {
            const arr = [];
            const { errors } = res;
            // 获取所有错误提示
            for(let i = 0; i < Object.keys(errors).length; i += 1) {
              if(Object.keys(errors[Object.keys(errors)[i]]).length !== 0) {
                for(let j = 0; j < Object.keys(errors[Object.keys(errors)[i]]).length; j += 1) {
                  arr.push(errors[Object.keys(errors)[i]][j]);
                }
              }
            }
            for(let i = 0; i < arr.length; i += 1) {
              message.warning(arr[i], 5);
            }
          }else {
            message.success('更新成功！')
          }
        },
      });
    });
  };

  back = () => {
    router.goBack();
  };

  render() {
    const {
      form: { getFieldDecorator },
      category: { options: categoryOptions },
      brand: { options: brandOptions },
      unit: { options: unitOptions },
    } = this.props;

    const { current, submitting, loading } = this.state;

    return (
      <PageHeaderWrapper
        title="可售商品编辑"
        extra={
          <Button type="link" icon="left" onClick={this.back}>
            返回列表
          </Button>
        }
      >
        <Skeleton active loading={loading}>
          <Form>
            <Card>
              <Form.Item label="产品编码（父SKU）" {...formLayout} help="用于商家内部管理使用，具体编码规则需要商家自定义">
                {getFieldDecorator('spu', {
                  rules: [{ required: true, message: '请输入商品编码' }],
                  initialValue: current.spu,
                })(<Input placeholder="请输入商品编码" />)}
              </Form.Item>
              <Form.Item label="产品名称" {...formLayout}>
                {getFieldDecorator('title', {
                  rules: [{ required: true, message: '请输入标题' }],
                  initialValue: current.title,
                })(<Input placeholder="请输入标题" />)}
              </Form.Item>
              <Form.Item label="所属品牌" {...formLayout}>
                {getFieldDecorator('brand_id', {
                  rules: [{ required: true, message: '请选择品牌' }],
                  initialValue: current.brand_id,
                })(
                  <Select allowClear placeholder="请选择品牌" style={{ width: 200 }}>
                    {brandOptions.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
                  </Select>,
                )}
              </Form.Item>
              <Form.Item label="所属分类" {...formLayout} help="商品分类用于店铺内部经营管理">
                {getFieldDecorator('category_id', {
                  rules: [{ required: true, message: '请选择商品分类' }],
                  initialValue: current.category_path,
                })(<Cascader options={categoryOptions} style={{ width: '100%' }} placeholder="请选择商品分类" />)}
              </Form.Item>
              <Form.Item label="库存单位" {...formLayout}>
                {getFieldDecorator('unit_id', {
                  rules: [{ required: true, message: '请选择库存分类' }],
                  initialValue: current.unit_id,
                })(
                  <Select allowClear placeholder="请选择库存单位" style={{ width: 200 }}>
                    {unitOptions.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
                  </Select>,
                )}
              </Form.Item>
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

export default EditSellerProduct;
