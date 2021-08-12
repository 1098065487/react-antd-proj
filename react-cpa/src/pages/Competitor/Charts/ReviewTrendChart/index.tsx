import React, { useEffect, useState } from 'react';
import { AbortController } from 'umi-request';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import { Radio, Card, Empty } from 'antd';
import moment from 'moment';
import { ReviewTrendChartProps, ReviewTrendData } from './reviewTrendChart.d';
import { getReviewTrend } from './service';
import styles from './index.less';

const ReviewTrendChart: React.FC<ReviewTrendChartProps> = ({ asinSite, range, setRange }) => {
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

  let chartIns: any = null;
  const scale = {
    date: {
      alias: '日期',
      type: 'time',
    },
    rating: {
      alias: '评分',
    },
    reviews: {
      alias: '评论数量',
    },
  };
  return (
    <Card
      style={{ width: 'calc(65% - 20px)' }}
      bordered={false}
      bodyStyle={{ padding: 0 }}
      loading={loading}
    >
      <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 0, float: 'left' }}>Review趋势</p>
      {reviewTrendData?.length && asinSite.currentOverview ? (
        <>
          <div style={{ float: 'right' }}>
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
          <div style={{ clear: 'both' }} />
          <Chart
            height={240}
            data={reviewTrendData}
            scale={scale}
            padding="auto"
            appendPadding={[20, 0, 0, 0]}
            autoFit
            onGetG2Instance={(chart: any) => {
              chartIns = chart;
            }}
          >
            <Legend
              allowAllCanceled={false}
              custom
              items={[
                {
                  value: 'reviews',
                  name: '评论数量',
                  marker: {
                    style: { fill: 'rgb(32, 197, 197)' },
                  },
                },
                {
                  value: 'rating',
                  name: '评分',
                  marker: {
                    style: { fill: '#1890FF' },
                  },
                },
              ]}
              onChange={(ev) => {
                if (ev) {
                  const { item } = ev;
                  const { value } = item;
                  const checked = !item.unchecked;
                  const geoms = chartIns.geometries;
                  for (let i = 0; i < geoms.length; i += 1) {
                    const geom = geoms[i];
                    if (geom.getYScale().field === value) {
                      if (checked) {
                        geom.show();
                      } else {
                        geom.hide();
                      }
                    }
                  }
                }
              }}
            />
            <Axis
              name="date"
              tickLine={reviewTrendData.length === 0 ? null : {}}
              label={reviewTrendData.length === 0 ? null : {}}
            />
            <Axis name="reviews" />
            <Axis name="rating" />
            <Tooltip shared showCrosshairs crosshairs={{ type: 'x' }} />
            <Geom
              type="line"
              shape="smooth"
              position="date*reviews"
              size={2}
              color="rgb(32, 197, 197)"
            />
            <Geom type="line" shape="smooth" position="date*rating" size={2} color="#1890FF" />
            {/* <Geom type='point' position='date*reviews' size={2} color="rgb(32, 197, 197)" /> */}
            {/* <Geom type='point' position='date*rating' size={2} color="#1890FF" /> */}
          </Chart>
        </>
      ) : (
        <Empty style={{ marginTop: 20, clear: 'both' }} />
      )}
    </Card>
  );
};

export default ReviewTrendChart;
