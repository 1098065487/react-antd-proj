import React, { Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Card, Button, Popover, Col, Row, Input, Select, DatePicker, List, Progress, Tag, Drawer } from 'antd';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import _ from "lodash";
import moment from 'moment';
import styles from './index.less';

const { Item } = Form;
const { Option } = Select;
const { RangePicker } = DatePicker;

const statusList = [
  { key: 'producting', label: '生产中' },
  { key: 'finished', label: '完成' },
];

const detailStatusList = [
  { key: 'create', label: '待生产' },
  { key: 'finished', label: '生产完成' },
  { key: 'partfinished', label: '生产中' },
  { key: 'producting', label: '生产中' },
  { key: 'unfinished', label: '生产中' },
  { key: 'cancelled', label: '生产终止' },
  { key: 'shipping', label: '运输中' },
  { key: 'storaged', label: '入库完成' },
];

const roles = JSON.parse(localStorage.getItem('ltg-erp-roles'));
const roleFactory = Object.values(roles).filter(e => e === 'factory');

@connect(({ user, factory, loading }) => ({
  user,
  factory,
  loading: loading.effects['factory/fetchProduction'],
  detailLoading: loading.effects['factory/getProductionDetailList'],
}))
@Form.create()
class Production extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      filters: { status: 'finished' },
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
      detailFilters: {},
      detailPagination: { current: 1, pageSize: 20 },
      users: [],
      current: {},
      detailList: {},
      orderDetails: {},
      visible: false,
    };
  }

  componentDidMount() {
    this.initProduction();
  }

  // 生产页主表格请求
  initProduction = () => {
    const { dispatch } = this.props;
    const { filters, pagination, sorter } = this.state;
    dispatch({
      type: 'factory/fetchProduction',
      payload: {
        filters,
        pagination,
        sorter,
        with: 'factoryOrders.taker',
      }
    });
  };

  // 生产页主表格变动
  handleStandardTableChange = (pagination, filter, sorters) => {
    const { filters, sorter } = this.state;
    this.setState(
      {
        pagination,
        filters: { ...filters, ...filter },
        sorter: { ...sorter, ...sorters },
      }, () => this.initProduction());
  };

  // 点击生产单号触发页面其他内容加载
  handleProductionClick = record => {
    this.setState({
      detailList: {},
      orderDetails: {},
      current: record,
      visible: true,
    }, () => {
      this.getOrderDetails();
      this.initProductionDetailList();
    })
  };

  getOrderDetails = () => {
    const { dispatch } = this.props;
    const { current: { factory_orders } } = this.state;
    if (factory_orders && Object.keys(factory_orders).length !== 0) {
      dispatch({
        type: 'factory/getOrderDetail',
        payload: { id: factory_orders.id, params: { with: ['productItems', 'user'] } },
        callback: res => this.setState({ orderDetails: res })
      })
    }
  };

  // 生产页详情表格请求
  initProductionDetailList = () => {
    const { dispatch } = this.props;
    const { current, detailFilters, detailPagination, } = this.state;
    dispatch({
      type: 'factory/getProductionDetailList',
      payload: {
        filters: detailFilters,
        pagination: detailPagination,
        sorter: {},
        productionId: current.id
      },
      callback: res => this.setState({ detailList: res }),
    });
  };

  // 生产页详情表格变动
  handleDetailTableChange = (pagination, filter) => {
    const { detailFilters } = this.state;
    this.setState(
      {
        detailPagination: pagination,
        filters: { ...detailFilters, ...filter },
      }, () => this.initProductionDetailList());
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

  // 主表格查询
  handleSearchSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    const { filters, pagination } = this.state;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      this.setState({
        filters: { ...filters, ...values },
        pagination: { ...pagination, current: 1 },
      }, this.initProduction);
    });
  };

  // 主表格重置
  handleSearchReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      filters: { status: 'finished' },
      pagination: { current: 1, pageSize: 20 },
    }, this.initProduction);
  };

  handleSearchDownload = () => {
    const { dispatch, form: { validateFieldsAndScroll } } = this.props;
    const { filters } = this.state;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      const dynamic = {
        ...filters, ...values
      };
      dispatch({
        type: 'system/createAnExport',
        payload: { type: 'factoryProduction', dynamic },
      });
    });
  };

  // 进度划分颜色
  renderProgressColor = value => {
    if (value > 0 && value <= 25) {
      return '#fa514c';
    }
    if (value > 25 && value <= 50) {
      return '#fadb14';
    }
    if (value > 50 && value <= 75) {
      return '#108ee9';
    }
    if (value > 75 && value < 100) {
      return '#13c2c2';
    }
    if (value >= 100) {
      return '#52c41a';
    }
    return '#ffffff';
  };

  closeDrawer = () => {
    this.setState({
      visible: false,
      detailList: {},
    });
  };

  render() {
    const {
      loading,
      detailLoading,
      form: { getFieldDecorator },
      factory: { productionList },
    } = this.props;

    const { users, detailList, orderDetails, visible } = this.state;

    const content = (
      <Form>
        <Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('keywords')(
            <Input size='small' placeholder="生产单号综合搜索" />
          )}
        </Item>
        <Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('receiveDate')(
            <RangePicker placeholder={['（接单）开始日期', '（接单）结束日期']} size='small' />
          )}
        </Item>
        <Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('expectDate')(
            <RangePicker placeholder={['（预计交付）开始日期', '（预计交付）结束日期']} size='small' />
          )}
        </Item>
        {roleFactory.length !== 0 ? (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator('actualDate')(
              <RangePicker placeholder={['（入库完成）开始日期', '（入库完成）结束日期']} size='small' />
            )}
          </Item>
        ) : null}
        <Item style={{ marginBottom: 10 }}>
          {getFieldDecorator('user')(
            <Select
              size='small'
              showSearch
              allowClear
              style={{ width: '100%' }}
              placeholder='接单人（请查询选择）'
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
        </Button>
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
        dataIndex: 'order_sn',
        render: (text, record) => {
          if (record.factory_orders && Object.keys(record.factory_orders).length !== 0) {
            return record.factory_orders.sn;
          }
          return null;
        }
      },
      {
        title: '生产单号',
        dataIndex: 'sn',
        render: (text, record) => {
          return <div className={styles.link} onClick={() => this.handleProductionClick(record)}>{text}</div>
        }
      },
      {
        title: '接单日期',
        dataIndex: 'processing_at',
        width: '12%',
        render: (text, record) => {
          if (record.factory_orders && Object.keys(record.factory_orders).length !== 0) {
            return record.factory_orders.processing_at;
          }
          return null;
        }
      },
      {
        title: '预计交付日',
        dataIndex: 'expect_finished_at',
      },
      {
        title: '入库完成日期',
        dataIndex: 'actual_finished_at',
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: '10%',
        render: text => {
          const status = statusList.filter(e => e.key === text);
          if (status.length !== 0) {
            return status[0].label;
          }
          return null;
        }
      },
      {
        title: '接单人',
        dataIndex: 'taker',
        render: (text, record) => {
          const { factory_orders } = record;
          if (factory_orders && Object.keys(factory_orders).length !== 0) {
            const { taker } = factory_orders;
            if (taker && Object.keys(taker).length !== 0) {
              return `${taker.name}(ID: ${taker.id})`;
            }
          }
          return null;
        },
      },
      {
        title: '完成百分比',
        dataIndex: 'proportion',
        width: '12%',
        render: text => <Progress type="circle" strokeColor={this.renderProgressColor(text * 100)} width={50} percent={text * 100} />
      },
    ];

    const detailOperationColumns = [
      {
        title: '单品SKU',
        dataIndex: 'base_sku',
      },
      {
        title: '产品线',
        dataIndex: 'category',
      },
      {
        title: '品牌',
        dataIndex: 'brand',
      },
      {
        title: '品名',
        dataIndex: 'title',
      },
      {
        title: '工厂SKU',
        dataIndex: 'factory_sku',
      },
      {
        title: '生产车间',
        dataIndex: 'workshop',
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: text => {
          const status = detailStatusList.filter(e => e.key === text);
          if (status.length !== 0) {
            return status[0].label;
          }
          return null;
        }
      },
      {
        title: '生产总量',
        dataIndex: 'qty',
      },
      {
        title: '短溢装数量',
        dataIndex: 'lack_over_qty',
      },
      {
        title: '生产未完成量',
        dataIndex: 'unfinished_qty',
      },
      {
        title: '实际完成量',
        dataIndex: 'finished_qty',
      },
      {
        title: '完成百分比',
        dataIndex: 'finished_rate',
        render: text => <Progress type="circle" strokeColor={this.renderProgressColor(text * 100)} width={50} percent={text * 100} />
      },
      {
        title: '实际入库量',
        dataIndex: 'storaged_qty',
      },
      {
        title: '入库百分比',
        dataIndex: 'storaged_rate',
        render: text => <Progress type="circle" strokeColor={this.renderProgressColor(text * 100)} width={50} percent={text * 100} />
      },
    ];

    const detailFactoryColumns = [
      {
        title: '单品SKU',
        dataIndex: 'base_sku',
      },
      {
        title: '工厂SKU',
        dataIndex: 'factory_sku',
      },
      {
        title: '生产车间',
        dataIndex: 'workshop',
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: text => {
          const status = detailStatusList.filter(e => e.key === text);
          if (status.length !== 0) {
            return status[0].label;
          }
          return null;
        }
      },
      {
        title: '生产总量',
        dataIndex: 'qty',
      },
      {
        title: '短溢装数量',
        dataIndex: 'lack_over_qty',
      },
      {
        title: '生产未完成量',
        dataIndex: 'unfinished_qty',
      },
      {
        title: '实际完成量',
        dataIndex: 'finished_qty',
      },
      {
        title: '完成百分比',
        dataIndex: 'finished_rate',
        render: text => <Progress type="circle" strokeColor={this.renderProgressColor(text * 100)} width={50} percent={text * 100} />
      },
      {
        title: '实际入库量',
        dataIndex: 'storaged_qty',
      },
      {
        title: '入库百分比',
        dataIndex: 'storaged_rate',
        render: text => <Progress type="circle" strokeColor={this.renderProgressColor(text * 100)} width={50} percent={text * 100} />
      },
    ];

    return (
      <PageHeaderWrapper
        title="订单库"
      >
        <Row gutter={24}>
          <Col span={16}>
            <Card>
              <div className={styles.tableButton}>
                <Popover content={content} style={{ width: '70%' }} trigger="click">
                  <Button
                    icon="search"
                    size="small"
                    style={{ marginLeft: 5 }}
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
                dataSource={productionList}
                rowSelection={null}
                rowClassName={record => record.actual_finished_at && record.expect_finished_at && (moment(record.expect_finished_at).isBefore(moment(record.actual_finished_at))) ? styles.tipsTableRow : ''}
                style={{ minHeight: 448 }}
                onChange={this.handleStandardTableChange}
                scroll={{ y: 500 }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              size="small"
              title={
                <Fragment>
                  {orderDetails.sn}
                  <div className={styles.listSubtitle}>
                    <div className={styles.listSubtitleLeft}>
                      {orderDetails.order_date ? moment(orderDetails.order_date).format('YYYY-MM-DD') : null}
                    </div>
                    <div className={styles.listSubtitleRight}>
                      {orderDetails.user && Object.keys(orderDetails).length !== 0 ? `${orderDetails.user.name}(ID: ${orderDetails.user.id})` : ''}
                    </div>
                  </div>
                </Fragment>
              }
              headStyle={{ textAlign: 'center' }}
            >
              <List
                size="small"
                bordered
                style={{
                  height: 175,
                  overflowY: orderDetails.product_items && orderDetails.product_items.length > 4 ? 'scroll' : 'hidden'
                }}
                dataSource={orderDetails.product_items && orderDetails.product_items.length !== 0 ? orderDetails.product_items : []}
                renderItem={item => (
                  <List.Item key={item.id}>
                    <div style={{ display: 'flex', flexFlow: 'row nowrap', width: '100%' }}>
                      <div style={{ width: '60%' }}>
                        <Tag color='blue'>
                          {`${item.sku} x ${item.pivot && Object.keys(item.pivot).length !== 0 ? item.pivot.qty : ''}`}
                        </Tag>
                      </div>
                      <div style={{ width: '40%' }}>
                        {item.pivot && Object.keys(item.pivot).length !== 0 ? (
                          <Progress
                            strokeColor={this.renderProgressColor(item.pivot.finished_rate * 100)}
                            width={50}
                            percent={item.pivot.finished_rate * 100}
                          />
                        ) : ''}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
            {/*<Card*/}
            {/*  size="small"*/}
            {/*  title={*/}
            {/*    <Fragment>*/}
            {/*      {current.sn || 'Md17116'}*/}
            {/*    </Fragment>*/}
            {/*  }*/}
            {/*  headStyle={{textAlign: 'center'}}*/}
            {/*  style={{marginTop: 20}}*/}
            {/*>*/}
            {/*  <List*/}
            {/*    size="small"*/}
            {/*    bordered*/}
            {/*    style={{height: 175, overflowY: orderData.length > 4 ? 'scroll' : 'hidden'}}*/}
            {/*    dataSource={orderData}*/}
            {/*    renderItem={item => (*/}
            {/*      <List.Item key={item.id}>*/}
            {/*        <div style={{display: 'flex', flexFlow: 'row nowrap', width: '100%'}}>*/}
            {/*          <div style={{width: '60%'}}>{`${item.sku} x ${item.amount}`}</div>*/}
            {/*          <div style={{width: '40%'}}>{item.progress}</div>*/}
            {/*        </div>*/}
            {/*      </List.Item>*/}
            {/*    )}*/}
            {/*  />*/}
            {/*</Card>*/}
          </Col>
        </Row>
        <Drawer
          destroyOnClose
          title="生产单详情"
          width="66.6%"
          placement='left'
          visible={visible}
          onClose={this.closeDrawer}
        >
          <StandardTable
            rowKey="id"
            size='small'
            loading={detailLoading}
            columns={roleFactory.length === 0 ? detailOperationColumns : detailFactoryColumns}
            dataSource={detailList}
            rowSelection={null}
            onChange={this.handleDetailTableChange}
          />
        </Drawer>
      </PageHeaderWrapper>
    );
  }
}

export default Production;
