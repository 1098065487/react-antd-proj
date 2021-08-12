import React, { Fragment, PureComponent } from 'react';
import { Button, Icon, Card, Divider, Modal, Input, Form, message, Tooltip, Tag } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import RoleForm from './RoleForm';
import SyncPermission from './SyncPermission';

@connect(({ rbac, loading }) => ({
  rbac,
  loading: loading.effects['rbac/fetchRoles'],
}))
@Form.create()
class List extends PureComponent {
  constructor(pros) {
    super(pros);
    this.state = {
      showEditModal: false,
      filters: {},
      sorter: {},
      pagination: {},
      current: {},
      assignPermissionVisible: false,
    };
  }

  componentDidMount() {
    this.initList();
  }

  initList = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'rbac/fetchRoles',
      payload: { pagination, filters, sorter, with_count: ['permissions'] },
    });
  };

  handleStandardTableChange = (pagination, filters, sorter) => {
    this.setState(
      {
        pagination,
        filters,
        sorter,
      },
      () => this.initList(),
    );
  };

  handleCreateEditModal = (flag, current = {}) => {
    this.setState({
      showEditModal: !!flag,
      current,
    });
  };

  // 数据提交
  handleFormSubmit = () => {
    const { dispatch, form } = this.props;
    const { current } = this.state;
    const id = current ? current.id : null;
    form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      if (id) {
        dispatch({
          type: 'rbac/updateRoles',
          payload: { id, data: { ...fieldsValue } },
          callback: () => this.handelSuccessSubmit(),
        });
      } else {
        dispatch({
          type: 'rbac/createRoles',
          payload: { ...fieldsValue },
          callback: () => this.handelSuccessSubmit(),
        });
      }
    });
  };

  // 表单成功提交后
  handelSuccessSubmit = () => {
    message.success('success');
    this.setState({ showEditModal: false }, () => this.initList());
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
      type: 'rbac/destroyRoles',
      payload: { id },
      callback: () => {
        message.success('delete success');
        this.initList();
      },
    });
  };

  handleAssignPermission = (flag, current = {}) => {
    this.setState({ assignPermissionVisible: !!flag, current }, () => this.initList());
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
      rbac: { roles },
      form,
    } = this.props;
    const { showEditModal, current, assignPermissionVisible } = this.state;
    const columns = [
      { title: 'ID', dataIndex: 'id' },
      { title: '名称', dataIndex: 'name', ...this.columnSearchProps('name') },
      { title: '描述', dataIndex: 'description' },
      {
        title: '权限',
        dataIndex: 'permissions_count',
        render: (text, record) => (
          <Tag color="#87d068">
            <a onClick={() => this.handleAssignPermission(true, record)}><Icon type="edit" />{text}</a>
          </Tag>
        ),
      },
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
        <Tooltip title="Add Role">
          <Button
            style={{ marginLeft: 8 }}
            icon="plus"
            onClick={() => this.handleCreateEditModal(true)}
          />
        </Tooltip>
        <Tooltip title="Refresh List">
          <Button style={{ marginLeft: 8 }} icon="sync" onClick={() => this.initList()} />
        </Tooltip>
      </div>
    );
    return (
      <PageHeaderWrapper
        title="角色列表"
        extra={extraContent}
      >
        <Card bordered={false}>
          <StandardTable
            loading={loading}
            dataSource={roles}
            columns={columns}
            onChange={this.handleStandardTableChange}
          />
        </Card>
        <Modal
          destroyOnClose
          title={Object.keys(current).length ? '编辑' : '新增'}
          visible={showEditModal}
          onCancel={() => this.handleCreateEditModal(false)}
          onOk={this.handleFormSubmit}
        >
          <RoleForm form={form} current={current} />
        </Modal>
        <Modal
          destroyOnClose
          title="分配权限"
          width={728}
          visible={assignPermissionVisible}
          onCancel={() => this.handleAssignPermission(false)}
          footer={null}
        >
          <SyncPermission current={current} />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default List;
