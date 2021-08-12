import { request } from 'umi';
import http from '@/utils/http';

export async function query() {
  return request<API.CurrentUser[]>('/api/users');
}

export async function queryNotices(): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/notices');
}

/**
 * 获取当前用户信息
 */
export async function queryUserInfo() {
  return http.get('/api/auth/user');
}

// mock 获取用户信息
// export async function queryUserInfo() {
//   return request('/fakeApi/getCurrentUser')
// }

/**
 * 当前用户更新个人信息
 * @param params
 */
export async function updateUserInfo(params: any) {
  return http.put('/api/auth/user', params);
}
