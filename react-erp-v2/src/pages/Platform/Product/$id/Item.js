import React, { Fragment, PureComponent } from 'react';
import { Form, Card, Button, Skeleton, Icon, message, Table, Input, Select } from 'antd';
import { connect } from 'dva';

import router from 'umi/router';
import FooterToolbar from '@/components/FooterToolbar';
import DescriptionList from '@/components/DescriptionList';
import _ from "lodash";
import styles from "./style.less";

const { Item } = Form;
const { Option } = Select;
const { Description } = DescriptionList;

let count = 1;

@connect(({ spec, product, factory, loading }) => ({
  spec,
  product,
  factory,
  loading: loading.effects['product/fetchOne'],
}))
@Form.create()
class ItemSetting extends PureComponent {
  constructor(props) {
    super(props);
    const { match: { params } } = this.props;
    this.state = {
      params,
      submittingAndBack: false,
      current: {},
      dataSource: [],
      platformTree: [],
      attributes: [],
      sellerSkuList: [],
      showAsin: false,
    };
  }

  componentDidMount() {
    this.initProduct();
  }

  initProduct = () => {
    count = 1;
    const { dispatch } = this.props;
    const { params: { id } } = this.state;
    dispatch({
      type: 'platform/fetchTree',
      payload: {},
      callback: platformTree => {
        this.setState({ platformTree });
      },
    });
    dispatch({
      type: 'attribute/fetchAll',
      payload: { with: ['values'] },
      callback: res => {
        const list = res.filter(e => e.name !== 'Group');
        this.setState({ attributes: list });
      },
    });
    dispatch({
      type: 'platform/fetchOneProduct',
      payload: { id, params: { with: ['items.sellerItem', 'brand', 'category', 'platform', 'attributeValues'] } },
      callback: res => {
        const { items = [] } = res;
        const list = [];
        items.forEach(e => {
          list.push({ ...e, key: count });
          count += 1;
        });
        this.setState({
          current: res,
          dataSource: list,
          showAsin: res.platform && res.platform.length !== 0 && (res.platform[0] === 1 || res.platform[0] === 13)
        })
      }
    });
  };

  backStep = () => {
    const { params: { id } } = this.state;
    router.push(`/products/platform/${id}/info`);
  };

  handleProductSubmit = flag => {
    const { params: { id }, showAsin } = this.state;
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }

      const list = [];
      Object.keys(values).forEach(key => {
        const { seller_sku = {} } = values[key];
        if(showAsin) {
          list.push({
            id: values[key].id,
            platform_sku: values[key].platform_sku,
            platform_sn: values[key].platform_sn,
            seller_product_item_id: seller_sku.key,
            seller_product_item_sku: seller_sku.label
          })
        } else {
          list.push({
            id: values[key].id,
            platform_sku: values[key].platform_sku,
            seller_product_item_id: seller_sku.key,
            seller_product_item_sku: seller_sku.label
          })
        }
      });

      if (flag === 'back') {
        this.setState({ submittingAndBack: true });
      }

