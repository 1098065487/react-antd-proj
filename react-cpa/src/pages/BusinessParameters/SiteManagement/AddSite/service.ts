/*
 * @Author: wjw
 * @Date: 2020-11-20 17:47:53
 * @LastEditTime: 2020-11-23 17:31:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\BusinessParameters\SiteManagement\AddSite\service.ts
 */
import http from '@/utils/http';

// 添加Site
export async function addSite(params: {
  name: string;
  short_name: string;
  domain: string;
  status: string;
}) {
  return http.post('/api/v1/site', params);
}

// 修改Site
export async function updateSite(params: {
  id: number;
  name: string;
  short_name: string;
  domain: string;
  status: string;
}) {
  return http.put(`/api/v1/site/${params.id}`, params);
}

// 修改Site配置
export async function updateSiteConfig(params: { id: number; config: string }) {
  return http.put(`/api/v1/site/${params.id}/save-config`, params);
}
