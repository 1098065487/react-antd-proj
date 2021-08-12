/*
 * @Author: wjw
 * @Date: 2020-11-13 13:18:38
 * @LastEditTime: 2020-12-29 11:26:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\Charts\CategoryRankChart\service.ts
 */
import http from '@/utils/http';

// 获取分类排名图数据
export function getCategoryRank(params: {
  id: number | undefined;
  filters: {
    site_id: number | undefined;
    range: string[];
  };
  signal: any;
}) {
  return http.get(`/api/v1/product/${params.id}/category-rank`, params);
}
