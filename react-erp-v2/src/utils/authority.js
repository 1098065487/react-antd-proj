import Cookies from 'js-cookie';

const tokenKey = 'ltg-erp-access-token';
const roleKey = 'ltg-erp-roles';
const authorityKey = 'ltg-erp-authorities';

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
  const roleString = localStorage.getItem('roleKey');
  try {
    return JSON.parse(roleString);
  } catch (e) {
    return ['guest'];
  }
}

/**
 * 用户权限
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

export default function setPermissionStorage(roles, authorities) {
  localStorage.setItem(roleKey, JSON.stringify(roles));
  localStorage.setItem(authorityKey, JSON.stringify(authorities));
}

/**
 *
 * @param token
 * @param permissions
 * @param roles
 * @param expires
 */
export function setLoginCookie({ token, authorities, roles, expires }) {
  const date = new Date();
  date.setTime(date.getTime() + expires * 1000);
  Cookies.set(tokenKey, token, { expires: date });
  setPermissionStorage(roles, authorities);
}

/**
 * 操作权限
 * @param permission
 * @return boolean
 */
export function hasPermission(permission) {
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
