import React, { useState, useEffect } from 'react';
import { AbortController } from 'umi-request';
import { Chart, Point, Legend, Axis, Tooltip } from 'bizcharts';
import { Card, Empty } from 'antd';
import { BubbleChartData } from './bubbleChart.d';
import { getBubbleChart } from './service';

const reg = /Red|IndianRed|DarkRed|Green|GreenYellow|LightGreen|DarkGreen|YellowGreen|Brown|Pink|LightPink|Orange|DarkOrange|Gold|Yellow|LightYellow|Blue|SkuBlue|LightBlue|White|Snow|Violet|Purple|Gray|Grey|LightGrey|DarkGray|Black/i;
const BubbleChart: React.FC<API.AsinSite> = ({ asinSite }) => {
  const [loading, setLoading] = useState(false);
  const [bubbleChartData, setBubbleChartData] = useState<BubbleChartData[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const fetchReviewTrend = async () => {
      setLoading(true);
      const { status, data } = await getBubbleChart({
        filters: { site_id: asinSite.currentOverview, product_id: asinSite.asinId },
        signal,
      });
      if (status === 'ok') {
        setBubbleChartData(data);
      }
      setLoading(false);
    };
    if (asinSite.asinId && asinSite.currentOverview) {
      fetchReviewTrend();
    }
    return () => controller.abort();
  }, [asinSite]);

  const scale = {
    rating: {
      alias: '平均评分',
      nice: true,
    },
    reviews: {
      alias: '评论数量',
    },
    size: {
      alias: '尺码',
    },
  };

  return (
    <Card bordered={false} bodyStyle={{ padding: 0 }} loading={loading}>
      <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 0 }}>Competitive Positioning Map</p>
      {bubbleChartData?.length && asinSite.currentOverview ? (
        <Chart
          height={400}
          data={bubbleChartData}
          autoFit
          scale={scale}
          interactions={['element-active']}
          padding="auto"
          appendPadding={[10, 0, 0, 20]}
        >
          <Axis name="size" title />
          <Axis name="rating" title={{ offset: 35 }} />
          <Legend name="reviews" visible={false} />
          <Tooltip>
            {(_, items: any) => {
              const { data: { rating = '', reviews = '', color = '', size = '' } = {} } =
                items[0] || {};
              const realColor = reg.exec(color)?.[0] || color;
              return (
                <div
                  style={{
                    zIndex: 8,
                    minWidth: 100,
                    position: 'absolute',
                    boxShadow: 'rgb(174, 174, 174) 0px 0px 20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 3,
                    color: 'rgb(87, 87, 87)',
                    fontSize: 12,
                    lineHeight: '20px',
                    padding: '10px 10px 6px',
                  }}
                >
                  <p>{size}</p>
                  <p style={{ margin: '5px 0' }}>
                    颜色:{' '}
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        display: 'inline-block',
                        backgroundColor: realColor,
                      }}
                    />
                    {color}
                  </p>
                  <p style={{ margin: '5px 0' }}>平均星评: {rating}</p>
                  <p style={{ margin: '5px 0' }}>评论总数: {reviews}</p>
                </div>
              );
            }}
          </Tooltip>
          <Point
            position="size*rating"
            color={['color', (val) => reg.exec(val)?.[0] || val]}
            shape="circle"
            size={['reviews', [4, 65]]}
            style={[
              'color',
              (val) => {
                let color = reg.exec(val)?.[0] || val;
                const lowerColor = color?.toLowerCase();
                if (lowerColor === 'white' || lowerColor === 'snow') {
                  color = 'Black';
                }
                return {
                  lineWidth: 1,
                  strokeOpacity: 1,
                  fillOpacity: 0.5,
                  stroke: color,
                };
              },
            ]}
          />
        </Chart>
      ) : (
        <Empty style={{ marginTop: 20 }} />
      )}
    </Card>
  );
};

export default BubbleChart;
