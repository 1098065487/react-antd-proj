/*
 * @Author: wjw
 * @Date: 2020-11-13 13:14:00
 * @LastEditTime: 2020-11-16 15:02:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\Charts\ReviewTrendChart\reviewTrendChart.d.ts
 */

export interface ReviewTrendChartProps extends API.AsinSite {
  range: string;
  setRange: (range: string) => void;
}

export interface ReviewTrendData {
  date: string;
  rating: number;
  reviews: number;
}
