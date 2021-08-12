/*
 * @Author: wjw
 * @Date: 2021-01-05 09:37:25
 * @LastEditTime: 2021-01-05 10:02:33
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Shop\Overview\Charts\TrendChart\trendChart.d.ts
 */

export interface DateTrend {
  date: string;
  change: number;
}

export interface TrendChartProps {
  height: number;
  style: {
    width: string;
    [key: string]: string;
  };
  data?: DateTrend[];
}
