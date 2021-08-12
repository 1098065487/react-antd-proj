/*
 * @Author: wjw
 * @Date: 2020-11-12 14:23:57
 * @LastEditTime: 2021-01-08 16:51:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\AddProduct\service.ts
 */
import http from '@/utils/http';

// 添加店铺
export async function addShop(params: { site_id: number; asin: string; name: string }) {
  return http.post('/api/v1/shop-item', params);
}
