import React from 'react';
import { Col, Row, Skeleton, Tag, Input, Avatar } from 'antd';
import { connect } from 'dva';
import StandardTable from '@/components/StandardTable';
import defaultImg from '@/assets/product.webp';

const { Search } = Input;

@connect((
  { product }) => ({ product }),
)
class SelectProduct extends React.Component {
  constructor(props) {
    super(props);
    const { items } = props;
    const selectionKeys = items.map(i => i.sku);
    this.state = {
      searchLoading: false,
      pagination: {},
      filters: {},
      sorter: {},
      products: {},
      productItems: [],
      selectionKeys,
    };
  }

  componentDidMount() {
    this.searchProductList();
  }

  searchProductList = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'product/fetch',
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

  handleItemRowSelection = (selectionKeys) => {
    const { onRowChange } = this.props;
    this.setState({ selectionKeys });
    if (onRowChange) {
      onRowChange(selectionKeys);
    }
  };

  handleTagClose = removedTag => {
    const { onRowChange } = this.props;
    const { selectionKeys } = this.state;
    const newKeys = selectionKeys.filter(tag => tag !== removedTag);
    this.setState({ selectionKeys: newKeys });
    if (onRowChange) {
      onRowChange(newKeys);
    }
  };

  render() {
    const {
      searchLoading,
      products,
      productItems,
      selectionKeys,
    } = this.state;
    const parentColumns = [
      {
        title: '产品信息',
        dataIndex: 'title',
        render: (text, record) => (
          <div style={{ clear: 'both' }}>
            <Avatar style={{ float: 'left' }} src={record.thumbnail || defaultImg} shape="square" size="large" />
            <div style={{ float: 'left', marginLeft: 10 }}>
              <h5>{record.spu}</h5>
              <p style={{ marginBottom: 0, height: 14, fontSize: 12 }}>{record.title || '名称缺失'}</p>
            </div>
          </div>
        ),
      },
    ];
    const childrenColumns = [
      { title: 'SKU', dataIndex: 'sku', width: '40%' },
      { title: '颜色', dataIndex: 'color', width: '30%' },
      { title: '尺码', dataIndex: 'size', width: '30%' },
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
              rowKey="sku"
              dataSource={{ data: productItems }}
              columns={childrenColumns}
              rowSelection={{
                selectedRowKeys: selectionKeys,
                onChange: (selectedRowKeys, selectedRows) => {
                  this.handleItemRowSelection(selectedRowKeys, selectedRows);
                },
              }}
              pagination={false}
              scroll={{ y: 356 }}
            />
          </Col>
        </Row>
        <div>
          已选商品：
          {selectionKeys.map(key =>
            <Tag
              closable
              key={key}
              color="#87d068"
              onClose={() => this.handleTagClose(key)}
            >
              {key}
            </Tag>,
          )}
        </div>
      </Skeleton>
    );
  }
}

export default SelectProduct;
