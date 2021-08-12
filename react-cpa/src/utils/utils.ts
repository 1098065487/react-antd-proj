import Cookies from 'js-cookie';

const tokenKey = 'ltg-crm-access-token';
const roleKey = 'ltg-crm-roles';
const authorityKey = 'ltg-crm-authorities';

export interface LoginResInfo {
  token: string;
  authorities?: string | string[];
  roles?: string | string[];
  expires: number;
}

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }
  return window.location.hostname === 'preview.pro.ant.design';
};

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'development') {
    return true;
  }
  return isAntDesignPro();
};

/**
 * 获取鉴权token
 */
export function getAccessToken() {
  return Cookies.get(tokenKey);
}

/**
 * 获取用户角色
 */
export function getRoles() {
  const roleString = localStorage.getItem(roleKey);
  try {
    if (typeof roleString === 'string') {
      return JSON.parse(roleString);
    }
    return ['guest'];
  } catch (e) {
    return ['guest'];
  }
}

/**
 * 获取用户权限
 */
export function getAuthorities() {
  const roles = localStorage.getItem(roleKey);
  const permissions = localStorage.getItem(authorityKey);
  if (roles && permissions) {
    try {
      return {
        roles: JSON.parse(roles),
        permissions: JSON.parse(permissions),
      };
    } catch (e) {
      return { roles: [], permissions: [] };
    }
  }
  return { roles: [], permissions: [] };
}

export default function setPermissionStorage(
  roles: string | string[],
  authorities: string | string[],
) {
  localStorage.setItem(roleKey, JSON.stringify(roles));
  localStorage.setItem(authorityKey, JSON.stringify(authorities));
}

/**
 * 获取用户权限（仅Authority，适配框架）
 */
export function getAuthority() {
  const permissions = localStorage.getItem(authorityKey);
  try {
    if (typeof permissions === 'string') {
      return JSON.parse(permissions);
    }
    return [];
  } catch (e) {
    return [];
  }
}

/**
 * 登录成功设置cookie和本地缓存
 * @param token
 * @param permissions
 * @param roles
 * @param expires
 */
export function setLoginCookie({ token, authorities, roles, expires }: LoginResInfo) {
  const date = new Date();
  date.setTime(date.getTime() + expires * 1000);
  Cookies.set(tokenKey, token, { expires: date });
  if (roles && authorities) {
    setPermissionStorage(roles, authorities);
  }
}

/**
 * 操作权限
 * @param permission
 * @return boolean
 */
export function hasPermission(permission: string) {
  if (!permission) {
    return true;
  }
  const authorities = getAuthorities();
  const { roles = [], permissions = [] } = authorities;
  if (roles.includes('admin')) {
    return true;
  }
  return permissions.includes(permission);
}

/**
 * 用户退出
 */
export function logout() {
  Cookies.remove(tokenKey);
  localStorage.removeItem(roleKey);
  localStorage.removeItem(authorityKey);
}

// 带百分比保留两位小数
export function KeepDecimals(val: number) {
  if (typeof val === 'number') {
    const per = val * 100;
    const perStr = per.toString();
    const index = perStr.indexOf('.');
    return index === -1 ? `${per}%` : `${perStr.slice(0, index + 3)}%`;
  }
  return '0%';
}

// 7天变化保留一位小数
export function keepOne(val: number) {
  if (typeof val === 'number') {
    const perStr = val.toString();
    const index = perStr.indexOf('.');
    return index === -1 ? val : val.toFixed(1);
  }
  return 0;
}
