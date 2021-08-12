/*
 * @Author: wjw
 * @Date: 2020-11-12 14:23:57
 * @LastEditTime: 2020-11-17 15:30:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\AddProduct\service.ts
 */
import http from '@/utils/http';

// 添加asin
export async function addAsin(params: {
  name: string;
  asin: string;
  category: string;
  brand: string;
}) {
  return http.post('/api/v1/product', params);
}

// 更新asin
export async function putAsin(params: {
  name: string;
  asin: string;
  category: string;
  brand: string;
}) {
  return http.put('/api/v1/product', params);
}

// 获取品牌列表
export async function getBrand(params: { filters: { name: string } }) {
  return http.get('/api/v1/brand', params);
}

// 获取分类列表
export async function getCategory(params: { filters: { name: string } }) {
  return http.get('/api/v1/category', params);
}
