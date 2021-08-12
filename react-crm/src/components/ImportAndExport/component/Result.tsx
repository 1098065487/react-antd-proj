import React from 'react';
import { Divider } from 'antd';
import { Chart, Coordinate, Axis, Interval, Tooltip, Interaction, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
import { apiHost } from '@/utils/http';
import styles from '../index.less';

const Result: React.FC<{ data: any }> = props => {
  const colors = ['#00C853', '#FFAB00', '#F44336'];

  const { data: { total = 0, success = 0, skip = 0, error = 0, error_file = '' } } = props;
  const chartData = [
    {
      x: 'success',
      y: success,
      color: colors[0],
    },
    {
      x: 'skip',
      y: skip,
      color: colors[1],
    },
    {
      x: 'error',
      y: error,
      color: colors[2],
    }
  ];

  const { DataView } = DataSet;
  const dv = new DataView();

  dv.source(chartData).transform({
    type: "percent",
    field: "y",
    dimension: "x",
    as: "percent"
  });

  const cols = {
    percent: {
      formatter: (val: any) => {
        val = val * 100 + "%";
        return val;
      }
    }
  };

  return (
    <div className={styles.result_content}>
      <div className={styles.chart}>

        <Chart height={160} data={dv} scale={cols} autoFit>
          <Coordinate type="theta" radius={1} innerRadius={0.8} />
          <Tooltip showTitle={false} />
          <Axis visible={false} />
          <Interval
            position="percent"
            adjust="stack"
            color={['x', colors]}
            style={{
              lineWidth: 1,
              stroke: '#fff',
            }}
          />
          <Legend visible={false} />
          <Interaction type='element-single-selected' />
        </Chart>

        <div className={styles.annotation}>
          <h3>导入结果</h3>
          <p>{total}</p>
        </div>

      </div>
      <div className={styles.legend}>
        <ul>
          {chartData.map((item) => (
            <li key={item.x}>
              <span
                className={styles.dot}
                style={{
                  backgroundColor: item.color,
                }}
              />
              <span className={styles.legendTitle}>{item.x}</span>
              <Divider type="vertical" />
              <span className={styles.percent}>
                {`${(item.y * 100 % total !== 0) ? (item.y / total * 100).toFixed(2) : (item.y / total * 100)}%`}
              </span>
              <span className={styles.value}>{item.y}</span>
            </li>
          ))}
        </ul>
        {error_file !== '' ? (
          <a className={styles.error_download} href={`${apiHost}/storage/${error_file}`} rel="noreferrer" target='_blank'>下载错误数据</a>
        ) : null}
      </div>
    </div>
  );
};

export default Result;
