/*
 * @Author: wjw
 * @Date: 2020-11-04 17:30:46
 * @LastEditTime: 2021-01-06 10:42:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\competitor.d.ts
 */
export interface Overview {
  id: number;
  name: string;
}

export interface CompetitorProps {
  currentShop?: {
    id: number | undefined;
    asin: string | undefined;
  };
}
