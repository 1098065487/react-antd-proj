import React, { useState, useEffect } from 'react';
import { AbortController } from 'umi-request';
import { Radio, Card, Empty } from 'antd';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import moment from 'moment';
import { ReviewTrendData } from './reviewTrendChart.d';
import { getReviewTrend } from './service';
import styles from '../../Charts/ReviewTrendChart/index.less';

const cols = {
  date: {
    alias: '日期',
    type: 'time',
  },
  reviews: {
    alias: '子SKU评论数量',
  },
};

const ReviewTrendChart: React.FC<API.AsinSite> = ({ asinSite }) => {
  const [range, setRange] = useState('2years');
  const [loading, setLoading] = useState(false);
  const [reviewTrendData, setReviewTrendData] = useState<ReviewTrendData[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const fetchReviewTrend = async () => {
      setLoading(true);
      const dataRange = [];
      if (range !== 'all') {
        dataRange[0] = moment().subtract(range.slice(0, 1), range.slice(1)).format('YYYY-MM-DD');
        dataRange[1] = moment().format('YYYY-MM-DD');
      }
      const { status, data } = await getReviewTrend({
        id: asinSite.asinId,
        filters: { site_id: asinSite.currentOverview, range: dataRange },
        signal,
      });
      if (status === 'ok') {
        setReviewTrendData(data);
      }
      setLoading(false);
    };
    if (asinSite.asinId && asinSite.currentOverview) {
      fetchReviewTrend();
    }
    return () => controller.abort();
  }, [range, asinSite]);

  return (
    <Card bordered={false} bodyStyle={{ padding: 0 }} loading={loading}>
      {reviewTrendData?.length && asinSite.currentOverview ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <Radio.Group
              defaultValue="overview"
              value={range}
              buttonStyle="solid"
              style={{ display: 'flex' }}
              className={styles.timeRadioGroup}
              onChange={(e) => setRange(e.target.value)}
            >
              <Radio.Button value="1months">1M</Radio.Button>
              <Radio.Button value="6months">6M</Radio.Button>
              <Radio.Button value="1years">1Y</Radio.Button>
              <Radio.Button value="2years">2Y</Radio.Button>
              <Radio.Button value="all">全部</Radio.Button>
            </Radio.Group>
          </div>
          <Chart
            height={240}
            data={reviewTrendData}
            scale={cols}
            autoFit
            padding="auto"
            appendPadding={[20, 0, 0, 0]}
          >
            <Legend />
            <Axis
              name="date"
              tickLine={reviewTrendData.length === 0 ? null : {}}
              label={reviewTrendData.length === 0 ? null : {}}
            />
            <Axis name="reviews" title />
            <Geom type="line" shape="smooth" position="date*reviews" size={2} color="attr" />
            <Tooltip showCrosshairs crosshairs={{ type: 'x' }} />
          </Chart>
        </>
      ) : (
        <Empty style={{ marginTop: 20 }} />
      )}
    </Card>
  );
};

export default ReviewTrendChart;
