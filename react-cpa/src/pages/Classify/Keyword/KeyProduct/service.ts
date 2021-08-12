/*
 * @Author: wjw
 * @Date: 2021-02-02 15:59:36
 * @LastEditTime: 2021-02-02 15:59:36
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\KeyProduct\service.ts
 */

import http from '@/utils/http';

// 获取classify列表
export async function getClassifyList(params: {
  current: number;
  pageSize: number;
  filters: {
    keyword: string;
    site_id: number;
    num: number;
  };
  signal?: any;
}) {
  return http.get('/api/v1/product-classify/search-keyword', params);
}
