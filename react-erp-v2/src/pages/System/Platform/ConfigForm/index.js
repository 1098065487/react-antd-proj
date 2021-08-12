import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Radio, Select, Switch } from 'antd';

const { Item } = Form;
const { Option, OptGroup } = Select;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};
const marketplaceIds = [{
  label: '易贝、沃尔玛、独立站', ids: [{
    key: 'US', label: '美国',
  }],
}, {
  label: '亚马逊北美地区', ids: [{
    key: 'A2Q3Y263D00KWC', label: '巴西',
  }, {
    key: 'A2EUQ1WTGCTBG2', label: '加拿大',
  }, {
    key: 'A1AM78C64UM0Y8', label: '墨西哥',
  }, {
    key: 'ATVPDKIKX0DER', label: '美国',
  }],
}, {
  label: '亚马逊欧洲地区', ids: [{
    key: 'A1PA6795UKMFR9', label: '德国',
  }, {
    key: 'A1RKKUPIHCS9HS', label: '西班牙',
  }, {
    key: 'A13V1IB3VIYZZH', label: '法国',
  }, {
    key: 'A1F83G8C2ARO7P', label: '英国',
  }, {
    key: 'APJ6JRA9NG5V4', label: '意大利',
  }, {
    key: 'A33AVAJ2PDY3EV', label: '土耳其',
  }],
}, {
  label: '亚马逊远东地区', ids: [{
    key: 'A1VC38T7YXB528', label: '日本',
  }],
}];

