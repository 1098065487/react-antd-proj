/*
 * @Author: wjw
 * @Date: 2021-02-03 10:10:12
 * @LastEditTime: 2021-02-04 11:10:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\ShopList\shopList.d.ts
 */

import { Shop } from '../ShopProduct/shopProduct.d';

export interface WithStatusShop extends Shop {
  progress: {
    finished: number;
    total: number;
  };
}
