/*
 * @Author: wjw
 * @Date: 2021-01-29 10:49:57
 * @LastEditTime: 2021-02-03 10:25:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\KeywordList\service.ts
 */
import http from '@/utils/http';

// 获取店铺列表
export async function getShopList(params: { signal?: any; site_id: number }) {
  return http.get('/api/v1/shop-item/classify-progress', params);
}

// 重新抓取分类列表
export async function reGetClassifyList(params: {
  filters: { shop_asin: string; site_id: number | undefined };
}) {
  return http.get('/api/v1/product-classify/crawl-classify', params);
}
