import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Select } from 'antd';
import _ from 'lodash';

const { Item } = Form;
const { TextArea } = Input;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const types = [
  {
    key: 'Amazon',
    label: '亚马逊',
  },
  {
    key: 'Ebay',
    label: '易贝',
  },
  {
    key: 'Walmart',
    label: '沃尔玛',
  },
  {
    key: 'Shopify',
    label: 'Shopify',
  },
  {
    key: 'PrestaShop',
    label: 'PrestaShop',
  },
];

@connect(({ system, user, warehouse }) => ({
  system,
  user,
  warehouse,
}))
class PlatformForm extends PureComponent {
  constructor(props) {
    super(props);
    const { current, parent } = props;
    this.state = {
      current,
      parent,
      searchLoading: false,
      users: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'warehouse/fetchOptions',
      payload: {},
    });
  }

  handleSearch = v => {
    if (v) {
      const { dispatch } = this.props;
      this.setState({ searchLoading: true });
      dispatch({
        type: 'user/fetch',
        payload: { filters: { name: v } },
        callback: res => {
          this.setState({
            users: res.data,
            searchLoading: false,
          });
        },
      });
    }
  };

  render() {
    const {
      form: { getFieldDecorator },
      warehouse: { options },
      actionType,
    } = this.props;
    const { current, parent, users, searchLoading } = this.state;
    const initUsers = current.users
      ? current.users.map(u => {
          return { key: u.id, label: u.name };
        })
      : [];
    const initWs = current.warehouses ? current.warehouses.map(w => w.id) : [];
    const type = (Object.keys(parent).length ? parent.type : current.type) || 'Amazon';
    return (
      <Form>
        {Object.keys(parent).length ? (
          <>
            <Item className="hidden">
              {getFieldDecorator('parent_id', {
                initialValue: parent.id,
              })(<Input type="hidden" />)}
            </Item>
            <Item {...formLayout} label="所属帐号">
              <span className="ant-form-text">{parent.name}</span>
            </Item>
          </>
        ) : null}
        <Item {...formLayout} label="平台类型">
          {getFieldDecorator('type', {
            initialValue: type,
          })(
            <Select placeholder="select platform type">
              {types.map(o => (
                <Option key={o.key} value={o.key}>
                  {o.label}
                </Option>
              ))}
            </Select>
          )}
        </Item>
        <Item {...formLayout} label="帐号&市场">
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please input name' }],
            initialValue: current.name,
          })(<Input placeholder="input name" />)}
        </Item>
        <Item {...formLayout} label="描述">
          {getFieldDecorator('description', {
            initialValue: current.description,
          })(<TextArea placeholder="input description" />)}
        </Item>
        <Item {...formLayout} label="指定用户">
          {getFieldDecorator('user_ids', {
            initialValue: initUsers,
          })(
            <Select
              showSearch
              labelInValue
              mode="multiple"
              placeholder="select users"
              filterOption={false}
              loading={searchLoading}
              onSearch={_.debounce(this.handleSearch, 500)}
            >
              {users.map(u => (
                <Option key={u.id} value={u.id}>
                  {u.name}
                </Option>
              ))}
            </Select>
          )}
        </Item>
        {actionType === 'addParent' || actionType === 'editParent' ? null : (
          <Item {...formLayout} label="发货仓库" help="请按发货顺序添加">
            {getFieldDecorator('warehouse_ids', {
              initialValue: initWs,
            })(
              <Select placeholder="select warehouse" mode="multiple">
                {options.map(o => (
                  <Option key={o.value} value={o.value}>
                    {o.label}
                  </Option>
                ))}
              </Select>
            )}
          </Item>
        )}
      </Form>
    );
  }
}

export default PlatformForm;
