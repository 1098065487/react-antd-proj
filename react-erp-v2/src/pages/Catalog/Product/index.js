import React, { Fragment, PureComponent } from 'react';
import { Table, Button, Card, Divider, Tooltip, Modal, Input, Form, message, Row, Col, Tag, Cascader, Select, Popover, } from 'antd';
import { connect } from 'dva';

import { router } from 'umi';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
import EditForm from './EditForm';
import styles from './style.less';

const { Item } = Form;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const tailFormItemLayout = {
  wrapperCol: { span: 20, offset: 4 },
};

const statusList = [
  { key: 1, label: '在售', value: 1, },
  { key: 0, label: '淘汰', value: 0 },
];

@connect(({ product, attribute, brand, category, loading }) => ({
  product,
  attribute,
  brand,
  category,
  tableLoading: loading.effects['product/fetch'],
}))
@Form.create()
class Index extends PureComponent {
  constructor(pros) {
    super(pros);
    const {
      product: { filters },
    } = pros;
    this.state = {
      filters: this.props.location.state ? {} : filters,  // 为消除跳转和查询干扰，跳转时缓存查询条件置空,
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
      editVisible: false,
      records: {},
      categories: [],
      brandList: [],
      sku: this.props.location.state ? this.props.location.state.sku : '',
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'brand/fetchOptions',
      callback: brandList => {
        this.setState({ brandList });
      }
    });
    dispatch({
      type: 'category/fetchOptions',
      callback: categories => {
        this.setState({ categories });
      },
    });
    this.initProductList();
  }

  componentWillUnmount() {
    // 需要清除数据
    const { dispatch } = this.props;
    dispatch({
      type: 'product/save',
      payload: { list: {} },
    });
  }

  initProductList = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter, sku } = this.state;
    let combineFilters;
    if (sku !== '') {
      // 从可售页点击sku Tag跳转过来，避免干扰，清空原页面查询条件
      combineFilters = { sku };
    } else {
      combineFilters = { sku, ...filters };
    }
    dispatch({
      type: 'product/fetch',
      payload: {
        pagination,
        filters: combineFilters,
        sorter,
        with: ['brand', 'category', 'unit', 'operator', 'items.factoryProductItems', 'items.operator'],
      },
    });
  };

  handleStandardTableChange = (pagination, filter, sorters) => {
    const { filters, sorter } = this.state;
    this.setState({
      pagination,
      filters: { ...filters, ...filter },
      sorter: { ...sorter, ...sorters },
    }, () => this.initProductList());
  };

  // 编辑或更新
  handleActions = (key, item = {}, record = {}) => {
    if (key === 'edit') {
      const { id = 'create' } = item;
      router.push(`/products/product/${id}`);
    } else if (key === 'upload') {
      router.push('/excel/imports/create?type=product');
    } else if (key === 'upload-mapping') {
      router.push('/excel/imports/create?type=product_mapping');
    } else if (key === 'delete') {
      Modal.confirm({
        title: '删除提醒',
        content: `确定删除"${item.spu}"吗？若含有子产品，不可删除！`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => this.delete(item.id),
      });
    } else if (key === 'item-edit') {
      const { id } = record;
      router.push(`/products/product/${id}/items`);
    } else if(key === 'item-delete') {
      Modal.confirm({
        title: '删除提醒',
        content: '确定删除吗？如果产品已经被可售商品关联，无法删除！',
        okText: '确认',
        cancelText: '取消',
        onOk: () => this.deleteItem(item.id),
      });
    }
  };

  delete = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'product/deleteProducts',
      payload: id,
      callback: res => {
        if(res.status === 'error') {
          message.warning(res.body.message, 5);
        }else {
          message.success("删除成功！");
          this.initProductList();
        }
      }
    });
  };

  deleteItem = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'product/removeItem',
      payload: id,
      callback: res => {
        if(res.status === 'error') {
          message.warning(res.body.message, 5);
        }else {
          message.success('delete success');
          this.initProductList();
        }
      }
    });
  };

  directTo = sku => {
    router.push('/products/factory', { 'sku': sku });
  };

  renderFactorySku = list => {
    if (Object.keys(list).length !== 0) {
      return list.map(item =>
        <Tag
          className={styles.tags}
          key={item.id}
          color="blue"
          onClick={() => this.directTo(item.sku)}
        >
          {item.sku}
        </Tag>
      );
    }
    return null;
  };

  handleDownload = () => {
    const { dispatch, form: { validateFieldsAndScroll } } = this.props;
    const { filters } = this.state;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      const dynamic = { ...filters, ...values };
      dispatch({
        type: 'system/createAnExport',
        payload: { type: 'product', dynamic },
      });
    });
  };

  doExpandedRowRender = (record, index, indent, expanded) => {
    const { items = [] } = record;
    const columns = [
      { title: '系统编号', dataIndex: 'id' },
      { title: 'BASE SKU', dataIndex: 'sku' },
      {
        title: '工厂SKU',
        dataIndex: 'factory_product_items',
        width: 200,
        render: text => this.renderFactorySku(text),
      },
      { title: '颜色', dataIndex: 'color' },
      { title: '尺码', dataIndex: 'size' },
      { title: '已入库库存', dataIndex: 'qty' },
      { title: '在产库存', dataIndex: 'production_qty' },
      {
        title: '产品状态',
        dataIndex: 'selling_status',
        render: (text) => this.renderStatus(text),
      },
      {
        title: '备注',
        dataIndex: 'note',
        render: text => {
          if(text) {
            const content = <div style={{whiteSpace: 'pre-wrap'}} dangerouslySetInnerHTML={{ __html: text.replace(new RegExp('↵', 'gm'), '\n') }} />;
            return (<Popover content={content}>
              <p
                style={{
                  marginBottom: 0,
                  fontSize: 14,
                  width: 100,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {text}
              </p>
            </Popover>)
          }
          return null;
        }
      },
      { title: '修改时间', dataIndex: 'updated_at' },
      {
        title: '操作人',
        dataIndex: 'operator',
        render: text => {
          if(text && Object.keys(text).length !== 0) {
            return `${text.name} (ID:${text.id})`
          }
          return null;
        }
      },
      {
        title: '操作',
        key: 'action',
        width: 160,
        render: (text, item) => (
          <Fragment>
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => this.handleActions('item-edit', item, record)}
            />
            <Divider type="vertical" />
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => this.handleActions('item-delete', item)}
            />
          </Fragment>
        ),
      },
    ];
    return expanded ? (
      <Table
        bordered
        rowKey="sku"
        size="small"
        columns={columns}
        dataSource={items}
        pagination={false}
      />
    ) : null;
  };

  renderSimpleForm = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { filters, brandList, categories } = this.state;
    return (
      <Form layout="inline">
        <StandardFormRow title="分类过滤" grid first>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={6} sm={24}>
              <Form.Item {...formLayout} label="品牌">
                {getFieldDecorator('brand_id', {
                  initialValue: filters.brand_id,
                })(
                  <Select allowClear placeholder="请选择品牌" style={{ width: '100%' }}>
                    {brandList.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
                  </Select>,
                )}
              </Form.Item>
            </Col>
            <Col md={6} sm={24}>
              <Item {...formLayout} label="产品分类">
                {getFieldDecorator('category', {
                  initialValue: filters.category,
                })(
                  <Cascader
                    options={categories}
                    placeholder="请选择产品分类"
                    style={{ width: '100%' }}
                  />,
                )}
              </Item>
            </Col>
            <Col md={6} sm={24}>
              <Form.Item {...formLayout} label="产品状态">
                {getFieldDecorator('sellingStatus', {
                  initialValue: filters.sellingStatus,
                })(
                  <Select allowClear placeholder="请选择产品状态" style={{ width: '100%' }}>
                    {statusList.map(item => <Option key={item.key} value={item.value}>{item.label}</Option>)}
                  </Select>,
                )}
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
        <StandardFormRow title="其他选择" grid last>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={6} sm={24}>
              <Form.Item {...formLayout} label="货号">
                {getFieldDecorator('spu', {
                  initialValue: filters.spu,
                })(<Input placeholder="请输入货号" />)}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" icon="search" onClick={this.handleSearch}>
                  查询
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  type="primary"
                  icon="cloud-download"
                  onClick={this.handleDownload}
                >
                  下载
                </Button>
                <Button style={{ marginLeft: 8 }} icon="rollback" onClick={this.handleFormReset}>
                  重置
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
      </Form>
    );
  };

  handleSearch = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { filters, pagination } = this.state;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      const newFilters = { ...filters, ...values };
      this.setState({
        filters: newFilters,
        pagination: { ...pagination, current: 1 },
      }, () => {
        // 记录到Redux中
        dispatch({
          type: 'product/save',
          payload: { filters: newFilters },
        });
        this.initProductList();
      });
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      filters: {},
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
      sku: '',
    }, () => {
      dispatch({
        type: 'product/save',
        payload: { filters: {} },
      });
      this.initProductList();
    });
  };

  handleFormVisible = (flag, current, refresh) => {
    this.setState({
      editVisible: !!flag,
      records: current,
    });
    if (refresh) {
      this.initProductList();
    }
  };

  renderStatus = record => {
    if(statusList.filter(e => e.key === record).length !== 0) {
      return statusList.filter(e => e.key === record)[0].label;
    }
    return null;
  };

  render() {
    const {
      tableLoading,
      product: { list },
    } = this.props;

    const { editVisible, records } = this.state;

    const columns = [
      {
        title: '系统编号',
        dataIndex: 'id',
      },
      {
        title: '货号',
        dataIndex: 'spu',
      },
      {
        title: '品牌',
        dataIndex: 'brand',
        render: (text, record) => record.brand && record.brand.name,
      },
      {
        title: '产品分类',
        dataIndex: 'category',
        render: (text, record) => record.category && record.category.name,
      },
      {
        title: '单位',
        dataIndex: 'unit',
        render: (text, record) => record.unit && record.unit.name,
      },
      {
        title: '产品状态',
        dataIndex: 'selling_status',
        render: (text) => this.renderStatus(text),
      },
      { title: '修改时间', dataIndex: 'updated_at' },
      {
        title: '操作人',
        dataIndex: 'operator',
        render: text => {
          if(text && Object.keys(text).length !== 0) {
            return `${text.name} (ID:${text.id})`
          }
          return null;
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 160,
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
        <Tooltip title="新建产品">
          <Button
            style={{ marginLeft: 8 }}
            icon="plus"
            onClick={() => this.handleActions('edit')}
          >
            新建
          </Button>
        </Tooltip>
        <Tooltip title="上传产品">
          <Button
            style={{ marginLeft: 8 }}
            icon="cloud-upload"
            onClick={() => this.handleActions('upload')}
          >
            上传
          </Button>
        </Tooltip>
        <Tooltip title="上传产品映射">
          <Button
            style={{ marginLeft: 8 }}
            icon="upload"
            onClick={() => this.handleActions('upload-mapping')}
          >
            上传产品映射
          </Button>
        </Tooltip>
        <Tooltip title="刷新列表">
          <Button style={{ marginLeft: 8 }} icon="sync" onClick={() => this.initProductList()} />
        </Tooltip>
      </div>
    );

    return (
      <PageHeaderWrapper title="产品列表（单品）" extra={extraContent}>
        <Card bordered={false} className="searchCard">
          {this.renderSimpleForm()}
        </Card>
        <Card bordered={false} style={{ marginTop: 12 }}>
          <StandardTable
            rowKey="spu"
            loading={tableLoading}
            dataSource={list}
            columns={columns}
            onChange={this.handleStandardTableChange}
            expandedRowRender={this.doExpandedRowRender}
          />
        </Card>
        {editVisible ? (
          <EditForm visible={editVisible} record={records} showForm={this.handleFormVisible} />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default Index;
