/*
 * @Author: wjw
 * @Date: 2020-11-13 13:17:20
 * @LastEditTime: 2020-11-16 15:05:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\Charts\CategoryRankChart\CategoryRankChart.d.ts
 */

export interface CategoryRankChartProps extends API.AsinSite {
  range: string;
  setRange: (range: string) => void;
}

export interface CategoryRankData {
  date: string;
  name: string;
  rank: number;
}
