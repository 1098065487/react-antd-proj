import moment from 'moment';
import React from 'react';
import nzh from 'nzh/cn';
import { parse, stringify } from 'qs';
import { baseUri } from '@/defaultSettings';
import { getAccessToken } from '@/utils/authority';

// 保留两位小数
export function KeepDecimals(val) {
  const per = val * 100;
  const perStr = per.toString();
  const index = perStr.indexOf('.');
  return index === -1 ? `${per}%` : `${perStr.slice(0, index + 3)}%`;
}

export function getLinkSuffix(platform_id, platform_sn) {
  // 平台id与网站后缀映射关系
  const reflect = [
    { ids: [5, 14], suffix: 'com' },
    { ids: [17], suffix: 'co.uk' },
    { ids: [19], suffix: 'de' },
    { ids: [18], suffix: 'fr' },
    { ids: [20], suffix: 'it' },
    { ids: [21], suffix: 'es' },
    { ids: [7], suffix: 'ca' },
  ];
  const suffix = reflect.find(item => item.ids.indexOf(platform_id) !== -1)?.suffix;
  const flag = suffix && platform_sn !== null;
  return { flag, suffix };
}

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  const year = now.getFullYear();
  return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  return nzh.toMoney(n);
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  }
  if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

export function getQueryPath(path = '', query = {}) {
  const search = stringify(query);
  if (search.length) {
    return `${path}?${search}`;
  }
  return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
  return reg.test(path);
}

export function formatWan(val) {
  const v = val * 1;
  if (!v) return '';

  let result = val;
  if (val > 10000) {
    result = Math.floor(val / 10000);
    result = (
      <span>
        {result}
        <span
          style={{
            position: 'relative',
            top: -2,
            fontSize: 14,
            fontStyle: 'normal',
            marginLeft: 2,
          }}
        >
          万
        </span>
      </span>
    );
  }
  return result;
}

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export function isAntdPro() {
  return window.location.hostname === 'preview.pro.ant.design';
}

export const importCDN = (url, name) =>
  new Promise(resolve => {
    const dom = document.createElement('script');
    dom.src = url;
    dom.type = 'text/javascript';
    dom.onload = () => {
      resolve(window[name]);
    };
    document.head.appendChild(dom);
  });

/**
 * 上传组件默认属性
 */
export function getUploadProps(action) {
  const token = getAccessToken();

  const defaultProps = {
    name: 'file',
    action: `${baseUri}/api/upload`,
    headers: { Authorization: token },
    showUploadList: false,
  };

  if (action) {
    return { ...defaultProps, action: `${baseUri}/${action}` };
  }
  return defaultProps;
}

/**
 * 定义一个函数，对给定的数分为四类(判断密码类型)，返回十进制1，2，4，8
 * @param iN
 */
function charType(iN) {
  // 数字（U+0030 - U+0039）二进制是0001
  if (iN >= 48 && iN <= 57) {
    return 1;
  }
  // 大写字母（U+0041 - U+005A）二进制是0010
  if (iN >= 65 && iN <= 90) {
    return 2;
  }
  // 小写字母（U+0061 - U+007A）,二进制是0100
  if (iN >= 97 && iN <= 122) {
    return 4;
  }
  // 其他算特殊字符二进制是1000
  return 8;
}

/**
 * 密码复杂度计算
 * @param psw
 */
export function pswStrength(psw = '') {
  // 小于7位，直接“弱”
  if (psw.length < 7) {
    return 'weak';
  }
  let result = 0;
  // 密码的每一位执行“位运算 OR”
  for (let i = 0; i < psw.length; i++) {
    result |= charType(psw.charCodeAt(i));
  }

  // 对result进行四次循环，计算其level
  let level = 0;
  for (let i = 0; i < 4; i++) {
    // result不是0的话, 复杂度+1
    if (result) {
      level += 1;
    }
    // result右移1位
    result >>>= 1;
  }

  switch (level) {
    case 1:
      return 'weak';
    case 2:
      return 'medium';
    case 3:
    case 4:
      return 'strong';
    default:
      return 'weak';
  }
}
