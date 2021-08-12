import React, { Component, Fragment } from 'react';
import { Button, Card, Col, Divider, Form, Input, Modal, Row, Select, Tooltip, } from 'antd';
import { connect } from 'dva';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
import { router } from "umi";
import InventoryForm from "./InventoryForm";

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const tailFormItemLayout = {
  wrapperCol: { span: 18, offset: 6 },
};

@connect(({ factory, loading }) => ({
  factory,
  loading: loading.effects['factory/fetchInventories'],
}))
@Form.create()
class Inventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {},
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
      inventoryVisible: false,
      currentInventory: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'factory/fetchWarehouseOptions',
      callback: () => this.initWarehouseInventory(),
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    // 清除数据
    dispatch({
      type: 'factory/clear',
      payload: { warehouseOptions: [] },
    });
  }

  initWarehouseInventory = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'factory/fetchInventories',
      payload: {
        filters,
        pagination,
        sorter,
        with: ['factoryProductItem.factoryProduct', 'warehouse']
      },
    });
  };

  handleStandardTableChange = (pagination, filter, sorters) => {
    const { filters, sorter } = this.state;
    this.setState(
      {
        pagination,
        filters: { ...filters, ...filter },
        sorter: { ...sorter, ...sorters },
      },
      () => this.initWarehouseInventory()
    );
  };

  handleActions = (key, item) => {
    if (key === 'edit') {
      this.InventoryFormVisible(true, item, false)
    } else if (key === 'upload') {
      router.push('/excel/imports/create?type=factory_inventory');
    } else if (key === 'delete') {
      Modal.confirm({
        title: '删除提醒',
        content: `确定删除"${item.sku}"库存信息吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => this.deleteItem(item.id),
      });
    }
  };

  deleteItem = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'factory/removeInventory',
      payload: id,
      callback: this.initWarehouseInventory,
    })
  };

  handleSearch = () => {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    const { pagination } = this.state;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      this.setState({
        filters: { ...values },
        pagination: { ...pagination, current: 1 },
      }, () => {
        this.initWarehouseInventory();
      });
    });
  };

  handleSearchFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      filters: {},
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
    }, () => {
      this.initWarehouseInventory();
    });
  };

  renderSearchForm = () => {
    const {
      form: { getFieldDecorator },
      factory: { warehouseOptions },
    } = this.props;
    return (
      <Form layout="inline">
        <StandardFormRow title="条件过滤" grid first>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="所属仓库">
                {getFieldDecorator('warehouse')(
                  <Select placeholder="请选择" style={{ width: '100%' }}>
                    {warehouseOptions && Object.keys(warehouseOptions).length !== 0 ?
                      (warehouseOptions.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)) : null}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
        <StandardFormRow title="其它选项" grid last>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="货号">
                {getFieldDecorator('spu')(<Input placeholder="请输入货号" />)}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                  查询
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  type="primary"
                  icon="cloud-download"
                  onClick={this.handleDownload}
                >
                  导出
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleSearchFormReset}>
                  重置
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
      </Form>
    );
  };

  InventoryFormVisible = (flag, record, refresh) => {
    this.setState({
      inventoryVisible: !!flag,
      currentInventory: record,
    });
    if (refresh) {
      this.initWarehouseInventory();
    }
  };

  handleDownload = () => {
    const { dispatch, form: { validateFieldsAndScroll } } = this.props;
    const { filters } = this.state;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      const dynamic = { ...filters, ...values };
      dispatch({
        type: 'system/createAnExport',
        payload: { type: 'factory_warehouse_inventory', dynamic },
      });
    });
  };

  render() {
    const {
      loading,
      factory: { inventoryList, warehouseOptions },
    } = this.props;

    const { inventoryVisible, currentInventory } = this.state;

    const columns = [
      {
        title: '所属仓库',
        dataIndex: 'warehouse',
        render: text => text && Object.keys(text).length !== 0 ? text.name : null,
      },
      {
        title: '货号',
        dataIndex: 'spu',
        render: (text, record) => {
          const { factory_product_item = {} } = record;
          if(Object.keys(factory_product_item).length !== 0) {
            const { factory_product = {} } = factory_product_item;
            if(Object.keys(factory_product).length !== 0) {
              return factory_product.spu;
            }
            return null;
          }
          return null;
        }
      },
      {
        title: '工厂SKU',
        dataIndex: 'sku',
        render: (text, record) => {
          const { factory_product_item = {} } = record;
          if(Object.keys(factory_product_item).length !== 0) {
            return factory_product_item.sku;
          }
          return null;
        }
      },
      {
        title: '颜色',
        dataIndex: 'color',
        render: (text, record) => {
          const { factory_product_item = {} } = record;
          if(Object.keys(factory_product_item).length !== 0) {
            return factory_product_item.color;
          }
          return null;
        }
      },
      {
        title: '尺码',
        dataIndex: 'size',
        render: (text, record) => {
          const { factory_product_item = {} } = record;
          if(Object.keys(factory_product_item).length !== 0) {
            return factory_product_item.size;
          }
          return null;
        }
      },
      { title: '在库库存', dataIndex: 'qty' },
      { title: '仓位', dataIndex: 'position' },
      {
        title: '操作',
        dataIndex: 'action',
        width: 160,
        render: (text, record) => (
          <Fragment>
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => this.handleActions('edit', record)}
            />
            <Divider type="vertical" />
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => this.handleActions('delete', record)}
            />
          </Fragment>
        ),
      },
    ];

    const extraContent = (
      <div>
        <Tooltip title="添加">
          <Button
            style={{ marginLeft: 8 }}
            icon="plus"
            onClick={() => this.InventoryFormVisible(true)}
          />
        </Tooltip>
        <Tooltip title="导入">
          <Button style={{ marginLeft: 8 }} icon="cloud-upload" onClick={() => this.handleActions('upload')} />
        </Tooltip>
      </div>
    );

    return (
      <PageHeaderWrapper
        title="库存管理"
        extra={extraContent}
      >
        <Fragment>
          <Card bordered={false} className="searchCard">
            {this.renderSearchForm()}
          </Card>
          <Card bordered={false} style={{ marginTop: 24 }}>
            <StandardTable
              loading={loading}
              columns={columns}
              dataSource={inventoryList}
              rowSelection={null}
              onChange={this.handleStandardTableChange}
            />
          </Card>
        </Fragment>
        <InventoryForm
          visible={inventoryVisible}
          current={currentInventory}
          warehouseOptions={warehouseOptions}
          onCancel={this.InventoryFormVisible}
        />
      </PageHeaderWrapper>
    );
  }
}

export default Inventory;
