import React, { Component, Fragment } from 'react';
import { Button, Card, Col, Divider, Form, Input, Modal, Row, Tooltip, Drawer } from 'antd';
import { connect } from 'dva';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
import { router } from "umi";
import moment, { now } from 'moment';
import ProductionForm from "./ProductionForm";
import ProductionDetail from './ProductionDetail';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const tailFormItemLayout = {
  wrapperCol: { span: 18, offset: 6 },
};
const statusList = [
  { key: 'create', value: '已创建' },
  { key: 'finished', value: '生产完成' },
  { key: 'partfinished', value: '生产中' },
  { key: 'unfinished', value: '生产中' },
  { key: 'cancelled', value: '生产终止' },
];

@connect(({ factory, loading }) => ({
  factory,
  loading: loading.effects['factory/fetchProduction'],
}))
@Form.create()
class Production extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {},
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
      productionFormVisible: false,
      currentProduction: {},
      detailVisible: false,
      currentDetail: {},
    };
  }

  componentDidMount() {
    this.initFactoryProduction()
  }

  initFactoryProduction = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'factory/fetchProduction',
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
      () => this.initFactoryProduction()
    );
  };

  handleActions = (key, item) => {
    if (key === 'edit') {
      this.productionFormVisible(true, item, false);
    } else if (key === 'detail') {
      this.handleDetailDrawer(true, item);
    } else if (key === 'upload') {
      router.push('/excel/imports/create?type=factory_production');
    } else if (key === 'delete') {
      Modal.confirm({
        title: '删除提醒',
        content: `确定删除"${item.sn}"吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => this.deleteItem(item.id),
      });
    }
  };

  deleteItem = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'factory/deleteProduction',
      payload: id,
      callback: this.initFactoryProduction,
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
        this.initFactoryProduction();
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
      this.initFactoryProduction();
    });
  };

  renderSearchForm = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline">
        <StandardFormRow title="其它选项" grid last>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="订单号">
                {getFieldDecorator('sn')(<Input placeholder="请输入订单号" />)}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="工厂SKU">
                {getFieldDecorator('sku')(<Input placeholder="请输入工厂SKU" />)}
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

  productionFormVisible = (flag, record, refresh) => {
    this.setState({
      productionFormVisible: !!flag,
      currentProduction: record,
    });
    if (refresh) {
      this.initFactoryProduction();
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
        payload: { type: 'factory_production', dynamic },
      });
    });
  };

  handleDetailDrawer = (flag, current = {}) => {
    this.setState({ currentDetail: current, detailVisible: !!flag });
  };

  closeDrawer = (flag) => {
    this.setState({ detailVisible: !!flag, currentDetail: {} });
    const { dispatch } = this.props;
    // 清除数据
    dispatch({
      type: 'factory/clear',
      payload: { detailList: {} },
    });
  };

  renderTime = (time) => (
    <div>
      <div>{moment(now()).isBefore(time) ? '正常' : '延期'}</div>
      <div>{time}</div>
    </div>
  );

  render() {
    const {
      loading,
      factory: { productionList },
    } = this.props;

    const { productionFormVisible, currentProduction, detailVisible, currentDetail } = this.state;

    const columns = [
      { title: '生产订单号', dataIndex: 'sn' },
      { title: '创建日期', dataIndex: 'created_at' },
      {
        title: '预期交付日',
        dataIndex: 'expect_finished_at',
        render: (text, record) => this.renderTime(record.expect_finished_at),
      },
      { title: '产品数', dataIndex: 'items_count' },
      {
        title: '状态',
        dataIndex: 'status',
        render: text => {
          const filterStatus = statusList.filter(e => e.key === text);
          if(filterStatus && Object.keys(filterStatus).length !== 0) {
            return filterStatus[0].value;
          }
          return null;
        }
      },
      { title: '完成比例', dataIndex: 'proportion' },
      { title: '备注信息', dataIndex: 'remark' },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <Button
              icon="edit"
              size="small"
              onClick={() => this.handleActions('edit', record)}
            />
            <Divider type="vertical" />
            <Button
              type="primary"
              icon="eye"
              size="small"
              onClick={() => this.handleActions('detail', record)}
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
        <Tooltip title="添加生产订单">
          <Button
            style={{ marginLeft: 8 }}
            icon="plus"
            onClick={() => this.productionFormVisible(true)}
          />
        </Tooltip>
        <Tooltip title="导入">
          <Button style={{ marginLeft: 8 }} icon="cloud-upload" onClick={() => this.handleActions('upload')} />
        </Tooltip>
      </div>
    );

    return (
      <PageHeaderWrapper
        title="产品管理"
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
              dataSource={productionList}
              rowSelection={null}
              onChange={this.handleStandardTableChange}
            />
          </Card>
        </Fragment>
        {productionFormVisible ? (
          <ProductionForm
            visible={productionFormVisible}
            current={currentProduction}
            showForm={this.productionFormVisible}
          />
        ) : null}
        <Drawer
          destroyOnClose
          title='生产订单详情'
          width="100%"
          placement="left"
          onClose={() => this.closeDrawer(false)}
          visible={detailVisible}
        >
          <ProductionDetail current={currentDetail} refreshList={this.initFactoryProduction} />
        </Drawer>
      </PageHeaderWrapper>
    );
  }
}

export default Production;