@connect(({ system, user, warehouse }) => ({
  system,
  user,
  warehouse,
}))
class ConfigForm extends PureComponent {
  constructor(props) {
    super(props);
    const { current } = props;
    this.state = { current };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'warehouse/fetchOptions',
      payload: {},
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { current = {} } = this.state;
    const { name, type, is_replace, dynamic = {} } = current;
    return (
      <Form>
        <Item {...formLayout} label="帐号&市场">
          <span className="ant-form-text">{name}</span>
        </Item>,
        {
          type === 'Amazon' && (
            <>
              <Item {...formLayout} label="MWS端点" help="亚马逊MWS端点(https://mws.amazonservices.com)">
                {getFieldDecorator('dynamic.base_uri', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.base_uri,
                })(<Input placeholder="MWS端点" />)}
              </Item>
              <Item {...formLayout} label="卖家编号" help="您注册亚马逊MWS 时收到的卖家编号MerchantId">
                {getFieldDecorator('dynamic.merchant_id', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.merchant_id,
                })(<Input placeholder="卖家编号" />)}
              </Item>
              <Item {...formLayout} label="密钥编码" help="您注册亚马逊MWS 时收到的 AccessKeyId">
                {getFieldDecorator('dynamic.access_key_id', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.access_key_id,
                })(<Input placeholder="密钥编码" />)}
              </Item>
              <Item {...formLayout} label="授权码" help="您注册亚马逊MWS 时收到的授权令牌 SecretAccessKey">
                {getFieldDecorator('dynamic.secret_access_key', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.secret_access_key,
                })(<Input placeholder="授权码" />)}
              </Item>
              <Item {...formLayout} label="代理" help="存在不同帐号时，必须填写代理信息">
                {getFieldDecorator('dynamic.proxy', {
                  initialValue: dynamic && dynamic.proxy,
                })(<Input placeholder="代理信息" />)}
              </Item>
            </>
          )
        }
        {
          type === 'Ebay' && (
            <>
              <Item {...formLayout} label="环境">
                {getFieldDecorator('dynamic.type', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.type,
                })(
                  <Radio.Group>
                    <Radio key="sandbox" value="sandbox">测试环境</Radio>
                    <Radio key="production" value="production">生产环境</Radio>
                  </Radio.Group>,
                )}
              </Item>
              <Item {...formLayout} label="客户端ID" help="ClientId">
                {getFieldDecorator('dynamic.client_id', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.client_id,
                })(<Input placeholder="客户端ID" />)}
              </Item>
              <Item {...formLayout} label="客户端密钥" help="ClientSecret">
                {getFieldDecorator('dynamic.client_secret', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.client_secret,
                })(<Input placeholder="客户端密钥" />)}
              </Item>
              <Item {...formLayout} label="设备ID" help="DevId">
                {getFieldDecorator('dynamic.dev_id', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.dev_id,
                })(<Input placeholder="客户端ID" />)}
              </Item>
              <Item {...formLayout} label="跳转规则" help="RedirectUri">
                {getFieldDecorator('dynamic.redirect_uri', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.redirect_uri,
                })(<Input placeholder="跳转规则" />)}
              </Item>
              <Item {...formLayout} label="固定鉴权密钥" help="OldAuthToken">
                {getFieldDecorator('dynamic.old_auth_token', {
                  rules: [],
                  initialValue: dynamic && dynamic.old_auth_token,
                })(<Input placeholder="固定鉴权密钥" />)}
              </Item>
            </>
          )
        }
        {
          type === 'Walmart' && (
            <>
              <Item {...formLayout} label="客户端ID" help="ClientId">
                {getFieldDecorator('dynamic.client_id', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.client_id,
                })(<Input placeholder="客户端ID" />)}
              </Item>
              <Item {...formLayout} label="客户端密钥" help="ClientSecret">
                {getFieldDecorator('dynamic.client_secret', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.client_secret,
                })(<Input placeholder="客户端密钥" />)}
              </Item>
            </>
          )
        }
        {
          type === 'PrestaShop' && (
            <>
              <Item {...formLayout} label="请求地址URI" help="BaseUri">
                {getFieldDecorator('dynamic.base_uri', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.base_uri,
                })(<Input placeholder="请求地址URI" />)}
              </Item>
              <Item {...formLayout} label="鉴权密钥" help="Token">
                {getFieldDecorator('dynamic.token', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.token,
                })(<Input placeholder="API鉴权密钥" />)}
              </Item>
            </>
          )
        }
        {
          type === 'Shopify' && (
            <>
              <Item {...formLayout} label="商城链接" help="ShopUrl">
                {getFieldDecorator('dynamic.shop_url', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.shop_url,
                })(<Input placeholder="商城链接" />)}
              </Item>
              <Item {...formLayout} label="API版本" help="ApiVersion">
                {getFieldDecorator('dynamic.api_version', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.api_version,
                })(<Input placeholder="API版本信息" />)}
              </Item>
              <Item {...formLayout} label="API客户端KEY" help="ApiKey">
                {getFieldDecorator('dynamic.api_key', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.api_key,
                })(<Input placeholder="API客户端KEY" />)}
              </Item>
              <Item {...formLayout} label="鉴权密钥" help="Password">
                {getFieldDecorator('dynamic.password', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.password,
                })(<Input placeholder="API鉴权密钥" />)}
              </Item>
              <Item {...formLayout} label="默认仓库" help="Shopify仓库GID">
                {getFieldDecorator('dynamic.location_id', {
                  rules: [{ required: true }],
                  initialValue: dynamic && dynamic.location_id,
                })(<Input placeholder="默认仓库" />)}
              </Item>
            </>
          )
        }
        <Item {...formLayout} label="市场ID" help="请注意配合端点使用">
          {getFieldDecorator('dynamic.marketplace_id', {
            rules: [{ required: true }],
            initialValue: dynamic ? (dynamic.marketplace_id || []) : [],
          })(
            <Select placeholder="市场ID" mode='multiple'>
              {marketplaceIds.map((m) => {
                const { label, ids } = m;
                return (
                  <OptGroup key={Math.random()} label={label}>
                    {ids.map(id => <Option key={id.key} value={id.key}>{id.label}</Option>)}
                  </OptGroup>
                );
              })}
            </Select>,
          )}
        </Item>
        <Item {...formLayout} label="SKU后缀" help="美亚为-FBA">
          {getFieldDecorator('dynamic.suffix', {
            initialValue: dynamic && dynamic.suffix,
          })(<Input placeholder="SKU后缀" />)}
        </Item>
        <Item {...formLayout} label="覆盖父级配置">
          {getFieldDecorator('is_replace', {
            initialValue: is_replace,
            valuePropName: 'checked',
          })(<Switch checkedChildren="是" unCheckedChildren="否" />)}
        </Item>
      </Form>
    );
  }
}

export default ConfigForm;
