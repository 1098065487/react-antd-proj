import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Descriptions, Table } from 'antd';

@connect(({ product, loading }) => ({
  product,
  loading: loading.effects['product/fetchProductDetail'],
}))
class ProductDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.initProductDetail();
  }

  initProductDetail = () => {
    const { dispatch, record: { id } } = this.props;
    dispatch({
      type: 'product/fetchProductDetail',
      payload: id,
    });
  };

  render() {
    const { loading, product: { productDemandDetail } } = this.props;
    const {
      productItem = {},
      factoryProductItems = [],
      factoryWarehouseInventories = [],
      factoryProductionItems = []
    } = productDemandDetail;
    const showProduct = productItem && Object.keys(productItem).length !== 0;

    const productColumns = [
      { title: '品名', dataIndex: 'title' },
      { title: '工厂SKU', dataIndex: 'sku' },
      { title: '颜色', dataIndex: 'color' },
      { title: '尺码', dataIndex: 'size' },
      { title: '库存', dataIndex: 'qty' },
    ];

    const inventoryColumns = [
      { title: '所属仓库', dataIndex: 'warehouse', render: text => text.name },
      {
        title: '工厂SKU',
        dataIndex: 'sku',
        render: (text, record) => {
          const { factory_product_item } = record;
          if(factory_product_item && Object.keys(factory_product_item).length !== 0) {
            return factory_product_item.sku;
          }
          return null;
        }
      },
      { title: '在库库存', dataIndex: 'qty' },
      { title: '仓位', dataIndex: 'position' },
    ];

    const productionColumns = [
      {
        title: '生产单号',
        dataIndex: 'sn',
        render: (text, item) => {
          const { production = {} } = item;
          if(production && Object.keys(production).length !== 0) {
            return production.sn;
          }
          return null;
        }
      },
      {
        title: '预计完成时间',
        dataIndex: 'expect_finished_at',
        render: (text, item) => {
          const { production = {} } = item;
          if(production && Object.keys(production).length !== 0) {
            return production.expect_finished_at;
          }
          return null;
        }
      },
      {
        title: '工厂SKU',
        dataIndex: 'sku',
        render: (text, record) => {
          const { factory_product_item } = record;
          if(factory_product_item && Object.keys(factory_product_item).length !== 0) {
            return factory_product_item.sku;
          }
          return null;
        }
      },
      { title: '生产量', dataIndex: 'qty' },
      { title: '入库量', dataIndex: 'finished_qty' },
      { title: '未完成量', dataIndex: 'unfinished_qty' },
    ];

    return (
      <Fragment>
        <Row gutter={24}>
          <Col span={6}>
            <Card>
              <Descriptions title={showProduct ? productItem.sku : null} style={{margin: '10px, 20px, 20px, 20px'}} column={1}>
                <Descriptions.Item label="颜色">{showProduct ? productItem.color : null}</Descriptions.Item>
                <Descriptions.Item label="尺码">{showProduct ? productItem.size : null}</Descriptions.Item>
                <Descriptions.Item label="全年需求量">{productDemandDetail.demands}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col span={18}>
            <Card bordered={false}>
              <div style={{fontSize: 16, marginBottom: 10, fontFamily: 'bold'}}>产品信息：</div>
              <Table
                rowKey='id'
                size='small'
                loading={loading}
                columns={productColumns}
                dataSource={factoryProductItems || []}
                rowSelection={null}
                pagination={false}
              />
            </Card>

            <Card bordered={false}>
              <div style={{fontSize: 16, marginBottom: 10, fontFamily: 'bold'}}>库存信息：</div>
              <Table
                rowKey='id'
                size='small'
                loading={loading}
                columns={inventoryColumns}
                dataSource={factoryWarehouseInventories || []}
                rowSelection={null}
                pagination={false}
              />
            </Card>

            <Card bordered={false}>
              <div style={{fontSize: 16, marginBottom: 10, fontFamily: 'bold'}}>生产计划信息：</div>
              <Table
                rowKey='id'
                size='small'
                loading={loading}
                columns={productionColumns}
                dataSource={factoryProductionItems || []}
                rowSelection={null}
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default ProductDetail;
