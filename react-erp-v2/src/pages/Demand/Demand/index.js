import React, { Component, Fragment } from 'react';
import { Button, Card, Col, Form, Input, Row, Cascader, Tooltip, DatePicker, Icon, Avatar } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { router } from 'umi';
import _ from 'lodash';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
import defaultImg from '@/assets/product.webp';
import EditForm from './EditForm';

const { RangePicker } = DatePicker;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const tailFormItemLayout = {
  wrapperCol: { span: 18, offset: 6 },
};

@connect(({ platform, loading }) => ({
  platform,
  loading: loading.effects['platform/fetchDemands'],
}))
@Form.create()
class Demand extends Component {
  constructor(props) {
    super(props);
    const { platform: { demandFilters } } = props;
    this.state = {
      filters: {
        ...demandFilters,
        start_at: moment().add(-3, 'months').format('YYYY-MM'),
        end_at: moment().add(11, 'months').format('YYYY-MM'),
      },
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'sku', order: 'desc' },
      categories: [],
      start: -3,
      end: 12,
      visible: false,
      current: {},
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
    const { dispatch } = this.props;
    dispatch({
      type: 'platform/fetchTree',
      payload: {},
    });
    dispatch({
      type: 'category/fetchOptions',
      callback: categories => {
        this.setState({ categories });
      },
    });
    this.initLists();
  }

  initLists = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    const { platform } = filters;
    if (platform) {
      dispatch({
        type: 'platform/fetchDemands',
        payload: {
          filters,
          pagination,
          sorter,
          with: ['attributeValues', 'product.category'],
        },
      });
    }
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

    if (key === 'edit') {
      this.editModalVisible(true, record);
    } else if (key === 'upload') {
      router.push('/excel/imports/create?type=annual_demand');
    } else if (key === 'download') {
      validateFieldsAndScroll((err, values) => {
        if (err) {
          return;
        }
        dispatch({
          type: 'system/createAnExport',
          payload: { type: 'annual_demand', dynamic: values },
        });
      });
    }
  };

  editModalVisible = (flag, record, refresh) => {
    this.setState({
      visible: !!flag,
      current: record,
    });
    if (refresh) {
      this.initLists();
    }
  };

  handleSearch = e => {
    e.preventDefault();
    const {
      form: { validateFieldsAndScroll },
      dispatch,
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
        dispatch({
          type: 'platform/save',
          payload: { demandFilters: newFilters },
        });
        this.initLists();
      });
    });
  };

  handlePanelChange = (value, mode) => {
    const { firstModeRecord } = this.state;  // ??????range????????????????????????????????????????????????????????????
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
      form.setFieldsValue({ range: value });  //  ??????????????????????????????
    }
  };

  handleChange = value => {  //  ????????????????????????onChange????????????
    this.setState({ value });
  };

  onOpenChange = status => {  //  ????????????????????????
    if (status) {
      this.setState({ isOpen: true });
    } else {
      this.setState({ isOpen: false });
    }
  };

  handleSearchFormReset = () => {
    const { form, dispatch } = this.props;
    const { filters: { platform } } = this.state;
    form.resetFields();
    this.setState({
      filters: {
        'platform': platform,
        start_at: moment().add(-3, 'months').format('YYYY-MM'),
        end_at: moment().add(11, 'months').format('YYYY-MM'),
      },
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
      start: -3,
      end: 12,
      value: [
        moment().add(-3, 'months'),
        moment().add(11, 'months'),
      ],
    }, () => {
      dispatch({
        type: 'platform/save',
        payload: { demandFilters: { 'platform': platform } },
      });
      this.initLists();
    });
  };

  renderSearchForm = () => {
    const {
      form: { getFieldDecorator },
      platform: { platformTree },
    } = this.props;
    const { categories, value, mode, isOpen, filters } = this.state;
    return (
      <Form layout="inline">
        <StandardFormRow title="????????????" grid first>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="????????????">
                {getFieldDecorator('platform', {
                  initialValue: filters.platform,
                })(
                  <Cascader
                    options={platformTree}
                    placeholder="?????????????????????"
                    style={{ width: '100%' }}
                  />,
                )}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="??????SKU">
                {getFieldDecorator('sku', {
                  initialValue: filters.sku,
                })(<Input placeholder="?????????" />)}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="????????????">
                {getFieldDecorator('category', {
                  initialValue: filters.category,
                })(
                  <Cascader
                    options={categories}
                    placeholder="?????????????????????"
                    style={{ width: '100%' }}
                  />,
                )}
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
        <StandardFormRow title="????????????" grid first>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="????????????">
                {getFieldDecorator('range', {
                  rules: [{ required: true, message: '?????????????????????' }],
                  initialValue: value,
                })(
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['????????????', '????????????']}
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
        <Tooltip title={sku}>
          <h5
            style={{
              width: 200, overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {sku}
          </h5>
        </Tooltip>
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
      </div>
    </div>
  );

  render() {
    const {
      loading,
      platform: { demands },
    } = this.props;

    const { start, end, visible, current } = this.state;

    const months = this.handleContinuousMonths();
    const columns = [
      {
        title: '????????????',
        dataIndex: 'sku',
        fixed: 'left',
        width: 280,
        render: (text, record) => {
          const { thumbnail, sku, title } = record;
          return this.renderInfo(thumbnail, sku, title);
        },
      },
      {
        title: '??????',
        dataIndex: 'category',
        render: (text, record) => _.get(record.product.category, 'name'),
      },
    ];
    const dynamicColumns = _.concat(columns, months, [
      {
        title: '??????',
        dataIndex: 'quantity',
        width: 100,
        render: (text, record) => {
          let total = 0;
          for (let i = start; i < end; i += 1) {
            const month = moment().add(i, 'months').format('YYYY-MM');
            total += _.get(record.demands, month);
          }
          return total;
        },
      },
      { title: '????????????', dataIndex: 'total_qty', width: 100 },
      { title: '??????????????????', dataIndex: 'in_stock_qty', width: 100 },
      { title: '???????????????', dataIndex: 'inventory_qty', width: 100 },
      { title: 'FBA??????', dataIndex: 'delivery_qty', width: 100 },
      { title: '????????????', dataIndex: 'shipping_qty', width: 100 },
      {
        title: '??????',
        fixed: 'right',
        width: 100,
        render: (text, record) => (
          <Tooltip title="????????????">
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => this.handleActions('edit', record)}
            />
          </Tooltip>
        ),
      },
    ]);

    const extraContent = (
      <div>
        <Tooltip title="????????????">
          <Button
            style={{ marginLeft: 8 }}
            icon="cloud-upload"
            onClick={() => this.handleActions('upload')}
          >
            ??????
          </Button>
        </Tooltip>
      </div>
    );

    return (
      <PageHeaderWrapper
        title="????????????"
        extra={extraContent}
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
              dataSource={demands}
              rowSelection={null}
              onChange={this.handleStandardTableChange}
              scroll={{
                x: (980 + (end - start) * 100) > 980 ? (1080 + (end - start) * 100) : 1080,
                y: (document.documentElement.clientHeight - 496),
              }}
            />
          </Card>
        </Fragment>
        {visible ? (
          <EditForm
            visible={visible}
            current={current}
            formVisible={this.editModalVisible}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default Demand;
