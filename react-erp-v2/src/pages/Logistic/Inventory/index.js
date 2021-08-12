import React, { Component, Fragment } from 'react';
import { Button, Card, Col, Divider, Form, Input, Modal, Row, Select, Table } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
import { router } from 'umi';
import InventoryForm from './InventoryForm';
import BoxForm from './BoxForm';

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const tailFormItemLayout = {
  wrapperCol: { span: 21, offset: 3 },
};

@connect(({ logistic, loading }) => ({
  logistic,
  loading: loading.effects['logistic/fetchWarehouseInventory'],
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
      boxVisible: false,
      currentBox: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'logistic/fetchWarehouseOptions',
      callback: () => this.initWarehouseInventory(),
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    // 清除数据
    dispatch({
      type: 'logistic/removeWarehouseOptions',
    });
  }

  initWarehouseInventory = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'logistic/fetchWarehouseInventory',
      payload: {
        filters,
        pagination,
        sorter,
        with: ['locations', 'seller_product_item'],
        order: 'created_at:desc',
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
      () => this.initWarehouseInventory(),
    );
  };

  handleActions = (key, item, record) => {
    if (key === 'edit') {
      this.InventoryFormVisible(true, item, false);
    } else if (key === 'add') {
      this.BoxFormVisible(true, item, record, false);
    } else if (key === 'upload') {
      router.push('/excel/imports/create?type=warehouse_inventory');
    } else if (key === 'delete') {
      Modal.confirm({
        title: '删除提醒',
        content: `确定删除"${item.seller_sku}"吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => this.deleteItem(item.id),
      });
    }
  };

  deleteItem = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'logistic/removeInventory',
      payload: id,
      callback: this.initWarehouseInventory,
    });
  };

  renderWarehouse = warehouseId => {
    const { logistic: { warehouseOption } } = this.props;
    const warehouse = _.find(warehouseOption, item => item.value === warehouseId);
    return warehouse === undefined ? '' : warehouse.label;
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
      logistic: { warehouseOption },
    } = this.props;
    return (
      <Form layout="inline">
        <StandardFormRow title="过滤项" grid first>
          <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
            <Col md={6} sm={24}>
              <Form.Item {...formItemLayout} label="InflowSKU">
                {getFieldDecorator('inflow_sku')(<Input placeholder="请输入InflowSKU" />)}
              </Form.Item>
            </Col>
            <Col md={6} sm={24}>
              <Form.Item {...formItemLayout} label="在售SKU">
                {getFieldDecorator('seller_sku')(<Input placeholder="请输入在售SKU" />)}
              </Form.Item>
            </Col>
            <Col md={6} sm={24}>
              <Form.Item {...formItemLayout} label="是否匹配">
                {getFieldDecorator('is_match')(
                  <Select allowClear>
                    <Option key="0" value="yes">已匹配</Option>
                    <Option key="1" value="no">未匹配</Option>
                  </Select>,
                )}
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
        <StandardFormRow title="其它选项" grid last>
          <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
            <Col md={6} sm={24}>
              <Form.Item {...formItemLayout} label="所属仓库">
                {getFieldDecorator('warehouse')(
                  <Select placeholder="请选择" style={{ width: '100%' }}>
                    {
                      warehouseOption && Object.keys(warehouseOption).length !== 0 ? (
                        warehouseOption.map(item =>
                          <Option
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </Option>)
                      ) : null
                    }
                  </Select>,
                )}
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
                <Button style={{ marginLeft: 8 }} onClick={() => this.InventoryFormVisible(true)}>
                  添加
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

  BoxFormVisible = (flag, item, record, refresh) => {
    this.setState({
      boxVisible: !!flag,
      currentBox: item,
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
        payload: { type: 'warehouse_inventory', dynamic },
      });
    });
  };

  handleItemActions = (key, item, record) => {
    if (key === 'edit') {
      this.BoxFormVisible(true, item, record, false);
    } else if (key === 'delete') {
      Modal.confirm({
        title: '删除提醒',
        content: `确定删除"${item.box}"吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => this.deleteBoxItem(item.id),
      });
    }
  };

  deleteBoxItem = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'logistic/removeBox',
      payload: id,
      callback: this.initWarehouseInventory,
    });
  };

  doExpandedRowRender = (record, index, indent, expanded) => {
    const { locations = [] } = record;
    const columns = [
      { title: '箱号', dataIndex: 'box' },
      { title: '库存', dataIndex: 'quantity' },
      {
        title: '操作',
        key: 'action',
        width: 160,
        render: (text, item) => (
          <Fragment>
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => this.handleItemActions('edit', item)}
            />
            <Divider type="vertical" />
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => this.handleItemActions('delete', item)}
            />
          </Fragment>
        ),
      },
    ];
    return expanded ? (
      <Table
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={locations}
        pagination={false}
      />
    ) : null;
  };

  render() {
    const {
      loading,
      logistic: { warehouseInventory, warehouseOption },
    } = this.props;

    const { inventoryVisible, currentInventory, boxVisible, currentBox } = this.state;

    const columns = [
      { title: 'InflowSKU', dataIndex: 'inflow_sku' },
      {
        title: '系统SKU',
        dataIndex: 'sys_seller_sku',
        render: (text, record) => {
          const { seller_product_item } = record;
          return seller_product_item ? seller_product_item.sku : '未匹配';
        },
      },
      {
        title: '所属仓库',
        dataIndex: 'warehouse_id',
        render: text => this.renderWarehouse(text),
      },
      { title: '实际库存', dataIndex: 'quantity' },
      { title: '订单锁库', dataIndex: 'order_quantity' },
      { title: '调拨锁库', dataIndex: 'transfer_quantity' },
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
            <Divider type="vertical" />
            <Button
              type="dashed"
              icon="plus"
              size="small"
              onClick={() => this.handleActions('add', {}, record)}
            />
          </Fragment>
        ),
      },
    ];
    return (
      <PageHeaderWrapper
        title="库存管理"
        extra={(
          <Button style={{ marginLeft: 8 }} icon="cloud-upload" onClick={() => this.handleActions('upload')}>
            导入
          </Button>
        )}
      >
        <Fragment>
          <Card bordered={false} className="searchCard">
            {this.renderSearchForm()}
          </Card>
          <Card bordered={false} style={{ marginTop: 24 }}>
            <StandardTable
              loading={loading}
              columns={columns}
              dataSource={warehouseInventory}
              rowSelection={null}
              onChange={this.handleStandardTableChange}
              expandedRowRender={this.doExpandedRowRender}
            />
          </Card>
        </Fragment>
        <InventoryForm
          visible={inventoryVisible}
          current={currentInventory}
          warehouseOption={warehouseOption}
          onCancel={this.InventoryFormVisible}
        />
        <BoxForm
          visible={boxVisible}
          current={currentBox}
          inventory={currentInventory}
          onCancel={this.BoxFormVisible}
        />
      </PageHeaderWrapper>
    );
  }
}

export default Inventory;
