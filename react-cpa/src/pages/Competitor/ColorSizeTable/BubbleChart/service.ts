/*
 * @Author: wjw
 * @Date: 2020-11-16 15:59:29
 * @LastEditTime: 2020-11-16 16:00:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\ColorSizeTable\BubbleChart\service.ts
 */
import http from '@/utils/http';

// 获取气泡图数据
export function getBubbleChart(params: {
  filters: {
    product_id: number | undefined;
    site_id: number | undefined;
  };
  signal: any;
}) {
  return http.get('/api/v1/product-review/color-size-map', params);
}
