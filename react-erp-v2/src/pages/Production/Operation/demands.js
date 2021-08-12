import React, { Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Form, Select, message, Col, Row, Divider, Tag, DatePicker, Popover, Input, Tooltip } from 'antd';

import StandardTable from '@/components/StandardTable';
import _ from "lodash";
import moment from 'moment';
import BaseProductList from "./BaseProductList";
import styles from './style.less';

const { Item } = Form;
const { RangePicker } = DatePicker;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};
const statusList = [
  { key: 'created', label: '待下单' },
  { key: 'placed', label: '待接单' },
  { key: 'rejected', label: '被退回' },
  { key: 'received', label: '已接单' },
];

@connect(({ user, factory, loading, }) => ({
  user,
  factory,
  loading: loading.effects['factory/getProductionDemand'],
}))
@Form.create()
class Demands extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      filters: { status: 'created' },
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
      current: {},
      users: [],
    };
  }

  componentDidMount() {
    this.initProductionDemand();
  }

  initProductionDemand = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'factory/getProductionDemand',
      payload: {
        pagination,
        filters,
        sorter,
        with: ['productItems', 'user'],
      },
    });
  };

  handleStandardTableChange = (pagination, filter, sorters) => {
    const { filters, sorter } = this.state;
    this.setState({
      pagination,
      filters: { ...filters, ...filter },
      sorter: { ...sorter, ...sorters },
    }, () => this.initProductionDemand());
  };

  // 判断一维数组是否存在重复元素
  hasDuplicates = array => {
    return _.some(array, (elt, index) => {
      return array.indexOf(elt) !== index;
    });
  };

  // 处理左侧Form模块在接口处理后的置空初始化
  renderAfterSubmit = () => {
    const { form } = this.props;
    form.resetFields(['date', 'sku']);
    this.setState({
      current: {},
    }, this.initProductionDemand);
  };

  handleSubmit = key => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { current: { id } } = this.state;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      const { sku = [] } = values;
      if (sku && sku.length === 0) {
        message.warning('单品信息不能为空！', 5);
        return;
      }
      if (sku && sku.length !== 0) {
        const arr = [];
        sku.forEach(e => {
          arr.push(e.id);
        });
        if (this.hasDuplicates(arr)) {
          message.warning('存在重复单品SKU，请处理！', 5);
          return;
        }
      }
      const { date } = values;
      const list = [];
      sku.forEach(e => {
        list.push({
          product_item_id: e.id,
          qty: e.amount,
        })
      });
      if (id) {
        dispatch({
          type: 'factory/updateProductionDemand',
          payload: {
            id,
            params: {
              status: key === 'order' ? 'placed' : 'created',
              order_date: moment(date).format('YYYY-MM-DD'),
              details: list
            }
          },
          callback: res => {
            if (res.status === 'ok') {
              message.success(key === 'order' ? '下单成功！' : '暂存成功！');
              this.renderAfterSubmit();
            } else {
              message.error(key === 'order' ? '下单失败！' : '暂存失败！');
            }
          },
        });
      } else {
        dispatch({
          type: 'factory/createProductionDemand',
          payload: {
            status: key === 'order' ? 'placed' : 'created',
            order_date: moment(date).format('YYYY-MM-DD'),
            details: list
          },
          callback: res => {
            if (res.status === 'ok') {
              message.success(key === 'order' ? '下单成功！' : '暂存成功！');
              this.renderAfterSubmit();
            } else {
              message.error(key === 'order' ? '下单失败！' : '暂存失败！');
            }
          },
        });
      }
    });
  };

  handleActions = (type, params) => {
    const { form, dispatch } = this.props;
    if (type === 'new') {
      form.resetFields(['date', 'sku']);
      this.setState({
        current: {},
      })
    }
    if (type === 'delete') {
      const { id } = params;
      dispatch({
        type: 'factory/deleteProductionDemand',
        payload: id,
        callback: res => {
          if (res.status === 'ok') {
            message.success('删除成功！');
            this.initProductionDemand();
          } else {
            message.error('删除失败！');
          }
        }
      })
    }
    if (type === 'order') {
      const { id } = params;
      dispatch({
        type: 'factory/updateProductionDemand',
        payload: { id, params: { status: 'placed' } },
        callback: res => {
          if (res.status === 'ok') {
            message.success('下单成功！');
            this.renderAfterSubmit();
          } else {
            message.error('下单失败！');
          }
        },
      });
    }
  };

  handleOrderClick = record => {
    const { form } = this.props;
    const list = [];
    form.resetFields(['date', 'sku',]);
    const { product_items = [] } = record;
    product_items.forEach(e => {
      list.push({ id: e.id, sku: e.sku, amount: e.pivot.qty })
    });
    this.setState({
      current: { id: record.id, sn: record.sn, date: record.order_date, 'list': list },
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

  handleSearchSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    const { filters, pagination } = this.state;
    validateFieldsAndScroll(['keywords', 'range', 'user'], (err, values) => {
      if (err) {
        return;
      }
      this.setState({
        filters: { ...filters, ...values },
        pagination: { ...pagination, current: 1 },
      }, this.initProductionDemand);
    });
  };

  handleSearchReset = () => {
    const { form } = this.props;
    form.resetFields(['keywords', 'range', 'user']);
    this.setState({
      filters: { status: 'created' },
      pagination: { current: 1, pageSize: 20 },
    }, this.initProductionDemand);
  };

  handleSearchDownload = () => {
    const { dispatch, form: { validateFieldsAndScroll } } = this.props;
    const { filters } = this.state;
    validateFieldsAndScroll(['keywords', 'range', 'user'], (err, values) => {
      if (err) {
        return;
      }
      const dynamic = {
        ...filters, ...values
      };
      dispatch({
        type: 'system/createAnExport',
        payload: { type: 'factoryOrderStatus', dynamic },
      });
    });
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator },
      form,
      factory: { demands },
    } = this.props;

    const { current, users } = this.state;

    const content = (
      <Form>
        <Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('keywords')(
            <Input size='small' placeholder="订单号搜索" />
          )}
        </Item>
        <Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('range')(
            <RangePicker placeholder={['（下单）开始日期', '（下单）结束日期']} size='small' />
          )}
        </Item>
        <Item style={{ marginBottom: 10 }}>
          {getFieldDecorator('user')(
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
          onClick={() => this.handleSearchSubmit()}
        >
          搜索
        </Button>
        <Button
          size='small'
          style={{ marginLeft: 15 }}
          onClick={() => this.handleSearchReset()}
        >
          重置
        </Button>,
        <Button
          size='small'
          style={{ marginLeft: 15 }}
          onClick={() => this.handleSearchDownload()}
        >
          下载
        </Button>
      </Form>
    );

    const columns = [
      {
        title: '订单号',
        dataIndex: 'sn',
        render: (text, record) => {
          return <div className={styles.link} onClick={() => this.handleOrderClick(record)}>{text}</div>
        }
      },
      {
        title: '单品详情',
        dataIndex: 'sku',
        render: (text, record) => {
          const { product_items = [] } = record;
          if (product_items) {
            return product_items.map(e => <Tag key={e.id} color='blue' style={{ display: 'inline-block', marginBottom: 2 }}>{`${e.sku} x ${e.pivot.qty}`}</Tag>);
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
        width: '11%',
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
        width: '15%',
        dataIndex: 'action',
        render: (text, record) => {
          return (
            <Fragment>
              <Button
                type="primary"
                size="small"
                onClick={() => this.handleActions('order', record)}
              >
                下单
              </Button>
              <Divider type="vertical" />
              <Button
                icon='delete'
                type='danger'
                size="small"
                onClick={() => this.handleActions('delete', record)}
              />
            </Fragment>
          )
        }
      },
    ];

    return (
      <Fragment>
        <Row gutter={24}>
          <Col span={8}>
            <Form>
              <Card
                size="small"
                title={
                  <Fragment>
                    {current.sn || ''}
                    <Item label="日期" {...formLayout} style={{ marginBottom: 0, marginTop: 10, width: '70%' }}>
                      {getFieldDecorator('date', {
                        rules: [{ required: true, message: '请选择日期' }],
                        initialValue: current.date ? moment(current.date) : null,
                      })(<DatePicker size='small' placeholder="请选择日期" />)}
                    </Item>
                  </Fragment>
                }
                headStyle={{ textAlign: 'center' }}
                actions={
                  [
                    <></>,
                    <></>,
                    <Button
                      onClick={() => this.handleSubmit('save')}
                    >
                      暂存
                    </Button>,
                    <Button
                      type="primary"
                      onClick={() => this.handleSubmit('order')}
                    >
                      下单
                    </Button>
                  ]
                }
              >
                <Item style={{marginBottom: 0}}>
                  {getFieldDecorator('sku', {
                    initialValue: current.list,
                  })(<BaseProductList form={form} Item={Item} />)}
                </Item>
              </Card>
            </Form>
          </Col>
          <Col span={16}>
            <div className={styles.tableButton}>
              <Tooltip title="点击后请在左侧添加">
                <Button
                  icon="plus"
                  type="primary"
                  size="small"
                  onClick={() => this.handleActions('new')}
                >
                  添加
                </Button>
              </Tooltip>
              <Popover content={content} style={{ width: '70%' }} trigger="click">
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
              loading={loading}
              columns={columns}
              dataSource={demands}
              rowSelection={null}
              onChange={this.handleStandardTableChange}
              scroll={{ y: 495 }}
            />
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default Demands;
