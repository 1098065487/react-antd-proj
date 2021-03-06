import React, { PureComponent } from 'react';
import { Button, Card, Form, Input, Cascader, Select, Skeleton, Icon, message, } from 'antd';
import { connect } from 'dva';

import router from 'umi/router';
import FooterToolbar from '@/components/FooterToolbar';
import ErrorInfo from "@/components/ErrorInfo";

const { Item } = Form;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};

@connect(({ brand, category, attribute, platform, loading, }) => ({
  brand,
  category,
  attribute,
  platform,
  loading: loading.effects['platform/fetchOneProduct'],
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
      errors: {},
      platformTree: [],
      brandList: [],
      categories: [],
      attributes: [],
      current: {},
      showAsin: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { params: { id } } = this.state;
    dispatch({
      type: 'platform/fetchTree',
      payload: {},
      callback: platformTree => {
        this.setState({ platformTree });
      },
    });
    dispatch({
      type: 'brand/fetchOptions',
      callback: brandList => {
        this.setState({ brandList });
      }
    });
    dispatch({
      type: 'category/fetchOptions',
      callback: categories => {
        this.setState({ categories });
      },
    });
    dispatch({
      type: 'attribute/fetchAll',
      payload: { with: ['values'] },
      callback: res => {
        const list = res.filter(e => e.name !== 'Group');
        this.setState({ attributes: list });
      },
    });
    if (id && id !== 'create') {
      dispatch({
        type: 'platform/fetchOneProduct',
        payload: { id, params: { with: ['attributeValues'] } },
        callback: res => {
          this.setState({
            current: res,
            showAsin: res.platform && res.platform.length !== 0 && (res.platform[0] === 1 || res.platform[0] === 13),
          })
        }
      });
    }

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
      if (flag === 'next') {
        this.setState({ submittingAndNext: true });
      }
      if (flag === 'back') {
        this.setState({ submittingAndBack: true });
      }
      if (id && id !== 'create') {
        dispatch({
          type: 'platform/updateOneProduct',
          payload: { id, params: { ...values } },
          callback: res => {
            if (res.status === 'error') {
              this.setState({
                submittingAndNext: false,
                submittingAndBack: false,
                errors: res.body.errors || {}
              });
              message.error(res.body.message || '???????????????', 5);
            } else {
              if (flag === 'next') {
                this.setState({ submittingAndNext: false });
                this.next(res.body.id);
              }
              if (flag === 'back') {
                this.setState({ submittingAndBack: false });
                router.push('/products/platform');
              }
            }
          },
        });
      } else {
        dispatch({
          type: 'platform/createOneProduct',
          payload: { ...values },
          callback: res => {
            if (res.status === 'error') {
              this.setState({
                submittingAndNext: false,
                submittingAndBack: false,
                errors: res.body.errors || {}
              });
              message.error(res.body.message || '???????????????', 5);
            } else {
              if (flag === 'next') {
                this.setState({ submittingAndNext: false });
                this.next(res.body.id);
              }
              if (flag === 'back') {
                this.setState({ submittingAndBack: false });
                router.push('/products/platform');
              }
            }
          },
        });
      }
    });
  };

  next = id => {
    router.push(`/products/platform/${id}/items`);
  };

  renderAttributeFilters = attr => {
    const { values } = attr;
    return (
      <Select style={{ width: '100%' }} placeholder="??????????????????">
        {values.map(value => (
          <Option key={value.id} value={value.id}>
            {value.description}
          </Option>
        ))}
      </Select>
    );
  };

  platformChange = value => {
    // 1?????????MD?????????13?????????LIN??????
    if(value.length !== 0) {
      this.setState({
        showAsin: value[0] === 1 || value[0] === 13,
      })
    }
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator },
    } = this.props;
    const { submittingAndBack, submittingAndNext, errors, brandList, categories, attributes, platformTree, current, showAsin } = this.state;

    return (
      <Skeleton active loading={loading}>
        <Form>
          <Card style={{ width: '60%', margin: '0 auto' }}>
            <Item label="???SKU" {...formLayout}>
              {getFieldDecorator('spu', {
                rules: [{ required: true, message: '????????????SKU' }],
                initialValue: current.spu,
              })(<Input placeholder="????????????SKU" />)}
            </Item>
            <Item label="????????????" {...formLayout}>
              {getFieldDecorator('platform_id', {
                rules: [{ required: true, message: '???????????????' }],
                initialValue: current.platform,
              })(
                <Cascader options={platformTree} onChange={this.platformChange} placeholder="???????????????" />
              )}
            </Item>
            {showAsin ? (
              <Item label="ASIN" {...formLayout}>
                {getFieldDecorator('platform_sn', {
                  rules: [{ required: true, message: '?????????ASIN' }],
                  initialValue: current.platform_sn,
                })(<Input placeholder="?????????ASIN" />)}
              </Item>
            ) :null}
            <Item label="??????" {...formLayout}>
              {getFieldDecorator('brand_id', {
                initialValue: current.brand_id,
              })(
                <Select allowClear placeholder="???????????????" style={{ width: '100%' }}>
                  {brandList.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
                </Select>,
              )}
            </Item>
            <Item label="?????????" {...formLayout}>
              {getFieldDecorator('category_id', {
                initialValue: current.category_path,
              })(<Cascader options={categories} style={{ width: '100%' }} placeholder="??????????????????" />)}
            </Item>
            {attributes.map((attr, idx) => (
              <Item {...formLayout} key={attr.id} label={attr.description}>
                {getFieldDecorator(`attrs.${idx}`, {
                  rules: [],
                  initialValue: current.attribute_values && current.attribute_values.length !== 0 && current.attribute_values[`${idx}`] ? current.attribute_values[`${idx}`].id : [],
                })(this.renderAttributeFilters(attr))}
              </Item>
            ))}
          </Card>
        </Form>
        <FooterToolbar>
          <ErrorInfo key='errors' errors={errors} />,
          <Button
            onClick={() => router.push('/products/platform')}
            style={{ width: 80 }}
          >
            ??????
          </Button>
          <Button
            loading={submittingAndBack}
            type="primary"
            onClick={() => this.handleProductSubmit('back')}
            style={{ width: 140 }}
          >
            <Icon type="left" />???????????????
          </Button>
          <Button
            loading={submittingAndNext}
            type="primary"
            onClick={() => this.handleProductSubmit('next')}
            style={{ width: 140 }}
          >
            ??????????????????<Icon type="right" />
          </Button>
        </FooterToolbar>
      </Skeleton>
    );
  }
}

export default Info;
