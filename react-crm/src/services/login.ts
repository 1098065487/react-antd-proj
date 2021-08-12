import { request } from 'umi';
import http from '@/utils/http';

export interface LoginParamsType {
  username: string;
  password: string;
  mobile: string;
  captcha: string;
  type: string;
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}

/**
 * 登录
 * @param params
 */
export async function login(params: any) {
  return http.post<API.MyLoginStateType>('/api/auth/login', params)
}

// mock 登录
// export async function login(params: any) {
//   return request('/fakeApi/login', {
//     method: 'POST',
//     data: params,
//   })
// }

/**
 * 退出登录
 * @param params
 */
export async function logout(params: any) {
  return http.post('/api/auth/logout', params);
}
