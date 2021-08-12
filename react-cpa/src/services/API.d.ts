/*
 * @Author: your name
 * @Date: 2020-11-04 10:28:04
 * @LastEditTime: 2020-11-24 16:34:38
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\services\API.d.ts
 */
declare namespace API {
  export interface CurrentUser {
    avatar?: string;
    name?: string;
    title?: string;
    group?: string;
    signature?: string;
    tags?: {
      key: string;
      label: string;
    }[];
    id?: number;
    access?: 'user' | 'guest' | 'admin';
    unreadCount?: number;
    roles: string[];
    permissions: string[];
  }

  export interface LoginStateType {
    status?: 'ok' | 'error';
    type?: string;
  }

  export interface NoticeIconData {
    id: string;
    key: string;
    avatar: string;
    title: string;
    datetime: string;
    type: string;
    read?: boolean;
    description: string;
    clickClose?: boolean;
    extra: any;
    status: string;
  }

  // 分页
  export interface Pagination {
    current: number;
    pageSize: number;
  }

  // asin以及当前overview
  export interface AsinAndOverview {
    asinId: number | undefined;
    currentOverview: number | undefined;
  }

  export interface AsinSite {
    asinSite: AsinAndOverview;
  }

  // 表格基础接口格式
  export interface TableRes {
    page: number;
    total: number;
    meta: {
      current_page: number;
      from: number;
      per_page: number;
      to: number;
      total: number;
    };
  }
}
