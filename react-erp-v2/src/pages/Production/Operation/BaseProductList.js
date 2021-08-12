import React, { Fragment } from 'react';
import { connect } from "dva";
import { Table, Button, Select, InputNumber } from 'antd';
import _ from "lodash";

let count = 1;
const { Option } = Select;

@connect((
  { product }) => ({ product }),
)
class BaseProductList extends React.Component {
  // 声明这是一个受控组件，否则不能修改
  static getDerivedStateFromProps(props, state) {
    if (props.value !== state.prevData) {
      // 当外面父组件默认值变化时，里面初始props的值需要变化改变state
      count = 1;
      const list = [];
      const values = props.value || [];
      const { form } = props;
      values.forEach((e, idx) => {
        // 父组件值变化时，里层的form元素需要清空已有的值，避免界面干扰
        form.resetFields([`sku_${idx + 1}`, `amount_${idx + 1}`]);
        if (e.id) {
          list.push({ ...e, key: count, baseSku: { key: e.id, label: e.sku } }); // 处理成labelInValue格式
        } else {
          list.push({ ...e, key: count });
        }
        count += 1;
      });
      return {
        prevData: props.value,
        dataSource: list,
      }
    }
    return null;
  }

  constructor(props) {
    super(props);
    // 初始值处理，同上
    const { value = [] } = props;
    const list = [];
    value.forEach(e => {
      // constructor仅初始化一次，和上面不同，不存在id为空情况
      list.push({ ...e, key: count, baseSku: { key: e.id, label: e.sku } });
      count += 1;
    });
    this.state = {
      prevData: [],
      dataSource: list,
      skuList: [],
    };
  }

  handelChange = () => {
    // 组件值变化，推送到父级
    const { onChange } = this.props;
    const { dataSource } = this.state;
    if (onChange) {
      onChange(dataSource);
    }
  };

  amountChange = (value, key) => {
    const { dataSource } = this.state;
    const list = [];
    dataSource.forEach(e => {
      if (e.key === key) {
        list.push({ ...e, amount: value });
      } else {
        list.push({ ...e });
      }
    });
    this.setState({
      dataSource: list,
    }, () => this.handelChange())
  };

  skuChange = (value, key) => {
    const { dataSource } = this.state;
    const list = [];
    dataSource.forEach(e => {
      if (e.key === key) {
        if (value) {
          list.push({ ...e, id: value.key, sku: value.label });
        } else {
          delete e.id;
          delete e.sku;
          delete e.baseSku;
          list.push({ ...e });
        }
      } else {
        list.push({ ...e });
      }
    });
    this.setState({
      dataSource: list,
    }, () => this.handelChange())
  };

  handleAdd = () => {
    const { dataSource } = this.state;
    const newData = {
      key: count,
      amount: 0,
    };
    count += 1;
    this.setState({
      dataSource: [...dataSource, newData]
    })
  };

  handleDelete = (key) => {
    const { dataSource } = this.state;
    this.setState({ dataSource: dataSource.filter(item => item.key !== key) }, () => this.handelChange());
  };

  searchBaseSku = label => {
    const { dispatch } = this.props;
    dispatch({
      type: 'product/fetchItems',
      payload: { filters: { sku: label } },
      callback: res => {
        this.setState({
          skuList: res.data || [],
        })
      }
    });
  };

  render() {
    const { Item, form: { getFieldDecorator } } = this.props;
    const { dataSource, skuList } = this.state;

    const imageColumns = [
      {
        title: <div>单品SKU<span style={{ fontSize: 15, color: 'red' }}>*</span></div>,
        dataIndex: 'baseSku',
        width: '60%',
        render: (text, record) => {
          return (
            <Item style={{ marginBottom: 0 }}>
              {getFieldDecorator(`sku_${record.key}`, {
                rules: [{ required: true, message: '单品SKU必选' }],
                initialValue: text,
              })(
                <Select
                  size='small'
                  labelInValue
                  showSearch
                  allowClear
                  placeholder='请查询选择'
                  filterOption={false}
                  onSearch={_.debounce(this.searchBaseSku, 500)}
                  onChange={value => this.skuChange(value, record.key)}
                >
                  {skuList.length !== 0 ? (
                    skuList.map(item => <Option key={item.id} value={item.id}>{item.sku}</Option>)) : null}
                </Select>
              )}
            </Item>
          );
        }
      },
      {
        title: <div>数量<span style={{ fontSize: 15, color: 'red' }}>*</span></div>,
        width: '25%',
        dataIndex: 'amount',
        render: (text, record) => {
          return (
            <Item style={{ marginBottom: 0 }}>
              {getFieldDecorator(`amount_${record.key}`, {
                rules: [{ required: true, message: '数量必填' }],
                initialValue: text,
              })(
                <InputNumber
                  size='small'
                  min={1}
                  precision={0}
                  placeholder="请输入数量"
                  style={{ width: '100%' }}
                  onChange={value => this.amountChange(value, record.key)}
                />
              )}
            </Item>
          );
        }
      },
      {
        title: '操作',
        width: '15%',
        dataIndex: 'action',
        render: (text, record) => (
          <Fragment>
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => this.handleDelete(record.key)}
            />
          </Fragment>
        ),
      },
    ];

    return (
      <Fragment>
        <Table
          size='small'
          rowKey="key"
          dataSource={dataSource}
          columns={imageColumns}
          pagination={false}
          footer={() => {
            return (
              <>
                <Button
                  style={{ marginRight: 20, width: 40 }}
                  icon="plus"
                  type='primary'
                  size='small'
                  onClick={this.handleAdd}
                />
                <a
                  href='/products/product/create'
                  target='_blank'
                  rel="noopener noreferrer"
                >
                  未查询到单品？点击添加
                </a>
              </>
            );
          }}
          scroll={{ y: 400 }}
        />
      </Fragment>
    );
  }
}

export default BaseProductList;
