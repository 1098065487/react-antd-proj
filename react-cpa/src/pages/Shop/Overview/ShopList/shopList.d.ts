/*
 * @Author: wjw
 * @Date: 2020-11-04 15:37:07
 * @LastEditTime: 2021-01-08 17:14:57
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\AsinList\asinList.d.ts
 */

export interface Shop {
  id: number;
  detail: any;
  link: string;
  shop: {
    id: number;
    asin: string;
    name: string;
  };
  top_id: number;
}

export interface ShopListProps {
  filters: any;
  cref: any;
}
