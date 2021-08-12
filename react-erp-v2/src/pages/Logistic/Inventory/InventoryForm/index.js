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
        title="编辑总库存信息"
        visible={visible}
        destroyOnClose
        width={760}
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
      >
        <Item label="InflowSKU" {...formLayout}>
          {getFieldDecorator('inflow_sku', {
            rules: [{ required: true, message: '请输入SKU' }],
            initialValue: current.inflow_sku,
          })(<Input placeholder="请输入" disabled={disabled} />)}
        </Item>
        <Item label="所属仓库" {...formLayout}>
          {getFieldDecorator('warehouse_id', {
            rules: [{ required: true, message: '请选择所属仓库' }],
            initialValue: current.warehouse_id,
          })(
            <Select placeholder="请选择" style={{ width: '100%' }} disabled={disabled}>
              {warehouseOption && Object.keys(warehouseOption).length !== 0 ?
                (warehouseOption.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)) : null}
            </Select>
          )}
        </Item>
        <Item label="在售SKU" {...formLayout}>
          {getFieldDecorator('seller_product_sku', {
            rules: [{ required: true, message: '请输入SKU' }],
            initialValue: this.renderSellerSkuOption(current.seller_product_item),
          })(
            <Select
              showSearch
              allowClear
              labelInValue
              placeholder='请查询选择在售SKU'
              style={{ width: '100%' }}
              filterOption={false}
              onSearch={_.debounce(this.searchProductSku, 500)}
            >
              {Object.keys(productSkuList).length !== 0 ? productSkuList.map(item => <Option key={item.id} value={item.id}>{item.sku}</Option>) : null}
            </Select>,
          )}
        </Item>
        <Item label="库存" {...formLayout}>
          {getFieldDecorator('quantity', {
            rules: [{ required: true, message: '请输入库存量' }],
            initialValue: current.quantity,
          })(<Input placeholder="请输入" />)}
        </Item>
        <Item label="备注" {...formLayout}>
          {getFieldDecorator('remark', {
            initialValue: current.remark,
          })(<TextArea placeholder="请输入" />)}
        </Item>
      </Modal>

    );
  }
}

export default InventoryForm;
