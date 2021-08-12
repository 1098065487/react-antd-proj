/*
 * @Author: wjw
 * @Date: 2020-11-05 10:58:34
 * @LastEditTime: 2020-12-03 14:24:58
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\ColorSizeTable\colorSizeTable.d.ts
 */
export interface ColorSizeItem {
  id: number;
  rating: number;
  rating_week_change: number;
  reviews: number;
  reviews_week_change: number;
  color: string;
  size: string;
  five_weight: number;
  proportion: number;
}