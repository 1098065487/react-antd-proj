import React, { PureComponent } from 'react';
import { Form, Table, Card, Button, Skeleton, Icon, Tag, Popover, } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import FooterToolbar from '@/components/FooterToolbar';
import DescriptionList from '@/components/DescriptionList';
import styles from './style.less';

const { Description } = DescriptionList;

const statusList = [
  { key: 1, label: '在售', value: 1, },
  { key: 0, label: '淘汰', value: 0 },
];

@connect(({ spec, product, factory, loading }) => ({
  spec,
  product,
  factory,
  loading: loading.effects['product/fetchOne'],
}))
@Form.create()
class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const { match: { params } } = this.props;
    this.state = {
      params,
      current: {},
      dataSource: [],
    };
  }

  componentDidMount() {
    this.initProduct();
  }

  initProduct = () => {
    const { dispatch } = this.props;
    const { params: { id } } = this.state;
    dispatch({
      type: 'product/fetchOne',
      payload: { id, params: { with: ['brand', 'category', 'unit', 'items.factoryProductItems'] } },
      callback: res => {
        const { items = [] } = res;
        this.setState({
          current: res,
          dataSource: items,
        })
      }
    });
  };

  renderFactorySku = list => {
    if (Object.keys(list).length !== 0) {
      return list.map(item =>
        <Tag
          style={{ display: 'inline-block', marginBottom: 2 }}
          key={item.id}
          color="blue"
        >
          {item.sku}
        </Tag>
      );
    }
    return null;
  };

  renderStatus = record => {
    if(record || record === 0) {
      if(statusList.filter(e => e.key === record).length !== 0) {
        return statusList.filter(e => e.key === record)[0].label;
      }
    }
    return null;
  };

  backStep = () => {
    const { params: { id } } = this.state;
    router.push(`/products/product/${id}/items`);
  };

  render() {
    const { loading } = this.props;
    const { current, dataSource } = this.state;

    const columns = [
      { title: '系统编号', dataIndex: 'id' },
      { title: '颜色', dataIndex: 'color', },
      { title: '尺码', dataIndex: 'size', },
      { title: '子SKU', dataIndex: 'sku' },
      {
        title: '工厂SKU',
        dataIndex: 'factory_product_items',
        width: 200,
        render: text => this.renderFactorySku(text),
      },
      {
        title: '产品状态',
        dataIndex: 'selling_status',
        render: text => this.renderStatus(text),
      },
      {
        title: '备注',
        dataIndex: 'note',
        render: text => {
          if(text) {
            const content = <div style={{whiteSpace: 'pre-wrap'}} dangerouslySetInnerHTML={{ __html: text.replace(new RegExp('↵', 'gm'), '\n') }} />;
            return (<Popover content={content}>
              <p
                style={{
                  marginBottom: 0,
                  fontSize: 14,
                  width: 100,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {text}
              </p>
            </Popover>)
          }
          return null;
        }
      },
      { title: '已入库库存', dataIndex: 'qty' },
      { title: '在产库存', dataIndex: 'production_qty' },
      { title: '修改时间', dataIndex: 'updated_at' },
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
        <Card style={{ marginTop: 12 }}>
          <Table
            size="small"
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            rowClassName={record => (record.editable ? styles.editable : '')}
          />
        </Card>
        <FooterToolbar>
          <Button
            onClick={() => router.push('/products/product')}
            style={{ width: 90 }}
          >
            返回
          </Button>
          <Button
            type="primary"
            onClick={this.backStep}
            style={{ width: 120 }}
          >
            <Icon type="left" />上一步
          </Button>
          <Button
            type="primary"
            onClick={() => router.push('/products/product')}
            style={{ width: 90 }}
          >
            完成
          </Button>
        </FooterToolbar>
      </Skeleton>
    );
  }
}

export default Detail;
