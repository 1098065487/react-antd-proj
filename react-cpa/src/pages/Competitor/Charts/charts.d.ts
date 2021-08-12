/*
 * @Author: wjw
 * @Date: 2020-11-13 16:48:15
 * @LastEditTime: 2020-11-13 16:54:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\Charts\charts.d.ts
 */
import { CountryReviews } from './ReviewNumChart/reviewNumChart.d';
import { FeatureRating } from './FeatureRateChart/featureRateChart.d';

export interface ChartsProps {
  reviewNumChartData: CountryReviews[];
  asinSite: API.AsinAndOverview;
  featureRateChartData: FeatureRating[];
}
