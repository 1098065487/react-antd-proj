import React, { PureComponent } from 'react';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Radio,
  Cascader,
  Card,
  Result, Col, Row,
} from 'antd';
import { connect } from 'dva';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import ErrorInfo from '@/components/ErrorInfo';

const { Item } = Form;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

@connect((
  {
    platform,
    attribute,
    sellerProduct,
    loading,
  },
) => ({
  platform,
  attribute,
  sellerProduct,
  searchLoading: loading.effects['sellerProduct/fetch'],
}))
@Form.create()
class PublishForm extends PureComponent {
  constructor(props) {
    super(props);
    const { match: { params } } = props;
    this.state = {
      submitting: false,
      isDone: false,
      platforms: [],
      attributes: [],
      current: {},
      ...params,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { item } = this.state;
    // todo 并发
    dispatch({
      type: 'sellerProduct/fetchAnItem',
      payload: { id: item, params: { with: ['product'] } },
      callback: (current) => {
        this.setState({ current });
      },
    });
    dispatch({
      type: 'platform/fetchTree',
      payload: {},
      callback: platforms => {
        this.setState({ platforms });
      },
    });
    dispatch({
      type: 'attribute/fetchAll',
      payload: { with: ['values'] },
      callback: (attributes) => {
        this.setState({ attributes });
      },
    });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { item } = this.state;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      dispatch({
        type: 'sellerProduct/publishItem',
        payload: { id: item, data: values },
        callback: () => {
          this.setState({ isDone: true });
        },
      });
    });
  };

  onFinish = () => {
    const { onClose } = this.props;
    if (onClose) {
      onClose();
    }
  };

  renderAttributeGroup = (attr) => {
    const { type, values } = attr;
    if (type === 'Radio') {
      return (
        <Radio.Group>
          {values.map(value => <Radio key={value.id} value={value.id}>{value.description}</Radio>)}
        </Radio.Group>
      );
    }
    return (
      <Checkbox.Group>
        {values.map(value => <Checkbox key={value.id} value={value.id}>{value.description}</Checkbox>)}
      </Checkbox.Group>
    );
  };


  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { current, platforms, attributes, submitting, isDone, item } = this.state;
    return (
      <PageHeaderWrapper
        title="发布商品"
        extra={[
          <Button key="back" type="link" icon="left">
            <Link to="/catalog/seller-products">返回列表</Link>
          </Button>,
        ]}
      >
        {isDone ? (
          <Result
            status="success"
            title="发布成功"
            description="可售商品库已更新"
            extra={[
              <Button key="back" type="link" icon="left">
                <Link to="/catalog/seller-products">返回列表</Link>
              </Button>,
            ]}
          />
        ) : (
          <Card>
            <Row>
              <Col span={16}>
                <Form>
                  <Item {...formLayout} label="可售商品SKU">
                    {getFieldDecorator('seller.sku', {
                      rules: [{ required: true, message: 'Please input seller sku' }],
                      initialValue: current.sku,
                    })(<Input disabled placeholder="请填写父SKU" />)}
                  </Item>
                  <Item {...formLayout} label="发布平台&市场">
                    {getFieldDecorator('platform.ids', {
                      rules: [{ required: true, message: 'Please select platform' }],
                      initialValue: [],
                    })(<Cascader style={{ width: 360 }} options={platforms} placeholder="选择要发布的平台" />)}
                  </Item>
                  <Item {...formLayout} label="平台&市场SKU" help="如不填写，系统将自动生成">
                    {getFieldDecorator('platform.item_sku', {
                      rules: [],
                      initialValue: '',
                    })(<Input placeholder="请填写市场SKU" />)}
                  </Item>
                  <Item {...formLayout} label="平台&市场唯一编码" help="亚马逊为ASIN">
                    {getFieldDecorator('platform.platform_sn', {
                      rules: [],
                      initialValue: '',
                    })(<Input placeholder="请填写唯一编码" />)}
                  </Item>
                  {
                    attributes.map((attr, idx) => (
                      <Item {...formLayout} key={attr.id} label={attr.description}>
                        {
                          getFieldDecorator(`attr_values.${idx}`, {
                            rules: [],
                          })(this.renderAttributeGroup(attr))
                        }
                      </Item>
                    ))
                  }
                </Form>
              </Col>
              <Col span={8}>
                <p>商品发布后，后台会自动同步详细信息</p>
                <p>平台&市场唯一编码，暂时需要手动添加</p>
              </Col>
            </Row>
            <FooterToolbar>
              <ErrorInfo errors={{}} />
              <Button
                loading={submitting}
                type="primary"
                onClick={() => this.handleSubmit()}
              >
                保存
              </Button>
            </FooterToolbar>
          </Card>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default PublishForm;
