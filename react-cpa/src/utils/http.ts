/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import request, { RequestOptionsWithResponse, RequestResponse } from 'umi-request';
import { getAccessToken, logout } from '@/utils/utils';
import { notification } from 'antd';
import { history } from 'umi';

const key = 'updatable';

const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

const hosts = {
  dev: 'http://cpa.leading.io',
  // dev: 'http://api.competitor.local',
  develop: 'http://' + window.location.host,
  production: 'http://cpa.leadingtechgroup.com',
};

export const apiHost = hosts[REACT_APP_ENV || 'dev'];

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

const checkStatus = (response: RequestResponse) => {
  if (response.response.status >= 200 && response.response.status < 300) {
    return response;
  }
  const errorText = codeMessage[response.response.status] || response.response.statusText;
  throw { errorText, response };
};

const filterParams = (paramsToHandle: any) => {
  // 基于入参处理为最终请求参数
  const finalParams = paramsToHandle;
  // 如果存在tableFilter,那么是表格的请求
  const tableFiltersKey = Object.keys(finalParams).find((key) => key === 'tableFilters');
  if (tableFiltersKey) {
    // 合并filters
    let filters = { ...finalParams[tableFiltersKey] };
    const filtersKey = Object.keys(finalParams).find((key) => key === 'filters');
    if (filtersKey) {
      filters = { ...filters, ...finalParams[filtersKey] };
    }
    finalParams.filters = filters;
    delete finalParams.tableFilters;
  }
  if (finalParams.sorter) {
    Object.keys(finalParams.sorter).forEach((key) => {
      finalParams.sorter[key] = finalParams.sorter[key].replace('end', '');
    });
  }
  return finalParams;
};

export function getUploadProps(action?: string) {
  const token = getAccessToken();

  const defaultProps = {
    name: 'file',
    action: `${apiHost}/api/v1/upload`,
    headers: { Authorization: token as string },
    data: { type: 'imports' },
    showUploadList: false,
  };

  if (action) {
    return { ...defaultProps, action: `${apiHost}/${action}` };
  }
  return defaultProps;
}

export default class Http {
  /**
   * Requests a URL, returning a promise.
   *
   * @param url
   * @param params
   */
  static get(url: string, params?: any) {
    if (params) {
      const handledParams = filterParams(params);
      return this.httpRequest(url, { method: HttpMethod.GET, params: handledParams });
    }
    return this.httpRequest(url, { method: HttpMethod.GET });
  }

  static post(url: string, params?: any) {
    return this.httpRequest(url, { method: HttpMethod.POST, data: params });
  }

  static put(url: string, params?: any) {
    return this.httpRequest(url, { method: HttpMethod.PUT, data: params });
  }

  static delete(url: string, params?: any) {
    return this.httpRequest(url, { method: HttpMethod.DELETE, data: params });
  }

  static httpRequest(path: string, options: any) {
    const url = `${apiHost}${path}`;

    const defaultOptions: RequestOptionsWithResponse = {
      credentials: 'include',
      getResponse: true,
    };

    const newOptions = { ...defaultOptions, ...options };
    if (newOptions?.data?.signal) {
      newOptions.signal = newOptions.data.signal;
      delete newOptions.data.signal;
    }
    if (newOptions?.params?.signal) {
      newOptions.signal = newOptions.params.signal;
      delete newOptions.params.signal;
    }

    const accessToken = getAccessToken();
    // 鉴权信息
    if (accessToken) {
      newOptions.headers = {
        ...newOptions.headers,
      };
    }
    newOptions.headers = {
      ...newOptions.headers,
      Authorization: accessToken as string,
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/json; charset=utf-8',
    };

    return request(url, newOptions)
      .then(checkStatus)
      .then((response: RequestResponse) => {
        return { ...response.data, status: 'ok' };
      })
      .catch((err) => {
        const { response, data } = err || {};
        // token验证不通过
        if (response?.status === 401) {
          logout();
          history.push('/user/login');
          return {};
        }
        if (response?.status === 429) {
          notification.warning({
            key,
            message: '操作太过频繁！',
          });
        }
        if (response?.status === 422) {
          notification.error({
            key: 'actionError',
            message: '错误提示：',
            description: data.message,
            duration: 0,
          });
        }
        return { ...data, status: 'error' };
      });
  }
}
