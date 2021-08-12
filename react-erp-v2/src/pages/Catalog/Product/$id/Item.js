import React, { Fragment, PureComponent } from 'react';
import { Form, Table, Input, Card, InputNumber, Button, Skeleton, Icon, Modal, message, Select, } from 'antd';
import { connect } from 'dva';

import router from 'umi/router';
import FooterToolbar from '@/components/FooterToolbar';
import DescriptionList from '@/components/DescriptionList';
import ErrorInfo from "@/components/ErrorInfo";
import _ from "lodash";
import styles from './style.less';

const { Item } = Form;
const { Option } = Select;
const { TextArea } = Input;
const { Description } = DescriptionList;

const statusList = [
  { key: 1, label: '在售', value: 1, },
  { key: 0, label: '淘汰', value: 0 },
];

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
      submittingAndNext: false,
      colors: [],
      sizes: [],
      factorySkuList: [],
      current: {},
      dataSource: [],
      errors: {}
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
      type: 'product/fetchOne',
      payload: { id, params: { with: ['brand', 'category', 'unit', 'items.specValues.spec', 'items.factoryProductItems'] } },
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
        })
      }
    });
  };

  backStep = () => {
    const { params: { id } } = this.state;
    router.push(`/products/product/${id}/info`);
  };

  handleProductSubmit = flag => {
    this.setState({
      errors: {}
    });
    const { params: { id } } = this.state;
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      if(flag === 'next') {
        this.setState({ submittingAndNext: true });
      }
      if(flag === 'back') {
        this.setState({ submittingAndBack: true });
      }
      const dataList = [];
      Object.values(values).forEach(e => dataList.push({ ...e, product_id: id}));
      dispatch({
        type: 'product/batchUpdateItems',
        payload: { data: dataList },
        callback: res => {
          this.setState({
            submittingAndBack: false,
            submittingAndNext: false,
          });
          if(res.status === 'ok') {
            if(flag === 'next') {
              router.push(`/products/product/${id}/detail`);
            }
            if(flag === 'back') {
              router.push('/products/product');
            }
          }
          if(res.status === 'error') {
            this.setState({
              errors: res.body.errors || {}
            })
            message.warning(res.body.errors && Object.keys(res.body.errors).length !== 0 ? '保存失败!' : res.body.message, 5)
          }
        },
      });
    });
  };

  handleColorSearch = value => {
    if (value) {
      const { dispatch } = this.props;
      dispatch({
        type: 'spec/fetchSpecSearchList',
        payload: { filters: { specName: 'Color', specValue: value }, pagination: { current: 1, pageSize: 100 } },
        callback: res => {
          this.setState({
            colors: res.data,
          });
        },
      });
    }
  };

  handleSizeSearch = value => {
    if (value) {
      const { dispatch } = this.props;
      dispatch({
        type: 'spec/fetchSpecSearchList',
        payload: { filters: { specName: 'Size', specValue: value }, pagination: { current: 1, pageSize: 100 } },
        callback: res => {
          this.setState({
            sizes: res.data,
          });
        },
      });
    }
  };

  searchFactorySku = label => {
    const { dispatch } = this.props;
    dispatch({
      type: 'factory/getFactorySkuOptions',
      payload: { filters: { factorySku: label } },
      callback: res => this.setState({
        factorySkuList: res.data || [],
      })
    });
  };

  renderSelectFactorySku = list => {
    if(list && Object.keys(list).length !== 0) {
      const arr = [];
      list.forEach(item => arr.push(item.sku));
      return arr;
    }
    return [];
  };

  handleAdd = () => {
    const { dataSource, current } = this.state;
    const newData = {
      key: count,
      id: '',
      color: '',
      size: '',
      sku: current.spu,
      factory_sku: null,
      selling_status: '',
      note: '',
      qty: 0,
      production_qty: 0
    };
    count += 1;
    this.setState({
      dataSource: [ ...dataSource, newData ]
    })
  };

  handleDelete = (id, key) => {
    if(id !== '') {
      Modal.confirm({
        title: '删除提醒',
        content: '确定删除吗？如果产品已经存在工厂/可售/需求关联，无法删除！',
        okText: '确认',
        cancelText: '取消',
        onOk: () => this.remove(id),
      });
    }else {
      const { dataSource } = this.state;
      this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
    }
  };

  remove = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'product/removeItem',
      payload: id,
      callback: res => {
        if (res.status === 'error') {
          message.warning(res.body.message, 5);
        } else {
          const { dataSource } = this.state;
          this.setState({ dataSource: dataSource.filter(item => item.id !== id) });
        }
      },
    });
  };

  renderStatus = record => {
    if(record || record === 0) {
      if(statusList.filter(e => e.key === record).length !== 0) {
        return statusList.filter(e => e.key === record)[0].label;
      }
    }
    return null;
  };

  colorChange = (value, key) => {
    const { form } = this.props;
    const { current } = this.state;
    const size = form.getFieldValue(`${key}.size`);
    form.setFieldsValue({ [`${key}.sku`]: `${current.spu}-${value}${size}`});
  };

  sizeChange = (value, key) => {
    const { form } = this.props;
    const { current } = this.state;
    const color = form.getFieldValue(`${key}.color`);
    form.setFieldsValue({ [`${key}.sku`]: `${current.spu}-${color}${value}`});
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator },
    } = this.props;
    const {
      submittingAndBack,
      submittingAndNext,
      colors,
      sizes,
      factorySkuList,
      current,
      dataSource,
      errors,
    } = this.state;

    const columns = [
      {
        title: '系统编号',
        dataIndex: 'id',
        width: 80,
        fixed: 'left',
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
        title: <div>颜色<span style={{ fontSize: 15, color: 'red' }}>*</span></div>,
        dataIndex: 'color',
        width: 170,
        render: (text, record) => (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${record.key}.color`, {
              rules: [{ required: true, message: '颜色必选' }],
              initialValue: text,
            })(
              <Select
                showSearch
                allowClear
                placeholder="select color"
                filterOption={false}
                style={{ width: 150 }}
                onSearch={_.debounce(this.handleColorSearch, 500)}
                onChange={(value) => this.colorChange(value, `${record.key}`)}
              >
                {colors.map(u => <Option key={u.id} value={u.value}>{u.value}</Option>)}
              </Select>,
            )}
          </Item>
        ),
      },
      {
        title: <div>尺码<span style={{ fontSize: 15, color: 'red' }}>*</span></div>,
        dataIndex: 'size',
        width: 120,
        render: (text, record) => (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${record.key}.size`, {
              rules: [{ required: true, message: '尺码必选' }],
              initialValue: text,
            })(
              <Select
                showSearch
                allowClear
                placeholder="select size"
                filterOption={false}
                style={{ width: 100 }}
                onSearch={_.debounce(this.handleSizeSearch, 500)}
                onChange={(value) => this.sizeChange(value, `${record.key}`)}
              >
                {sizes.map(u => <Option key={u.id} value={u.value}>{u.value}</Option>)}
              </Select>,
            )}
          </Item>
        ),
      },
      {
        title: 'Base SKU',
        dataIndex: 'sku',
        width: 270,
        render: (text, record) => (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${record.key}.sku`, {
              initialValue: text,
            })(<Input disabled />)}
          </Item>
        ),
      },
      {
        title: '工厂SKU',
        dataIndex: 'factory_sku',
        width: 220,
        render: (text, record) => (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${record.key}.factory_sku`, {
              initialValue: this.renderSelectFactorySku(record.factory_product_items),
            })(
              <Select
                showSearch
                allowClear
                mode='multiple'
                placeholder='请查询选择工厂SKU'
                filterOption={false}
                style={{ width: 200 }}
                onSearch={_.debounce(this.searchFactorySku, 500)}
              >
                {Object.keys(factorySkuList).length !== 0 ? factorySkuList.map(item => <Option key={item.id} disabled={!!(item.product_item_id)} value={item.sku}>{item.sku}</Option>) : null}
              </Select>
            )}
          </Item>
        ),
      },
      {
        title: '产品状态',
        dataIndex: 'selling_status',
        width: 120,
        render: (text, record) => (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${record.key}.selling_status`, {
              initialValue: text || text === 0 ? text : 1
            })(
              <Select placeholder="请选择" style={{ width: 100 }}>
                {statusList.map(item => <Option key={item.key} value={item.key}>{item.label}</Option>)}
              </Select>,
            )}
          </Item>
        ),
      },
      {
        title: '备注',
        dataIndex: 'note',
        width: 170,
        render: (text, record) => (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${record.key}.note`, {
              initialValue: text
            })(<TextArea style={{ width: 150 }} />)}
          </Item>
        ),
      },
      {
        title: '已入库库存',
        dataIndex: 'qty',
      },
      {
        title: '在产库存',
        dataIndex: 'production_qty',
      },
      { title: '修改时间', dataIndex: 'updated_at', },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
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
        <Card style={{ width: '60%', margin: '0 auto' }}>
          <DescriptionList
            title='单品信息'
            col="3"
          >
            <Description term='货号'>{current.spu}</Description>
            <Description term='品牌'>{current.brand ? current.brand.name : null}</Description>
            <Description term='产品分类'>{current.category ? current.category.name : null}</Description>
            <Description term='单位'>{current.unit ? current.unit.name : null}</Description>
            <Description term='产品状态'>{this.renderStatus(current.selling_status)}</Description>
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
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              rowClassName={record => (record.editable ? styles.editable : '')}
              scroll={{ x: 1500, y: document.documentElement.clientWidth > 1440 ? 600 : 500 }}
            />
          </Form>
        </Card>
        <FooterToolbar>
          <ErrorInfo key='errors' errors={errors} />
          <Button
            onClick={() => router.push('/products/product')}
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
            disabled={dataSource.length === 0}
            type="primary"
            onClick={() => this.handleProductSubmit('back')}
            style={{ width: 130 }}
          >
            保存并返回
          </Button>
          <Button
            loading={submittingAndNext}
            disabled={dataSource.length === 0}
            type="primary"
            onClick={() => this.handleProductSubmit('next')}
            style={{ width: 140 }}
          >
            保存并下一步<Icon type="right" />
          </Button>
        </FooterToolbar>
      </Skeleton>
    );
  }
}

export default ItemSetting;
