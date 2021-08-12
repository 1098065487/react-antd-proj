import React, { Fragment, PureComponent } from 'react';
import { Button, Icon, Card, Divider, Tooltip, Modal, Input, Form, message, Drawer } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import IconFont from '@/components/IconFont';
import BrandForm from './BrandForm';

@connect(({ brand, loading }) => ({
  brand,
  loading: loading.effects['brand/fetch'],
}))
@Form.create()
class Brand extends PureComponent {
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
      type: 'brand/fetch',
      payload: { pagination, filters, sorter },
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
          type: 'brand/update',
          payload: { id, data: { ...fieldsValue } },
          callback: () => this.handelSuccessSubmit(),
        });
      } else {
        dispatch({
          type: 'brand/create',
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
      type: 'brand/delete',
      payload: { id },
      callback: () => {
        message.success('delete success');
        this.initList();
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
      brand: { list },
      form,
    } = this.props;
    const { editVisible, current } = this.state;
    const columns = [
      { title: 'ID', dataIndex: 'id' },
      { title: '品牌', dataIndex: 'name', ...this.columnSearchProps('name') },
      { title: 'LOGO', dataIndex: 'logo' },
      { title: '描述', dataIndex: 'description' },
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
        title="品牌列表"
        logo={<IconFont type="icon-authorization-management" />}
        extra={extraContent}
      >
        <Card bordered={false}>
          <StandardTable
            loading={loading}
            dataSource={list}
            columns={columns}
            onChange={this.handleStandardTableChange}
          />
        </Card>
        <Modal
          title={Object.keys(current).length ? '编辑品牌' : '新增品牌'}
          visible={editVisible}
          destroyOnClose
          onCancel={() => this.handleCreateEditModal(false)}
          onOk={this.handleFormSubmit}
        >
          <BrandForm form={form} current={current} />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default Brand;
