import React, { Component, Fragment } from 'react';
import { Button, Card, Col, Form, Input, Row, Select, Cascader, Tooltip, Spin, Divider, DatePicker } from 'antd';
import { connect } from 'dva';
import { router } from "umi";
import _ from 'lodash';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
import CreateForm from "./CreateForm";

const { Option } = Select;
const SelectOption = Select.Option;
const { RangePicker } = DatePicker;

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

@connect(({ user, newProduct, category, loading }) => ({
  user,
  newProduct,
  category,
  loading: loading.effects['newProduct/fetchList'],
  searchLoading: loading.effects['user/fetchUsers'],
}))
@Form.create()
class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {},
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'created_at', order: 'desc' },
      categories: [],
      stepsList: [],
      users: [],
      visible: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/fetchOptions',
      callback: categories => {
        this.setState({ categories });
      },
    });
    dispatch({
      type: 'newProduct/fetchStepOption',
      callback: stepsList => {
        this.setState({ stepsList });
      },
    });
    this.initLists();
  }

  initLists = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'newProduct/fetchList',
      payload: {
        filters,
        pagination,
        sorter,
        with: ['category', 'user', 'workflowRun.currentStep.users'],
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
    const { categories } = this.state;
    if (key === 'add') {
      this.newModalVisible(true)
    } else if (key === 'read') {
      router.push('/production/new-product/detail', {
        newProductId: record.id,
        flowId: record.workflow_run.id,
        'categories': categories,
        category_id: record.category_id
      });
    } else if (key === 'action') {
      router.push('/production/new-product/develop', {
        newProductId: record.id,
        flowId: record.workflow_run.id,
        'categories': categories,
        category_id: record.category_id
      });
    }
  };

  newModalVisible = (flag, refresh) => {
    this.setState({
      visible: !!flag,
    });
    if (refresh) {
      this.initLists();
    }
  };

  renderButton = record => {
    const { user: { currentUser } } = this.props;
    const { workflow_run } = record;
    if (workflow_run && Object.keys(workflow_run).length !== 0) {
      const { current_step, status } = workflow_run;
      if (status === 'process' || status === 'reject') {
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

  searchUsers = name => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchUsers',
      payload: { filters: { 'name': name } },
      callback: (res) => {
        this.setState({ users: res.body });
      },
    });
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
      const { range = [], user } = values;
      let ranges;
      let userId;
      if(range && Object.keys(range).length !== 0) {
        ranges = `${range[0].format('YYYY-MM-DD')},${range[1].format('YYYY-MM-DD')}`;
      }else {
        ranges = '';
      }
      if(user && Object.keys(user).length !== 0) {
        userId = user.key;
      }
      const newFilters = { ...filters, ...values, range: ranges, user: userId };
      this.setState({
        filters: newFilters,
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
      sorter: { field: 'created_at', order: 'desc' },
    }, () => {
      this.initLists();
    });
  };

  renderSearchForm = () => {
    const {
      form: { getFieldDecorator },
      searchLoading,
    } = this.props;
    const { categories, users, stepsList } = this.state;
    return (
      <Form layout="inline">
        <StandardFormRow title="分类过滤" grid first>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="产品分类">
                {getFieldDecorator('category')(
                  <Cascader
                    options={categories}
                    placeholder="请选择产品分类"
                    style={{ width: '100%' }}
                  />,
                )}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="开发类型">
                {getFieldDecorator('type')(
                  <Select placeholder="请选择" style={{ width: '100%' }}>
                    <SelectOption value='new'>新品开发</SelectOption>
                    <SelectOption value='old'>老品改良</SelectOption>
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
        <StandardFormRow title="条件过滤" grid first>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="编号">
                {getFieldDecorator('sn')(<Input placeholder="请输入" />)}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="标题">
                {getFieldDecorator('title')(<Input placeholder="请输入" />)}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="创建人">
                {getFieldDecorator('user')(
                  <Select
                    showSearch
                    allowClear
                    labelInValue
                    style={{ width: '100%' }}
                    placeholder="请查询选择"
                    notFoundContent={searchLoading ? <Spin size="small" /> : null}
                    filterOption={false}
                    onSearch={_.debounce(this.searchUsers, 500)}
                  >
                    {Object.keys(users).length === 0 ? null : users.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
                  </Select>,
                )}
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
        <StandardFormRow title="其它选项" grid first>
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
              <Form.Item {...formItemLayout} label="节点">
                {getFieldDecorator('step')(
                  <Select placeholder="请选择" style={{ width: '100%' }}>
                    {stepsList.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
        <StandardFormRow title="时间筛选" grid last>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="创建时间">
                {getFieldDecorator('range')(
                  <RangePicker
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                  />
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
      newProduct: { list },
    } = this.props;

    const { visible, categories } = this.state;

    const columns = [
      { title: '编号', dataIndex: 'sn' },
      { title: '标题', dataIndex: 'title' },
      {
        title: '产品分类',
        dataIndex: 'category',
        render: (text, record) => {
          const { category } = record;
          return category ? category.name : null;
        },
      },
      {
        title: '开发类型',
        dataIndex: 'develop_type',
        render: text => text === 'new' ? '新品开发' : '老品改良',
      },
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
      {
        title: '创建人',
        dataIndex: 'create_name',
        render: (text, record) => {
          const { user } = record;
          return user ? user.name : null;
        },
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

    const extraContent = (
      <div>
        <Tooltip title="添加新品">
          <Button
            style={{ marginLeft: 8 }}
            icon="plus"
            onClick={() => this.handleActions('add')}
          />
        </Tooltip>
        <Tooltip title="刷新列表">
          <Button style={{ marginLeft: 8 }} icon="sync" onClick={() => this.initLists()} />
        </Tooltip>
      </div>
    );

    return (
      <PageHeaderWrapper
        title="新品开发列表"
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
              dataSource={list}
              rowSelection={null}
              onChange={this.handleStandardTableChange}
            />
          </Card>
        </Fragment>
        <CreateForm
          visible={visible}
          categories={categories}
          onCancel={this.newModalVisible}
        />
      </PageHeaderWrapper>
    );
  }
}

export default ProductList;
