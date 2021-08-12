import React, { Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Modal, Form, message, Divider, Tag, Icon, Tooltip } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import { hasPermission } from '@/utils/authority';
import UserForm from './UserForm';
import AssignRole from './AssignRole';

@connect(({ user, loading }) => ({
  user,
  loading: loading.effects['user/fetch'],
}))
@Form.create()
class User extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      current: {},
      editVisible: false,
      assignRolesVisible: false,
      pagination: {},
      filters: {},
    };
  }

  // 组件生命周期
  componentDidMount() {
    this.initUsers();
  }

  initUsers = () => {
    const { dispatch } = this.props;
    const { pagination, filters } = this.state;
    dispatch({
      type: 'user/fetch',
      payload: { pagination, filters, with_count: ['roles', 'permissions'] },
    });
  };

  handleStandardTableChange = (pagination, filters) => {
    this.setState({
        pagination,
        filters,
      }, () => this.initUsers(),
    );
  };

  handleEditVisible = (flag, current = {}) => {
    this.setState({ editVisible: !!flag, current });
  };

  handleSubmit = () => {
    const { dispatch, form } = this.props;
    const {
      current: { id },
    } = this.state;
    form.validateFieldsAndScroll((err, fieldValues) => {
      if (err) {
        return;
      }
      if (id === undefined) {
        dispatch({
          type: 'user/create',
          payload: { ...fieldValues },
          callback: () => {
            message.success('Created Success!');
            this.setState({ editVisible: false }, () => this.initUsers());
          },
        });
      } else {
        dispatch({
          type: 'user/update',
          payload: { id, data: fieldValues },
          callback: () => {
            message.success('Updated Success!');
            this.setState({ editVisible: false }, () => this.initUsers());
          },
        });
      }
    });
  };

  // 操作键
  handleActions = (key, item) => {
    if (key === 'edit') {
      this.handleEditVisible(true, item);
    } else if (key === 'assignRoles') {
      this.handleAssignRolesVisible(true, item);
    } else if (key === 'assignPermissions') {
      this.handleAssignPermissionsVisible(true, item);
    } else if (key === 'delete') {
      if (item.id === 1) {
        Modal.warning({
          title: '删除提醒',
          content: '系统用户不能删除！',
        });
      } else {
        Modal.confirm({
          title: '删除提醒',
          content: `确定删除用户"${item.name}"吗？`,
          okText: '确认',
          cancelText: '取消',
          onOk: () => this.deleteItem(item.id),
        });
      }
    }
  };

  deleteItem = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/remove',
      payload: { id },
      callback: (res) => {
        if (res.status === 'ok') {
          message.success('Delete Success!');
          this.initUsers();
        }
      },
    });
  };

  handleAssignRolesVisible = (flag, current = {}) => {
    this.setState({ assignRolesVisible: !!flag, current }, () => this.initUsers());
  };


  render() {
    const {
      form,
      loading,
      user: { list },
    } = this.props;

    const { editVisible, assignRolesVisible, current } = this.state;

    const genders = ['保密', '男', '女'];
    const columns = [
      { title: 'ID', dataIndex: 'id' },
      { title: '用户名', dataIndex: 'name' },
      { title: '邮箱', dataIndex: 'email' },
      {
        title: '性别',
        dataIndex: 'gender',
        filters: [{ text: '保密', value: 0 }, { text: '男', value: 1 }, { text: '女', value: 2 }],
        render: (text, record) => genders[record.gender],
      },
      { title: '电话', dataIndex: 'mobile' },
      {
        title: '角色',
        dataIndex: 'roles_count',
        render: (text, record) => (
          <Tag color="#87d068">
            <a onClick={() => this.handleAssignRolesVisible(true, record)}><Icon type="edit" />{text}</a>
          </Tag>
        ),
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: 180,
        render: (text, record) => (
          <Fragment>
            <Button
              type="primary"
              icon="edit"
              size="small"
              disabled={!hasPermission('api_update_user')}
              onClick={() => this.handleActions('edit', record)}
            />
            <Divider type="vertical" />
            <Button
              type="danger"
              icon="delete"
              size="small"
              disabled={!hasPermission('api_delete_user')}
              onClick={() => this.handleActions('delete', record)}
            />
          </Fragment>
        ),
      },
    ];

    const action = (
      <Fragment>
        <Tooltip title="新增用户">
          <Button
            key="edit"
            disabled={!hasPermission('api_create_user')}
            style={{ marginLeft: 8 }}
            icon="plus"
            onClick={() => this.handleActions('edit')}
          />
        </Tooltip>
        <Tooltip title="刷新列表">
          <Button style={{ marginLeft: 8 }} icon="sync" onClick={() => this.initUsers()} />
        </Tooltip>
      </Fragment>
    );
    return (
      <PageHeaderWrapper
        title="系统用户"
        logo={
          <img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png" />
        }
        extra={action}
      >
        <Card bordered={false}>
          <StandardTable
            rowSelection={null}
            loading={loading}
            dataSource={list}
            columns={columns}
            onChange={this.handleStandardTableChange}
            showSelection={false}
          />
        </Card>
        <Modal
          destroyOnClose
          title={Object.keys(current).length ? '编辑用户' : '新建用户'}
          width={728}
          visible={editVisible}
          okText="保存"
          onOk={this.handleSubmit}
          onCancel={() => this.handleEditVisible(false)}
        >
          <UserForm form={form} current={current} />
        </Modal>
        <Modal
          destroyOnClose
          visible={assignRolesVisible}
          title="分配角色"
          width={728}
          onCancel={() => this.handleAssignRolesVisible(false)}
          footer={null}
        >
          <AssignRole current={current} />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default User;
