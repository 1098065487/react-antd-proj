import React from 'react';
import Redirect from 'umi/redirect';
import pathToRegexp from 'path-to-regexp';
import { connect } from 'dva';
import Authorized from '@/utils/Authorized';
import { getRoles } from '@/utils/authority';
import Exception403 from '@/pages/Exception/403';

function AuthComponent({ children, location, routerData }) {
  const roles = getRoles();
  const isLogin = roles && roles[0] !== 'guest';
  const getRouteAuthority = (path, routeData) => {
    let authorities = null;
    routeData.forEach(route => {
      // match prefix
      if (pathToRegexp(`${route.path}(.*)`).test(path)) {
        authorities = route.authority || authorities;

        // get children authority recursively
        if (route.routes) {
          authorities = getRouteAuthority(path, route.routes) || authorities;
        }
      }
    });
    return authorities;
  };
  return (
    <Authorized
      authority={getRouteAuthority(location.pathname, routerData)}
      noMatch={isLogin ? <Exception403 /> : <Redirect to="/user/login" />}
    >
      {children}
    </Authorized>
  );
}

export default connect(({ menu: menuModel }) => ({
  routerData: menuModel.routerData,
}))(AuthComponent);
