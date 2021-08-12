import React, { Fragment } from 'react';
import { Modal, Table, Button, Input, Form } from 'antd';
import { connect } from 'dva';

import styles from './style.less';
import SelectProduct from './SelectProduct';

const { Item } = Form;

@connect((
  { sellerProduct }) => ({ sellerProduct }),
)
class SellerProduct extends React.Component {
  // 父组件传值变化，子组件对比变化，反应到自身变化
  static getDerivedStateFromProps(props, state) {
    if (props.value !== state.prevSelectionProducts) {
      return {
        selectionProducts: props.value,
        prevSelectionProducts: props.value
      }
    }
    return null;
  }

  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      searchVisible: false,
      selectionProducts: value,
      prevSelectionProducts: [],
      selections: [],
    };
  }

  handleSearchModal = (flag) => {
    this.setState({ searchVisible: !!flag });
  };

  handleSubmit = () => {
    const { selections } = this.state;
    this.setState(
      { selectionProducts: selections, searchVisible: false },
      () => this.handelChange(),
    );
  };

  handelRowChange = selections => {
    this.setState({ selections });
  };


  handelChange = () => {
    const { onChange, onItemChange } = this.props;
    const { selectionProducts } = this.state;
    if (onChange) {
      onChange(selectionProducts);
    }
    if (onItemChange) {
      onItemChange(selectionProducts);
    }
  };

  getItemById = (id, newItems) => {
    const { items } = this.state;
    return (newItems || items).filter(item => item.id === id)[0];
  };

  handleAsinChange = (value, id) => {
    const { selectionProducts } = this.state;
    const newItems = selectionProducts.map(item => ({ ...item }));
    const target = this.getItemById(id, newItems);
    if (target) {
      const field = 'asin';
      target[field] = value;
      this.setState(
        { selectionProducts: newItems },
        () => this.handelChange(),
      );
    }
  };

  handleActions = (key, record) => {
    if (key === 'delete') {
      const { selectionProducts } = this.state;
      const { sku } = record;
      const newItems = selectionProducts.filter(item => item.sku !== sku);

      this.setState(
        { selectionProducts: newItems },
        () => this.handelChange(),
      );
    }
  };

  render() {
    const { getFieldDecorator } = this.props;
    const { searchVisible, selectionProducts } = this.state;

    const productColumns = [
      { title: '可售商品SKU', dataIndex: 'sku' },
      {
        title: <div>ASIN<span style={{ fontSize: 15, color: 'red' }}>*</span></div>,
        dataIndex: 'asin',
        render: (text, record) => (
          <Item style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${record.id}.asin`, {
              scrollToFirstError: true,
              rules: [{ required: true, message: 'ASIN必填' }],
              initialValue: text
            })(
              <Input
                placeholder="请输入"
                onChange={e => this.handleAsinChange(e.target.value, record.id)}
              />,
            )}
          </Item>
        )
      },
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        render: (text, record) => (
          <Fragment>
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

    return (
      <Fragment>
        <Button icon="plus" style={{ marginBottom: 10 }} type='primary' onClick={this.handleSearchModal}>添加产品</Button>
        <Table
          rowKey="sku"
          dataSource={selectionProducts}
          columns={productColumns}
          pagination={false}
          footer={null}
        />
        <Modal
          destroyOnClose
          width={860}
          title="产品选择（仅支持同一尺码组合）"
          visible={searchVisible}
          className={styles.selectModal}
          onOk={() => this.handleSubmit()}
          onCancel={() => this.handleSearchModal(false)}
        >
          <SelectProduct items={selectionProducts} onRowChange={this.handelRowChange} />
        </Modal>
      </Fragment>
    );
  }
}

export default SellerProduct;
