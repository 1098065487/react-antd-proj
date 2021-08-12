import React, { Fragment, PureComponent } from 'react';
import { Button, Icon, Card, Divider, Modal, Input, message, Col, Row, Tag } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import AttributeForm from './AttributeForm';
import ValueForm from './ValueForm';

@connect(({ attribute, loading }) => ({
  attribute,
  loading: loading.effects['attribute/fetch'],
  valueLoading: loading.effects['attribute/fetchValues'],
}))
class Index extends PureComponent {
  constructor(pros) {
    super(pros);
    this.state = {
      // 属性列表
      filters: {},
      pagination: { current: 1, pageSize: 20 },
      sorter: {},
      // 属性值列表
      valueFilters: {},
      valuePagination: { current: 1, pageSize: 20 },
      valueSorter: {},
      value: '',  // 默认属性
      // 属性弹框
      attributeVisible: false,
      attributeCurrent: {},
      // 属性值弹框
      valueVisible: false,
      valueCurrent: {},
    };
  }

  componentDidMount() {
    this.initList();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'attribute/removeValueList',
    })
  }


  initList = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter, value } = this.state;
    dispatch({
      type: 'attribute/fetch',
      payload: { pagination, filters, sorter, with_count: ['values'] },
      callback: res => {
        if (value === '') {  // 仅当为有选中时默认第一项
          if (res.data && Object.keys(res.data).length !== 0) {
            if (res.data[0].id !== undefined) {
              this.setState({
                value: res.data[0].id,
              }, () => this.initValueList());
            }
          }
        }
      }
    });
  };

  initValueList = () => {
    const { dispatch } = this.props;
    const { value } = this.state;
    const { valueFilters, valuePagination, valueSorter } = this.state;
    dispatch({
      type: 'attribute/fetchValues',
      payload: { pagination: valuePagination, filters: { ...valueFilters, attribute_id: value }, sorter: valueSorter },
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
      () => this.initList(),
    );
  };

  handleValueStandardTableChange = (pagination, filters, sorter) => {
    const { valueFilters, valueSorter } = this.state;
    this.setState(
      {
        valuePagination: pagination,
        valueFilters: { ...valueFilters, ...filters },
        valueSorter: { ...valueSorter, ...sorter },
      },
      () => this.initValueList(),
    );
  };

  handleAttributeForm = (flag, current = {}, refresh) => {
    this.setState({
      attributeVisible: !!flag,
      attributeCurrent: current,
    });
    if (refresh) {
      this.initList();
    }
  };

  handleValueForm = (flag, current = {}, refresh) => {
    this.setState({
      valueVisible: !!flag,
      valueCurrent: current,
    })
    if (refresh) {
      this.initValueList();
      this.initList();  // 刷新规格值数量
    }
  }


  // 编辑或更新
  handleActions = (key, item) => {
    if (key === 'edit_attribute') {
      this.handleAttributeForm(true, item);
    } else if (key === 'edit_value') {
      this.handleValueForm(true, item);
    } else if (key === 'delete_attribute') {
      Modal.confirm({
        title: '删除提醒',
        content: `确定删除"${item.name}"吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => this.deleteAttributeItem(item.id),
      });
    } else if (key === 'delete_value') {
      Modal.confirm({
        title: '删除提醒',
        content: `确定删除"${item.value}"吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => this.deleteValueItem(item.id),
      });
    }
  };

  deleteAttributeItem = id => {
    const { dispatch } = this.props;
    const { value } = this.state;
    dispatch({
      type: 'attribute/delete',
      payload: { id },
      callback: () => {
        message.success('delete success');
        //  当选中属性删除的时候，保证删除属性后，能默认选中第一项
        if (value === id) {
          this.setState({
            value: '',
          })
        }
        this.initList();
      },
    });
  };

  deleteValueItem = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'attribute/deleteValue',
      payload: { id },
      callback: () => {
        message.success('delete success');
        this.initValueList();
        this.initList();  // 刷新属性值数量
      },
    });
  };

  columnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      return (
        <div style={{ padding: 8 }}>
          <Input
            ref={node => {
              this.searchInput = node;
            }}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys}
            onChange={e => setSelectedKeys(e.target.value)}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            icon="search"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      );
    },
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
  });

  handleRowClick = (record) => {
    this.setState({
      value: record.id,
    }, () => this.initValueList());
  };

  render() {
    const {
      loading,
      valueLoading,
      attribute: { list, valueList },
    } = this.props;
    const { value, attributeVisible, attributeCurrent, valueVisible, valueCurrent } = this.state;
    const columns = [
      { title: 'ID', dataIndex: 'id', width: '8%', },
      { title: '名称', dataIndex: 'name', width: '15%', ...this.columnSearchProps('name') },
      {
        title: '类型',
        dataIndex: 'type',
        width: '15%',
      },
      { title: '描述', dataIndex: 'description', width: '15%', },
      { title: '属性值', dataIndex: 'values_count', width: '15%', },
      {
        title: '操作',
        dataIndex: 'action',
        width: '24%',
        render: (text, record) => (
          <Fragment>
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => this.handleActions('edit_attribute', record)}
            />
            <Divider type="vertical" />
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => this.handleActions('delete_attribute', record)}
            />
          </Fragment>
        ),
      },
    ];

    const valueColumns = [
      { title: 'ID', dataIndex: 'id', width: '10%', },
      { title: '属性值', dataIndex: 'value', width: '20%', ...this.columnSearchProps('value'), },
      {
        title: '属性值别名',
        dataIndex: 'value_alias',
        width: '30%',
        render: text => <Tag color={text}>{text}</Tag>,
      },
      { title: '位置', dataIndex: 'position', width: '20%', },
      {
        title: '操作',
        dataIndex: 'action',
        width: '20%',
        render: (text, record) => (
          <Fragment>
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => this.handleActions('edit_value', record)}
            />
            <Divider type="vertical" />
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => this.handleActions('delete_value', record)}
            />
          </Fragment>
        ),
      },
    ];

    const rowSelections = {
      type: 'radio',
      selectedRowKeys: [value],
      onSelect: record => {
        this.setState({
          value: record.id,
        }, () => this.initValueList());
      },
    };

    return (
      <PageHeaderWrapper
        title="属性列表"
      >
        <Row gutter={24}>
          <Col span={9}>
            <Card bordered={false}>
              <div style={{ marginBottom: 15 }}>
                <span>属性列表</span>
                <Button
                  style={{ float: 'right' }}
                  type='primary'
                  icon="plus"
                  onClick={() => this.handleAttributeForm(true)}
                >
                  添加
                </Button>
              </div>
              <StandardTable
                simple
                loading={loading}
                dataSource={list}
                columns={columns}
                rowSelection={rowSelections}
                onRow={record => {
                  return {
                    onClick: event => {
                      this.handleRowClick(record, event);
                    },
                  };
                }}
                onChange={this.handleStandardTableChange}
                scroll={{ y: (document.documentElement.clientHeight - 394) }}
              />
            </Card>
          </Col>
          <Col span={15}>
            <Card bordered={false}>
              <div style={{ marginBottom: 15 }}>
                <span>属性值列表</span>
                <Button
                  style={{ float: 'right' }}
                  type='primary'
                  icon="plus"
                  onClick={() => this.handleValueForm(true)}
                >
                  添加
                </Button>
              </div>
              <StandardTable
                rowSelection={null}
                loading={valueLoading}
                dataSource={valueList}
                columns={valueColumns}
                onChange={this.handleValueStandardTableChange}
                scroll={{ y: (document.documentElement.clientHeight - 394) }}
              />
            </Card>
          </Col>
        </Row>

        {attributeVisible ?
          <AttributeForm visible={attributeVisible} current={attributeCurrent} showForm={this.handleAttributeForm} />
          : null}

        {valueVisible ?
          <ValueForm visible={valueVisible} current={valueCurrent} id={value} showForm={this.handleValueForm} type="Color" />
          : null}

      </PageHeaderWrapper>
    );
  }
}

export default Index;
