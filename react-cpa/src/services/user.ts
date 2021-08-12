import { request } from 'umi';
import http from '@/utils/http';

export async function query() {
  return request<API.CurrentUser[]>('/api/users');
}

export async function queryCurrent() {
  return request<API.CurrentUser>('/api/currentUser');
}

export async function queryNotices(): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/notices');
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUserInfo() {
  return http.get('/api/v1/auth/info');
}
