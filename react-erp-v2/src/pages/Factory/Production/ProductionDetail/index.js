import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Descriptions, Button, message } from 'antd';

import StandardTable from '@/components/StandardTable';

const statusList = [
  { key: 'create', value: '已创建' },
  { key: 'finished', value: '生产完成' },
  { key: 'partfinished', value: '生产中' },
  { key: 'unfinished', value: '生产中' },
  { key: 'cancelled', value: '生产终止' },
];

@connect(({ factory, loading }) => ({
  factory,
  loading: loading.effects['production/fetchProductionDetail'],
}))
class ProductionDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pagination: { current: 1, pageSize: 20 },
      sorter: {},
      selectedRowKeys: [],
    };
  }

  componentDidMount() {
    this.initProductionDetail();
  }

  initProductionDetail = () => {
    const { dispatch, current: { id } } = this.props;
    const { pagination, sorter } = this.state;
    dispatch({
      type: 'factory/fetchProductionDetail',
      payload: {
        filters: { productionId: id },
        pagination,
        sorter,
        with: 'factoryProductItem',
      },
    });
  };

  handleStandardTableChange = (pagination, sorter) => {
    this.setState(
      {
        pagination,
        sorter,
      },
      () => this.initProductionDetail()
    );
  };

  onSelectChange = selectedRowKeys => {
    this.setState({
      'selectedRowKeys': selectedRowKeys
    });
  };

  handleStatus = key => {
    const { dispatch, refreshList } = this.props;
    const { selectedRowKeys } = this.state;
    dispatch({
      type: 'factory/changeProductionItemStatus',
      payload: { ids: selectedRowKeys, status: key },
      callback: res => {
        if(res.status === 'ok') {
          message.success('状态修改成功！');
          this.initProductionDetail();
          refreshList();
        }else {
          message.success('状态修改失败！');
        }
      },
    })
  };

  render() {
    const { loading, current, factory: { detailList } } = this.props;

    const { selectedRowKeys } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const columns = [
      {
        title: '工厂SKU',
        dataIndex: 'sku',
        render: (text, record) => {
          const { factory_product_item = {} } = record;
          // null也是值，会导致赋不上自定义的初值{}
          if(factory_product_item && Object.keys(factory_product_item).length !== 0) {
            return factory_product_item.sku;
          }
          return null;
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: text => {
          const filterStatus = statusList.filter(e => e.key === text);
          if(filterStatus && Object.keys(filterStatus).length !== 0) {
            let color = 'black';
            if(filterStatus[0].key === 'create') {
              color = 'blue'
            } else if (filterStatus[0].key === 'partfinished' || filterStatus[0].key === 'unfinished') {
              color = '#87d068'
            } else if (filterStatus[0].key === 'cancelled') {
              color = 'red'
            } else {
              color = 'black'
            }
            return <div style={{'color': color}}>{filterStatus[0].value}</div>;
          }
          return null;
        }
      },
      { title: '生产总量', dataIndex: 'qty' },
      { title: '入库量', dataIndex: 'finished_qty' },
      {
        title: '短溢装数量',
        dataIndex: 'unfinished_qty',
        render: text => {
          let color = 'black';
          if(text > 0) {
            color = '#87d068';
          } else if(text < 0) {
            color = 'red';
          } else {
            color = 'black';
          }
          return <div style={{'color': color}}>{text}</div>
        }
      },
      {
        title: '生产未完成量',
        dataIndex: 'un_qty',
        render: (text, record) => {
          if(record.status !== 'cancelled' && record.status !== 'finished') {
            if(record.unfinished_qty < 0) {
              return -(record.unfinished_qty);
            }
          }
          return 0;
        }
      },
    ];

    return (
      <Fragment>
        <Row gutter={24}>
          <Col span={6}>
            <Card>
              <Descriptions title={`订单号：${current.sn}`} style={{margin: '10px, 20px, 20px, 20px'}} column={1}>
                <Descriptions.Item label="创建时间">{current.created_at}</Descriptions.Item>
                <Descriptions.Item label="预计完成时间">{current.expect_finished_at}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col span={18}>
            <Card bordered={false}>
              <Button style={{ marginBottom: 10 }} type='primary' disabled={selectedRowKeys.length === 0} onClick={() => this.handleStatus('finished')}>生产完成</Button>
              <Button style={{ marginLeft: 20 }} type='primary' disabled={selectedRowKeys.length === 0} onClick={() => this.handleStatus('unfinished')}>生产中</Button>
              <Button style={{ marginLeft: 20 }} type='primary' disabled={selectedRowKeys.length === 0} onClick={() => this.handleStatus('cancelled')}>生产终止</Button>
              <StandardTable
                loading={loading}
                columns={columns}
                dataSource={detailList}
                rowSelection={rowSelection}
                onChange={this.handleStandardTableChange}
              />
            </Card>
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default ProductionDetail;
