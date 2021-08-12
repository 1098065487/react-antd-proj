// src/access.ts
import { getAuthorities } from '@/utils/utils';
import routes from '../config/router.config';

// 获取所有菜单项配置并导出
const routeMenu: Array<{ name: string, path: string }> = [];
/**
 * 处理菜单配置，提取所有含path及name的配置项，供自定义面包屑取值
 * @param arr
 */
const routeMenuRegister = (arr: any[]) => {
  arr.forEach((e) => {
    if (e.name && e.path) {
      routeMenu.push({ name: e.name, path: e.path });
    }
    if (e.routes) {
      routeMenuRegister(e.routes);
    }
  })
};
// 递归获取
routeMenuRegister(routes);
export const menuList = routeMenu;

// 导出配置菜单校验后的权限
export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};

  /**
   * 处理单项权限校验函数
   * @param key
   */
  const handlePermission = (key: string) => {
    const authorities = getAuthorities();
    const { roles = [], permissions = [] } = authorities;
    if (roles.includes('admin')) {
      return true;
    }
    return permissions.includes(key);
  };

  // 获取路由菜单权限配置项 menuAccess
  const menuAccess: string[] = [];
  const routesRegister = (arr: Array<any>) => {    // 递归函数
    arr.forEach((e: any) => {
      if (e.access) {
        menuAccess.push(e.access);
      }
      if (e.routes) {
        routesRegister(e.routes);
      }
    })
  };
  routesRegister(routes);    // 获取菜单access配置

  // 遍历校验菜单权限 menuPermissions
  const menuPermissions = {};
  menuAccess.forEach((e: string) => {
    menuPermissions[e] = currentUser && handlePermission(e);
  });

  return {
    canAdmin: currentUser && currentUser.access === 'admin',
  };
  // return menuPermissions;
}
