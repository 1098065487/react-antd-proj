import React, { Fragment, PureComponent } from 'react';
import { Button, Icon, Card, Divider, Modal, Input, Form, Tag, message, Tooltip } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ValueForm from './ValueForm';
import DragSortingTable from '@/components/DragSortingTable/index';

@connect(({ spec, loading }) => ({
  spec,
  loading: loading.effects['spec/fetchValues'],
}))
@Form.create()
class ValueList extends PureComponent {
  constructor(props) {
    super(props);
    const { match: { params } } = props;
    this.state = {
      showCreateModal: false,
      pagination: { current: 1, pageSize: 20 },
      filters: {},
      sorter: {},
      current: {},
      ...params,
    };
  }

  componentDidMount() {
    this.initValueList();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({ type: 'spec/clearValueList' });
  }

  initValueList = () => {
    const { dispatch } = this.props;
    const { id } = this.state;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'spec/fetchValues',
      payload: { pagination, filters: { ...filters, spec_id: id }, sorter },
    });
  };

  handleStandardTableChange = (pagination, filters, sorter) => {
    this.setState({ pagination, filters, sorter }, () => this.initValueList());
  };

  handleMoveRow = v => {
    console.log(v);
  };

  handleCreateEditModal = (flag, current = {}) => {
    this.setState({
      showCreateModal: !!flag,
      current,
    });
  };

  // 数据提交
  handleFormSubmit = () => {
    const { dispatch, form } = this.props;
    const { current, id } = this.state;
    const cId = current ? current.id : null;
    form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      if (cId) {
        dispatch({
          type: 'spec/updateValue',
          payload: { id: cId, data: { ...fieldsValue, spec_id: id } },
          callback: () => this.handelSuccessSubmit(),
        });
      } else {
        dispatch({
          type: 'spec/createValue',
          payload: { ...fieldsValue, spec_id: id },
          callback: () => this.handelSuccessSubmit(),
        });
      }
    });
  };

  // 表单成功提交后
  handelSuccessSubmit = () => {
    message.success('success');
    this.setState({ showCreateModal: false }, () => this.initValueList());
  };

  // 编辑或更新
  handleEditAndDelete = (key, item) => {
    if (key === 'edit') {
      this.handleCreateEditModal(true, item);
    } else if (key === 'delete') {
      Modal.confirm({
        title: '删除提醒',
        content: `确定删除"${item.name}"吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => this.deleteItem(item.id),
      });
    }
  };

  deleteItem = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'spec/deleteValue',
      payload: { id },
      callback: () => {
        message.success('delete success');
        this.initValueList();
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

  render() {
    const {
      loading,
      spec: { valueList },
      form,
    } = this.props;
    const {
      showCreateModal,
      current,
    } = this.state;
    const columns = [
      { title: 'ID', dataIndex: 'id' },
      { title: '规格值', dataIndex: 'value', ...this.columnSearchProps('value') },
      {
        title: '规格值别名',
        dataIndex: 'value_alias',
        render: text => <Tag color={text}>{text}</Tag>,
      },
      { title: '位置', dataIndex: 'position' },
      {
        title: '操作',
        dataIndex: 'action',
        width: 180,
        render: (text, record) => (
          <Fragment>
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => this.handleEditAndDelete('edit', record)}
            />
            <Divider type="vertical" />
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => this.handleEditAndDelete('delete', record)}
            />
          </Fragment>
        ),
      },
    ];
    const extraContent = (
      <div>
        <Tooltip title="新建规格值">
          <Button
            style={{ marginLeft: 8 }}
            icon="plus"
            onClick={() => this.handleCreateEditModal(true)}
          />
        </Tooltip>
        <Tooltip title="刷新列表">
          <Button style={{ marginLeft: 8 }} icon="sync" onClick={() => this.initValueList()} />
        </Tooltip>
      </div>
    );

    return (
      <PageHeaderWrapper
        title="规格值列表"
        extra={extraContent}
      >
        <Card bordered={false}>
          <DragSortingTable
            rowSelection={null}
            loading={loading}
            dataSource={valueList}
            columns={columns}
            onChange={this.handleStandardTableChange}
            onMoveRow={this.handleMoveRow}
          />
        </Card>
        <Modal
          visible={showCreateModal}
          destroyOnClose
          onCancel={() => this.handleCreateEditModal(false)}
          onOk={this.handleFormSubmit}
        >
          <ValueForm form={form} current={current} type="Color" />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default ValueList;
