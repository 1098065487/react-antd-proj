import React, { Component, Fragment } from 'react';
import { Button, Card, Cascader, Col, Divider, Form, Input, Modal, Row, Select, Table, Tabs, Tooltip, Popover } from 'antd';
import { connect } from 'dva';
import { router } from 'umi';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
import ProductForm from './ProductForm';
import FatherProductForm from './FatherProductForm';

const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@connect(({ factory, brand, category, loading }) => ({
  factory,
  brand,
  category,
  loading: loading.effects['factory/fetchProducts'],
}))
@Form.create()
class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: { is_match: 'yes' },
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
      productFormVisible: false,
      spu: '',
      factory_product_id: '',
      currentProduct: {},
      fatherProductFormVisible: false,
      currentFatherProduct: {},
      sku: this.props.location.state ? this.props.location.state.sku : '',
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'brand/fetchOptions' });
    dispatch({ type: 'category/fetchOptions' });
    this.initFactoryProducts();
  }

  initFactoryProducts = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter, sku } = this.state;
    dispatch({
      type: 'factory/fetchProducts',
      payload: {
        filters: { ...filters, 'sku': sku  },
        pagination,
        sorter,
        with: ['factoryProductItems.productItem', 'factoryProductItems.operator', 'operator']
      },
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
      () => this.initFactoryProducts(),
    );
  };

  handleActions = (key, item, father) => {
    if (key === 'add-father') {
      this.fatherProductFormVisible(true, {})
    } else if (key === 'edit-father') {
      this.fatherProductFormVisible(true, item, false)
    } else if (key === 'add') {
      this.setState({
        spu: item.spu,
        factory_product_id: item.id,
      }, () => this.productFormVisible(true));
    } else if (key === 'edit') {
      this.setState({
        spu: father.spu,
        factory_product_id: father.id,
      }, () => this.productFormVisible(true, item, false));
    } else if (key === 'upload') {
      router.push('/excel/imports/create?type=factory_product');
    } else if (key === 'delete-father') {
      Modal.confirm({
        title: '????????????',
        content: `????????????"${item.spu}"??????`,
        okText: '??????',
        cancelText: '??????',
        onOk: () => this.deleteFatherItem(item.id),
      });
    } else if (key === 'delete') {
      Modal.confirm({
        title: '????????????',
        content: `????????????"${item.sku}"??????`,
        okText: '??????',
        cancelText: '??????',
        onOk: () => this.deleteItem(item.id),
      });
    }
  };

  deleteFatherItem = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'factory/deleteFatherProduct',
      payload: id,
      callback: this.initFactoryProducts,
    });
  };

  deleteItem = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'factory/deleteProduct',
      payload: id,
      callback: this.initFactoryProducts,
    });
  };

  handleSearch = () => {
    const { filters } = this.state;
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    const { pagination } = this.state;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      this.setState({
        filters: { ...filters, ...values },
        pagination: { ...pagination, current: 1 },
      }, () => {
        this.initFactoryProducts();
      });
    });
  };

  handleSearchFormReset = () => {
    const { form } = this.props;
    const { filters: { is_match } } = this.state;
    form.resetFields();
    this.setState({
      filters: { 'is_match': is_match },
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
      sku: '',
    }, () => {
      this.initFactoryProducts();
    });
  };

  renderSearchForm = () => {
    const {
      brand: { options: brandOptions },
      category: { options: categoryOptions }
    } = this.props;
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline">
        <StandardFormRow title="??????" grid last>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={6} sm={24}>
              <Form.Item {...formItemLayout} label="??????">
                {getFieldDecorator('brand_id')(
                  <Select allowClear placeholder="???????????????" style={{ width: '100%' }}>
                    {brandOptions.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
                  </Select>,
                )}
              </Form.Item>
            </Col>
            <Col md={6} sm={24}>
              <Form.Item {...formItemLayout} label="????????????">
                {getFieldDecorator('category')(
                  <Cascader options={categoryOptions} style={{ width: '100%' }} placeholder="?????????????????????" />
                )}
              </Form.Item>
            </Col>
            <Col md={6} sm={24}>
              <Form.Item {...formItemLayout} label="????????????">
                {getFieldDecorator('spu')(<Input placeholder="?????????????????????" />)}
              </Form.Item>
            </Col>
            <Col md={6} sm={24}>
              <Form.Item>
                <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                  ??????
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  type="primary"
                  icon="cloud-download"
                  onClick={this.handleDownload}
                >
                  ??????
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleSearchFormReset}>
                  ??????
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
      </Form>
    );
  };

  productFormVisible = (flag, record, refresh) => {
    this.setState({
      productFormVisible: !!flag,
      currentProduct: record,
    });
    if (refresh) {
      this.initFactoryProducts();
    }
  };

  fatherProductFormVisible = (flag, record, refresh) => {
    this.setState({
      fatherProductFormVisible: !!flag,
      currentFatherProduct: record,
    });
    if (refresh) {
      this.initFactoryProducts();
    }
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
        payload: { type: 'factory_product', dynamic },
      });
    });
  };

  doExpandedRowRender = (record, index, indent, expanded) => {
    const { factory_product_items = [] } = record;
    const columns = [
      { title: '????????????', dataIndex: 'id' },
      { title: '??????SKU', dataIndex: 'sku' },
      {
        title: '??????SKU',
        dataIndex: 'base_sku',
        render: (text, item) => item.product_item ? item.product_item.sku : <span style={{ color: 'red' }}>????????????</span>,
      },
      { title: '??????', dataIndex: 'color' },
      { title: '??????', dataIndex: 'size' },
      { title: '????????????', dataIndex: 'composition' },
      { title: '??????(???)', dataIndex: 'price' },
      { title: '????????????',
        dataIndex: 'feature',
        width: 100,
        render: text => {
          if(text) {
            const content = <div style={{whiteSpace: 'pre-wrap'}} dangerouslySetInnerHTML={{ __html: text.replace(new RegExp('???', 'gm'), '\n') }} />;
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
      { title: '????????????', dataIndex: 'updated_at' },
      {
        title: '?????????',
        dataIndex: 'operator',
        render: text => {
          if(text && Object.keys(text).length !== 0) {
            return `${text.name} (ID:${text.id})`
          }
          return null;
        }
      },
      {
        title: '??????',
        width: 160,
        render: (text, item) => (
          <Fragment>
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => this.handleActions('edit', item, record)}
            />
            <Divider type="vertical" />
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => this.handleActions('delete', item)}
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
        dataSource={factory_product_items}
        pagination={false}
      />
    ) : null;
  };

  onTabChange = key => {
    const { filters } = this.state;
    let isMatch = 'yes';
    if(key === 'normal') {
      isMatch = 'yes';
    } else {
      isMatch = 'no';
    }
    this.setState({
      'filters': { ...filters, is_match: isMatch }
    }, this.initFactoryProducts);
  };

  renderCategory = id => {
    if(id) {
      let list = [];
      const { category: { options: categoryOptions } } = this.props;
      categoryOptions.forEach(e => {
        if(e.children && e.children.length !== 0) {
          list = list.concat(e.children);
        }
      });
      return list.find(e => e.value === id) ? list.find(e => e.value === id).label : null;
    }
    return null;
  }
  ;

  render() {
    const {
      loading,
      factory: { productList },
      brand: { options: brandOptions },
      category: { options: categoryOptions }
    } = this.props;

    const { productFormVisible, spu, factory_product_id, currentProduct, fatherProductFormVisible, currentFatherProduct } = this.state;

    const tabList = [
      {
        key: 'normal',
        tab: (
          <span>
            ?????????
          </span>
        ),
      },
      {
        key: 'abnormal',
        tab: (
          <span style={{ color: 'red' }}>
            ?????????
          </span>
        ),
      },
    ];

    const columns = [
      { title: '????????????', dataIndex: 'id' },
      {
        title: '??????',
        dataIndex: 'brand',
        render: (text, record) => {
          const { brand_id } = record;
          if(brand_id) {
            return brandOptions.find(e => e.value === brand_id) ? brandOptions.find(e => e.value === brand_id).label : null;
          }
          return null;
        }

      },
      { title: '??????', dataIndex: 'spu' },
      { title: '????????????', dataIndex: 'production_sn' },
      {
        title: '????????????',
        dataIndex: 'category_id',
        render: text => this.renderCategory(text),
      },
      { title: '????????????', dataIndex: 'title' },
      { title: '????????????', dataIndex: 'updated_at' },
      {
        title: '?????????',
        dataIndex: 'operator',
        render: text => {
          if(text && Object.keys(text).length !== 0) {
            return `${text.name} (ID:${text.id})`
          }
          return null;
        }
      },
      {
        title: '??????',
        width: 160,
        render: (text, record) => (
          <Fragment>
            <Button
              icon="plus"
              size="small"
              onClick={() => this.handleActions('add', record)}
            />
            <Divider type="vertical" />
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => this.handleActions('edit-father', record)}
            />
            <Divider type="vertical" />
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => this.handleActions('delete-father', record)}
            />
          </Fragment>
        ),
      },
    ];

    const extraContent = (
      <div>
        <Tooltip title="???????????????">
          <Button
            style={{ marginLeft: 8 }}
            icon="plus"
            onClick={() => this.handleActions('add-father')}
          >
            ??????
          </Button>
        </Tooltip>
        <Tooltip title="??????">
          <Button
            style={{ marginLeft: 8 }}
            icon="cloud-upload"
            onClick={() => this.handleActions('upload')}
          >
            ??????
          </Button>
        </Tooltip>
      </div>
    );

    return (
      <PageHeaderWrapper
        title="??????????????????"
        extra={extraContent}
      >
        <Fragment>
          <Card bordered={false} className="searchCard">
            {this.renderSearchForm()}
          </Card>
          <Card bordered={false} style={{ marginTop: 24 }}>
            <Tabs
              animated={false}
              onChange={this.onTabChange}
            >
              {tabList.map(item => (
                <Tabs.TabPane tab={item.tab} key={item.key} />
              ))}
            </Tabs>
            <StandardTable
              loading={loading}
              columns={columns}
              dataSource={productList}
              rowSelection={null}
              onChange={this.handleStandardTableChange}
              expandedRowRender={this.doExpandedRowRender}
            />
          </Card>
        </Fragment>
        {productFormVisible ? (
          <ProductForm
            visible={productFormVisible}
            spu={spu}
            factory_product_id={factory_product_id}
            current={currentProduct}
            showForm={this.productFormVisible}
          />
        ) : null}
        {fatherProductFormVisible ? (
          <FatherProductForm
            visible={fatherProductFormVisible}
            brandList={brandOptions}
            categoryList={categoryOptions}
            current={currentFatherProduct}
            showForm={this.fatherProductFormVisible}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default Product;
