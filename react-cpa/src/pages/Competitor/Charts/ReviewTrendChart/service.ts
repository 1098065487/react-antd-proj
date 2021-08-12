/*
 * @Author: wjw
 * @Date: 2020-11-13 13:18:44
 * @LastEditTime: 2020-12-29 11:25:59
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\Charts\ReviewTrendChart\service.ts
 */
import http from '@/utils/http';

// 获取review趋势图数据
export function getReviewTrend(params: {
  id: number | undefined;
  filters: {
    site_id: number | undefined;
    range: string[];
  };
  signal: any;
}) {
  return http.get(`/api/v1/product/${params.id}/review-trend`, params);
}
