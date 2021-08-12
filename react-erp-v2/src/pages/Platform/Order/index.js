import React, { Component, Fragment } from 'react';
import { Button, Card, Col, Form, Input, Row, Select, Drawer, Cascader, Tag, Tooltip, Divider } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
import { router } from 'umi';
import OrderDetail from './Detail';
import EditForm from './EditForm';

const SelectOption = Select.Option;
const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const tailFormItemLayout = {
  wrapperCol: { span: 18, offset: 6 },
};

const status = [
  { text: formatMessage({ id: 'platform.search-option.pending' }), value: 'Pending' },
  { text: formatMessage({ id: 'platform.search-option.unshipped' }), value: 'Unshipped' },
  { text: formatMessage({ id: 'platform.search-option.partially-shipped' }), value: 'PartiallyShipped' },
  { text: formatMessage({ id: 'platform.search-option.shipped' }), value: 'Shipped' },
  { text: formatMessage({ id: 'platform.search-option.canceled' }), value: 'Canceled' },
  { text: formatMessage({ id: 'platform.search-option.refunded' }), value: 'Refunded' },
  { text: formatMessage({ id: 'platform.search-option.unfulfillable' }), value: 'Unfulfillable' },
  { text: formatMessage({ id: 'platform.search-option.unknown' }), value: 'Unknown' },
];

