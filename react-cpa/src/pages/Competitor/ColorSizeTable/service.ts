/*
 * @Author: wjw
 * @Date: 2020-11-04 16:34:09
 * @LastEditTime: 2020-11-17 10:59:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\AsinList\service.ts
 */
import http from '@/utils/http';

// 获取颜色尺码组合列表
export async function getColorSizeList(params: {
  current: number;
  pageSize: number;
  filters: {
    product_id: number | undefined;
    site_id: number | undefined;
  };
}) {
  return http.get('/api/v1/product-review/color-size', params);
}
