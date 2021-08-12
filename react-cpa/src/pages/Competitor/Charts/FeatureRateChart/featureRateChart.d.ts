/*
 * @Author: wjw
 * @Date: 2020-11-13 17:17:22
 * @LastEditTime: 2020-11-13 17:24:21
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\Charts\FeatureRateChart\featureRateChart.d.ts
 */
export interface FeatureRating {
  name: string | undefined;
  rating: number | undefined;
}

export interface FeatureRateChartProps {
  featureRateChartData: FeatureRating[];
}
