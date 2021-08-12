import React, { Component, Fragment } from 'react';
import {
  Skeleton,
  Button,
  Card,
  Cascader,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Table,
  Tooltip,
  Avatar,
  Tag,
  Popover,
  Icon,
  Tabs,
  DatePicker,
  Divider
} from 'antd';
import { connect } from 'dva';

import { router } from 'umi';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
import defaultImg from '@/assets/product.webp';
import styles from './index.less';

const { Item } = Form;
const { Option } = Select;
const { RangePicker } = DatePicker;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const tailFormItemLayout = {
  wrapperCol: { span: 21, offset: 3 },
};

const markets = {
  'ATVPDKIKX0DER': '美国',
  'A2EUQ1WTGCTBG2': '加拿大',
  'A1PA6795UKMFR9': '德国',
  'A1RKKUPIHCS9HS': '西班牙',
  'A13V1IB3VIYZZH': '法国',
  'A1F83G8C2ARO7P': '英国',
  'APJ6JRA9NG5V4': '意大利',
  'US': '美国',
};

@connect((
  { category, attribute, platform, loading },
) => ({
  category,
  attribute,
  platform,
  loading: loading.effects['platform/fetchProducts'],
}))
@Form.create()
class SearchList extends Component {
  constructor(props) {
    super(props);
    const { platform: { productFilters } } = props;
    this.state = {
      initializing: true,
      filters: productFilters,
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
      categories: [],
      brandList: [],
      attributes: [],
      platformTree: [],
      subPlatformList: [],
      notMatch: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { filters } = this.state;
    dispatch({
      type: 'platform/fetchTree',
      payload: {},
      callback: platformTree => {
        if(filters.platformPid) {
          const filterPlatform = platformTree.filter(e => e.value === parseInt(filters.platformPid, 10));
          this.setState({
            platformTree,
            subPlatformList: filterPlatform[0].children || [],
          });
        } else {
          this.setState({
            platformTree,
            subPlatformList: platformTree.length !== 0 ? platformTree[0].children || [] : [],
          });
        }
      },
    });
    dispatch({
      type: 'brand/fetchOptions',
      callback: brandList => {
        this.setState({ brandList });
      }
    });
    // 获取所有属性，实现过滤问题
    dispatch({
      type: 'category/fetchOptions',
      callback: categories => {
        this.setState({ categories });
      },
    });
    dispatch({
      type: 'attribute/fetchAll',
      payload: { with: ['values'] },
      callback: res => {
        const list = res.filter(e => e.name !== 'Group');
        this.setState({ attributes: list, initializing: false });
      },
    });
    if (filters.platformPid) {
      this.initPlatformProducts();
      this.initIfMatch();
    } else {
      this.setState({
        filters: { ...filters, platformPid: 1 }
      }, this.initPlatformProducts);
      this.initIfMatch();
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'platform/save',
      payload: { products: {} },
    });
  }

