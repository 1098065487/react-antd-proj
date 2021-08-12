import { connect } from 'dva';
import React, { Component } from 'react';
import { Card, Form, Modal, Input, Select, Button, Row, Col, Tooltip, Table, message, Tag, DatePicker, Popconfirm } from 'antd';
import moment from 'moment';
import DescriptionList from '@/components/DescriptionList';
import { formatMessage } from 'umi/locale';
import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
const { Description } = DescriptionList;
const { TextArea } = Input;

@connect(({ carrier, platform, loading }) => ({
  carrier,
  platform,
  loading: loading.effects['platform/fetchOrderItems'],
}))
@Form.create()
class OrderDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      submitLoading: false,
      carriers: [],
      editVisible: false,
      current: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'carrier/fetchOption',
      payload: {},
      callback: carrier => this.setState({
        carriers: carrier,
      }),
    });
    this.initOneOrder();
  }

  initOneOrder = () => {
    const { dispatch, record } = this.props;
    dispatch({
      type: 'platform/fetchOneOrder',
      payload: {
        id: record.id,
        data: { with: ['platform', 'address', 'items.warehouseInventoryLock.warehouse'] },
      },
    });
  };

  handleModalVisible = flag => {
    this.setState({ visible: !!flag });
  };

  shipOrder = () => {
    const { record, form, dispatch, platform: { platformOrder = {} } } = this.props;
    form.validateFieldsAndScroll(['carrier_id', 'tracking_number', 'actual_ship_date'], (err, fieldValues) => {
      if (err) {
        return;
      }
      this.setState({ submitLoading: true });
      const { carrier_id, actual_ship_date } = fieldValues;
      if(platformOrder.local_status === 'Shipped') {
        dispatch({
          type: 'platform/editShipOrder',
          payload: {
            id: record.id,
            data: {
              ...fieldValues,
              'carrier_id': carrier_id.key,
              actual_ship_date: moment(actual_ship_date).format('YYYY-MM-DD HH:mm:ss'),
            },
          },
          callback: () => {
            message.success(formatMessage({ id: 'platform.detail.ship.edit.tips.success' }));
            this.setState({ visible: false, submitLoading: false }, () => this.initOneOrder());
          },
        });
      } else {
        dispatch({
          type: 'platform/shipOrder',
          payload: {
            id: record.id,
            data: {
              ...fieldValues,
              'carrier_id': carrier_id.key,
              actual_ship_date: moment(actual_ship_date).format('YYYY-MM-DD HH:mm:ss'),
            },
          },
          callback: res => {
            if(res.status === 'ok') {
              message.success(formatMessage({ id: 'platform.detail.tips.success' }));
              this.setState({ visible: false, submitLoading: false }, () => this.initOneOrder());
            } else {
              message.error(formatMessage({id: 'platform.detail.tips.failure'}));
            }
          },
        });
      }
    });
  };

  renderCarrier = id => {
    const { carriers } = this.state;
    const carrier = carriers.filter(item => item.value === id);
    if(carrier.length !== 0){
      return carrier[0].label;
    }
    return null;
  };

  handleEditRemark = (flag, record, refresh) => {
    this.setState({
      editVisible: !!flag,
      current: record,
    });
    if(refresh) {
      this.initOneOrder();
    }
  };

  handleSubmit = () => {
    const { form, dispatch } = this.props;
    const { current } = this.state;
    form.validateFieldsAndScroll(['remark'], (err, fieldValues) => {
      if (err) {
        return;
      }
      dispatch({
        type: 'platform/updateOrderProductItem',
        payload: {
          id: current.id,
          data: fieldValues,
        },
        callback: () => {
          message.success(formatMessage({ id: 'platform.detail.edit.tips.success' }));
          this.handleEditRemark(false, {}, true);
        },
      });
    });
  };
  
  renderInitialOption = id => {
    const { carriers } = this.state;
    const filter = carriers.filter(e => id === e.value);
    if(filter.length !== 0) {
      return { key: id, label: filter[0].label }
    }
    return undefined;
  };

  render() {
    const { form, platform: { platformOrder = {} } } = this.props;
    const { address = {}, items = [] } = platformOrder;
    const showAddress = address && Object.keys(address).length !== 0;
    const { visible, submitLoading, carriers, editVisible, current } = this.state;
    const columns = [
      {
        title: 'SKU',
        dataIndex: 'platform_sku',
        width: 300,
      },
      {
        title: formatMessage({ id: 'platform.detail.product.title' }),
        dataIndex: 'platform_title',
        width: 400,
      },
      { title: formatMessage({ id: 'platform.detail.product.quantity' }), dataIndex: 'quantity' },
      { title: formatMessage({ id: 'platform.detail.product.currency' }), dataIndex: 'currency_code' },
      { title: formatMessage({ id: 'platform.detail.product.amount' }), dataIndex: 'amount' },
      {
        title: formatMessage({ id: 'platform.detail.product.pick_info' }),
        dataIndex: 'pick_info',
        render: (text, item) => {
          if(platformOrder.fulfillment !== 'Platform') {
            const { warehouse_inventory_lock } = item;
            if (warehouse_inventory_lock) {
              const { warehouse } = warehouse_inventory_lock;
              return (
                <DescriptionList col={1} size="small">
                  <Description
                    term={formatMessage({ id: 'platform.detail.product.pick_info.warehouse' })}
                  >
                    {warehouse.name}
                  </Description>
                  <Description
                    term={formatMessage({ id: 'platform.detail.product.pick_info.quantity' })}
                  >
                    {warehouse_inventory_lock.quantity}
                  </Description>
                </DescriptionList>
              );
            }
            return <Tag color="red">CN</Tag>;
          }
          return formatMessage({ id: 'platform.detail.fulfillment.info' });
        },
      },
      {
        title: formatMessage({ id: 'platform.detail.product.remark' }),
        dataIndex: 'remark',
        width: 200,
        render: (text) => (
          <Tooltip title={text}>
            <div className={styles.white_space}>{text}</div>
          </Tooltip>
        ),
      },
      {
        title: formatMessage({ id: 'platform.detail.product.action' }),
        dataIndex: 'action',
        render: (text, record) => (
          (platformOrder.ignore_shipment !== true) && (platformOrder.platform_status !== 'Shipped') && platformOrder.local_status === 'Unshipped' && platformOrder.fulfillment === 'Merchant' ? (
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => this.handleEditRemark(true, record)}
            />
          ) : null
        ),
      },
    ];

    return (
      <div>
        <div style={{ marginBottom: 20 }}>Order ID: # {platformOrder.platform_sn}</div>
        <Row gutter={24}>
          <Col span={16} style={{ paddingRight: 20 }}>
            <Card>
              <DescriptionList
                title={formatMessage({ id: 'platform.detail.subtitle.order' })}
                style={{ float: 'left' }}
                col="2"
              >
                <Description
                  term={formatMessage({ id: 'platform.detail.order.created_at' })}
                >
                  {platformOrder.order_date}
                </Description>
                <Description
                  term={formatMessage({ id: 'platform.detail.order.price' })}
                >
                  {`${platformOrder.currency_code} / ${platformOrder.amount}`}
                </Description>
                <Description
                  term={formatMessage({ id: 'platform.detail.order.fulfillment' })}
                >
                  {platformOrder.fulfillment}
                </Description>
                <Description
                  term={formatMessage({ id: 'platform.detail.order.ship_level' })}
                >
                  {platformOrder.ship_level}
                </Description>
                <Description
                  term={formatMessage({ id: 'platform.detail.order.platform' })}
                >
                  {platformOrder.platform && Object.keys(platformOrder.platform).length !== 0 ? platformOrder.platform.name : ''}
                </Description>
                <Description
                  term={formatMessage({ id: 'platform.detail.order.platform_status' })}
                >
                  {platformOrder.platform_status}
                </Description>
                <Description
                  term={formatMessage({ id: 'platform.detail.order.local_status' })}
                >
                  {platformOrder.local_status}
                </Description>
                {platformOrder.carrier_id !== null ?
                  <Description
                    term={formatMessage({ id: 'platform.detail.order.carrier' })}
                  >
                    {this.renderCarrier(platformOrder.carrier_id)}
                  </Description> : null}
                {platformOrder.tracking_number !== null ?
                  <Description
                    term={formatMessage({ id: 'platform.detail.order.tracking_number' })}
                  >
                    {platformOrder.tracking_number}
                  </Description> : null}
                {platformOrder.actual_ship_date !== null ?
                  <Description
                    term={formatMessage({ id: 'platform.detail.order.actual_ship_date' })}
                  >
                    {platformOrder.actual_ship_date}
                  </Description> : null}
              </DescriptionList>
            </Card>
          </Col>
          <Col span={8} style={{ paddingLeft: 20 }}>
            <Card style={{ paddingBottom: 0 }}>
              <DescriptionList
                title={formatMessage({ id: 'platform.detail.subtitle.waybill' })}
                style={{ float: 'right' }}
                col="1"
              >
                <Description
                  term={formatMessage({ id: 'platform.detail.waybill.name' })}
                >{showAddress ? address.name : ''}</Description>
                <Description
                  term={formatMessage({ id: 'platform.detail.waybill.phone' })}
                >{showAddress ? address.phone : ''}</Description>
                <Description
                  term={formatMessage({ id: 'platform.detail.waybill.address1' })}
                >{showAddress ? address.address1 : ''}</Description>
                <Description
                  term={formatMessage({ id: 'platform.detail.waybill.address2' })}
                >{showAddress ? address.address2 : ''}</Description>
                <Description
                  term={formatMessage({ id: 'platform.detail.waybill.address3' })}
                >{showAddress ? address.address3 : ''}</Description>
                <Description
                  term={formatMessage({ id: 'platform.detail.waybill.city' })}
                >{showAddress ? address.city : ''}</Description>
                <Description
                  term={formatMessage({ id: 'platform.detail.waybill.state' })}
                >{showAddress ? address.state : ''}</Description>
                <Description
                  term={formatMessage({ id: 'platform.detail.waybill.postal_code' })}
                >{showAddress ? address.postal_code : ''}</Description>
                <Description
                  term={formatMessage({ id: 'platform.detail.waybill.country' })}
                >{showAddress ? address.country_code : ''}</Description>
              </DescriptionList>
            </Card>
          </Col>
        </Row>
        <Card bordered={false}>
          <div className={styles.title}>
            {formatMessage({ id: 'platform.detail.subtitle.product' })}
            {
              (platformOrder.ignore_shipment !== true) && (platformOrder.platform_status !== 'Shipped') && platformOrder.local_status === 'Unshipped' && platformOrder.fulfillment === 'Merchant' ? (
                <Popconfirm
                  title={formatMessage({ id: 'platform.detail.button.delivery.tips' })}
                  onConfirm={() => this.handleModalVisible(true)}
                >
                  <Button style={{ marginLeft: 20 }}>
                    {formatMessage({ id: 'platform.detail.button.ship_conform' })}
                  </Button>
                </Popconfirm>
              ) : null
            }
            {
              ((platformOrder.ignore_shipment !== true) && platformOrder.fulfillment === 'Merchant' && platformOrder.local_status === 'Shipped') ? (
                <Button style={{ marginLeft: 20 }} onClick={() => this.handleModalVisible(true)}>
                  {formatMessage({ id: 'platform.detail.button.ship_edit' })}
                </Button>
              ) : null
            }
          </div>
          <Table
            rowKey='id'
            columns={columns}
            dataSource={items}
            pagination={false}
          />
          <Modal
            destroyOnClose
            confirmLoading={submitLoading}
            title={formatMessage({ id: 'platform.detail.delivery.title' })}
            width={720}
            visible={visible}
            onOk={this.shipOrder}
            onCancel={() => this.handleModalVisible(false)}
          >
            <Form>
              <FormItem
                label={formatMessage({ id: 'platform.detail.delivery.carrier' })}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 15 }}
              >
                {form.getFieldDecorator('carrier_id', {
                  rules: [{
                    required: true,
                    message: formatMessage({ id: 'platform.detail.delivery.carrier.message' }),
                  }],
                  initialValue: this.renderInitialOption(platformOrder.carrier_id),
                })(
                  <Select
                    allowClear
                    labelInValue
                    placeholder={formatMessage({ id: 'platform.detail.delivery.carrier.placeholder' })}
                    style={{ width: '100%' }}
                  >
                    {Object.keys(carriers).length !== 0 ? carriers.map(item =>
                      <Option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </Option>) : null}
                  </Select>,
                )}
              </FormItem>
              <FormItem
                label={formatMessage({ id: 'platform.detail.delivery.tracking_number' })}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 15 }}
              >
                {form.getFieldDecorator('tracking_number', {
                  rules: [{
                    required: true,
                    message: formatMessage({ id: 'platform.detail.delivery.tracking_number.message' }),
                  }],
                  initialValue: platformOrder.tracking_number,
                })(<Input
                  placeholder={formatMessage({ id: 'platform.detail.delivery.tracking_number.placeholder' })}
                />)}
              </FormItem>
              <FormItem
                label={formatMessage({ id: 'platform.detail.delivery.actual_ship_date' })}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 15 }}
              >
                {form.getFieldDecorator('actual_ship_date', {
                  initialValue: platformOrder.actual_ship_date ? moment(platformOrder.actual_ship_date) : null,
                })(
                  <DatePicker
                    showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder={formatMessage({ id: 'platform.detail.delivery.actual_ship_date.placeholder' })}
                    style={{ width: '100%' }}
                  />,
                )}
              </FormItem>
            </Form>
          </Modal>
          <Modal
            destroyOnClose
            title={formatMessage({ id: 'platform.detail.product.edit-remark' })}
            width={720}
            visible={editVisible}
            onOk={this.handleSubmit}
            onCancel={() => this.handleEditRemark(false, {})}
          >
            <Form>
              <FormItem
                label={formatMessage({ id: 'platform.detail.product.remark' })}
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 13 }}
              >
                {form.getFieldDecorator('remark', {
                  initialValue: current.remark ? current.remark : null,
                })(<TextArea />)}
              </FormItem>
            </Form>
          </Modal>
        </Card>
      </div>
    );
  }
}

export default OrderDetail;
