/*
 * @Author: wjw
 * @Date: 2020-11-12 14:23:57
 * @LastEditTime: 2021-01-08 17:22:11
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\AddProduct\service.ts
 */
import http from '@/utils/http';

// 编辑店铺
export async function editShop(params: { name: string; shopId: number | undefined }) {
  return http.put(`/api/v1/shop-item/${params.shopId}`, params);
}
