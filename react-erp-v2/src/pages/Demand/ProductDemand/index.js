import React, { Component, Fragment } from 'react';
import { Button, Card, Col, Form, Input, Row, Tag, Select, Drawer, message, Icon } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
import ProductDetail from './ProductDetail';

const { Option } = Select;
const months = [];
for (let i = 0; i < 12; i += 1) {
  const month = moment().add(i, 'months').format('YYYY-MM');
  months.push(<Option key={month} value={month}>{month}</Option>);
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const tailFormItemLayout = {
  wrapperCol: { span: 18, offset: 6 },
};

@connect(({ product, loading }) => ({
  product,
  loading: loading.effects['product/fetchProductDemands'],
}))
@Form.create()
class Demand extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        end_at: moment().add(11, 'month').format('YYYY-MM'),
      },
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'sku', order: 'desc' },
      visible: false,
      current: {},
    };
  }

  componentDidMount() {
    this.initLists();
  }

  initLists = () => {
    const { dispatch } = this.props;
    const { filters, pagination, sorter } = this.state;
    dispatch({
      type: 'product/fetchProductDemands',
      payload: {
        filters,
        pagination,
        sorter,
        with: ['factoryProductItems'],
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
      () => this.initLists(),
    );
  };

  handleActions = (key, record) => {
    const { dispatch, form: { validateFieldsAndScroll } } = this.props;

    if (key === 'detail') {
      const { factory_product_items } = record;
      if (factory_product_items && Object.keys(factory_product_items).length !== 0) {
        this.detailVisible(true, record);
      } else {
        message.warning('?????????????????????????????????');
      }
    } else if (key === 'download') {
      validateFieldsAndScroll((err, values) => {
        if (err) {
          return;
        }
        dispatch({
          type: 'system/createAnExport',
          payload: { type: 'annual_base_demand', dynamic: values },
        });
      });
    }
  };

  detailVisible = (flag, record) => {
    this.setState({
      visible: !!flag,
      current: record,
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    const { pagination } = this.state;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      this.setState({
        filters: values,
        pagination: { ...pagination, current: 1 },
      }, () => {
        this.initLists();
      });
    });
  };


  handleSearchFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      filters: {
        end_at: moment().add(11, 'month').format('YYYY-MM'),
      },
      pagination: { current: 1, pageSize: 20 },
      sorter: {},
    }, () => {
      this.initLists();
    });
  };

  renderSearchForm = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form layout="inline">
        <StandardFormRow title="????????????" grid first>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label={`${moment().format('YYYY-MM')}???`}>
                {getFieldDecorator('end_at', {
                  initialValue: moment().add(11, 'month').format('YYYY-MM'),
                })(
                  <Select
                    placeholder="???????????????"
                  >
                    {months}
                  </Select>,
                )}
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
        <StandardFormRow title="????????????" grid last>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="SKU">
                {getFieldDecorator('sku')(<Input placeholder="?????????" />)}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                  ??????
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleSearchFormReset}>
                  ??????
                </Button>
                <Button style={{ marginLeft: 8 }} type="primary" onClick={() => this.handleActions('download')}>
                  <Icon type='cloud-download' />??????
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
      </Form>
    );
  };

  closeDrawer = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const {
      loading,
      product: { demandList },
    } = this.props;

    const { visible, current } = this.state;

    const columns = [
      {
        title: '??????SKU',
        dataIndex: 'sku',
      },
      {
        title: '??????SKU',
        dataIndex: 'factory_sku',
        width: 200,
        render: (text, record) => {
          const { factory_product_items = [] } = record;
          if (factory_product_items && Object.keys(factory_product_items).length !== 0) {
            return factory_product_items.map(o =>
              <Tag
                key={o.id}
                style={{ display: 'inline-block', marginBottom: 2 }}
                color="blue"
              >
                {o.sku}
              </Tag>,
            );
          }
          return '?????????';
        },
      },
      {
        title: '??????????????????',
        dataIndex: 'demand_origin',
        render: (text, record) => {
          return record.demand_origin || 0;
        },
      },
      {
        title: '????????????',
        dataIndex: 'total_operation_demands',
        render: (text, record) => {
          return record.total_operation_demands || 0;
        },
      },
      {
        title: '??????????????????',
        dataIndex: 'month_operation_demands',
        render: (text, record) => {
          return record.month_operation_demands || 0;
        },
      },
      {
        title: '??????????????????',
        dataIndex: 'total_production_demands',
        render: (text, record) => {
          return record.total_production_demands || 0;
        },
      },
      {
        title: '??????????????????',
        dataIndex: 'factory_inventory_quantities',
      },
      {
        title: 'CN???????????????',
        dataIndex: 'cn_factory_inventory_quantities',
      },
      {
        title: 'LB???????????????',
        dataIndex: 'lb_factory_inventory_quantities',
      },
      {
        title: '??????????????????',
        dataIndex: 'undone_production_quantities',
      },
      {
        title: '?????????',
        dataIndex: 'lack_quantities',
        render: (text, record) => {
          const lock = record.total_production_demands - record.factory_inventory_quantities - record.undone_production_quantities;
          return lock > 0 ? lock : '??????';
        },
      },
      {
        title: '??????',
        render: (text, record) => (
          <Fragment>
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
        title="????????????"
      >
        <Fragment>
          <Card bordered={false} className="searchCard">
            {this.renderSearchForm()}
          </Card>
          <Card bordered={false} style={{ marginTop: 24 }}>
            <StandardTable
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={demandList}
              rowSelection={null}
              onChange={this.handleStandardTableChange}
            />
          </Card>
        </Fragment>
        {visible ? (
          <Drawer
            destroyOnClose
            title="????????????"
            width="100%"
            placement='left'
            visible={visible}
            onClose={this.closeDrawer}
          >
            <ProductDetail record={current} />
          </Drawer>
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default Demand;
