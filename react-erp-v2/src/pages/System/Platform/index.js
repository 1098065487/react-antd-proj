import React, { Fragment, PureComponent } from 'react';
import { Button, Card, Divider, Tooltip, Modal, Form, message, Tag } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import PlatformForm from './PlatformForm';
import { hasPermission } from '@/utils/authority';
import ConfigForm from '@/pages/System/Platform/ConfigForm/index';

@connect(({ system, loading }) => ({
  system,
  loading: loading.effects['system/fetchPlatforms'],
}))
@Form.create()
class Index extends PureComponent {
  constructor(pros) {
    super(pros);
    this.state = {
      showCreateModal: false,
      showConfigModal: false,
      current: {},
      parent: {},
      actionType: '',
    };
  }

  componentDidMount() {
    this.initPlatformList();
  }

  initPlatformList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'system/fetchPlatforms',
      payload: { with: ['warehouses', 'users'] },
    });
  };

  handleEditModal = (flag, current = {}) => {
    this.setState({
      showCreateModal: !!flag,
      current,
    });
  };

  handleConfigModal = (flag, current = {}) => {
    this.setState({
      showConfigModal: !!flag,
      current,
    });
  };

  handleCancel = () => {
    this.setState({
      showCreateModal: false,
      current: {},
      parent: {},
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
          type: 'system/updatePlatforms',
          payload: { id, data: { ...fieldsValue } },
          callback: () => this.handelSuccessSubmit(),
        });
      } else {
        dispatch({
          type: 'system/createPlatforms',
          payload: { ...fieldsValue },
          callback: () => this.handelSuccessSubmit(),
        });
      }
    });
  };

  // 表单成功提交后
  handelSuccessSubmit = () => {
    message.success('success');
    this.setState(
      {
        showCreateModal: false,
        showConfigModal: false,
        current: {},
        parent: {},
      },
      () => this.initPlatformList()
    );
  };

  // 编辑或更新
  handleActions = (key, item = {}) => {
    this.setState({ actionType: key });
    if (key === 'addChild') {
      this.setState(
        {
          parent: item,
        },
        () => this.handleEditModal(true)
      );
    } else if (key === 'edit' || key === 'editParent') {
      this.handleEditModal(true, item);
    } else if (key === 'config') {
      this.handleConfigModal(true, item);
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
      type: 'system/deletePlatforms',
      payload: { id },
      callback: () => {
        message.success('delete success');
        this.initPlatformList();
      },
    });
  };

  render() {
    const {
      loading,
      system: { platformList },
      form,
    } = this.props;
    const { showCreateModal, showConfigModal, current, parent, actionType } = this.state;
    const columns = [
      { title: 'ID', dataIndex: 'id', sorter: true },
      { title: '平台类型', dataIndex: 'type' },
      { title: '帐号&市场', dataIndex: 'name' },
      { title: '描述', dataIndex: 'description' },
      {
        title: '健康度',
        dataIndex: 'is_healthy',
        width: 300,
        render: (text, record) => {
          const { is_healthy, type, dynamic } = record;
          return (
            <Fragment>
              <Tag color={is_healthy ? '#87d068' : '#f50'}>{is_healthy ? '健康' : '异常'}</Tag>
              {type === 'Ebay' && dynamic && dynamic.auth_link ? (
                <>
                  <Divider type="vertical" />
                  <a href={dynamic.auth_link} target="_blank">
                    RESTFUL鉴权
                  </a>
                </>
              ) : null}
              {type === 'Ebay' && dynamic && dynamic.old_auth_link ? (
                <>
                  <Divider type="vertical" />
                  <a href={dynamic.old_auth_link} target="_blank">
                    XML鉴权
                  </a>
                </>
              ) : null}
            </Fragment>
          );
        },
      },
      {
        title: '最新订单同步时间',
        dataIndex: 'order_sync_time',
        width: 200,
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 200,
        render: (text, record) => {
          return (
            <Fragment>
              {!record.parent_id && (
                <>
                  <Button
                    disabled={!hasPermission('api_create_platform')}
                    type="primary"
                    icon="plus"
                    size="small"
                    onClick={() => this.handleActions('addChild', record)}
                  />
                  <Divider type="vertical" />
                </>
              )}
              {record.parent_id ? (
                <Button
                  disabled={!hasPermission('api_update_platform')}
                  type="primary"
                  icon="edit"
                  size="small"
                  onClick={() => this.handleActions('edit', record)}
                />
              ) : (
                <Button
                  disabled={!hasPermission('api_update_platform')}
                  type="primary"
                  icon="edit"
                  size="small"
                  onClick={() => this.handleActions('editParent', record)}
                />
              )}
              {record.parent_id && (
                <>
                  <Divider type="vertical" />
                  <Button
                    disabled={!hasPermission('api_update_platform')}
                    icon="control"
                    size="small"
                    onClick={() => this.handleActions('config', record)}
                  />
                  <Divider type="vertical" />
                  <Button
                    disabled={!hasPermission('api_delete_platform')}
                    type="danger"
                    icon="delete"
                    size="small"
                    onClick={() => this.handleActions('delete', record)}
                  />
                </>
              )}
            </Fragment>
          );
        },
      },
    ];
    const extraContent = (
      <div>
        <Tooltip title="新建平台">
          <Button
            disabled={!hasPermission('api_create_platform')}
            style={{ marginLeft: 8 }}
            icon="plus"
            onClick={() => {
              this.setState({ actionType: 'addParent' }, () => {
                this.handleEditModal(true);
              });
            }}
          />
        </Tooltip>
        <Tooltip title="刷新列表">
          <Button style={{ marginLeft: 8 }} icon="sync" onClick={() => this.initPlatformList()} />
        </Tooltip>
      </div>
    );

    return (
      <PageHeaderWrapper title="平台列表" extra={extraContent}>
        <Card bordered={false}>
          <StandardTable
            defaultExpandAllRows
            loading={loading}
            dataSource={platformList}
            columns={columns}
          />
        </Card>
        <Modal
          width={760}
          title={Object.keys(current).length ? '编辑帐号&市场' : '新建帐号&市场'}
          visible={showCreateModal}
          destroyOnClose
          onCancel={() => this.handleCancel()}
          onOk={this.handleFormSubmit}
        >
          <PlatformForm form={form} current={current} parent={parent} actionType={actionType} />
        </Modal>
        <Modal
          width={760}
          title={Object.keys(current).length ? '编辑配置' : '新建配置'}
          visible={showConfigModal}
          destroyOnClose
          onCancel={() => this.handleConfigModal(false)}
          onOk={this.handleFormSubmit}
        >
          <ConfigForm form={form} current={current} parent={parent} />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default Index;