      dispatch({
        type: 'platform/updateOneProduct',
        payload: { id, params: { items: list } },
        callback: res => {
          this.setState({
            submittingAndBack: false,
          });
          if (res.status === 'ok') {
            if (flag === 'back') {
              router.push('/products/platform');
            }
          }
          if (res.status === 'error') {
            message.warning(res.body.message, 5)
          }
        },
      });
    });
  };

  renderPlatform = platform => {
    const { platformTree } = this.state;
    if (platform && platform.length !== 0) {
      const father = platformTree.filter(e => e.value === platform[0]);
      if (platform[1] && father.length !== 0 && father[0].children) {
        const son = father[0].children.filter(e => e.value === platform[1]);
        if (son && son.length !== 0) {
          return `${father[0].label}/${son[0].label}`;
        }
      }
    }
    return null;
  };

  renderAttr = (id, attr) => {
    if (attr && attr.length !== 0) {
      const opt = attr.filter(e => e.attribute_id === id);
      if (opt && opt.length !== 0) {
        return opt[0].value;
      }
    }
    return null;
  };

  fetchSellerSku = value => {
    if (value) {
      const { dispatch } = this.props;
      dispatch({
        type: 'platform/fetchSellerSku',
        payload: {
          filters: { sku: value },
          pagination: { current: 1, pageSize: 20 },
        },
        callback: res => {
          this.setState({
            sellerSkuList: res.data,
          })
        }
      })
    }
  };

  renderSellerSku = record => {
    if(record.seller_item && Object.keys(record.seller_item).length !== 0) {
      return { key: record.seller_item.id, label: record.seller_item.sku }
    }
    return undefined;
  };

  handleAdd = () => {
    const { dataSource } = this.state;
    const newData = {
      key: count,
      id: '',
      seller_item: {},
      platform_sku: '',
      platform_sn: '',
    };
    count += 1;
    this.setState({
      dataSource: [ ...dataSource, newData ]
    })
  };

  handleDelete = (id, key) => {
    const { dataSource } = this.state;
    this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator },
    } = this.props;
    const {
      submittingAndBack,
      current,
      dataSource,
      attributes,
      sellerSkuList,
      showAsin
    } = this.state;

    const columns = [
      {
        title: '系统编号',
        dataIndex: 'id',
        render: (text, record) => (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${record.key}.id`, {
              initialValue: text,
            })(<Input hidden />)}
            {text}
          </Item>
        ),
      },
      {
        title: '平台子SKU',
        dataIndex: 'platform_sku',
        render: (text, record) => (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${record.key}.platform_sku`, {
              initialValue: text,
            })(
              <Input placeholder="请输入" />,
            )}
          </Item>
        ),
      },
      {
        title: <div>可售商品SKU<span style={{ fontSize: 15, color: 'red' }}>*</span></div>,
        dataIndex: 'seller_sku',
        render: (text, record) => (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${record.key}.seller_sku`, {
              rules: [{ required: true, message: '可售商品SKU必选' }],
              initialValue: this.renderSellerSku(record),
            })(
              <Select
                showSearch
                labelInValue
                allowClear
                placeholder="查询选择"
                style={{ width: '100%' }}
                filterOption={false}
                onSearch={_.debounce(this.fetchSellerSku, 500)}
              >
                {sellerSkuList.map(item => <Option key={item.id} value={item.id}>{item.sku}</Option>)}
              </Select>,
            )}
          </Item>
        ),
      },
      {
        title: <div>ASIN<span style={{ fontSize: 15, color: 'red' }}>*</span></div>,
        dataIndex: 'platform_sn',
        render: (text, record) => (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${record.key}.platform_sn`, {
              scrollToFirstError: true,
              rules: [{ required: true, message: 'ASIN必填' }],
              initialValue: text
            })(
              <Input placeholder="请输入" />,
            )}
          </Item>
        )
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <Fragment>
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => this.handleDelete(record.id, record.key)}
            />
          </Fragment>
        ),
      },
    ];

    const noAsinColumns = [
      {
        title: '系统编号',
        dataIndex: 'id',
        render: (text, record) => (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${record.key}.id`, {
              initialValue: text,
            })(<Input hidden />)}
            {text}
          </Item>
        ),
      },
      {
        title: '平台子SKU',
        dataIndex: 'platform_sku',
        render: (text, record) => (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${record.key}.platform_sku`, {
              initialValue: text,
            })(
              <Input placeholder="请输入" />,
            )}
          </Item>
        ),
      },
      {
        title: <div>可售商品SKU<span style={{ fontSize: 15, color: 'red' }}>*</span></div>,
        dataIndex: 'seller_sku',
        render: (text, record) => (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${record.key}.seller_sku`, {
              rules: [{ required: true, message: '可售商品SKU必选' }],
              initialValue: this.renderSellerSku(record),
            })(
              <Select
                showSearch
                labelInValue
                allowClear
                placeholder="查询选择"
                style={{ width: '100%' }}
                filterOption={false}
                onSearch={_.debounce(this.fetchSellerSku, 500)}
              >
                {sellerSkuList.map(item => <Option key={item.id} value={item.id}>{item.sku}</Option>)}
              </Select>,
            )}
          </Item>
        ),
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <Fragment>
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => this.handleDelete(record.id, record.key)}
            />
          </Fragment>
        ),
      },
    ];

    return (
      <Skeleton active loading={loading}>
        <Card style={{ width: '80%', margin: '0 auto' }}>
          <DescriptionList
            title='平台产品信息'
            col="3"
          >
            <Description term='父SKU'>{current.spu}</Description>
            <Description term='ASIN'>{current.platform_sn}</Description>
            <Description term='发布平台'>{this.renderPlatform(current.platform)}</Description>
            <Description term='品牌'>{current.brand ? current.brand.name : null}</Description>
            <Description term='产品线'>{current.category ? current.category.name : null}</Description>
            {attributes && attributes.length !== 0 ? (
              attributes.map(e => <Description key={e.id} term={e.description}>{this.renderAttr(e.id, current.attribute_values)}</Description>)
            ) : null}
          </DescriptionList>
        </Card>
        <Card style={{ marginTop: 12, marginBottom: 24 }}>
          <Button type="primary" onClick={() => this.handleAdd()} style={{ marginBottom: 16 }}>
            添加
          </Button>
          <Form>
            <Table
              size="small"
              rowKey="key"
              loading={loading}
              columns={showAsin ? columns : noAsinColumns}
              dataSource={dataSource}
              pagination={false}
              rowClassName={record => (record.editable ? styles.editable : '')}
              scroll={{ y: document.documentElement.clientWidth > 1440 ? 600 : 500 }}
            />
          </Form>
        </Card>
        <FooterToolbar>
          <Button
            onClick={() => router.push('/products/platform')}
            style={{ width: 80 }}
          >
            返回
          </Button>
          <Button
            type="primary"
            onClick={() => this.backStep()}
            style={{ width: 100 }}
          >
            <Icon type="left" />上一步
          </Button>
          <Button
            loading={submittingAndBack}
            type="primary"
            onClick={() => this.handleProductSubmit('back')}
            style={{ width: 130 }}
          >
            保存并返回
          </Button>
        </FooterToolbar>
      </Skeleton>
    );
  }
}

export default ItemSetting;
