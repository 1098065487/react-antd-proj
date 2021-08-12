import React, { Fragment, PureComponent } from 'react';
import { Button, Icon, Card, Divider, Modal, Input, Form, Tag, message, Tooltip } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import ValueForm from './ValueForm';

@connect(({ attribute, loading }) => ({
  attribute,
  loading: loading.effects['attribute/fetchValues'],
}))
@Form.create()
class ValueTable extends PureComponent {
  constructor(props) {
    super(props);
    const { match: { params } } = props;
    this.state = {
      showModalForm: false,
      filters: {},
      sorter: {},
      pagination: {},
      current: {},
      ...params,
    };
  }

  componentDidMount() {
    this.initValueList();
  }

  initValueList = () => {
    const { dispatch } = this.props;
    const { id } = this.state;
    const { filters, sorter, pagination } = this.state;
    dispatch({
      type: 'attribute/fetchValues',
      payload: { filters: { ...filters, attribute_id: id }, sorter, pagination },
    });
  };

  handleStandardTableChange = (pagination, filters, sorter) => {
    this.setState(
      {
        filters,
        sorter,
        pagination,
      },
      () => this.initValueList(),
    );
  };

  handleModalForm = (flag, current = {}) => {
    this.setState({
      showModalForm: !!flag,
      current,
    });
  };

  // 数据提交
  handleFormSubmit = () => {
    const { dispatch, form } = this.props;
    const { current, id } = this.state;
    const valueId = current ? current.id : null;
    form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      if (valueId) {
        dispatch({
          type: 'attribute/updateValues',
          payload: { id: valueId, data: { ...fieldsValue, spec_id: id } },
          callback: () => this.handelSuccessSubmit(),
        });
      } else {
        dispatch({
          type: 'attribute/createValues',
          payload: { ...fieldsValue, spec_id: id },
          callback: () => this.handelSuccessSubmit(),
        });
      }
    });
  };

  // 表单成功提交后
  handelSuccessSubmit = () => {
    message.success('success');
    this.setState({ showModalForm: false }, () => this.initValueList());
  };

  // 编辑或更新
  handleActions = (key, item) => {
    if (key === 'edit') {
      this.handleModalForm(true, item);
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
      type: 'attribute/deleteValues',
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
      attribute: { valueList },
      form,
    } = this.props;
    const {
      showModalForm,
      current,
    } = this.state;
    const columns = [
      { title: 'ID', dataIndex: 'id' },
      { title: '属性值', dataIndex: 'value', ...this.columnSearchProps('name') },
      {
        title: '属性值别名',
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
        <Tooltip title="Setting">
          <Button
            style={{ marginLeft: 8 }}
            icon="setting"
            onClick={() => this.handleActions('edit')}
          />
        </Tooltip>
        <Tooltip title="Add An New Spec">
          <Button
            style={{ marginLeft: 8 }}
            icon="plus"
            onClick={() => this.handleModalForm(true)}
          />
        </Tooltip>
        <Tooltip title="Upload Specs">
          <Button
            style={{ marginLeft: 8 }}
            icon="cloud-upload"
            onClick={() => this.handleActions('edit')}
          />
        </Tooltip>
        <Tooltip title="Refresh List">
          <Button style={{ marginLeft: 8 }} icon="sync" onClick={() => this.initValueList()} />
        </Tooltip>
      </div>
    );
    return (
      <PageHeaderWrapper
        title="属性值列表"
        extra={extraContent}
      >
        <Card bordered={false}>
          <StandardTable
            loading={loading}
            dataSource={valueList}
            columns={columns}
            onChange={this.handleStandardTableChange}
          />
        </Card>
        <Modal
          visible={showModalForm}
          destroyOnClose
          onCancel={() => this.handleModalForm(false)}
          onOk={this.handleFormSubmit}
        >
          <ValueForm form={form} current={current} type="Color" />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default ValueTable;
