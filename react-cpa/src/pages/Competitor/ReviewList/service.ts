/*
 * @Author: wjw
 * @Date: 2020-11-17 15:10:39
 * @LastEditTime: 2020-11-17 16:38:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\ReviewList\service.ts
 */
import http from '@/utils/http';

// 获取颜色列表
export function getColorList(params: {
  id: number | undefined;
  filters: { site_id: number | undefined };
}) {
  return http.get(`/api/v1/product/${params.id}/colors`, params);
}

// 获取颜色列表
export function getSizeList(params: {
  id: number | undefined;
  filters: { site_id: number | undefined };
}) {
  return http.get(`/api/v1/product/${params.id}/sizes`, params);
}

// 获取评论列表
export function getReviewList(params: {
  filters: {
    site_id: number | undefined;
    product_id: number | undefined;
    color: string;
    size: string;
  };
  current: number;
  pageSize: number;
  sorter: {
    date?: string;
    helpers?: string;
  };
  with: string;
}) {
  return http.get('/api/v1/product-review', params);
}
