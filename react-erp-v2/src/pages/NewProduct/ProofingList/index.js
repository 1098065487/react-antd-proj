import React, { Component, Fragment } from 'react';
import { Button, Card, Col, Divider, Form, Input, Row, Select } from 'antd';
import { connect } from 'dva';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
import { router } from "umi";

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const tailFormItemLayout = {
  wrapperCol: { span: 18, offset: 6 },
};

const statusList = [
  { label: '流转中', value: 'process' },
  { label: '驳回', value: 'reject' },
  { label: '终止', value: 'abort' },
  { label: '完成', value: 'finish' },
];

@connect(({ user, newProduct, loading }) => ({
  user,
  newProduct,
  loading: loading.effects['newProduct/fetchProofingList'],
}))
@Form.create()
class ProofingList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {},
      pagination: { current: 1, pageSize: 20 },
      sorter: {},
    };
  }

  componentDidMount() {
    this.initLists();
  };

  initLists = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'newProduct/fetchProofingList',
      payload: {
        filters,
        pagination,
        sorter,
        with: ['newproduct', 'workflowRun.currentStep.users']
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
      () => this.initLists()
    );
  };

  handleActions = (key, record) => {
    if (key === 'read') {
      router.push('/production/new-product/proofing-detail', { proofingId: record.id, flowId: record.workflow_run.id });
    } else if (key === 'action') {
      router.push('/production/new-product/proofing', { proofingId: record.id, flowId: record.workflow_run.id });
    }
  };

  renderButton = record => {
    const { user: { currentUser } } = this.props;
    const { workflow_run } = record;
    if (workflow_run && Object.keys(workflow_run).length !== 0) {
      const { current_step, status } = workflow_run;
      if (status === 'process') {
        if (current_step && Object.keys(current_step).length !== 0) {
          const { users = [] } = current_step;
          const rights = users.find(item => item.id === currentUser.id);
          if (Object.keys(rights).length !== 0) {
            return (
              <Fragment>
                <Divider type="vertical" />
                <Button
                  type="primary"
                  icon="edit"
                  size="small"
                  onClick={() => this.handleActions('action', record)}
                />
              </Fragment>
            );
          } else {
            return null;
          }
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
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
      filters: {},
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
        <StandardFormRow title="条件过滤" grid first>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="打样编号">
                {getFieldDecorator('dysn')(<Input placeholder="请输入" />)}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="新品开发编号">
                {getFieldDecorator('xpsn')(<Input placeholder="请输入" />)}
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
        <StandardFormRow title="其它选项" grid last>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="状态">
                {getFieldDecorator('status')(
                  <Select placeholder="请选择" style={{ width: '100%' }}>
                    {statusList.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
                  </Select>
                )}
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
      newProduct: { proofingList },
    } = this.props;

    const columns = [
      { title: '打样编号', dataIndex: 'sn' },
      {
        title: '新品开发编号',
        dataIndex: 'new_sn',
        render: (text, record) => {
          const { newproduct } = record;
          return newproduct ? newproduct.sn : null;
        },
      },
      { title: '计划开始时间', dataIndex: 'expected_start_time' },
      { title: '计划结束时间', dataIndex: 'expected_end_time' },
      {
        title: '节点',
        dataIndex: 'node',
        render: (text, record) => {
          const { workflow_run: { current_step } } = record;
          return current_step.label;
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text, record) => {
          const { status } = record.workflow_run;
          const statusNow = statusList.find(item => item.value === status);
          return statusNow.label;
        }
      },
      { title: '创建时间', dataIndex: 'created_at' },
      {
        title: '操作',
        dataIndex: 'action',
        width: 160,
        render: (text, record) => (
          <Fragment>
            <Button
              type="primary"
              icon="eye"
              size="small"
              onClick={() => this.handleActions('read', record)}
            />
            {this.renderButton(record)}
          </Fragment>
        ),
      },
    ];

    return (
      <PageHeaderWrapper
        title="打样信息列表"
      >
        <Fragment>
          <Card bordered={false} className="searchCard">
            {this.renderSearchForm()}
          </Card>
          <Card bordered={false} style={{ marginTop: 24 }}>
            <StandardTable
              loading={loading}
              columns={columns}
              dataSource={proofingList}
              rowSelection={null}
              onChange={this.handleStandardTableChange}
            />
          </Card>
        </Fragment>
      </PageHeaderWrapper>
    );
  }
}

export default ProofingList;
