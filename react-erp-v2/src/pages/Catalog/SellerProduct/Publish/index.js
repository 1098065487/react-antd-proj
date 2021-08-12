import React, { PureComponent } from 'react';
import { Cascader, Checkbox, Form, Input, message, Modal, Radio, Tag } from 'antd';
import { connect } from 'dva';

const { Item } = Form;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

@connect((
  {
    platform,
    attribute,
    sellerProduct,
  },
) => ({
  platform,
  attribute,
  sellerProduct,
}))
@Form.create()
class BrandForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      platforms: [],
      attributes: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
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
  };

  onSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      onCancel,
      ids,
    } = this.props;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      dispatch({
        type: 'sellerProduct/batchPublishItems',
        payload: { ...values, ids },
        callback: () => {
          if (onCancel) {
            message.success('发布成功！');
            onCancel();
          }
        },
      });
    });
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
    const { visible, onCancel, form: { getFieldDecorator }, items } = this.props;
    const { platforms, attributes } = this.state;
    return (
      <Modal
        destroyOnClose
        visible={visible}
        width={760}
        title="可售商品批量发布"
        onCancel={onCancel}
        onOk={() => this.onSubmit()}
      >
        <Form>
          <Item {...formLayout} label="已选商品">
            {items.map(i => <Tag>{i.sku}</Tag>)}
          </Item>
          <Item {...formLayout} label="帐号&市场">
            {getFieldDecorator('platform_ids', {
              rules: [{ required: true, message: 'Please select platform' }],
              initialValue: [],
            })(
              <Cascader
                style={{ width: 360 }}
                options={platforms}
                placeholder="选择要发布的平台"
              />,
            )}
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
      </Modal>
    );
  }
}

export default BrandForm;
