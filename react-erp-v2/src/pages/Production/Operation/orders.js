import React, { Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Select, Popover, Tag, Divider, DatePicker, message, } from 'antd';

import StandardTable from '@/components/StandardTable';
import _ from "lodash";
import moment from "moment";
import styles from './style.less';

const { Item } = Form;
const { Option } = Select;
const { RangePicker } = DatePicker;

const statusList = [
  { key: 'created', label: '待下单' },
  { key: 'placed', label: '待接单' },
  { key: 'rejected', label: '被退回' },
  { key: 'received', label: '已接单' },
];

@connect(({ user, factory, loading }) => ({
  user,
  factory,
  loadingPlaced: loading.effects['factory/getPlacedOrders'],
  loadingReceived: loading.effects['factory/getReceivedOrders'],
  loadingRejected: loading.effects['factory/getRejectedOrders'],
}))
@Form.create()
class Orders extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // 3个表格，互不干扰
      placedFilters: { status: 'placed' },
      placedPagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },  // 针对排序，无要求的情况下，可以用一套
      receivedFilters: { status: 'received' },
      receivedPagination: { current: 1, pageSize: 20 },
      rejectedFilters: { status: 'rejected' },
      rejectedPagination: { current: 1, pageSize: 20 },
      users: [],
      placedData: [],
      receivedData: [],
      rejectedData: [],
    };
  }

  componentDidMount() {
    this.initPlacedList();
    this.initReceivedList();
    this.initRejectedList();
  }

  initPlacedList = () => {
    const { dispatch } = this.props;
    const { placedFilters, placedPagination, sorter } = this.state;
    dispatch({
      type: 'factory/getPlacedOrders',
      payload: {
        filters: placedFilters,
        pagination: placedPagination,
        sorter,
        with: ['productItems', 'user'],
      },
      callback: res => {
        this.setState({
          placedData: res,
        })
      }
    })
  };

  initReceivedList = () => {
    const { dispatch } = this.props;
    const { receivedFilters, receivedPagination, sorter } = this.state;
    dispatch({
      type: 'factory/getReceivedOrders',
      payload: {
        filters: receivedFilters,
        pagination: receivedPagination,
        sorter,
        with: ['productItems', 'user', 'taker'],
      },
      callback: res => {
        this.setState({
          receivedData: res,
        })
      }
    })
  };

  initRejectedList = () => {
    const { dispatch } = this.props;
    const { rejectedFilters, rejectedPagination, sorter } = this.state;
    dispatch({
      type: 'factory/getRejectedOrders',
      payload: {
        filters: rejectedFilters,
        pagination: rejectedPagination,
        sorter,
        with: ['productItems', 'user', 'taker'],
      },
      callback: res => {
        this.setState({
          rejectedData: res,
        })
      }
    })
  };

  searchUser = name => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchUsers',
      payload: { filters: { 'name': name } },
      callback: (res) => {
        this.setState({ users: res.body });
      },
    });
  };

  handlePlacedTableChange = (pagination, filter, sorters) => {
    const { placedFilters, sorter } = this.state;
    this.setState({
      placedPagination: { ...pagination },
      placedFilters: { ...placedFilters, ...filter },
      sorter: { ...sorter, ...sorters },
    }, () => this.initPlacedList());
  };

  handleReceivedTableChange = (pagination, filter, sorters) => {
    const { receivedFilters, sorter } = this.state;
    this.setState({
      receivedPagination: { ...pagination },
      receivedFilters: { ...receivedFilters, ...filter },
      sorter: { ...sorter, ...sorters },
    }, () => this.initReceivedList());
  };

  handleStandardTableChange = (pagination, filter, sorters) => {
    const { rejectedFilters, sorter } = this.state;
    this.setState({
      rejectedPagination: { ...pagination },
      rejectedFilters: { ...rejectedFilters, ...filter },
      sorter: { ...sorter, ...sorters },
    }, () => this.initRejectedList());
  };

  handleSearchSubmit = key => {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    const {
      placedFilters,
      placedPagination,
      receivedFilters,
      receivedPagination,
      rejectedFilters,
      rejectedPagination
    } = this.state;
    validateFieldsAndScroll([`keywords_${key}`, `range_${key}`, `user_${key}`], (err, values) => {
      if (err) {
        return;
      }
      if (key === 'placed') {
        const { keywords_placed, range_placed, user_placed } = values;
        this.setState({
          placedFilters: {
            ...placedFilters,
            keywords: keywords_placed,
            user: user_placed,
            range: range_placed
          },
          placedPagination: { ...placedPagination, current: 1 },
        }, this.initPlacedList);
      }
      if (key === 'received') {
        const { keywords_received, range_received, user_received } = values;
        this.setState({
          receivedFilters: {
            ...receivedFilters,
            keywords: keywords_received,
            user: user_received,
            range: range_received
          },
          receivedPagination: { ...receivedPagination, current: 1 },
        }, this.initReceivedList);
      }
      if (key === 'rejected') {
        const { keywords_rejected, range_rejected, user_rejected } = values;
        this.setState({
          rejectedFilters: {
            ...rejectedFilters,
            keywords: keywords_rejected,
            user: user_rejected,
            range: range_rejected
          },
          rejectedPagination: { ...rejectedPagination, current: 1 },
        }, this.initRejectedList);
      }
    });
  };

  handleSearchReset = key => {
    const { form } = this.props;
    form.resetFields([`keywords_${key}`, `range_${key}`, `user_${key}`]);
    if (key === 'placed') {
      this.setState({
        placedFilters: { status: 'placed' },
        placedPagination: { current: 1, pageSize: 20 },
      }, this.initPlacedList);
    }
    if (key === 'received') {
      this.setState({
        receivedFilters: { status: 'received' },
        receivedPagination: { current: 1, pageSize: 20 },
      }, this.initReceivedList);
    }
    if (key === 'rejected') {
      this.setState({
        rejectedFilters: { status: 'rejected' },
        rejectedPagination: { current: 1, pageSize: 20 },
      }, this.initRejectedList);
    }
  };

  handleSearchDownload = key => {
    const { dispatch, form: { validateFieldsAndScroll } } = this.props;
    const { placedFilters, receivedFilters, rejectedFilters } = this.state;
    validateFieldsAndScroll([`keywords_${key}`, `range_${key}`, `user_${key}`], (err, values) => {
      if (err) {
        return;
      }
      let dynamic = {};
      if (key === 'placed') {
        const { keywords_placed, range_placed, user_placed } = values;
        dynamic = {
          ...placedFilters,
          keywords: keywords_placed,
          user: user_placed,
          range: range_placed
        };
      }
      if (key === 'received') {
        const { keywords_received, range_received, user_received } = values;
        dynamic = {
          ...receivedFilters,
          keywords: keywords_received,
          user: user_received,
          range: range_received
        };
      }
      if (key === 'rejected') {
        const { keywords_rejected, range_rejected, user_rejected } = values;
        dynamic = {
          ...rejectedFilters,
          keywords: keywords_rejected,
          user: user_rejected,
          range: range_rejected
        };
      }
      dispatch({
        type: 'system/createAnExport',
        payload: { type: 'factoryOrderStatus', dynamic },
      });
    });
  };

  handleActions = (type, current, key) => {
    const { dispatch } = this.props;
    const { id } = current;
    if (type === 'delete') {
      dispatch({
        type: 'factory/deleteProductionDemand',
        payload: id,
        callback: res => {
          if (res.status === 'ok') {
            message.success('删除成功！');
            if (key === 'placed') {
              this.initPlacedList();
            }
            if (key === 'rejected') {
              this.initRejectedList();
            }
          } else {
            message.error('删除失败！');
          }
        }
      })
    }
    if (type === 'back') {
      dispatch({
        type: 'factory/updateProductionDemand',
        payload: { id, params: { status: 'created' } },
        callback: res => {
          if (res.status === 'ok') {
            message.success('退回至需求成功！');
            if (key === 'placed') {
              this.initPlacedList();
            }
            if (key === 'rejected') {
              this.initRejectedList();
            }
          } else {
            message.error('退回至需求失败！');
          }
        },
      });
    }
    if (type === 're-order') {
      dispatch({
        type: 'factory/updateProductionDemand',
        payload: { id, params: { status: 'placed' } },
        callback: res => {
          if (res.status === 'ok') {
            message.success('重新下单成功！');
            this.initRejectedList();
            this.initPlacedList();
          } else {
            message.error('重新下单失败！');
          }
        },
      });
    }
  };

  render() {
    const {
      loadingPlaced,
      loadingReceived,
      loadingRejected,
      form: { getFieldDecorator },
    } = this.props;
    const {
      users,
      placedData,
      receivedData,
      rejectedData,
    } = this.state;

    const contentPlaced = (
      <Fragment>
        <Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('keywords_placed')(
            <Input size='small' placeholder="订单号搜索" />
          )}
        </Item>
        <Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('range_placed')(
            <RangePicker placeholder={['（下单）开始日期', '（下单）结束日期']} size='small' />
          )}
        </Item>
        <Item style={{ marginBottom: 10 }}>
          {getFieldDecorator('user_placed')(
            <Select
              size='small'
              showSearch
              allowClear
              style={{ width: '100%' }}
              placeholder='下单人（请查询选择）'
              filterOption={false}
              onSearch={_.debounce(this.searchUser, 500)}
            >
              {Object.keys(users).length !== 0 ? users.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>) : null}
            </Select>
          )}
        </Item>
        <Button
          type="primary"
          size='small'
          style={{ marginLeft: 120 }}
          onClick={() => this.handleSearchSubmit('placed')}
        >
          搜索
        </Button>
        <Button
          size='small'
          style={{ marginLeft: 15 }}
          onClick={() => this.handleSearchReset('placed')}
        >
          重置
        </Button>,
        <Button
          size='small'
          style={{ marginLeft: 15 }}
          onClick={() => this.handleSearchDownload('placed')}
        >
          下载
        </Button>
      </Fragment>
    );

    const contentReceived = (
      <Fragment>
        <Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('keywords_received')(
            <Input size='small' placeholder="订单号搜索" />
          )}
        </Item>
        <Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('range_received')(
            <RangePicker placeholder={['（下单）开始日期', '（下单）结束日期']} size='small' />
          )}
        </Item>
        <Item style={{ marginBottom: 10 }}>
          {getFieldDecorator('user_received')(
            <Select
              size='small'
              showSearch
              allowClear
              style={{ width: '100%' }}
              placeholder='下单人（请查询选择）'
              filterOption={false}
              onSearch={_.debounce(this.searchUser, 500)}
            >
              {Object.keys(users).length !== 0 ? users.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>) : null}
            </Select>
          )}
        </Item>
        <Button
          type="primary"
          size='small'
          style={{ marginLeft: 120 }}
          onClick={() => this.handleSearchSubmit('received')}
        >
          搜索
        </Button>
        <Button
          size='small'
          style={{ marginLeft: 15 }}
          onClick={() => this.handleSearchReset('received')}
        >
          重置
        </Button>,
        <Button
          size='small'
          style={{ marginLeft: 15 }}
          onClick={() => this.handleSearchDownload('received')}
        >
          下载
        </Button>
      </Fragment>
    );

    const contentRejected = (
      <Fragment>
        <Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('keywords_rejected')(
            <Input size='small' placeholder="订单号搜索" />
          )}
        </Item>
        <Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('range_rejected')(
            <RangePicker placeholder={['（下单）开始日期', '（下单）结束日期']} size='small' />
          )}
        </Item>
        <Item style={{ marginBottom: 10 }}>
          {getFieldDecorator('user_rejected')(
            <Select
              size='small'
              showSearch
              allowClear
              style={{ width: '100%' }}
              placeholder='下单人（请查询选择）'
              filterOption={false}
              onSearch={_.debounce(this.searchUser, 500)}
            >
              {Object.keys(users).length !== 0 ? users.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>) : null}
            </Select>
          )}
        </Item>
        <Button
          type="primary"
          size='small'
          style={{ marginLeft: 120 }}
          onClick={() => this.handleSearchSubmit('rejected')}
        >
          搜索
        </Button>
        <Button
          size='small'
          style={{ marginLeft: 15 }}
          onClick={() => this.handleSearchReset('rejected')}
        >
          重置
        </Button>,
        <Button
          size='small'
          style={{ marginLeft: 15 }}
          onClick={() => this.handleSearchDownload('placed')}
        >
          下载
        </Button>
      </Fragment>
    );

    const placedColumns = [
      {
        title: '订单号',
        dataIndex: 'sn',
      },
      {
        title: '单品详情',
        dataIndex: 'sku',
        render: (text, record) => {
          const { product_items = [] } = record;
          if (product_items) {
            return product_items.map(e => <Tag key={e.id} color='blue' style={{ display: 'block', marginBottom: 2 }}>{`${e.sku} x ${e.pivot.qty}`}</Tag>);
          }
          return null;
        },
      },
      {
        title: '下单日期',
        width: '14%',
        dataIndex: 'order_date',
        render: text => text ? moment(text).format('YYYY-MM-DD') : null,
      },
      {
        title: '下单人',
        width: '16%',
        dataIndex: 'user',
        render: (text, record) => {
          const { user } = record;
          if (user && Object.keys(user).length !== 0) {
            return `${record.user.name}(ID: ${record.user.id})`;
          }
          return null;
        },
      },
      {
        title: '状态',
        width: '13%',
        dataIndex: 'status',
        render: text => {
          const status = statusList.filter(e => e.key === text);
          if (status.length !== 0) {
            return status[0].label;
          }
          return null;
        }
      },
      {
        title: '操作',
        width: '16%',
        dataIndex: 'action',
        render: (text, record) => {
          return (
            <Fragment>
              <Button
                type="primary"
                size="small"
                onClick={() => this.handleActions('back', record, 'placed')}
              >
                回退至需求
              </Button>
              <Divider type="vertical" />
              <Button
                icon='delete'
                type='danger'
                size="small"
                onClick={() => this.handleActions('delete', record, 'placed')}
              />
            </Fragment>
          )
        }
      },
    ];

    const receivedColumns = [
      {
        title: '订单号',
        dataIndex: 'sn',
      },
      {
        title: '单品详情',
        dataIndex: 'sku',
        render: (text, record) => {
          const { product_items = [] } = record;
          if (product_items) {
            return product_items.map(e => <Tag key={e.id} color='blue' style={{ display: 'block', marginBottom: 2 }}>{`${e.sku} x ${e.pivot.qty}`}</Tag>);
          }
          return null;
        },
      },
      {
        title: '下单日期',
        width: '13%',
        dataIndex: 'order_date',
        render: text => text ? moment(text).format('YYYY-MM-DD') : null,
      },
      {
        title: '下单人',
        width: '13%',
        dataIndex: 'user',
        render: (text, record) => {
          const { user } = record;
          if (user && Object.keys(user).length !== 0) {
            return `${record.user.name}(ID: ${record.user.id})`;
          }
          return null;
        },
      },
      {
        title: '状态',
        width: '10%',
        dataIndex: 'status',
        render: text => {
          const status = statusList.filter(e => e.key === text);
          if (status.length !== 0) {
            return status[0].label;
          }
          return null;
        }
      },
      {
        title: '反馈时间',
        width: '13%',
        dataIndex: 'processing_at',
      },
      {
        title: '反馈人',
        width: '13%',
        dataIndex: 'taker',
        render: (text, record) => {
          const { taker } = record;
          if (taker && Object.keys(taker).length !== 0) {
            return `${record.taker.name}(ID: ${record.taker.id})`;
          }
          return null;
        },
      },
    ];

    const rejectedColumns = [
      {
        title: '订单号',
        dataIndex: 'sn',
      },
      {
        title: '单品详情',
        dataIndex: 'sku',
        render: (text, record) => {
          const { product_items = [] } = record;
          if (product_items) {
            return product_items.map(e => <Tag key={e.id} color='blue' style={{ display: 'block', marginBottom: 2 }}>{`${e.sku} x ${e.pivot.qty}`}</Tag>);
          }
          return null;
        },
      },
      {
        title: '下单日期',
        dataIndex: 'order_date',
        width: '8%',
        render: text => text ? moment(text).format('YYYY-MM-DD') : null,
      },
      {
        title: '下单人',
        dataIndex: 'user',
        width: '9%',
        render: (text, record) => {
          const { user } = record;
          if (user && Object.keys(user).length !== 0) {
            return `${record.user.name}(ID: ${record.user.id})`;
          }
          return null;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: '6%',
        render: text => {
          const status = statusList.filter(e => e.key === text);
          if (status.length !== 0) {
            return status[0].label;
          }
          return null;
        }
      },
      {
        title: '反馈信息',
        dataIndex: 'feedback_info',
        width: '10%',
      },
      {
        title: '反馈时间',
        width: '8%',
        dataIndex: 'processing_at',
      },
      {
        title: '反馈人',
        width: '9%',
        dataIndex: 'taker',
        render: (text, record) => {
          const { taker } = record;
          if (taker && Object.keys(taker).length !== 0) {
            return `${record.taker.name}(ID: ${record.taker.id})`;
          }
          return null;
        },
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 240,
        render: (text, record) => {
          return (
            <Fragment>
              <Button
                type="primary"
                size="small"
                onClick={() => this.handleActions('back', record, 'rejected')}
              >
                回退至需求
              </Button>
              <Divider type="vertical" />
              <Button
                type="primary"
                size="small"
                onClick={() => this.handleActions('re-order', record)}
              >
                重新下单
              </Button>
              <Divider type="vertical" />
              <Button
                icon='delete'
                type='danger'
                size="small"
                onClick={() => this.handleActions('delete', record, 'rejected')}
              />
            </Fragment>
          )
        }
      },
    ];

    return (
      <Fragment>
        <Form>
          <div>
            <div className={styles.tableButton}>
              <span className={styles.tableTitle}>待接单</span>
              <Popover content={contentPlaced} style={{ width: '70%' }} trigger="click">
                <Button
                  icon="search"
                  size="small"
                  style={{ marginLeft: 20 }}
                >
                  过滤
                </Button>
              </Popover>
            </div>
            <StandardTable
              rowKey="id"
              size='small'
              loading={loadingPlaced}
              columns={placedColumns}
              dataSource={placedData}
              rowSelection={null}
              onChange={this.handlePlacedTableChange}
              scroll={{ y: 250 }}
            />
          </div>
          <div style={{ marginTop: 10 }}>
            <div className={styles.tableButton}>
              <span className={styles.tableTitle}>已接单</span>
              <Popover content={contentReceived} style={{ width: '70%' }} trigger="click">
                <Button
                  icon="search"
                  size="small"
                  style={{ marginLeft: 20 }}
                >
                  过滤
                </Button>
              </Popover>
            </div>
            <StandardTable
              rowKey="id"
              size='small'
              loading={loadingReceived}
              columns={receivedColumns}
              dataSource={receivedData}
              rowSelection={null}
              onChange={this.handleReceivedTableChange}
              scroll={{ y: 250 }}
            />
          </div>
          <div style={{ marginTop: 10 }}>
            <div className={styles.tableButton}>
              <span className={styles.tableTitle}>退单</span>
              <Popover content={contentRejected} style={{ width: '70%' }} trigger="click">
                <Button
                  icon="search"
                  size="small"
                  style={{ marginLeft: 20 }}
                >
                  过滤
                </Button>
              </Popover>
            </div>
            <StandardTable
              rowKey="id"
              size='small'
              loading={loadingRejected}
              columns={rejectedColumns}
              dataSource={rejectedData}
              rowSelection={null}
              onChange={this.handleStandardTableChange}
              scroll={{ y: 250 }}
            />
          </div>
        </Form>
      </Fragment>
    );
  }
}

export default Orders;
