import React, { useEffect, useRef } from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import StandardTable from '@/components/StandardTable';
import { KeepDecimals, keepOne } from '@/utils/utils';
import { ColorSizeItem } from './colorSizeTable.d';
import { getColorSizeList } from './service';
import BubbleChart from './BubbleChart';
import ReviewTrendChart from './ReviewTrendChart';

const reg = /Red|IndianRed|DarkRed|Green|GreenYellow|LightGreen|DarkGreen|YellowGreen|Brown|Pink|LightPink|Orange|DarkOrange|Gold|Yellow|LightYellow|Blue|SkuBlue|LightBlue|White|Snow|Violet|Purple|Gray|Grey|LightGrey|DarkGray|Black/i;
// 获取7天变化趋势
const getTrend = (value: number) => {
  if (value > 0) {
    return (
      <span style={{ fontSize: '12px' }}>
        <ArrowUpOutlined style={{ color: 'var(--up-color)' }} />
        <span style={{ color: 'var(--up-color)' }}>{keepOne(Math.abs(value))}</span>
      </span>
    );
  }
  return value < 0 ? (
    <span style={{ fontSize: '12px' }}>
      <ArrowDownOutlined style={{ color: 'var(--down-color)' }} />
      <span style={{ color: 'var(--down-color)' }}>{keepOne(Math.abs(value))}</span>
    </span>
  ) : null;
};

const ColorSizeTable: React.FC<API.AsinSite> = ({ asinSite }) => {
  const tableRef: any = useRef(null);
  const isFirstLoad: any = useRef(true);
  const fetchColorSizeList = (params: any) => {
    return getColorSizeList({
      ...params,
      filters: { product_id: asinSite.asinId, site_id: asinSite.currentOverview },
    });
  };

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    } else if (asinSite.asinId && asinSite.currentOverview) {
      tableRef?.current?.reset(true);
    }
  }, [asinSite]);

  const columns: ColumnsType<ColorSizeItem> = [
    {
      title: '颜色',
      dataIndex: 'color',
      width: 80,
      render: (color) => {
        const realColor = reg.exec(color)?.[0] || color;
        return (
          <>
            <span
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: realColor,
                display: 'inline-block',
              }}
            />
            <span>{color}</span>
          </>
        );
      },
    },
    {
      title: '尺码',
      dataIndex: 'size',
    },
    {
      title: '星评',
      dataIndex: 'rating',
      width: 70,
      render: (_, { rating, rating_week_change }) => {
        return (
          <p style={{ display: 'flex', alignItems: 'flex-end' }}>
            <span>{rating}</span>
            {getTrend(rating_week_change)}
          </p>
        );
      },
    },
    {
      title: '数量',
      dataIndex: 'reviews',
      width: 70,
      render: (_, { reviews, reviews_week_change }) => {
        return (
          <p style={{ display: 'flex', alignItems: 'flex-end' }}>
            <span>{reviews}</span>
            {getTrend(reviews_week_change)}
          </p>
        );
      },
    },
    {
      title: '5星权重',
      dataIndex: 'five_weight',
      render: (five_weight: number) => {
        return KeepDecimals(five_weight);
      },
    },
    {
      title: '占比',
      dataIndex: 'proportion',
      render: (proportion: number) => {
        return KeepDecimals(proportion);
      },
    },
  ];
  return (
    <>
      <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 0 }}>颜色尺码分布</p>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, marginRight: 10 }}>
          <StandardTable
            cref={tableRef}
            request={asinSite.currentOverview && asinSite.asinId && fetchColorSizeList}
            rowKey="attr"
            bordered={false}
            columns={columns}
            paginationConfig={{ showQuickJumper: false, showSizeChanger: false }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <BubbleChart asinSite={asinSite} />
        </div>
      </div>
      <ReviewTrendChart asinSite={asinSite} />
    </>
  );
};

export default ColorSizeTable;
