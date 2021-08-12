import router from 'umi/router';
import { getAccessToken } from '@/utils/authority';
import {
  fetchUsers,
  fetchCurrent,
  createUsers,
  updateUsers,
  removeUser,
  fetchAuthNotices,
  fetchAuthUnreadNotices,
  readAuthNotice,
  fetchAuthImports,
  fetchAuthExports,
  fetchRoles,
  assignRoles,
  fetchPermissions,
  assignPermissions,
  updateAuthPassword,
  updateAuthInfo,
  updateAuthDynamic,
  fetchUserLists,
} from '@/services/user';

export default {
  namespace: 'user',

  state: {
    list: {},
    currentUser: {},
    roleOptions: [],
    importList: {},
    exportList: {},
  },

  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(fetchUsers, payload);
      if (callback) {
        callback(response.body);
      } else {
        yield put({
          type: 'save',
          payload: { list: response.body },
        });
      }
    },
    *create({ payload, callback }, { call }) {
      yield call(createUsers, payload);
      if (callback) {
        callback();
      }
    },
    *update({ payload: { id, data }, callback }, { call }) {
      yield call(updateUsers, id, data);
      if (callback) {
        callback();
      }
    },
    *remove({ payload: { id }, callback }, { call }) {
      const res = yield call(removeUser, id);
      if(callback) {
        callback(res);
      }
    },
    *fetchRoles({ payload: { id }, callback }, { call }) {
      const response = yield call(fetchRoles, id);
      if (callback) {
        callback(response.body);
      }
    },
    *assignRoles({ payload: { id, roles }, callback }, { call }) {
      yield call(assignRoles, id, roles);
      if (callback) {
        callback();
      }
    },
    *fetchPermissions({ payload: { id }, callback }, { call }) {
      const response = yield call(fetchPermissions, id);
      if (callback) {
        callback(response.body);
      }
    },
    *assignPermissions({ payload: { id, permissions }, callback }, { call }) {
      yield call(assignPermissions, id, permissions);
      if (callback) {
        callback();
      }
    },
    *fetchCurrent({ callback }, { call, put }) {
      const accessToken = getAccessToken();
      if (accessToken === undefined) {
        router.push('/user/login');
        return;
      }
      const response = yield call(fetchCurrent);
      if (callback) {
        callback(response.body);
      }
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
    *fetchAuthImports({ payload }, { call, put }) {
      const res = yield call(fetchAuthImports, payload);
      yield put({
        type: 'save',
        payload: { importList: res.body },
      });
    },
    *fetchAuthExports({ payload }, { call, put }) {
      const res = yield call(fetchAuthExports, payload);
      yield put({
        type: 'save',
        payload: { exportList: res.body },
      });
    },
    *fetchAuthNotices({ payload }, { call, put }) {
      const res = yield call(fetchAuthNotices, payload);
      yield put({
        type: 'save',
        payload: { noticeList: res.body },
      });
    },
    *fetchAuthUnreadNotices(_, { call, put }) {
      const res = yield call(fetchAuthUnreadNotices);
      yield put({
        type: 'save',
        payload: { unreadNotices: res.body.data },
      });
    },
    *readNotice({ payload, callback }, { call, put }) {
      const { id } = payload;
      // 标记为已读，并返回未读列表
      const res = yield call(readAuthNotice, id);
      if (callback) {
        callback(res.body.data);
      }
      yield put({
        type: 'save',
        payload: { unreadNotices: res.body.data },
      });
      // 更新用户未读通知总数
      yield put({
        type: 'saveCurrentUserUnreadCount',
        payload: { unread_count: res.body.data.length },
      });
    },
    *updateAuthPassword({ payload, callback }, { call }) {
      const res = yield call(updateAuthPassword, payload);
      if (callback) {
        callback(res);
      }
    },
    *updateAuthInfo({ payload, callback }, { call, put }) {
      const res = yield call(updateAuthInfo, payload);
      yield put({
        type: 'saveCurrentUser',
        payload: res,
      });
      if (callback) {
        callback(res.body);
      }
    },
    *updateAuthDynamic({ payload, callback }, { call, put }) {
      const res = yield call(updateAuthDynamic, payload);
      yield put({
        type: 'saveCurrentUser',
        payload: res.body,
      });
      if (callback) {
        callback(res);
      }
    },
    *fetchUsers({ payload, callback }, { call }) {
      const res = yield call(fetchUserLists, payload);
      if(callback) {
        callback(res);
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveCurrentUser(state, { payload }) {
      return {
        ...state,
        currentUser: payload.body,
      };
    },
    saveCurrentUserUnreadCount(state, { payload }) {
      const { currentUser } = state;
      const { unread_count } = payload;
      return {
        ...state,
        currentUser: { ...currentUser, unread_count },
      };
    },
  },
};
