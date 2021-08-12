/*
 * @Author: wjw
 * @Date: 2020-11-20 17:16:48
 * @LastEditTime: 2021-01-04 11:17:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\BusinessParameters\SiteManagement\service.ts
 */
import http from '@/utils/http';

// 获取站点列表
export async function getSiteList(params: { current: number; pageSize: number }) {
  return http.get('/api/v1/site', { ...params, with: 'config' });
}

// 删除站点
export async function deleteSite(id: number) {
  return http.delete(`/api/v1/site/${id}`);
}
