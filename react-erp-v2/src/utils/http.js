import fetch from 'dva/fetch';
import router from 'umi/router';
import _ from 'lodash';
import { getAccessToken, logout } from './authority';
import { baseUri } from '@/defaultSettings';

const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const errorText = codeMessage[response.status] || response.statusText;
  // notification.error({
  //   message: `请求错误 ${response.status}`,
  //   description: errorText,
  // });
  // eslint-disable-next-line no-throw-literal
  throw { errorText, response };
};

const handleUrlQuery = params => Object.keys(params)
  .map(key => {
    const values = params[key];
    let val = values;
    // 对分页和排序重新处理
    switch (key) {
      case 'filters':
        val = encodeURIComponent(JSON.stringify(values)); // 存在特殊字符
        break;
      case 'pagination':
        if (values && Object.keys(values).length) {
          const { current, pageSize } = values;
          val = JSON.stringify({ page: current, limit: pageSize });
        } else {
          val = null;
        }
        break;
      case 'sorter':
        if (values && Object.keys(values).length) {
          const { field, order } = values;
          val = JSON.stringify({ field, direction: _.replace(order, 'end', '') });
        } else {
          val = null;
        }
        break;
      default:
        break;
    }
    return `${key}=${val}`;
  }).join('&');

export default class Http {
  /**
   * Requests a URL, returning a promise.
   *
   * @param url
   * @param params
   */
  static get(url, params) {
    let newUrl = url;
    if (params) {
      const query = handleUrlQuery(params);
      newUrl = url.search(/\?/) === -1 ? `${url}?${query}` : `${url}&${query}`;
    }
    return this.request(newUrl, { method: HttpMethod.GET });
  }

  /**
   * Requests a URL, returning a promise.
   *
   * @param  {string} path       The path we want to request
   * @param  {object} [params]  The params we want to pass to "fetch"
   * @return {object}           An object containing either "data" or "err"
   */
  static post(path, params) {
    return this.request(path, { method: HttpMethod.POST, body: params });
  }

  static put(path, params) {
    return this.request(path, { method: HttpMethod.PUT, body: params });
  }

  static delete(path, params) {
    return this.request(path, { method: HttpMethod.DELETE, body: params });
  }

  /**
   *
   * @param {string} path
   * @param {object} option
   */
  static request(path, options) {
    // todo url处理
    const url = `${baseUri}${path}`;
    const defaultOptions = {
      credentials: 'include',
    };

    const newOptions = { ...defaultOptions, ...options };
    const accessToken = getAccessToken();
    // 鉴权信息
    if (accessToken) {
      newOptions.headers = {
        ...newOptions.headers,
      };
    }
    newOptions.headers = {
      Authorization: accessToken,
      Accept: 'application/vnd.erp.v1+json',
      'Content-Type': 'application/json; charset=utf-8',
      ...newOptions.headers,
    };
    if (
      newOptions.method === 'POST' ||
      newOptions.method === 'PUT' ||
      newOptions.method === 'DELETE'
    ) {
      if (!(newOptions.body instanceof FormData)) {
        newOptions.body = JSON.stringify(newOptions.body);
      }
    }

    return new Promise(resolve => {
      fetch(url, newOptions)
        .then(checkStatus)
        .then(response => {
          // 判断一下响应中是否有 token
          // const token = response.headers.authorization;
          // DELETE and 204 do not return data by default
          // using .json will report an error.
          if (newOptions.method === 'DELETE' || response.status === 204) {
            return resolve({ status: 'ok', body: {} });
          }
          return response.json().then(data => {
            resolve({ status: 'ok', body: data });
          });
        })
        .catch(error => {
          const { response } = error;
          if (response.status === 401) {
            // todo 自动刷新token
            logout();
            router.push('/user/login');
          }

          if (response.status === 422) {
            return response.json().then(data => {
              resolve({ status: 'error', body: data });
            });
          }

          if (newOptions.method === 'DELETE' || response.status === 403) {
            return response.json().then(data => {
              resolve({ status: 'error', body: data });
            });
          }

          if (response.status === 500) {
            return response.json().then(data => {
              resolve({ status: 'error', body: data });
            });
          }

          return resolve({ status: 'error', body: {} });
        });
    });
  }
}
