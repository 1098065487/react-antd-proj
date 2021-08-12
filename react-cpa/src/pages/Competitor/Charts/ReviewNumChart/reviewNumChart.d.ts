/*
 * @Author: wjw
 * @Date: 2020-11-13 16:44:00
 * @LastEditTime: 2020-11-13 17:06:27
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\Charts\ReviewNumChart\reviewNumChart.d.ts
 */

export interface CountryReviews {
  name: string | undefined;
  reviews: number | undefined;
}

export interface ReviewNumChartProps {
  reviewNumChartData: CountryReviews[];
}
