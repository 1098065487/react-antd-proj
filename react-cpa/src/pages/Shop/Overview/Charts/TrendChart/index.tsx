import React from 'react';
import { Chart, Interval, Legend, Axis } from 'bizcharts';
import { TrendChartProps } from './trendChart';

const TrendChart: React.FC<TrendChartProps> = ({ height, style, data }) => {
  const scale = {
    date: {
      type: 'timeCat'
    },
    change: {
      alias: '当天数量',
      minTickInterval: 1
    },
  };
  return (
    <div style={style}>
      <Chart height={height} autoFit data={data} padding="auto" appendPadding={[0, 20, 0, 0]} scale={scale}>
        <Legend visible={false} />
        <Axis name="date" visible={false} />
        <Interval
          position="date*change"
          color={[
            'change',
            (change) => {
              if (change > 0) {
                return '#4fae33';
              }
              return '#d2562c';
            },
          ]}
        />
      </Chart>
    </div>
  );
};

export default TrendChart;