@connect(({ platform, logistic, loading }) => ({
  platform,
  logistic,
  loading: loading.effects['platform/fetchOrders'],
}))
@Form.create()
class Order extends Component {
  constructor(props) {
    super(props);
    const { platform: { orderFilters } } = props;
    this.state = {
      filters: orderFilters,
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'order_date', order: 'desc' },
      visible: false,
      current: {},
      editVisible: false,
      editCurrent: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'platform/fetchTree',
      payload: {},
    });
    dispatch({
      type: 'logistic/fetchWarehouseOptions',
    });
    this.initOrders();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    // // 清除数据
    dispatch({
      type: 'platform/removeTree',
    });
    dispatch({
      type: 'logistic/removeWarehouseOptions',
    });
  }

  initOrders = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'platform/fetchOrders',
      payload: {
        filters,
        pagination,
        sorter,
        with: ['platform', 'warehouse'],
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
      () => this.initOrders(),
    );
  };

  handleActions = (key, record) => {
    if (key === 'detail') {
      this.orderDetailVisible(true, record);
    } else if (key === 'upload') {
      router.push('/excel/imports/create?type=amazon_order');
    } else if(key === 'edit') {
      this.editOrderVisible(true, record);
    }
  };

  orderDetailVisible = (flag, record, refresh) => {
    this.setState({
      visible: !!flag,
      current: record,
    });
    if (refresh) {
      this.initOrders();
    }
  };

  editOrderVisible = (flag, record, refresh) => {
    this.setState({
      editVisible: !!flag,
      editCurrent: record,
    })
    if(refresh) {
      this.initOrders();
    }
  };

  closeDrawer = () => {
    const { dispatch } = this.props;
    this.orderDetailVisible(false);
    // 关闭详情页清空当前详情数据
    dispatch({
      type: 'platform/remove',
      payload: { platformOrder: {} },
    });
  };

  handleSearch = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { filters, pagination } = this.state;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      const newFilters = { ...filters, ...values };
      this.setState({
        filters: newFilters,
        pagination: { ...pagination, current: 1 },
      }, () => {
        // 记录到Redux中
        dispatch({
          type: 'platform/save',
          payload: { orderFilters: newFilters },
        });
        this.initOrders();
      });
    });
  };

  handleSearchFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      filters: {},
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
    }, () => {
      dispatch({
        type: 'platform/save',
        payload: { orderFilters: {} },
      });
      this.initOrders();
    });
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
        payload: { type: 'merchant_order', dynamic },
      });
    });
  };

  renderSearchForm = () => {
    const {
      form: { getFieldDecorator },
      platform: { platformTree },
      logistic: { warehouseOption },
    } = this.props;
    const { filters } = this.state;
    return (
      <Form layout="inline">
        <StandardFormRow title={formatMessage({ id: 'platform.search.classification' })} grid first>
          <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
            <Col md={6} sm={24}>
              <Form.Item {...formItemLayout} label={formatMessage({ id: 'platform.search-option.platform' })}>
                {getFieldDecorator('platforms', {
                  initialValue: filters.platforms,
                })(
                  <Cascader
                    options={platformTree}
                    placeholder={formatMessage({ id: 'platform.search-option.platform.placeholder' })}
                  />,
                )}
              </Form.Item>
            </Col>
            <Col md={6} sm={24}>
              <Form.Item {...formItemLayout} label={formatMessage({ id: 'platform.search-option.fulfillment' })}>
                {getFieldDecorator('fulfillment', {
                  initialValue: filters.fulfillment,
                })(
                  <Select
                    allowClear
                    placeholder={formatMessage({ id: 'platform.search-option.fulfillment.placeholder' })}
                    style={{ width: '100%' }}
                  >
                    <SelectOption
                      value='Merchant'
                    >{formatMessage({ id: 'platform.search-option.fulfillment.merchant' })}</SelectOption>
                    <SelectOption
                      value='Platform'
                    >{formatMessage({ id: 'platform.search-option.fulfillment.platform' })}</SelectOption>
                  </Select>,
                )}
              </Form.Item>
            </Col>
            <Col md={6} sm={24}>
              <Form.Item {...formItemLayout} label={formatMessage({ id: 'platform.search-option.local-status' })}>
                {getFieldDecorator('local_status', {
                  initialValue: filters.local_status,
                })(
                  <Select
                    allowClear
                    placeholder={formatMessage({ id: 'platform.search-option.local-status.placeholder' })}
                  >
                    {status.map(s => (<SelectOption key={s.value} value={s.value}>{s.text}</SelectOption>))}
                  </Select>,
                )}
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
        <StandardFormRow title={formatMessage({ id: 'platform.search.filter' })} grid last>
          <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
            <Col md={6} sm={24}>
              <Form.Item {...formItemLayout} label={formatMessage({ id: 'platform.search-option.platform-sn' })}>
                {getFieldDecorator('platformSn', {
                  initialValue: filters.platformSn,
                })(<Input placeholder={formatMessage({ id: 'platform.search-option.platform-sn.placeholder' })} />)}
              </Form.Item>
            </Col>
            <Col md={6} sm={24}>
              <Form.Item {...formItemLayout} label={formatMessage({ id: 'platform.search-option.warehouse' })}>
                {getFieldDecorator('warehouse_id', {
                  initialValue: filters.warehouse_id,
                })(
                  <Select
                    allowClear
                    placeholder={formatMessage({ id: 'platform.search-option.warehouse.placeholder' })}
                    style={{ width: '100%' }}
                  >
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
                  {formatMessage({ id: 'app.settings.search.button.search' })}
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleSearchFormReset}>
                  {formatMessage({ id: 'app.settings.search.button.reset' })}
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  type="primary"
                  icon="cloud-download"
                  onClick={this.handleDownload}
                >
                  {formatMessage({ id: 'app.settings.search.button.download' })}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
      </Form>
    );
  };

  render() {
    const {
      loading,
      platform: { orders, platformTree },
    } = this.props;

    const { visible, current, editVisible, editCurrent } = this.state;
    const extraContent = (
      <div>
        <Tooltip title="北美历史订单导入">
          <Button
            style={{ marginLeft: 8 }}
            icon="cloud-upload"
            onClick={() => this.handleActions('upload')}
          >
            订单导入
          </Button>
        </Tooltip>
      </div>
    );
    const columns = [
      {
        title: formatMessage({ id: 'platform.table.th.platform' }),
        dataIndex: 'platform_id',
        render: (text, record) => {
          const { platform } = record;
          return platform && platform.name;
        },
      },
      { title: formatMessage({ id: 'platform.table.th.sn' }), dataIndex: 'platform_sn' },
      {
        title: formatMessage({ id: 'platform.table.th.fulfillment' }),
        dataIndex: 'fulfillment',
        render: (text, record) => {
          if(record.ignore_shipment === true) {
            return `${text}  (${formatMessage({ id: 'platform.table.ignore-shipment' })})`;
          }
          return text;
        }
      },
      {
        title: formatMessage({ id: 'platform.table.th.warehouse' }),
        dataIndex: 'warehouse',
        render: (text, record) => {
          const { fulfillment, warehouse = {} } = record;
          if (fulfillment === 'Platform') {
            return formatMessage({ id: 'platform.table.platform-warehouse' });
          }
          if (warehouse && Object.keys(warehouse).length !== 0) {
            return warehouse.name;
          }
          return <Tag color="red">CN</Tag>;
        },
      },
      { title: formatMessage({ id: 'platform.table.th.ship-level' }), dataIndex: 'local_ship_level' },
      {
        title: formatMessage({ id: 'platform.table.th.local-status' }),
        dataIndex: 'local_status',
        render: (text, record) => {
          if(record.platform_status === text){
            return text;
          }
          return (
            <Tooltip title={formatMessage({ id: 'platform.table.status.tips' })}>
              <Tag color="volcano">{text}</Tag>
            </Tooltip>
          );
        }
      },
      { title: formatMessage({ id: 'platform.table.th.customer' }), dataIndex: 'customer' },
      { title: formatMessage({ id: 'platform.table.th.payment' }), dataIndex: 'payment_method' },
      {
        title: formatMessage({ id: 'platform.table.th.price' }),
        dataIndex: 'price',
        render: (text, record) => `${record.currency_code} / ${record.amount}`,
      },
      { title: formatMessage({ id: 'platform.table.th.created_at' }), dataIndex: 'order_date', sorter: true },
      {
        title: formatMessage({ id: 'platform.table.th.action' }),
        dataIndex: 'action',
        render: (text, record) => (
          <Fragment>
            {record.fulfillment === 'Merchant' ? (
              <Fragment>
                <Button
                  type="primary"
                  icon="edit"
                  size="small"
                  onClick={() => this.handleActions('edit', record)}
                />
                <Divider type="vertical" />
              </Fragment>
            ) : null}
            <Button
              type="primary"
              icon="eye"
              size="small"
              onClick={() => this.handleActions('detail', record)}
            />
          </Fragment>
        ),
      },
    ];
    return (
      <PageHeaderWrapper
        title={formatMessage({ id: 'platform.title.order-management' })}
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
              dataSource={orders}
              rowSelection={null}
              onChange={this.handleStandardTableChange}
            />
          </Card>
        </Fragment>
        <Drawer
          destroyOnClose
          title={formatMessage({ id: 'platform.detail.title' })}
          width="100%"
          placement='left'
          visible={visible}
          onClose={this.closeDrawer}
        >
          <OrderDetail record={current} platformTree={platformTree} />
        </Drawer>
        {editVisible ? (
          <EditForm visible={editVisible} current={editCurrent} showForm={this.editOrderVisible} />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default Order;
