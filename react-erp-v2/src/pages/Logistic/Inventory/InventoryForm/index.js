import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select } from 'antd';
import { connect } from "dva";
import _ from "lodash";

const { Item } = Form;
const { TextArea } = Input;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

@connect(({ logistic, loading }) => ({
  logistic,
  loading: loading.effects['logistic/fetchWarehouseInventory'],
}))
@Form.create()
class InventoryForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      productSkuList: [],
    };
  }

  handleSubmit = () => {
    const { dispatch, form, current, onCancel } = this.props;
    form.validateFieldsAndScroll((err, fieldValues) => {
      if (err) {
        return;
      }
      const { seller_product_sku } = fieldValues;
      if (current && Object.keys(current).length !== 0) {
        const { id } = current;
        dispatch({
          type: 'logistic/updateInventory',
          payload: { id, data: { ...fieldValues, seller_product_item_id: seller_product_sku.key } },
          callback: () => onCancel(false, {}, true),
        })
      } else {
        dispatch({
          type: 'logistic/createInventory',
          payload: { ...fieldValues, seller_product_item_id: seller_product_sku.key },
          callback: () => onCancel(false, {}, true),
        })
      }
    });
  };

  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel(false);
  };

  searchProductSku = label => {
    const { dispatch } = this.props;
    dispatch({
      type: 'logistic/getProductSkuOptions',
      payload: { filters: { sku: label } },
      callback: res => this.setState({
        productSkuList: res.data || [],
      })
    });
  };

  renderSellerSkuOption = data => {
    if(data) {
      const { id, sku } = data;
      return { key: id, label: sku };
    }
    return undefined;
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      current = {},
      warehouseOption = [],
    } = this.props;

    const { productSkuList } = this.state;

    const disabled = current && Object.keys(current).length !== 0;

    return (
      <Modal
        title="?????????????????????"
        visible={visible}
        destroyOnClose
        width={760}
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
      >
        <Item label="InflowSKU" {...formLayout}>
          {getFieldDecorator('inflow_sku', {
            rules: [{ required: true, message: '?????????SKU' }],
            initialValue: current.inflow_sku,
          })(<Input placeholder="?????????" disabled={disabled} />)}
        </Item>
        <Item label="????????????" {...formLayout}>
          {getFieldDecorator('warehouse_id', {
            rules: [{ required: true, message: '?????????????????????' }],
            initialValue: current.warehouse_id,
          })(
            <Select placeholder="?????????" style={{ width: '100%' }} disabled={disabled}>
              {warehouseOption && Object.keys(warehouseOption).length !== 0 ?
                (warehouseOption.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)) : null}
            </Select>
          )}
        </Item>
        <Item label="??????SKU" {...formLayout}>
          {getFieldDecorator('seller_product_sku', {
            rules: [{ required: true, message: '?????????SKU' }],
            initialValue: this.renderSellerSkuOption(current.seller_product_item),
          })(
            <Select
              showSearch
              allowClear
              labelInValue
              placeholder='?????????????????????SKU'
              style={{ width: '100%' }}
              filterOption={false}
              onSearch={_.debounce(this.searchProductSku, 500)}
            >
              {Object.keys(productSkuList).length !== 0 ? productSkuList.map(item => <Option key={item.id} value={item.id}>{item.sku}</Option>) : null}
            </Select>,
          )}
        </Item>
        <Item label="??????" {...formLayout}>
          {getFieldDecorator('quantity', {
            rules: [{ required: true, message: '??????????????????' }],
            initialValue: current.quantity,
          })(<Input placeholder="?????????" />)}
        </Item>
        <Item label="??????" {...formLayout}>
          {getFieldDecorator('remark', {
            initialValue: current.remark,
          })(<TextArea placeholder="?????????" />)}
        </Item>
      </Modal>

    );
  }
}

export default InventoryForm;
