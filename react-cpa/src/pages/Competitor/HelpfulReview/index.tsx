import React, { useEffect, useState } from 'react';
import { AbortController } from 'umi-request';
import { Card, Tooltip } from 'antd';
import { KeepDecimals } from '@/utils/utils';
import styles from './index.less';
import { getHelpfulData } from './service';
import { HelpfulReviewData } from './helpfulReview.d';

const reflect = { five: 5, four: 4, three: 3, two: 2, one: 1 };
const initData = {
  proportion: { five: 0, four: 0, three: 0, two: 0, one: 0, all: 0 },
  weight: { five: 0, four: 0, three: 0, two: 0, one: 0, all: 0 },
};
const HelpfulReview: React.FC<API.AsinSite> = ({ asinSite }) => {
  const [loading, setLoading] = useState(false);
  const [helpfulData, setHelpfulData] = useState<HelpfulReviewData>(initData);
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const fetchHelpfulData = async () => {
      setLoading(true);
      const { status, data } = await getHelpfulData({
        id: asinSite.asinId,
        filters: { site_id: asinSite.currentOverview },
        signal,
      });
      if (status === 'ok') {
        setHelpfulData(data);
      }
      setLoading(false);
    };
    if (asinSite.asinId && asinSite.currentOverview) {
      fetchHelpfulData();
    } else {
      setHelpfulData(initData);
    }
    return () => controller.abort();
  }, [asinSite]);
  return (
    <Card bordered={false} bodyStyle={{ padding: 0 }} loading={loading}>
      <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 5 }}>Helpful占比与权重</p>
      <div style={{ fontSize: 12 }}>
        <div style={{ display: 'flex' }}>
          {helpfulData?.proportion &&
            Object.keys(helpfulData.proportion).map((star, index) => {
              if (star !== 'all') {
                return (
                  <div style={{ flex: 1 }} key={index}>
                    <p className={styles.explantion}>
                      <Tooltip title={`${reflect[star]}星helpful评论数 / 有helpful的总评论数`}>
                        <span>{reflect[star]}星help评论数</span>
                      </Tooltip>
                    </p>
                    <span className={styles.percentage}>
                      {KeepDecimals(helpfulData.proportion[star] / helpfulData.proportion.all || 0)}
                    </span>
                  </div>
                );
              }
              return null;
            })}
        </div>
        <div style={{ display: 'flex', marginTop: 10 }}>
          {helpfulData?.weight &&
            Object.keys(helpfulData.weight).map((star, index) => {
              if (star !== 'all') {
                return (
                  <div style={{ flex: 1 }} key={index}>
                    <p className={styles.explantion}>
                      <Tooltip title={`${reflect[star]}星评论的helpful点击数 / 总helpful的点击数`}>
                        <span>{reflect[star]}星评论的helpful点击数</span>
                      </Tooltip>
                    </p>
                    <span className={styles.percentage}>
                      {KeepDecimals(helpfulData.weight[star] / helpfulData.weight.all || 0)}
                    </span>
                  </div>
                );
              }
              return null;
            })}
        </div>
      </div>
    </Card>
  );
};

export default HelpfulReview;
