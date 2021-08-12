import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';

const { Item } = Form;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@connect(({ factory, loading }) => ({
  factory,
  loading: loading.effects['factory/fetchWarehouseInventory'],
}))
@Form.create()
class InventoryForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      factorySkuList: [],
    };
  }

  searchFactorySku = label => {
    const { dispatch } = this.props;
    dispatch({
      type: 'factory/getFactorySkuOptions',
      payload: { filters: { factorySku: label } },
      callback: res => this.setState({
        factorySkuList: res.data || [],
      })
    });
  };

  handleSubmit = () => {
    const { dispatch, form, current, onCancel } = this.props;
    form.validateFieldsAndScroll((err, fieldValues) => {
      if (err) {
        return;
      }
      const { sku } = fieldValues;
      if (current && Object.keys(current).length !== 0) {
        const { id } = current;
        dispatch({
          type: 'factory/updateInventory',
          payload: { id, data: fieldValues },
          callback: () => onCancel(false, {}, true),
        });
      } else {
        dispatch({
          type: 'factory/createInventory',
          payload: { ...fieldValues, factory_product_item_id: sku.key },
          callback: (res) => {
            if (res.status === 'ok') {
              onCancel(false, {}, true);
            }
          },
        });
      }
    });
  };

  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel(false);
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      current = {},
      warehouseOptions = [],
    } = this.props;

    const { factorySkuList } = this.state;

    const disabled = current && Object.keys(current).length !== 0;
    const { factory_product_item = {} } = current;

    return (
      <Modal
        title={Object.keys(current).length ? '编辑库存' : '新增库存'}
        visible={visible}
        destroyOnClose
        width={600}
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
      >
        <Item label="所属仓库" {...formLayout}>
          {getFieldDecorator('warehouse_id', {
            rules: [{ required: true, message: '请选择所属仓库' }],
            initialValue: current.warehouse_id,
          })(
            <Select placeholder="请选择" style={{ width: '100%' }} disabled={disabled}>
              {
                warehouseOptions && Object.keys(warehouseOptions).length !== 0
                  ? (warehouseOptions.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>))
                  : null
              }
            </Select>,
          )}
        </Item>
        <Item label="工厂SKU" {...formLayout}>
          {getFieldDecorator('sku', {
            rules: [{ required: true, message: '请输入SKU' }],
            initialValue: Object.keys(factory_product_item).length === 0 ? undefined : {
              key: factory_product_item.id,
              label: factory_product_item.sku,
            },
          })(
            <Select
              disabled={disabled}
              showSearch
              allowClear
              labelInValue
              placeholder='请选择'
              style={{ width: '100%' }}
              filterOption={false}
              onSearch={_.debounce(this.searchFactorySku, 500)}
            >
              {Object.keys(factorySkuList).length !== 0 ? factorySkuList.map(item => <Option key={item.id} value={item.id}>{item.sku}</Option>) : null}
            </Select>,
          )}
        </Item>
        <Item label="仓位" {...formLayout}>
          {getFieldDecorator('position', {
            rules: [{ required: true, message: '请输入仓位' }],
            initialValue: current.position,
          })(<Input placeholder="请输入" />)}
        </Item>
        <Item label="数量" {...formLayout}>
          {getFieldDecorator('qty', {
            initialValue: current.qty,
          })(<Input placeholder="请输入" />)}
        </Item>
      </Modal>
    );
  }
}

export default InventoryForm;
