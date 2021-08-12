/*
 * @Author: wjw
 * @Date: 2021-01-29 10:49:57
 * @LastEditTime: 2021-02-03 09:45:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\KeywordList\service.ts
 */
import http from '@/utils/http';

// 获取keyword列表
export async function getKeywordList(params: { signal?: any; site_id: number }) {
  return http.get('/api/v1/keyword/classify-progress', params);
}

// 重新抓取分类列表
export async function reGetClassifyList(params: {
  filters: { keyword: string; num: number; site_id: number | undefined };
}) {
  return http.get('/api/v1/product-classify/crawl-classify', params);
}
