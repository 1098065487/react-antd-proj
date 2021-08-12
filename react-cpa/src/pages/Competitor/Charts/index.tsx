import React, { useState } from 'react';
import ReviewNumChart from './ReviewNumChart';
import ReviewTrendChart from './ReviewTrendChart';
import FeatureRateChart from './FeatureRateChart';
import CategoryRankChart from './CategoryRankChart';
import { ChartsProps } from './charts.d'

const Charts: React.FC<ChartsProps> = ({ asinSite, reviewNumChartData, featureRateChartData }) => {
  const [range, setRange] = useState('2years');
  return (
    <>
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <ReviewNumChart reviewNumChartData={reviewNumChartData} />
        <ReviewTrendChart asinSite={asinSite} range={range} setRange={setRange} />
      </div>
      <div style={{ display: 'flex' }}>
        <FeatureRateChart featureRateChartData={featureRateChartData} />
        <CategoryRankChart asinSite={asinSite} range={range} setRange={setRange} />
      </div>
    </>
  );
};

export default Charts;
