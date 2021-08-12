import { notification } from 'antd';
import {
  fetchImports,
  fetchExports,
  fetchAnExports,
  createAnExport,
  fetchPlatforms,
  createPlatforms,
  updatePlatforms,
  deletePlatforms,
  fetchPlatformItems,
} from '@/services/system';

export default {
  namespace: 'system',

  state: {
    list: [],
    platformList: {},
    platformItemList: {},
    exportList: {},
    currentExport: {},
  },

  effects: {
    *fetchImports({ payload }, { call, put }) {
      const res = yield call(fetchImports, payload);
      yield put({
        type: 'save',
        payload: { list: res.body },
      });
    },
    *fetchExports({ payload }, { call, put }) {
      const res = yield call(fetchExports, payload);
      yield put({
        type: 'save',
        payload: { exportList: res.body },
      });
    },
    *fetchAnExport({ payload }, { call, put }) {
      const res = yield call(fetchAnExports, payload);
      yield put({
        type: 'save',
        payload: { currentExport: res.body },
      });
    },
    *createAnExport({ payload, callback }, { call }) {
      const res = yield call(createAnExport, payload);
      if (callback) {
        callback(res.body);
      } else {
        notification.success({
          message: '已加入队列，请到个人中心下载！',
          description: '下载中心记录所有已执行导出任务，并有更多详细信息。',
          duration: 0,
        });
      }
    },
    *fetchPlatforms({ payload }, { call, put }) {
      const res = yield call(fetchPlatforms, payload);
      yield put({
        type: 'save',
        payload: { platformList: res.body },
      });
    },
    *createPlatforms({ payload, callback }, { call }) {
      const res = yield call(createPlatforms, payload);
      if (callback) {
        callback(res);
      }
    },
    *updatePlatforms({ payload, callback }, { call }) {
      const { id, data } = payload;
      const res = yield call(updatePlatforms, id, data);
      if (callback) {
        callback(res);
      }
    },
    *deletePlatforms({ payload, callback }, { call }) {
      const { id } = payload;
      const res = yield call(deletePlatforms, id);
      if (callback) {
        callback(res);
      }
    },
    *fetchPlatformItems({ payload }, { call, put }) {
      const res = yield call(fetchPlatformItems, payload);
      yield put({
        type: 'savePlatformItems',
        payload: res,
      });
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    savePlatformItems(state, { payload }) {
      return {
        ...state,
        platformItemList: payload.body,
      };
    },
  },
};
