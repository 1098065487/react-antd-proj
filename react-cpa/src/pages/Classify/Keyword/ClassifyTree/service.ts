/*
 * @Author: wjw
 * @Date: 2021-02-02 16:01:12
 * @LastEditTime: 2021-02-02 16:01:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\ClassifyTree\service.ts
 */

import http from '@/utils/http';

// 获取classify树
export async function getClassifyTree(params: {
  filters: {
    ids: number[];
  };
  signal?: any;
}) {
  return http.get('/api/v1/product-classify/show-tree', params);
}
