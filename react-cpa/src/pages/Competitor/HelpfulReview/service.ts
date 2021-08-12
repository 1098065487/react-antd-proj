/*
 * @Author: wjw
 * @Date: 2020-11-16 16:34:00
 * @LastEditTime: 2020-11-17 14:39:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\HelpfulReview\service.ts
 */
import http from '@/utils/http';

export function getHelpfulData(params: {
  id: number | undefined;
  filters: {
    site_id: number | undefined;
  };
  signal: any;
}) {
  return http.get(`/api/v1/product/${params.id}/helpful-analysis`, params);
}
