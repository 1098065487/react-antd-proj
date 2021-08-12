import React, { Fragment, PureComponent } from 'react';
import { Button, Card, Divider, Tooltip, Modal, Form, message } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import CategoryForm from './CategoryForm';

@connect(({ category, loading }) => ({
  category,
  loading: loading.effects['category/fetch'],
}))
@Form.create()
class Category extends PureComponent {
  constructor(pros) {
    super(pros);
    this.state = {
      pagination: {},
      filters: { parent_id: 'null' },
      sorter: {},
      showCreateModal: false,
      current: {},
      parent: {},
    };
  }

  componentDidMount() {
    this.initCategoryList();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/save',
      payload: { treeData: [] },
    });
  }

  initCategoryList = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'category/fetch',
      payload: { filters, pagination, sorter,  with: [''] },
    });
  };

  handleEditModal = (flag, current = {}) => {
    this.setState({
      showCreateModal: !!flag,
      current,
    });
  };

  handleStandardTableChange = (pagination, filter, sorter) => {
    const { filters } = this.state;
    this.setState(
      {
        pagination,
        filters: { ...filters, ...filter },
        sorter,
      },
      () => this.initCategoryList(),
    );
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
          type: 'category/update',
          payload: { id, data: { ...fieldsValue } },
          callback: () => this.handelSuccessSubmit(),
        });
      } else {
        dispatch({
          type: 'category/create',
          payload: { ...fieldsValue },
          callback: () => this.handelSuccessSubmit(),
        });
      }
    });
  };

  // 表单成功提交后
  handelSuccessSubmit = () => {
    message.success('提交成功！');
    this.setState({ showCreateModal: false }, () => this.initCategoryList());
  };

  // 编辑或更新
  handleActions = (key, item = {}) => {
    if (key === 'addChild') {
      this.setState({
        parent: item,
      }, () => this.handleEditModal(true));
    } else if (key === 'edit') {
      this.setState({
        parent: {},
      }, () => this.handleEditModal(true, item));
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
      type: 'category/delete',
      payload: { id },
      callback: (res) => {
        if(res.status === 'ok') {
          message.success('delete success');
          this.initCategoryList();
        }
      },
    });
  };

  render() {
    const {
      loading,
      form,
      category: { list },
    } = this.props;
    const { showCreateModal, current, parent } = this.state;
    // 通用
    const columns = [
      { title: 'ID', dataIndex: 'id', sorter: true },
      { title: '分类', dataIndex: 'name' },
      { title: 'SEO标题', dataIndex: 'meta_title' },
      { title: 'SEO关键词', dataIndex: 'meta_keywords' },
      { title: 'SEO描述', dataIndex: 'meta_description' },
      {
        title: '操作',
        dataIndex: 'action',
        width: 180,
        render: (text, record) => (
          <Fragment>
            <Button
              type="primary"
              icon="plus"
              size="small"
              onClick={() => this.handleActions('addChild', record)}
            />
            <Divider type="vertical" />
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
        <Tooltip title="新建分类">
          <Button
            style={{ marginLeft: 8 }}
            icon="plus"
            onClick={() => this.handleActions('edit')}
          />
        </Tooltip>
        <Tooltip title="刷新列表">
          <Button style={{ marginLeft: 8 }} icon="sync" onClick={() => this.initCategoryList()} />
        </Tooltip>
      </div>
    );

    return (
      <PageHeaderWrapper
        title="分类列表"
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
          width={760}
          title={Object.keys(current).length ? '编辑' : '新建'}
          visible={showCreateModal}
          destroyOnClose
          onCancel={() => this.handleEditModal(false)}
          onOk={this.handleFormSubmit}
        >
          <CategoryForm form={form} current={current} parent={parent} />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default Category;
