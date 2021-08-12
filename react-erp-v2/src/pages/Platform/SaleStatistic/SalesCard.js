import React, { memo } from 'react';
import { Row, Col, Card } from 'antd';
import numeral from 'numeral';
import styles from './index.less';
import { Bar } from '@/components/Charts';

const SalesCard = memo((
  {
    yearSalesData,
    platformList,
    loading,
  }) => (
    <Card
      loading={loading}
      bordered={false}
      bodyStyle={{ padding: 0, marginTop: 24 }}
      title='销售额'
    >
      <div className={styles.salesCard}>
        <Row>
          <Col xl={16} lg={12} md={12} sm={24} xs={24}>
            <div className={styles.salesBar}>
              <Bar
                height={420}
                title='月销售趋势'
                data={yearSalesData}
              />
            </div>
          </Col>
          <Col xl={8} lg={12} md={12} sm={24} xs={24}>
            <div className={styles.salesRank}>
              <h4 className={styles.rankingTitle}>
                销售渠道销售额排名
              </h4>
              <ul className={styles.rankingList}>
                {platformList.map((item, i) => (
                  <li key={item.platform_id}>
                    <span className={`${styles.rankingItemNumber} ${i < 3 ? styles.active : ''}`}>{i + 1}</span>
                    <span className={styles.rankingItemTitle} title={item.platform_name}>{item.platform_name}</span>
                    <span className={styles.rankingItemValue}>{numeral(item.amount).format('0,0.00')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  ),
);

export default SalesCard;
