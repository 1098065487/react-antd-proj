import React, { Fragment, PureComponent } from 'react';
import { Button, Card, Divider, Tooltip, Modal, Form, message } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import IconFont from '@/components/IconFont';
import WarehouseForm from './WarehouseForm';

@connect(({ logistic, loading }) => ({
  logistic,
  loading: loading.effects['logistic/fetchWarehouse'],
}))
@Form.create()
class Warehouse extends PureComponent {
  constructor(pros) {
    super(pros);
    this.state = {
      editVisible: false,
      pagination: {},
      filters: {},
      sorter: {},
      current: {},
    };
  }

  componentDidMount() {
    this.initList();
  }

  initList = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'logistic/fetchWarehouse',
      payload: { pagination, filters, sorter },
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

  handleCreateEditModal = (flag, current = {}) => {
    this.setState({
      editVisible: !!flag,
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
          type: 'logistic/updateWarehouse',
          payload: { id, data: { ...fieldsValue } },
          callback: () => this.handelSuccessSubmit(),
        });
      } else {
        dispatch({
          type: 'logistic/createWarehouse',
          payload: { ...fieldsValue },
          callback: () => this.handelSuccessSubmit(),
        });
      }
    });
  };

  // 表单成功提交后
  handelSuccessSubmit = () => {
    message.success('success');
    this.setState({ editVisible: false }, () => this.initList());
  };

  // 编辑或更新
  handleActions = (key, item) => {
    if (key === 'edit') {
      this.handleCreateEditModal(true, item);
    } else if (key === 'values') {
      this.handleItemDrawer(true, item);
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
      type: 'logistic/deleteWarehouse',
      payload: id,
      callback: () => {
        message.success('delete success');
        this.initList();
      },
    });
  };

  render() {
    const {
      loading,
      logistic: { warehouse },
      form,
    } = this.props;
    const { editVisible, current } = this.state;
    const columns = [
      {
        title: '仓库名称',
        dataIndex: 'name',
      },
      {
        title: '仓库类型',
        dataIndex: 'type',
      },
      { title: '仓库地址', dataIndex: 'address' },
      { title: '仓库简述', dataIndex: 'description' },
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
              onClick={() => this.handleActions('edit', record)}
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
        <Tooltip title="Add An New Spec">
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
        title="仓库管理"
        logo={<IconFont type="icon-authorization-management" />}
        extra={extraContent}
      >
        <Card bordered={false}>
          <StandardTable
            loading={loading}
            dataSource={warehouse}
            columns={columns}
            onChange={this.handleStandardTableChange}
          />
        </Card>
        <Modal
          title={Object.keys(current).length ? '编辑仓库' : '新建仓库'}
          visible={editVisible}
          destroyOnClose
          onCancel={() => this.handleCreateEditModal(false)}
          onOk={this.handleFormSubmit}
        >
          <WarehouseForm form={form} current={current} />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default Warehouse;
