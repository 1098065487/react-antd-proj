import React, { Fragment } from 'react';
import { Modal, Table, Button, InputNumber } from 'antd';
import { connect } from 'dva';
import styles from './style.less';
import SelectProduct from './SelectProduct';

@connect((
  { product }) => ({ product }),
)
class SellerProduct extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // 声明这是一个受控组件，否则不能修改
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || []),
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      searchVisible: false,
      selectionProducts: value,
      selectionKeys: [],
    };
  }

  handleSearchModal = (flag) => {
    this.setState({ searchVisible: !!flag });
  };

  handleSubmit = () => {
    const { selectionKeys } = this.state;
    const newProducts = selectionKeys.map(key => {
      return { sku: key, amount: 1 };
    });
    this.setState(
      { selectionProducts: newProducts, searchVisible: false },
      () => this.handelChange(),
    );
  };

  handelRowChange = selectionKeys => {
    this.setState({ selectionKeys });
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

  getItemBySku = (sku, newItems) => {
    const { items } = this.state;
    return (newItems || items).filter(item => item.sku === sku)[0];
  };

  // 数量变更
  handleAmountChange = (value, sku) => {
    const { selectionProducts } = this.state;
    const newItems = selectionProducts.map(item => ({ ...item }));
    const target = this.getItemBySku(sku, newItems);
    if (target) {
      const field = 'amount';
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
    const { value } = this.props;
    const { searchVisible } = this.state;

    const productColumns = [
      { title: '商品', dataIndex: 'sku' },
      {
        title: '组合数量',
        dataIndex: 'amount',
        render: (text, record) => <InputNumber
          value={text}
          placeholder="Amount"
          min={1}
          max={20}
          onChange={num => this.handleAmountChange(num, record.sku)}
        />,
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 160,
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
        <Table
          rowKey="sku"
          dataSource={value}
          columns={productColumns}
          pagination={false}
          footer={() => {
            return <Button icon="plus" onClick={this.handleSearchModal}>添加产品</Button>;
          }}
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
          <SelectProduct items={value} onRowChange={this.handelRowChange} />
        </Modal>
      </Fragment>
    );
  }
}

export default SellerProduct;
