import React, { Component, Fragment } from 'react';
import { Button, Card, Col, Form, Input, Row, DatePicker, Icon, Tooltip, Avatar } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import moment from 'moment';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
import defaultImg from '@/assets/product.webp';

const { RangePicker } = DatePicker;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const tailFormItemLayout = {
  wrapperCol: { span: 18, offset: 6 },
};

@connect(({ sellerProduct, loading }) => ({
  sellerProduct,
  loading: loading.effects['sellerProduct/fetchSellerProductDemands'],
}))
@Form.create()
class Demand extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        start_at: moment().add(-3, 'months').format('YYYY-MM'),
        end_at: moment().add(11, 'months').format('YYYY-MM'),
      },
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'sku', order: 'desc' },
      start: -3,
      end: 12,
      value: [
        moment().add(-3, 'months'),
        moment().add(11, 'months'),
      ],
      mode: ['month', 'month'],
      isOpen: false,
      firstModeRecord: '',
    };
  }

  componentDidMount() {
    this.initLists();
  }

  initLists = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'sellerProduct/fetchSellerProductDemands',
      payload: {
        filters,
        pagination,
        sorter,
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
    const { filters } = this.state;

    if (key === 'edit') {
      this.editModalVisible(true, record);
    } else if (key === 'download') {
      validateFieldsAndScroll((err, values) => {
        if (err) {
          return;
        }
        const { range } = values;
        const dynamic = {
          ...filters, ...values,
          start_at: range[0].format('YYYY-MM'),
          end_at: range[1].format('YYYY-MM'),
        };
        dispatch({
          type: 'system/createAnExport',
          payload: { type: 'annual_seller_demand', dynamic },
        });
      });
    }
  };

  handleSearch = e => {
    e.preventDefault();
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    const { filters, pagination } = this.state;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      const { range } = values;
      this.setState({
        start: Math.ceil(range[0].diff(moment(), 'months', true)),
        end: Math.ceil(range[1].diff(moment(), 'months', true)) + 1,
      });
      const newFilters = {
        ...filters, ...values,
        start_at: range[0].format('YYYY-MM'),
        end_at: range[1].format('YYYY-MM'),
      };
      this.setState({
        filters: newFilters,
        pagination: { ...pagination, current: 1 },
      }, () => {
        this.initLists();
      });
    });
  };

  handlePanelChange = (value, mode) => {
    const { firstModeRecord } = this.state;  // 设置range选择为起始或者始起时，面板方才收起并赋值
    if (firstModeRecord === '') {
      this.setState({
        firstModeRecord: mode[0],
      });
    }
    if (firstModeRecord !== '' && firstModeRecord !== mode[0]) {
      const { form } = this.props;
      this.setState({
        value,
        mode: [mode[0] === 'date' ? 'month' : mode[0], mode[1] === 'date' ? 'month' : mode[1]],
        isOpen: false,
        firstModeRecord: '',
      });
      form.setFieldsValue({ range: value });  //  表单值的变动需要传回
    }
  };

  handleChange = value => {  //  存在清空的情况用onChange事件控制
    this.setState({ value });
  };

  onOpenChange = status => {  //  控制面板打开关闭
    if (status) {
      this.setState({ isOpen: true });
    } else {
      this.setState({ isOpen: false });
    }
  };

  handleSearchFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      filters: {
        start_at: moment().add(-3, 'months').format('YYYY-MM'),
        end_at: moment().add(11, 'months').format('YYYY-MM'),
      },
      pagination: { current: 1, pageSize: 20 },
      sorter: {},
      start: -3,
      end: 12,
      value: [
        moment().add(-3, 'months'),
        moment().add(11, 'months'),
      ],
    }, () => {
      this.initLists();
    });
  };

  renderSearchForm = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { value, mode, isOpen } = this.state;
    return (
      <Form layout="inline">
        <StandardFormRow title="条件过滤" grid first>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="月份范围">
                {getFieldDecorator('range', {
                  rules: [{ required: true, message: '请选择月份范围' }],
                  initialValue: value,
                })(
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['开始月份', '结束月份']}
                    format="YYYY-MM"
                    open={isOpen}
                    mode={mode}
                    onOpenChange={this.onOpenChange}
                    onChange={this.handleChange}
                    onPanelChange={this.handlePanelChange}
                  />,
                )}
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
        <StandardFormRow title="其它选项" grid last>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="市场SKU">
                {getFieldDecorator('sku')(<Input placeholder="请输入" />)}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                  查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleSearchFormReset}>
                  重置
                </Button>
                <Button style={{ marginLeft: 8 }} type="primary" onClick={() => this.handleActions('download')}>
                  <Icon type='cloud-download' />下载
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
      </Form>
    );
  };

  handleContinuousMonths = () => {
    const { start, end } = this.state;
    const result = [];
    for (let i = start; i < end; i += 1) {
      const month = moment().add(i, 'months').format('YYYY-MM');
      result.push({
        title: month,
        dataIndex: month,
        width: 100,
        render: (text, record) => _.get(record.demands, month),
      });
    }
    return result;
  };

  renderInfo = (thumbnail, sku, title) => (
    <div style={{ clear: 'both' }}>
      <Avatar
        style={{ float: 'left' }}
        src={thumbnail || defaultImg}
        shape="square"
        size="large"
      />
      <div style={{ float: 'left', marginLeft: 10 }}>
        <h5
          style={{
            width: 200, overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {sku}
        </h5>
        <Tooltip title={title}>
          <p
            style={{
              fontSize: 12,
              width: 200,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              margin: 0,
            }}
          >
            {title}
          </p>
        </Tooltip>
      </div>
    </div>
  );

  render() {
    const {
      loading,
      sellerProduct: { demandList },
    } = this.props;

    const { start, end } = this.state;

    const months = this.handleContinuousMonths();
    const columns = [
      {
        title: '在售SKU',
        dataIndex: 'sku',
        fixed: 'left',
        width: 280,
        render: (text, record) => {
          const { thumbnail, sku, title } = record;
          return this.renderInfo(thumbnail, sku, title);
        },
      },
    ];

    const dynamicColumns = _.concat(columns, months, [
      {
        title: '需求',
        dataIndex: 'quantity',
        render: (text, record) => {
          let total = 0;
          for (let i = start; i < end; i += 1) {
            const month = moment().add(i, 'months').format('YYYY-MM');
            total += _.get(record.demands, month);
          }
          return total;
        },
      },
      { title: 'CN仓库存', dataIndex: 'inventory_quantity', width: 100 },
      { title: '下单量', dataIndex: 'order_quantity', width: 100 },
      { title: '缺口', dataIndex: 'lack_quantity', width: 100 },
    ]);

    return (
      <PageHeaderWrapper
        title="可售商品需求"
      >
        <Fragment>
          <Card bordered={false} className="searchCard">
            {this.renderSearchForm()}
          </Card>
          <Card bordered={false} style={{ marginTop: 24 }}>
            <StandardTable
              rowKey="id"
              loading={loading}
              columns={dynamicColumns}
              dataSource={demandList}
              rowSelection={null}
              onChange={this.handleStandardTableChange}
              scroll={{
                x: (580 + (end - start) * 100) > 580 ? (680 + (end - start) * 100) : 680,
                y: (document.documentElement.clientHeight - 496),
              }}
            />
          </Card>
        </Fragment>
      </PageHeaderWrapper>
    );
  }
}

export default Demand;
