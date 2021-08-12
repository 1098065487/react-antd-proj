import React, { memo } from 'react';
import { Table, Card } from 'antd';
import { FormattedMessage } from 'umi-plugin-react/locale';
import styles from './index.less';

const columns = [
  {
    title: <FormattedMessage id="app.analysis.table.rank" defaultMessage="Rank" />,
    dataIndex: 'rank',
    render: (text) => {
      return <span className={`${styles.rankingItemNumber} ${text <= 3 ? styles.active : ''}`}>{text}</span>;
    },
  },
  {
    title: '商品sku',
    dataIndex: 'platform_sku',
    render: (text, record) => {
      const { seller_product_item } = record;
      return seller_product_item && seller_product_item.sku;
    },
  },
  {
    title: '月销量',
    dataIndex: 'quantity',
  },
];

const TopSearch = memo(({ loading, topSales }) => (
  <Card
    loading={loading}
    bordered={false}
    title='月热销商品'
    style={{ marginTop: 24 }}
  >
    <Table
      rowKey='rank'
      size="small"
      columns={columns}
      dataSource={topSales || []}
      pagination={false}
    />
  </Card>
));

export default TopSearch;
