/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import request, { RequestOptionsWithResponse, RequestResponse } from 'umi-request';
// import { notification } from 'antd';
import { getAccessToken, logout } from '@/utils/utils';
import { history } from 'umi';

export interface ResType {
  status: 'ok' | 'error';
  body: any;
}

export interface GetMethodParams {
  filter?: object;
  sorter?: object;
  params?: object;
  [key: string]: any;
}

const HttpMethod = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
};

const hosts = {
  local: 'http://www.crm.local',
  develop: 'http://crm.leading.io',
  production: 'http://crm.leadingtechgroup.com',
};

export const apiHost = hosts[REACT_APP_ENV || 'local'];

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

/**
 * 异常处理程序
 */
// const errorHandler = (error: { response: Response }): Response => {
//   const { response } = error;
//   if (response && response.status) {
//     const errorText = codeMessage[response.status] || response.statusText;
//     const { status, url } = response;
//
//     notification.error({
//       message: `请求错误 ${status}: ${url}`,
//       description: errorText,
//     });
//   } else if (!response) {
//     notification.error({
//       description: '您的网络发生异常，无法连接服务器',
//       message: '网络异常',
//     });
//   }
//   return response;
// };

/**
 * 配置request请求时的默认参数
 */
// const request = extend({
//   errorHandler, // 默认错误处理
//   credentials: 'include', // 默认请求是否带上cookie
// });

// export default request;

const checkStatus = (response: RequestResponse) => {
  if (response.response.status >= 200 && response.response.status < 300) {
    return response;
  }
  const errorText = codeMessage[response.response.status] || response.response.statusText;
  // notification.error({
  //   message: `请求错误 ${response.status}`,
  //   description: errorText,
  // });
  // eslint-disable-next-line no-throw-literal
  throw { errorText, response };
};

const handleParamsFilter = (paramsToHandle: GetMethodParams) => {
  // 基于入参处理为最终请求参数
  const finalParams = paramsToHandle;

  let paramsValue: object = {}; // 参数中params项中除去分页的筛选

  // 判别是否存在表格请求参数项（非表格请求接口，可能不存在这三个参数）
  const paramsFilter = Object.keys(paramsToHandle).filter((e) => e === 'params');
  const sorterFilter = Object.keys(paramsToHandle).filter((e) => e === 'sorter');
  const filterFilter = Object.keys(paramsToHandle).filter((e) => e === 'filter');

  // 处理参数项params，包括分页和表格筛选form
  if (paramsFilter.length !== 0) {
    const { current, pageSize, ...rest } = paramsToHandle[paramsFilter[0]];
    // 处理分页参数
    finalParams.current = current;
    finalParams.pageSize = pageSize;
    paramsValue = rest; // 表格筛选form
  }

  // 处理参数项sorter
  if (sorterFilter.length !== 0) {
    if (Object.keys(paramsToHandle[sorterFilter[0]]).length !== 0) {
      finalParams.sorter = paramsToHandle[sorterFilter[0]];
    } else {
      delete finalParams.sorter;
    }
  }

  // 处理参数项filter
  if (filterFilter.length !== 0 && Object.keys(paramsToHandle[filterFilter[0]]).length !== 0) {
    if (Object.keys(paramsValue).length !== 0) {
      finalParams.filters = { ...paramsValue, ...paramsToHandle[filterFilter[0]] };
    } else {
      finalParams.filters = { ...paramsToHandle[filterFilter[0]] };
    }
  } else {
    if (Object.keys(paramsValue).length !== 0) {
      finalParams.filters = { ...paramsValue };
    }
  }

  // 消除表格重置是undefined筛选项
  const middleValue = finalParams.filters as any;
  if (middleValue !== null && middleValue !== undefined) {
    Object.keys(middleValue).forEach((e) => {
      if (middleValue[e] === undefined || middleValue[e] === null) {
        delete middleValue[e];
      }
    });
    if (Object.keys(middleValue).length === 0) {
      delete finalParams.filters;
    } else {
      finalParams.filters = middleValue;
    }
  } else {
    delete finalParams.filters;
  }

  // params参数项已拆分使用，不需要再保留
  delete finalParams.params;

  return finalParams;
};

export function getUploadProps(action?: string) {
  const token = getAccessToken();

  const defaultProps = {
    name: 'file',
    action: `${apiHost}/api/upload`,
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

  static get<T>(url: string, params?: object) {
    if (params) {
      const handledParams = handleParamsFilter(params);
      return this.httpRequest<T>(url, { method: HttpMethod.GET, params: handledParams });
    }
    return this.httpRequest<T>(url, { method: HttpMethod.GET });
  }

  static post<T>(url: string, params: object) {
    return this.httpRequest<T>(url, { method: HttpMethod.POST, data: { ...params } });
  }

  static put<T>(url: string, params: object) {
    return this.httpRequest<T>(url, { method: HttpMethod.PUT, data: { ...params } });
  }

  static delete<T>(url: string, params?: object) {
    return this.httpRequest<T>(url, { method: HttpMethod.DELETE, data: { ...params } });
  }

  static httpRequest<T>(path: string, options: object) {
    const url = `${apiHost}${path}`;

    const defaultOptions: RequestOptionsWithResponse = {
      credentials: 'include',
      getResponse: true,
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
      Authorization: accessToken as string,
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/json; charset=utf-8',
      ...newOptions.headers,
    };

    return new Promise<ResType>((resolve) => {
      request(url, newOptions)
        .then(checkStatus)
        .then((response: RequestResponse) => {
          // 判断一下响应中是否有 token
          // const token = response.headers.authorization;
          // DELETE and 204 do not return data by default
          // using .json will report an error.
          if (newOptions.method === 'delete' || response.response.status === 204) {
            return resolve({ status: 'ok', body: {} });
          }
          // 处理Pro-Table request数据返回格式
          if (newOptions.method === 'get' && response.data.meta) {
            return resolve({
              status: 'ok',
              body: {
                ...response.data,
                total: response.data.meta.total,
                current: response.data.meta.current_page,
                pageSize: response.data.meta.per_page,
              },
            });
          }
          return resolve({ status: 'ok', body: response.data });
        })
        .catch((error) => {
          const { response } = error;

          if (response.status === 401) {
            // todo 自动刷新token
            logout();
            history.push('/user/login');
            return response.json().then((data: {}) => {
              resolve({ status: 'error', body: data });
            });
          }

          if (response.status === 422) {
            return response.json().then((data: {}) => {
              resolve({ status: 'error', body: data });
            });
          }

          if (newOptions.method === 'delete' || response.status === 403) {
            return response.json().then((data: {}) => {
              resolve({ status: 'error', body: data });
            });
          }

          if (response.status === 500) {
            return response.json().then((data: {}) => {
              resolve({ status: 'error', body: data });
            });
          }

          return resolve({ status: 'error', body: {} });
        });
    });
  }
}