  initPlatformProducts = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    // 必须存在marketplaceId，才能请求数据
    dispatch({
      type: 'platform/fetchProducts',
      payload: {
        filters: { ...filters },
        pagination,
        sorter,
        with: ['platform', 'brand', 'category', 'unit', 'items.prices', 'items.sellerItem'],
      },
    });
  };

  initIfMatch = () => {
    const { dispatch } = this.props;
    const { filters } = this.state;
    dispatch({
      type: 'platform/ifMatch',
      payload: { platformPid: filters.platformPid || 1 },
      callback: res => {
        this.setState({
          notMatch: res.flag === true ? res.flag : false,
        })
      }
    })
  };

  handleStandardTableChange = (pagination, filter, sorters) => {
    const { filters, sorter } = this.state;
    this.setState({
        pagination,
        filters: { ...filters, ...filter },
        sorter: { ...sorter, ...sorters },
      }, () => this.initPlatformProducts(),
    );
  };

  handleActions = (key, item = {}, record) => {
    if (key === 'add' || key === 'edit') {
      const { id = 'create' } = item;
      router.push(`/products/platform/${id}`);
    } else if (key === 'add-items') {
      const { id } = item;
      if (id) {
        router.push(`/products/platform/${id}/items`);
      }
    } else if (key === 'edit-item') {
      const { id } = record;
      if (id) {
        router.push(`/products/platform/${id}/items`);
      }
    } else if (key === 'upload') {
      router.push('/excel/imports/create?type=platform_product');
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
    console.log(id);
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
          type: 'platform/save',
          payload: { productFilters: newFilters },
        });
        this.initPlatformProducts();
      });
    });
  };

  handleSearchFormReset = () => {
    const { form, dispatch } = this.props;
    const { filters: { platformPid } } = this.state;
    form.resetFields();
    this.setState({
      filters: { 'platformPid': platformPid || 1 },
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
    }, () => {
      dispatch({
        type: 'platform/save',
        payload: { productFilters: { 'platformPid': platformPid || 1 } },
      });
      this.initPlatformProducts();
    });
  };

  renderAttributeFilters = attr => {
    const { values } = attr;
    return (
      <Select mode="multiple" style={{ maxWidth: 286, width: '100%' }} placeholder="请选择属性值">
        {values.map(value => (
          <Option key={value.id} value={value.id}>
            {value.description}
          </Option>
        ))}
      </Select>
    );
  };

  renderSearchForm = () => {
    const { form: { getFieldDecorator } } = this.props;
    const { brandList, categories, attributes, filters, subPlatformList } = this.state;
    return (
      <Form layout="inline">
        <StandardFormRow title="核心过滤项" grid first>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={6} sm={24}>
              <Item {...formItemLayout} label="平台">
                {getFieldDecorator('platformId', {
                  initialValue: filters.platformId,
                })(
                  <Select placeholder="请选择" allowClear style={{ width: '100%' }}>
                    {subPlatformList.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                )}
              </Item>
            </Col>
            <Col md={6} sm={24}>
              <Item {...formItemLayout} label="品牌">
                {getFieldDecorator('brand', {
                  initialValue: filters.brand,
                })(
                  <Select placeholder="请选择" style={{ width: '100%' }}>
                    {brandList.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                )}
              </Item>
            </Col>
            <Col md={6} sm={24}>
              <Item {...formItemLayout} label="产品线">
                {getFieldDecorator('category', {
                  rules: [],
                  initialValue: filters.category,
                })(
                  <Cascader
                    options={categories}
                    placeholder="请选择产品线"
                    style={{ width: '100%' }}
                  />,
                )}
              </Item>
            </Col>
          </Row>
        </StandardFormRow>
        <StandardFormRow title="属性过滤项" grid>
          <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
            {attributes.map((attr, idx) => (
              <Col key={attr.id} md={6} sm={24}>
                <Item {...formItemLayout} label={attr.description}>
                  {getFieldDecorator(`attrs.${idx}`, {
                    rules: [],
                    initialValue: filters.attrs && Object.keys(filters.attrs).length !== 0 ? filters.attrs[`${idx}`] : [],
                  })(this.renderAttributeFilters(attr))}
                </Item>
              </Col>
            ))}
          </Row>
        </StandardFormRow>
        <StandardFormRow title="其它过滤项" grid last>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={6} sm={24}>
              <Item {...formItemLayout} label="子SKU">
                {getFieldDecorator('itemSku', {
                  initialValue: filters.itemSku,
                })(<Input placeholder="SKU、ASIN综合搜索" />)}
              </Item>
            </Col>
            <Col md={6} sm={24}>
              <Item {...formItemLayout} label="父SKU">
                {getFieldDecorator('spu', {
                  initialValue: filters.spu,
                })(<Input placeholder="SKU、ASIN综合搜索" />)}
              </Item>
            </Col>
            <Col md={6} sm={24}>
              <Item {...formItemLayout} label="售罄日期">
                {getFieldDecorator('range', {
                  initialValue: filters.range,
                })(<RangePicker />)}
              </Item>
            </Col>
            <Col md={6} sm={24}>
              <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
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
                <Button style={{ marginLeft: 8 }} onClick={this.handleSearchFormReset}>
                  重置
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
      </Form>
    );
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
        payload: { type: 'platform_product', dynamic },
      });
    });
  };

  toSeller = sku => {
    router.push('/products/sellers', { 'sku': sku });
  };

  doExpandedRowRender = (record, index, indent, expanded) => {
    const { items = [], platform = {} } = record;
    const soldTitle = '预估可售天数 = 可售库存 / (3天日均销量 * 0.2+ 7日日均销量 * 0.3+ 14日日均销量 * 0.3+ 30日日均销量 * 0.2)';
    const { marketplaces = [] } = platform;
    const marketColumns = marketplaces.map(m => {
      const market = markets[m];
      return {
        title: market || '默认',
        dataIndex: m,
        render: (text, item) => {
          const { prices = [] } = item;
          const price = prices.filter(p => p.marketplace_id === m).shift();
          return price && price.price;
        },
      };
    });
    const columns = [
      { title: '系统编号', dataIndex: 'id' },
      {
        title: 'SKU',
        dataIndex: 'sku',
        render: (text, item) => {
          const { thumbnail, sku, platform_sku, title, seller_product_item_id = 0 } = item;
          const content = (
            <div style={{ clear: 'both', height: 120 }}>
              <Avatar
                style={{ float: 'left', marginRight: 10 }}
                src={thumbnail || defaultImg}
                shape="square"
                size="large"
              />
              <div style={{ float: 'left' }}>
                <h6>自配送SKU：{sku}</h6>
                <h6>平台配送SKU：{platform_sku}</h6>
                <p style={{ fontSize: 12, width: 400 }}>
                  {title}
                </p>
              </div>
            </div>
          );
          return (
            <Popover
              placement="right"
              title="SKU详情"
              content={content}
            >
              {text ? <Tag color='blue' className={styles.tags} onClick={() => this.toSeller(text)}>{text}</Tag> : null}
              {seller_product_item_id === 0 ? (
                <Tag color='red' style={{ marginLeft: 10 }}>未匹配</Tag>
              ) : null}
            </Popover>
          );
        },
      },
      { title: '编码（ASIN）', dataIndex: 'platform_sn' },
      {
        title: '地区售价',
        children: marketColumns,
      },
      {
        title: '日均销售速度',
        children: [
          {
            title: '7天',
            dataIndex: 'speed_of_7_day',
          },
          {
            title: '14天',
            dataIndex: 'speed_of_14_day',
          },
          {
            title: '30天',
            dataIndex: 'speed_of_month',
          },
        ],
      },
      {
        title: '库存',
        children: [
          { title: 'FBA可售库存', dataIndex: 'in_stock_qty' },
          { title: 'Reserved库存', dataIndex: 'reserved_qty', render: () => 0 },
          { title: 'inbound库存', dataIndex: 'inbound_qty', render: () => 0 }
        ],
      },
      {
        title: <Tooltip title={soldTitle}>售罄日期<Icon type="exclamation-circle" /></Tooltip>,
        dataIndex: 'sold_out_date',
      },
      {
        title: '上架时间',
        dataIndex: 'created_at',
      },
      {
        title: '是否同步',
        dataIndex: 'is_sync',
        render: (text) => {
          return <Tag color={text ? 'green' : 'red'}>{text ? '已同步' : '未同步'}</Tag>;
        },
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        render: (text, item) => (
          <Fragment>
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => this.handleActions('edit-item', item, record)}
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

  renderTitleContent = (thumbnail, sku, title) => (
    <div style={{ clear: 'both' }}>
      <Avatar style={{ float: 'left' }} src={thumbnail || defaultImg} shape="square" size="large" />
      <div style={{ float: 'left', marginLeft: 10 }}>
        <h5>{sku}</h5>
        {title ? (
          <Tooltip title={title}>
            <p
              style={{
                marginBottom: 0,
                fontSize: 12,
                width: 320,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </p>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );

  renderTab = () => {
    const { platformTree } = this.state;

    if (platformTree.length !== 0) {
      return platformTree.map(item => (
        <Tabs.TabPane tab={item.label} key={item.value} />
      ))
    }
    return null;
  };

  onTabChange = key => {
    const { form, dispatch } = this.props;
    const { filters, platformTree = [] } = this.state;
    // 切换Tab清除子平台选项缓存
    delete filters.platformId;
    form.resetFields('platformId');
    const list = platformTree.filter(e => e.value.toString() === key);
    dispatch({
      type: 'platform/save',
      payload: { productFilters: { platformPid: key } },
    });
    this.setState({
      'filters': { ...filters, platformPid: key, isSync: '' },
      subPlatformList: list.length !== 0 ? list[0].children || [] : [],
    }, () => {
      this.initPlatformProducts();
      this.initIfMatch();
    });
  };

  filterData = () => {
    const { form, dispatch } = this.props;
    const { filters: { platformPid } } = this.state;
    form.resetFields();
    this.setState({
      filters: { 'platformPid': platformPid || 1, isSync: false },
      pagination: { current: 1, pageSize: 20 },
      sorter: { field: 'updated_at', order: 'desc' },
    }, () => {
      dispatch({
        type: 'platform/save',
        payload: { productFilters: { 'platformPid': platformPid || 1 } },
      });
      this.initPlatformProducts();
    });
  };

  render() {
    const {
      loading,
      platform: { products },
    } = this.props;
    const { initializing, filters, notMatch } = this.state;

    const columns = [
      { title: '系统编号', dataIndex: 'id' },
      {
        title: '产品信息',
        dataIndex: 'spu',
        width: 450,
        render: (text, record) => {
          const { thumbnail, spu, title } = record;
          return this.renderTitleContent(thumbnail, spu, title);
        },
      },
      {
        title: '编码（ASIN）',
        dataIndex: 'platform_sn',
      },
      {
        title: '上架时间',
        dataIndex: 'created_at',
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 100,
        render: (text, record) => (
          <Fragment>
            <Button
              icon="plus"
              size="small"
              onClick={() => this.handleActions('add-items', record)}
            />
            <Divider type="vertical" />
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => this.handleActions('edit', record)}
            />
          </Fragment>
        ),
      },
    ];
    const extraContent = (
      <div>
        <Tooltip title="添加产品">
          <Button
            style={{ marginLeft: 8 }}
            icon="plus"
            type='primary'
            onClick={() => this.handleActions('add')}
          >
            发布
          </Button>
        </Tooltip>
        <Tooltip title="批量导入">
          <Button
            style={{ marginLeft: 8 }}
            icon="cloud-upload"
            onClick={() => this.handleActions('upload')}
          >
            导入
          </Button>
        </Tooltip>
        <Tooltip title="刷新列表">
          <Button style={{ marginLeft: 8 }} icon="sync" onClick={() => this.initPlatformProducts()} />
        </Tooltip>
      </div>
    );
    return (
      <PageHeaderWrapper
        title="平台商品列表"
        extra={extraContent}
      >
        <Skeleton loading={initializing}>
          <Card bordered={false} className="searchCard">
            <Tabs
              animated={false}
              onChange={this.onTabChange}
              activeKey={filters.platformPid ? filters.platformPid.toString() : '1'}
            >
              {this.renderTab()}
            </Tabs>
            {this.renderSearchForm()}
          </Card>
          <div className={styles.tabletop}>
            {notMatch ? (
              <div
                className={styles.tips}
                onClick={() => this.filterData()}
              >
                有未匹配或未同步的数据！点击查看
              </div>
            ) : null}
          </div>
          <Card bordered={false} style={{ marginTop: 12 }}>
            <StandardTable
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={products}
              rowSelection={null}
              onChange={this.handleStandardTableChange}
              expandedRowRender={this.doExpandedRowRender}
            />
          </Card>
        </Skeleton>
      </PageHeaderWrapper>
    );
  }
}

export default SearchList;
