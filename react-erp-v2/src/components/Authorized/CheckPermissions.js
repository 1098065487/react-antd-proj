import React from 'react';
// eslint-disable-next-line import/no-cycle
import PromiseRender from './PromiseRender';
import { CURRENT } from './renderAuthorize';

/**
 * 通用权限检查方法
 * Common check permissions method
 * @param { 权限判定 | Permission judgment } authority
 * @param { 你的权限 | Your permission description } currentAuthority
 * @param { 通过的组件 | Passing components } target
 * @param { 未通过的组件 | no pass components } Exception
 */
const checkPermissions = (authority, currentAuthority, target, Exception) => {
  // 如果是管理员跳过权限判断
  // Retirement authority, return target;
  const { roles = [], permissions = [] } = currentAuthority;
  if (roles.includes('admin')) {
    return target;
  }
  if (!authority) {
    return target;
  }
  // 数组处理
  if (Array.isArray(authority)) {
    if (Array.isArray(permissions)) {
      if (permissions.some(item => authority.includes(item))) {
        return target;
      }
    } else if (authority.includes(permissions)) {
      return target;
    }
    return Exception;
  }
  // string 处理
  if (typeof authority === 'string') {
    if (Array.isArray(permissions)) {
      if (permissions.some(item => authority === item)) {
        return target;
      }
    } else if (authority === permissions) {
      return target;
    }
    return Exception;
  }
  // Promise 处理
  if (authority instanceof Promise) {
    return <PromiseRender ok={target} error={Exception} promise={authority} />;
  }
  // Function 处理
  if (typeof authority === 'function') {
    try {
      const bool = authority(permissions);
      // 函数执行后返回值是 Promise
      if (bool instanceof Promise) {
        return <PromiseRender ok={target} error={Exception} promise={bool} />;
      }
      if (bool) {
        return target;
      }
      return Exception;
    } catch (error) {
      throw error;
    }
  }
  throw new Error('unsupported parameters');
};

export { checkPermissions };

const check = (authority, target, Exception) =>
  checkPermissions(authority, CURRENT, target, Exception);

export default check;
