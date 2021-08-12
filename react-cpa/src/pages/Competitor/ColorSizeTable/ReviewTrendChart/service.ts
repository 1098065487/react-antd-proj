/*
 * @Author: wjw
 * @Date: 2020-11-16 15:55:57
 * @LastEditTime: 2020-12-29 10:53:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\ColorSizeTable\ReviewTrendChart\service.ts
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
  return http.get(`/api/v1/product/${params.id}/color-size-reviews`, params);
}
