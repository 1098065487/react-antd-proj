import React, { memo, useMemo } from 'react';
import { Table, Avatar, Button, message } from 'antd';
import moment from 'moment';
import { hideSku } from '../service';
import styles from './index.less';

interface DetailTableProps {
  current: any;
  range: any[];
  compare: boolean;
  compareRange: any[];
  rangeSize: number;
  compareRangeSize: number;
  siteList: any[];
  type: string;
  pref: any;
}

const DetailTable: React.FC<DetailTableProps> = (props) => {
  const {
    current,
    range,
    compare,
    compareRange,
    rangeSize,
    compareRangeSize,
    siteList,
    type,
    pref,
  } = props;

  const currentSite: any[] = siteList.filter((e) => e.id === current.site_id);

  const columns = useMemo(() => {
    const defaultColumns: any[] =
      type === 'detail'
        ? [
            {
              title: '指标',
              dataIndex: 'target',
              width: 90,
              fixed: 'left',
            },
          ]
        : [
            {
              title: 'SKU',
              dataIndex: 'target',
              width: 120,
              fixed: 'left',
              render: (_: any, record: any) => {
                return currentSite.length !== 0 ? (
                  <a
                    href={`${currentSite[0].domain}dp/${record.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {record.target}
                  </a>
                ) : (
                  <span>{record.target}</span>
                );
              },
            },
            {
              title: '库存',
              dataIndex: 'inventory_qty',
              width: 60,
              align: 'center',
            },
          ];
    let dynamicColumns: any[] = [];
    // const rangeSize = range[1].diff(range[0], 'month');
    const rangeStart = moment(range[0]).format('YYYY-MM');
    // 日期范围对比时
    if (compare) {
      // const compareRangeSize = compareRange[1].diff(compareRange[0], 'month');
      const compareRangeStart = moment(compareRange[0]).format('YYYY-MM');
      // 对比范围大于选中范围
      if (compareRangeSize > rangeSize) {
        for (let i = 0; i <= compareRangeSize; i += 1) {
          if (i <= rangeSize) {
            dynamicColumns.push({
              title: (
                <span style={{ fontSize: 12, color: '#333' }}>
                  {moment(rangeStart).add(i, 'month').format('YYYY-MM')} /{' '}
                  {moment(compareRangeStart).add(i, 'month').format('YYYY-MM')}
                </span>
              ),
              width: 160,
              children: [
                {
                  title: moment(rangeStart).add(i, 'month').format('YYYY-MM'),
                  dataIndex: moment(rangeStart).add(i, 'month').format('YYYY-MM'),
                  width: 80,
                  align: 'center',
                },
                {
                  title: moment(compareRangeStart).add(i, 'month').format('YYYY-MM'),
                  dataIndex: moment(compareRangeStart).add(i, 'month').format('YYYY-MM'),
                  width: 80,
                  align: 'center',
                  className: styles.compareColumns,
                },
              ],
            });
          } else {
            dynamicColumns.push({
              title: `(*) / ${moment(compareRangeStart).add(i, 'month').format('YYYY-MM')}`,
              dataIndex: moment(compareRangeStart).add(i, 'month').format('YYYY-MM'),
              width: 100,
              align: 'center',
              className: styles.compareColumns,
            });
          }
        }
      } else {
        // 选中范围大于等于对比范围
        for (let i = 0; i <= rangeSize; i += 1) {
          if (i <= compareRangeSize) {
            dynamicColumns.push({
              title: (
                <span style={{ fontSize: 12, color: '#333' }}>
                  {moment(rangeStart).add(i, 'month').format('YYYY-MM')} /{' '}
                  {moment(compareRangeStart).add(i, 'month').format('YYYY-MM')}
                </span>
              ),
              width: 160,
              children: [
                {
                  title: moment(rangeStart).add(i, 'month').format('YYYY-MM'),
                  dataIndex: moment(rangeStart).add(i, 'month').format('YYYY-MM'),
                  width: 80,
                  align: 'center',
                },
                {
                  title: moment(compareRangeStart).add(i, 'month').format('YYYY-MM'),
                  dataIndex: moment(compareRangeStart).add(i, 'month').format('YYYY-MM'),
                  width: 80,
                  align: 'center',
                  className: styles.compareColumns,
                },
              ],
            });
          } else {
            dynamicColumns.push({
              title: `${moment(rangeStart).add(i, 'month').format('YYYY-MM')} / (*)`,
              dataIndex: moment(rangeStart).add(i, 'month').format('YYYY-MM'),
              width: 100,
              align: 'center',
            });
          }
        }
      }
    } else {
      // 不对比时
      for (let i = 0; i <= rangeSize; i += 1) {
        dynamicColumns.push({
          title: moment(range[0]).add(i, 'month').format('YYYY-MM'),
          dataIndex: moment(range[0]).add(i, 'month').format('YYYY-MM'),
          width: 80,
          align: 'center',
        });
      }
    }

    return defaultColumns.concat(dynamicColumns);
  }, [range, compare, compareRange, rangeSize, compareRangeSize, type]);

  const renderTableScroll = useMemo(() => {
    if (!compare) {
      if (type === 'detail') {
        return document.documentElement.clientWidth - 250 - 32 - 16 - 200 <
          (rangeSize + 1) * 80 + 90 + 90
          ? { x: (rangeSize + 1) * 80 + 90 + 90 }
          : undefined;
      }
      return document.documentElement.clientWidth - 250 - 32 - 16 - 200 < (rangeSize + 1) * 80 + 90
        ? { x: (rangeSize + 1) * 80 + 90 }
        : undefined;
    }
    let double = rangeSize;
    let single = compareRangeSize - rangeSize;
    if (rangeSize > compareRangeSize) {
      double = compareRangeSize;
      single = rangeSize - compareRangeSize;
    }
    if (type === 'detail') {
      return document.documentElement.clientWidth - 250 - 32 - 16 - 200 <
        (double + 1) * 160 + single * 100 + 90 + 90
        ? { x: (double + 1) * 160 + single * 100 + 90 + 90 }
        : undefined;
    }
    return document.documentElement.clientWidth - 250 - 32 - 16 - 200 <
      (double + 1) * 160 + single * 100 + 90
      ? { x: (double + 1) * 160 + single * 100 + 90 }
      : undefined;
  }, [compare, rangeSize, compareRangeSize, type]);

  const handleShowClick = async (id: number) => {
    const res = await hideSku(id);
    if (res.status === 'ok') {
      message.success('隐藏该sku数据成功！');
      if (pref.current) {
        pref.current.reset(true);
      }
    } else {
      message.error('隐藏该sku数据失败！');
    }
  };

  return (
    <div className={styles.tableContent}>
      <div className={styles.leftCol}>
        <Avatar src={current.thumbnail} style={{ marginLeft: 50 }} shape="square" size={100} />
        <div className={styles.sku}>
          <h5>
            {currentSite.length !== 0 ? (
              <a
                href={`${currentSite[0].domain}dp/${current.asin}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {current.sku}
              </a>
            ) : (
              <span>{current.sku}</span>
            )}
          </h5>
          <Button onClick={() => handleShowClick(current.id)} size="small">
            隐藏
          </Button>
        </div>
        <div className={styles.infoList}>
          <div className={styles.leftTitle}>评论总数:</div>
          <div className={styles.rightContent}>{current.reviews}</div>
        </div>
        <div className={styles.infoList}>
          <div className={styles.leftTitle}>评分:</div>
          <div className={styles.rightContent}>{current.rating}</div>
        </div>
        <div className={styles.infoList}>
          <div className={styles.leftTitle}>复购率:</div>
          <div className={styles.rightContent}>{`${
            Math.round(current.repurchase_rate * 100) / 100
          }%`}</div>
        </div>
        <div className={styles.infoList}>
          <div className={styles.leftTitle}>退货率:</div>
          <div className={styles.rightContent}>{`${
            Math.round(current.refund_rate * 100) / 100
          }%`}</div>
        </div>
        <div className={styles.infoList}>
          <div className={styles.leftTitle}>库存:</div>
          <div className={styles.rightContent}>{current.fulfillable_qty}</div>
        </div>
      </div>
      <div className={styles.rightCol}>
        <Table
          className={styles.innerTable}
          size="small"
          columns={columns as any}
          rowKey="key"
          bordered
          dataSource={type === 'detail' ? current.monthlyData : current.itemMonthlyData}
          pagination={false}
          scroll={renderTableScroll}
        />
      </div>
    </div>
  );
};

export default memo(DetailTable);
