/*
 * @Author: your name
 * @Date: 2020-11-04 10:28:04
 * @LastEditTime: 2021-01-05 14:20:37
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\services\login.ts
 */
import { request } from 'umi';
import http from '@/utils/http';

export interface LoginParamsType {
  name: string;
  password: string;
  autoLogin: boolean;
}

export async function fakeAccountLogin(params: LoginParamsType) {
  return request<API.LoginStateType>('/api/login/account', {
    method: 'POST',
    data: params,
  });
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}

export async function outLogin() {
  return request('/api/login/outLogin');
}

/**
 * 登录
 * @param params
 */
export async function login(params: any) {
  return http.post('/api/v1/auth/login', params);
}

/**
 * 登出
 * @param params
 */
export async function logout() {
  return http.post('/api/v1/auth/logout');
}
