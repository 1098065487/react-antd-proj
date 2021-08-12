import React, { Fragment, PureComponent } from 'react';
import { Table, Button, Card, Divider, Tooltip, Modal, Input, Form, Row, Col, Tag, Cascader, message, Popover, Select, } from 'antd';
import { connect } from 'dva';

import { router } from 'umi';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
import EditForm from './EditForm';
import EditDrawer from './EditDrawer';
import styles from './index.less';

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
  { label: '在售', value: 'selling' },
  { label: '观察中', value: 'observing' },
  { label: '待提升', value: 'improving' },
  { label: '淘汰', value: 'eliminated' }
];

@connect(({ sellerProduct, brand, category, loading }) => ({
  sellerProduct,
  brand,
  category,
  tableLoading: loading.effects['sellerProduct/fetch'],
}))
@Form.create()
class Index extends PureComponent {
  constructor(pros) {
    super(pros);
    const {
      sellerProduct: { filters },
    } = pros;
    this.state = {
      filters: this.props.location.state ? {} : filters,  // 为消除跳转和查询干扰，跳转时缓存查询条件置空
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
      categories: [],
      brandList: [],
      formVisible: false,
      formCurrent: {},
      drawerVisible: false,
      drawerCurrent: {},
      spu: '',
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

  initProductList = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter, sku } = this.state;
    let combineFilters;
    if (sku !== '') {
      // 从产品页点击sku Tag跳转过来，避免干扰，清空原页面查询条件
      combineFilters = { sku };
    } else {
      combineFilters = { sku, ...filters };
    }
    dispatch({
      type: 'sellerProduct/fetch',
      payload: {
        pagination,
        filters: combineFilters,
        sorter,
        with: ['items.base_items', 'brand', 'category', 'operator', 'items.operator', 'items.images'],
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
  handleActions = (key, item = {}, record) => {
    if(key === 'add') {
      this.handleFormVisible(true, {}, false);
    } else if (key === 'edit') {
      this.handleFormVisible(true, item, false);
    } else if(key === 'add-item') {
      this.setState({
        spu: item.spu
      });
      this.handleDrawerVisible(true, {}, false);
    } else if (key === 'edit-item') {
      this.setState({
        spu: record.spu
      });
      this.handleDrawerVisible(true, item, false);
    } else if (key === 'upload') {
      router.push('/excel/imports/create?type=seller_product');
    } else if (key === 'delete') {
      Modal.confirm({
        title: '删除提醒',
        content: `确定删除"${item.spu}"吗？若含有子产品，不可删除！`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => this.deleteProduct(item.id),
      });
    } else if(key === 'delete-item') {
      Modal.confirm({
        title: '删除提醒',
        content: '确定删除吗？如果已被发布不能删除！',
        okText: '确认',
        cancelText: '取消',
        onOk: () => this.deleteItem(item.id),
      });
    }
  };

  deleteProduct = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'sellerProduct/deleteSellerProduct',
      payload: id,
      callback: res => {
        if (res.status === 'error') {
          message.warning(res.body.message, 5);
        } else {
          message.success('删除成功！');
          this.initProductList();
        }
      },
    });
  };

  deleteItem = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'sellerProduct/deleteItem',
      payload: { id },
      callback: res => {
        if (res.status === 'error') {
          message.warning(res.body.message, 5);
        } else {
          message.success('删除成功！');
          this.initProductList();
        }
      },
    });
  };

  handleFormVisible = (flag, record, refresh) => {
    this.setState({
      formVisible: !! flag,
      formCurrent: record,
    });
    if(refresh) {
      this.initProductList();
    }
  };

  handleDrawerVisible = (flag, record, refresh) => {
    this.setState({
      drawerVisible: !!flag,
      drawerCurrent: record,
    });
    if(refresh) {
      this.initProductList();
    }
  };

  renderImages = record => {
    const { images = [] } = record;
    if(images.length !== 0) {
      const content = (<ul>{images.map(e => <li key={e.id}>{e.url}</li>)}</ul>);
      return (
        <Popover content={content}>
          <img src={images[0].url} style={{ width: 40, height: 40 }} alt='' />
        </Popover>
      )
    }
    return null;
  };

  directTo = sku => {
    router.push('/products/product', { 'sku': sku });
  };

  doExpandedRowRender = (record, index, indent, expanded) => {
    const { items = [] } = record;
    const columns = [
      { title: '系统编号', dataIndex: 'id' },
      {
        title: '缩略图',
        dataIndex: 'images',
        render: (text, item) => this.renderImages(item),
      },
      { title: 'SKU', dataIndex: 'sku' },
      {
        title: '组合明细',
        dataIndex: 'items',
        render: (text, item) => {
          const { base_items: baseItems } = item;
          return baseItems.map(tmp => (
            <Tag key={tmp.id} color="blue" onClick={() => this.directTo(tmp.sku)} className={styles.tags}>
              <span style={{ marginRight: 10 }}>{tmp.sku}</span>
              <span>X{tmp.pivot.amount}</span>
            </Tag>
          ));
        },
      },
      { title: 'EAN码', dataIndex: 'ean_code' },
      {
        title: '标题',
        dataIndex: 'title',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <div
                style={{
                  fontSize: 12,
                  width: 120,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {text}
              </div>
            </Tooltip>
          ) : null
        },
      },
      { title: '成分', dataIndex: 'material' },
      {
        title: '商品状态',
        dataIndex: 'status',
        render: text => statusList.filter(e => e.value === text).length !== 0 ? statusList.filter(e => e.value === text)[0].label : '',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <div
                style={{
                  fontSize: 12,
                  width: 120,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {text}
              </div>
            </Tooltip>
          ) : null
        },
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
        width: 130,
        render: (text, item) => (
          <Fragment>
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => this.handleActions('edit-item', item, record)}
            />
            <Divider type="vertical" />
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => this.handleActions('delete-item', item)}
            />
          </Fragment>
        ),
      },
    ];
    return expanded ? (
      <Table
        bordered
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={items}
        pagination={false}
      />
    ) : null;
  };

  renderSimpleForm = () => {
    const { form: { getFieldDecorator } } = this.props;
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
              <Form.Item {...formLayout} label="产品分类">
                {getFieldDecorator('category', {
                  initialValue: filters.category,
                })(
                  <Cascader
                    options={categories}
                    placeholder="请选择产品分类"
                    style={{ width: '100%' }}
                  />,
                )}
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
        <StandardFormRow title="其他选择" grid last>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={6} sm={24}>
              <Item {...formLayout} label="SKU">
                {getFieldDecorator('sku', {
                  initialValue: filters.sku,
                })(<Input placeholder="请输入sku" />)}
              </Item>
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
    const { form: { validateFieldsAndScroll }, dispatch } = this.props;
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
          type: 'sellerProduct/save',
          payload: { filters: newFilters },
        });
        this.initProductList();
      });
    });
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
        payload: { type: 'seller_product', dynamic },
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
        type: 'sellerProduct/save',
        payload: { filters: {} },
      });
      this.initProductList();
    });
  };

  render() {
    const {
      tableLoading,
      sellerProduct: { list },
    } = this.props;
    const {
      formVisible,
      formCurrent,
      drawerVisible,
      drawerCurrent,
      brandList,
      categories,
      spu,
    } = this.state;
    const columns = [
      { title: '系统编号', dataIndex: 'id' },
      { title: '父SKU', dataIndex: 'spu' },
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
        width: 130,
        render: (text, record) => (
          <Fragment>
            <Button
              icon="plus"
              size="small"
              onClick={() => this.handleActions('add-item', record)}
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
        <Tooltip title="新增可售商品">
          <Button
            style={{ marginLeft: 8 }}
            icon="plus"
            onClick={() => this.handleActions('add')}
          >
            添加
          </Button>
        </Tooltip>
        <Tooltip title="批量上传">
          <Button
            style={{ marginLeft: 8 }}
            icon="cloud-upload"
            onClick={() => this.handleActions('upload')}
          >
            上传
          </Button>
        </Tooltip>
        <Tooltip title="刷新列表">
          <Button style={{ marginLeft: 8 }} icon="sync" onClick={() => this.initProductList()} />
        </Tooltip>
      </div>
    );

    return (
      <PageHeaderWrapper
        title="可售商品列表（单品和组合商品）"
        extra={extraContent}
      >
        <Card bordered={false} className="searchCard">
          {this.renderSimpleForm()}
        </Card>
        <Card bordered={false} style={{ marginTop: 12 }}>
          <StandardTable
            rowKey="spu"
            rowSelection={null}
            loading={tableLoading}
            dataSource={list}
            columns={columns}
            onChange={this.handleStandardTableChange}
            expandedRowRender={this.doExpandedRowRender}
          />
        </Card>
        {formVisible ? (
          <EditForm
            visible={formVisible}
            brandList={brandList}
            categories={categories}
            current={formCurrent}
            showForm={this.handleFormVisible}
          />
        ) : null}
        {drawerVisible ? (
          <EditDrawer
            visible={drawerVisible}
            current={drawerCurrent}
            spu={spu}
            showDrawer={this.handleDrawerVisible}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default Index;
