import React, { useState, useEffect } from 'react';
import { AbortController } from 'umi-request';
import { Chart, Geom, Axis, Tooltip, Legend, Coordinate } from 'bizcharts';
import moment from 'moment';
import { Card, Empty } from 'antd';
import { CategoryRankChartProps, CategoryRankData } from './categoryRankChart.d';
import { getCategoryRank } from './service';

const CategoryRankChart: React.FC<CategoryRankChartProps> = ({ asinSite, range }) => {
  const [loading, setLoading] = useState(false);
  const [categoryRankData, setCategoryRankData] = useState<CategoryRankData[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const fetchCategoryRank = async () => {
      setLoading(true);
      const dataRange = [];
      if (range !== 'all') {
        dataRange[0] = moment().subtract(range.slice(0, 1), range.slice(1)).format('YYYY-MM-DD');
        dataRange[1] = moment().format('YYYY-MM-DD');
      }
      const { status, data } = await getCategoryRank({
        id: asinSite.asinId,
        filters: { site_id: asinSite.currentOverview, range: dataRange },
        signal,
      });
      if (status === 'ok') {
        setCategoryRankData(data);
      }
      setLoading(false);
    };
    if (asinSite.asinId && asinSite.currentOverview) {
      fetchCategoryRank();
    }
    return () => controller.abort();
  }, [range, asinSite]);
  const cols = {
    date: {
      alias: '日期',
      type: 'time',
    },
    rank: {
      alias: '排名',
    },

  };
  return (
    <Card
      style={{ width: 'calc(65% - 20px)' }}
      bordered={false}
      bodyStyle={{ padding: 0 }}
      loading={loading}
    >
      <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 0 }}>各分类排名</p>
      {categoryRankData?.length && asinSite.currentOverview ? (
        <Chart
          height={240}
          data={categoryRankData}
          scale={cols}
          autoFit
          padding="auto"
          appendPadding={[20, 0, 0, 0]}
        >
          <Legend />
          <Axis
            name="date"
            tickLine={categoryRankData.length === 0 ? null : {}}
            label={categoryRankData.length === 0 ? null : {}}
            position="top"
          />
          <Axis name="rank" />
          <Tooltip shared showCrosshairs crosshairs={{ type: 'x' }} />
          <Geom type="line" shape="smooth" position="date*rank" size={2} color="name" />
          <Coordinate reflect="y" />
        </Chart>
      ) : (
          <Empty style={{ marginTop: 20 }} />
        )}
    </Card>
  );
};

export default CategoryRankChart;
