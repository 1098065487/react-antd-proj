/*
 * @Author: wjw
 * @Date: 2020-11-04 16:34:09
 * @LastEditTime: 2021-01-06 10:49:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\AsinList\service.ts
 */
import http from '@/utils/http';

// 获取ASIN列表
export async function getAsinList(
  url: string,
  params: {
    url: string;
    current: number;
    pageSize: number;
    filters: any;
    with: string;
    signal?: any;
  },
) {
  return http.get(url, params);
}

// 置顶某个ASIN
export async function setAsinTop(params: { asinId: number; top: number }) {
  return http.put(`/api/v1/product/${params.asinId}/top`, params);
}

export async function crawlReview(params: any) {
  return http.get('/api/v1/product/crawl-product-item-review', params);
}
