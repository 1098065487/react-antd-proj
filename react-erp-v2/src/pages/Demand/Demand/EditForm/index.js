import React, { PureComponent } from 'react';
import { Col, Form, Input, Modal, Row, InputNumber, message, Descriptions } from 'antd';
import { connect } from "dva";
import moment from "moment";

const { Item } = Form;
const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@connect(({ platform }) => ({
  platform,
}))
@Form.create()
class EditForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { dispatch, current } = this.props;
    dispatch({
      type: 'platform/fetchItemDemand',
      payload: {
        id: current.id,
        data: { with: ['attributeValues', 'product.category', 'product.platform'] }
      },
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'platform/removeItemDemand'
    })
  }

  handleSubmit = () => {
    const { dispatch, form, formVisible, current } = this.props;
    const months = this.getMonths();
    const items = months.map(item => `demands.${item}`);
    form.validateFieldsAndScroll([...items, 'remark'], (err, fieldValues) => {
      if (err) {
        return;
      }
      dispatch({
        type: 'platform/saveDemands',
        payload: { 'id': current.id, ...fieldValues },
        callback: res => {
          if (res.status === 'ok') {
            message.success('修改成功！');
            formVisible(false, {}, true);
          }
        },
      })
    });
  };

  handleCancel = () => {
    const { formVisible } = this.props;
    formVisible(false);
  };

  renderCategory = info => {
    if (info && Object.keys(info).length !== 0) {
      const { category } = info;
      if (category && Object.keys(category).length !== 0) {
        return category.name;
      }
    }
    return null;
  };

  renderPlatform = info => {
    if (info && Object.keys(info).length !== 0) {
      const { platform } = info;
      if (platform && Object.keys(platform).length !== 0) {
        return platform.name;
      }
    }
    return null;
  };

  getMonths = () => {
    const result = [];
    for (let i = 0; i < 12; i += 1) {
      const month = moment().add(i, 'months').format('YYYY-MM');
      result.push(month);
    }
    return result;
  };

  renderMonthValue = (month, list) => {
    if (list && Object.keys(list).length !== 0) {
      if (list[month] !== undefined) {
        return list[month]
      }
    }
    return null;
  };

  render() {
    const {
      form: { getFieldDecorator },
      platform: { itemDemand },
      visible,
    } = this.props;

    const months = this.getMonths();

    return (
      <Modal
        title='年度需求填报'
        visible={visible}
        destroyOnClose
        width={700}
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
      >
        <Descriptions
          column={2}
        >
          <Descriptions.Item label="市场SKU">{itemDemand.sku}</Descriptions.Item>
          <Descriptions.Item label="产品分类">{this.renderCategory(itemDemand.product)}</Descriptions.Item>
          <Descriptions.Item label="销售市场">{this.renderPlatform(itemDemand.product)}</Descriptions.Item>
          <Descriptions.Item label="平台编码">{itemDemand.platform_sn}</Descriptions.Item>
        </Descriptions>

        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          {months.map(item => (
            <Col md={8} sm={24} key={item}>
              <Form.Item {...formLayout} label={item}>
                {getFieldDecorator(`demands.${item}`, {
                  initialValue: this.renderMonthValue(item, itemDemand.demands),
                })(<InputNumber placeholder="请输入" style={{width: '100%'}} />)}
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Item label="备注" labelCol={{ span: 3 }} wrapperCol={{ span: 18 }}>
          {getFieldDecorator('remark', {
            initialValue: itemDemand.remark,
          })(<TextArea placeholder="请输入" />)}
        </Item>
      </Modal>
    );
  }
}

export default EditForm;
