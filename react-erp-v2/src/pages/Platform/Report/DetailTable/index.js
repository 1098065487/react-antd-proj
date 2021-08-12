import React, { PureComponent } from 'react';
import { Avatar, Table } from 'antd';
import { connect } from 'dva';

import defaultImg from '@/assets/product.webp';
import _ from 'lodash';
import moment from 'moment';
// 获取跳转连接公共方法
import { getLinkSuffix } from '@/utils/utils';
import DailyChart from '../Daily';
import styles from '../index.less';

@connect(({ platform, loading }) => ({
  platform,
  loading: loading.effects['platform/fetchProductReports'],
}))
class DetailTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getMonthCols = (start, end, record) => {
    const { refresh } = this.props;
    const result = [];
    const colSpan = end - start + 1;

    const firstRender = (value, row, index) => {
      if (index < record.monthlyData.length - 1) {
        return value;
      }
      return {
        children: <DailyChart dataSource={row} id={record.id} refresh={refresh} />,
        props: { colSpan },
      };
    };

    const renderContent = (value, row, index) => {
      const obj = {
        children: value,
        props: {},
      };
      if (index === record.monthlyData.length - 1) {
        obj.props.colSpan = 0;
      }
      return obj;
    };
    for (let i = start; i <= end; i += 1) {
      const month = moment()
        .add(i, 'months')
        .format('YYYY-MM');
      result.push({
        title: month,
        dataIndex: month,
        width: 80,
        render: i === start ? firstRender : renderContent,
      });
    }
    return result;
  };

  render() {
    const { current, start, end, compareCheck } = this.props;

    // 获取对应跳转链接后缀
    const { platform_id, platform_sn } = current;
    const { suffix, flag } = getLinkSuffix(platform_id, platform_sn);

    const monthCols = this.getMonthCols(start, end, current);
    const columns = _.concat(
      [
        {
          title: '指标',
          dataIndex: 'target',
          width: 90,
          fixed:
            document.documentElement.clientWidth - 48 - 16 - 200 >= 90 + (end - start + 1) * 80
              ? false
              : 'left',
        },
      ],
      monthCols
    );

    return (
      <div className={styles.tableContent}>
        <div className={styles.leftCol}>
          <Avatar
            src={current.thumbnail || defaultImg}
            style={{ marginLeft: 20 }}
            shape="square"
            size={150}
          />
          <h5>
            {flag ? (
              <a
                href={`https://www.amazon.${suffix}/dp/${platform_sn}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {current.spu}
              </a>
            ) : (
              <span>{current.spu}</span>
            )}
          </h5>
          <div className={styles.infoList}>
            <div className={styles.leftTitle}>评论总数:</div>
            <div className={styles.rightContent}>{current.reviews_count}</div>
          </div>
          <div className={styles.infoList}>
            <div className={styles.leftTitle}>评分:</div>
            <div className={styles.rightContent}>{current.rating}</div>
          </div>
          <div className={styles.infoList}>
            <div className={styles.leftTitle}>复购率:</div>
            <div className={styles.rightContent}>{`${current.repurchase_rate}%`}</div>
          </div>
          <div className={styles.infoList}>
            <div className={styles.leftTitle}>退货率:</div>
            <div className={styles.rightContent}>{`${current.return_rate}%`}</div>
          </div>
          <div className={styles.infoList}>
            <div className={styles.leftTitle}>库存:</div>
            <div className={styles.rightContent}>{current.inventoryQty}</div>
          </div>
          <div className={styles.infoList}>
            <div className={styles.leftTitle}>产品分类:</div>
            <div className={styles.rightContent}>
              {current.category ? current.category.name : null}
            </div>
          </div>
          <div className={styles.infoList}>
            <div className={styles.leftTitle}>产品周期:</div>
            <div className={styles.rightContent}>
              {current.attribute_values && current.attribute_values.length !== 0
                ? current.attribute_values[0].value
                : null}
            </div>
          </div>
          <div className={styles.infoList}>
            <div className={styles.leftTitle}>产品分级:</div>
            <div className={styles.rightContent}>
              {current.attribute_values && current.attribute_values.length > 1
                ? current.attribute_values[1].value
                : null}
            </div>
          </div>
        </div>
        <div className={styles.rightCol}>
          <Table
            className={styles.innerTable}
            bordered={false}
            size="small"
            columns={columns}
            rowKey="key"
            dataSource={current.monthlyData}
            rowClassName={record =>
              !compareCheck && record.key === 'compare_amount' ? styles.compareData : ''
            }
            pagination={false}
            scroll={
              document.documentElement.clientWidth - 48 - 16 - 200 >= 90 + (end - start + 1) * 80
                ? undefined
                : { x: 90 + (end - start + 1) * 80 }
            }
          />
        </div>
      </div>
    );
  }
}

export default DetailTable;
