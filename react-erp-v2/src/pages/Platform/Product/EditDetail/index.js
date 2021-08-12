import React, { PureComponent } from 'react';
import { Form, Modal, Select } from 'antd';
import { connect } from 'dva';

const { Item } = Form;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@connect(({ platform, loading }) => ({
  platform,
  loading: loading.effects['platform/fetchProductsSku'],
}))
@Form.create()
class EditDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      parentSkuList: [],
      sellerSkuList: [],
    };
  }

  fetchParentSku = (value) => {
    if (value) {
      const { dispatch, current: { platformId } } = this.props;
      dispatch({
        type: 'platform/fetchProductsSku',
        payload: {
          filters: { platform_id: platformId, spu: value },
          pagination: { current: 1, pageSize: 20 },
          sorter: { field: 'updated_at', order: 'desc' },
        },
        callback: res => {
          this.setState({
            parentSkuList: res.data,
          })
        }
      });
    }
  };

  fetchSellerSku = value => {
    if (value) {
      const { dispatch } = this.props;
      dispatch({
        type: 'platform/fetchSellerSku',
        payload: {
          filters: { sku: value },
          pagination: { current: 1, pageSize: 20 },
        },
        callback: res => {
          this.setState({
            sellerSkuList: res.data,
          })
        }
      })
    }
  };

  handleSubmit = () => {
    const { dispatch, form, current, showForm } = this.props;
    const { id } = current;
    form.validateFieldsAndScroll((err, fieldValues) => {
      if (err) {
        return;
      }
      const { platform_product, seller_product_item } = fieldValues;
      const { key } = platform_product;
      const { key: sellerKey } = seller_product_item;
      dispatch({
        type: 'platform/updateProductDetail',
        payload: { id, data: { platform_product_id: key, seller_product_item_id: sellerKey } },
        callback: () => showForm(false, {}, true),
      });
    });
  };

  handleCancel = () => {
    const { showForm } = this.props;
    showForm(false);
  };

  renderSelect = current => {
    if(Object.keys(current).length !== 0) {
      const { parentId, spu } = current;
      return { key: parentId, label: spu };
    }
    return undefined;
  };

  renderSellerSelect = current => {
    if(Object.keys(current).length !== 0) {
      const { seller_item = {} } = current;
      if(seller_item && Object.keys(seller_item).length !== 0) {
        const { id, sku } = seller_item;
        return { key: id, label: sku };
      }
      return undefined;
    }
    return undefined;
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      current = {},
    } = this.props;

    const { parentSkuList, sellerSkuList } = this.state;

    return (
      <Modal
        title='编辑平台商品'
        visible={visible}
        destroyOnClose
        width={600}
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
      >
        <Item {...formLayout} label="父SKU">
          {getFieldDecorator('platform_product', {
            rules: [{ required: true, message: '请选择父SKU！' }],
            initialValue: this.renderSelect(current),
          })(
            <Select
              showSearch
              labelInValue
              allowClear
              placeholder="所属父SKU"
              style={{ width: '100%' }}
              filterOption={false}
              onSearch={this.fetchParentSku}
            >
              {parentSkuList.map(item => <Option key={item.id} value={item.id}>{item.spu}</Option>)}
            </Select>,
          )}
        </Item>
        <Item {...formLayout} label="匹配可售商品SKU">
          {getFieldDecorator('seller_product_item', {
            rules: [{ required: true, message: '请选择可售商品SKU！' }],
            initialValue: this.renderSellerSelect(current),
          })(
            <Select
              showSearch
              labelInValue
              allowClear
              placeholder="可售商品SKU"
              style={{ width: '100%' }}
              filterOption={false}
              onSearch={this.fetchSellerSku}
            >
              {sellerSkuList.map(item => <Option key={item.id} value={item.id}>{item.sku}</Option>)}
            </Select>,
          )}
        </Item>
      </Modal>
    );
  }
}

export default EditDetail;
