/*
 * @Author: wjw
 * @Date: 2020-11-04 16:34:09
 * @LastEditTime: 2021-01-08 17:44:06
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\AsinList\service.ts
 */
import http from '@/utils/http';

// 获取shop列表
export async function getShopList(params: {
  current: number;
  pageSize: number;
  filters: any;
  with: string;
  signal?: any;
}) {
  return http.get('/api/v1/shop-item', params);
}

// 置顶某个shop
export async function setShopTop(params: { shopId: number; top: number }) {
  return http.put(`/api/v1/shop-item/${params.shopId}/top`, params);
}

// 删除某个shop
export async function deleteShop(params: { shopId: number | undefined }) {
  return http.delete(`/api/v1/shop-item/${params.shopId}`);
}
