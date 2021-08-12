import React from 'react';
import { Col, Row, Skeleton, Tag, Input, Avatar } from 'antd';
import { connect } from 'dva';

import StandardTable from '@/components/StandardTable';
import defaultImg from '@/assets/product.webp';
import _ from "lodash";

const { Search } = Input;

@connect((
  { sellerProduct }) => ({ sellerProduct }),
)
class SelectProduct extends React.Component {
  constructor(props) {
    super(props);
    const { items } = props;
    const selections = items.map(i => ({ id: i.id, sku: i.sku, asin: i.asin || '' }));  // 组件选中值传递
    const selectionKeys = items.map(i => i.id);  // 组件选中展示key
    this.state = {
      searchLoading: false,
      pagination: {},
      filters: {},
      sorter: {},
      products: {},
      productItems: [],
      selectionKeys,
      selections,
    };
  }

  componentDidMount() {
    this.searchProductList();
  }

  searchProductList = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'sellerProduct/fetch',
      payload: {
        pagination,
        filters,
        sorter,
        with: ['items'],
      },
      callback: products => {
        this.setState({ products, searchLoading: false });
      },
    });
  };

  searchProduct = value => {
    this.setState({
      filters: { spu: value },
      pagination: {},
    }, () => this.searchProductList());
  };

  handleStandardTableChange = (pagination, filters, sorter) => {
    this.setState(
      { pagination, filters, sorter },
      () => this.searchProductList(),
    );
  };

  handleRowClick = (record) => {
    this.setState({ productItems: record.items });
  };

  // 选中值传回父组件
  handleItemRowSelection = selections => {
    const { onRowChange } = this.props;
    this.setState({ selections, })
    if (onRowChange) {
      onRowChange(selections);
    }
  };

  handleTagClose = removedId => {
    const { onRowChange } = this.props;
    const { selectionKeys, selections } = this.state;
    const newKeys = selectionKeys.filter(id => id !== removedId);
    const newSelection = selections.filter(e => e.id !== removedId);
    this.setState({
      selectionKeys: newKeys,
      selections: newSelection,
    });
    if (onRowChange) {
      onRowChange(newSelection);
    }
  };

  render() {
    const {
      searchLoading,
      products,
      productItems,
      selectionKeys,
      selections,
    } = this.state;

    const rowSelection = {
      selectedRowKeys: selectionKeys,
      onChange: selectedRowKeys => {  // 控制table展示
        this.setState({
          selectionKeys: selectedRowKeys
        })
      },
      onSelect: (record, selected) => {  // 控制table选择记录
        if (selected) {  // 选中
          const selectedRecord = _.uniqWith(selections.concat({
            id: record.id,
            sku: record.sku,
            asin: record.asin || ''
          }), _.isEqual);
          this.handleItemRowSelection(selectedRecord);
        } else {  // 取消选中
          const index = selections.findIndex(item => item.id === record.id);
          if (index !== -1) {
            selections.splice(index, 1);
            this.handleItemRowSelection(selections);
          }
        }
      },
      onSelectAll: (selected, selectedRows, changeRows) => {  // 控制table全选记录
        if (selected) {  // 全选中
          let selectedRecord = selections;
          changeRows.forEach(item => {
            selectedRecord = selectedRecord.concat({ id: item.id, sku: item.sku, asin: item.asin || '' });
          });
          this.handleItemRowSelection(selectedRecord);
        } else {  // 取消全选中
          changeRows.forEach(item => {
            const index = selections.findIndex(o => o.id === item.id);
            if (index !== -1) {
              selections.splice(index, 1);
            }
          });
          this.handleItemRowSelection(selections);
        }
      },
    };

    const parentColumns = [
      {
        title: '可售产品信息',
        dataIndex: 'title',
        render: (text, record) => (
          <div style={{ clear: 'both' }}>
            <Avatar style={{ float: 'left' }} src={record.thumbnail || defaultImg} shape="square" size="large" />
            <div style={{ float: 'left', marginLeft: 10 }}>
              <h5>{record.spu}</h5>
            </div>
          </div>
        ),
      },
    ];
    const childrenColumns = [
      { title: 'SKU', dataIndex: 'sku', width: '50%' },
    ];
    return (
      <Skeleton loading={searchLoading}>
        <Row gutter={24}>
          <Col span={8}>
            <Search
              placeholder="过滤SKU"
              onSearch={this.searchProduct}
              style={{ marginBottom: 5 }}
            />
            <StandardTable
              simple
              dataSource={products}
              columns={parentColumns}
              onRow={record => {
                return {
                  onClick: event => {
                    this.handleRowClick(record, event);
                  },
                };
              }}
              onChange={this.handleStandardTableChange}
              scroll={{ y: 320 }}
            />
          </Col>
          <Col span={16}>
            <StandardTable
              selectedRowKeys={selectionKeys}
              rowKey="id"
              dataSource={{ data: productItems }}
              columns={childrenColumns}
              rowSelection={rowSelection}
              pagination={false}
              scroll={{ y: 356 }}
            />
          </Col>
        </Row>
        <div>
          已选商品：
          {selections.map(e =>
            <Tag
              closable
              key={e.id}
              color="#87d068"
              style={{ marginBottom: 2 }}
              onClose={() => this.handleTagClose(e.id)}
            >
              {e.sku}
            </Tag>,
          )}
        </div>
      </Skeleton>
    );
  }
}

export default SelectProduct;
