/*
 * @Author: wjw
 * @Date: 2021-02-01 15:48:25
 * @LastEditTime: 2021-02-02 15:42:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\KeyProduct\service.ts
 */

import http from '@/utils/http';

// 获取ShopProduct列表
export async function getShopProduct(params: {
  current: number;
  pageSize: number;
  filters: {
    shop_asin: string;
    site_id: number;
  };
  signal?: any;
}) {
  return http.get('/api/v1/product-classify/search-shop-keyword', params);
}
