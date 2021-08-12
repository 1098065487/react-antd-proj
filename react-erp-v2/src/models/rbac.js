import {
  fetchAllRoles,
  fetchRoles,
  createRoles,
  updateRoles,
  deleteRoles,
  fetchRolePermissions,
  fetchAllPermissions,
  fetchPermissions,
  createPermissions,
  updatePermissions,
  deletePermissions,
  assignPermissions,
} from '@/services/rbac';

export default {
  namespace: 'rbac',

  state: {
    allRoles: [],
    roles: {},
    allPermissions: [],
    permissions: {},
    rolePermissions: [],
  },

  effects: {
    *fetchAllRoles({ payload }, { call, put }) {
      const response = yield call(fetchAllRoles, payload);
      yield put({
        type: 'save',
        payload: { allRoles: response.body.data },
      });
    },
    *fetchRoles({ payload }, { call, put }) {
      const response = yield call(fetchRoles, payload);
      yield put({
        type: 'save',
        payload: { roles: response.body },
      });
    },
    *createRoles({ payload, callback }, { call }) {
      yield call(createRoles, payload);
      if (callback) {
        callback();
      }
    },
    *updateRoles(
      {
        payload: { id, data },
        callback,
      },
      { call }
    ) {
      yield call(updateRoles, id, data);
      if (callback) {
        callback();
      }
    },
    *destroyRoles(
      {
        payload: { id },
        callback,
      },
      { call }
    ) {
      yield call(deleteRoles, id);
      if (callback) {
        callback();
      }
    },
    *fetchAllPermissions({ payload }, { call, put }) {
      const response = yield call(fetchAllPermissions, payload);
      yield put({
        type: 'save',
        payload: { allPermissions: response.body.data },
      });
    },
    *fetchRolePermissions(
      {
        payload: { roleId },
        callback,
      },
      { call }
    ) {
      const response = yield call(fetchRolePermissions, roleId);
      const rolePermissions = response.body.data.map(item => item.id);
      if (callback) {
        callback(rolePermissions);
      }
    },
    *fetchPermissions({ payload }, { call, put }) {
      const response = yield call(fetchPermissions, payload);
      yield put({
        type: 'save',
        payload: { permissions: response.body },
      });
    },
    *createPermissions({ payload, callback }, { call }) {
      yield call(createPermissions, payload);
      if (callback) {
        callback();
      }
    },
    *updatePermissions(
      {
        payload: { id, data },
        callback,
      },
      { call }
    ) {
      yield call(updatePermissions, id, data);
      if (callback) {
        callback();
      }
    },
    *destroyPermissions(
      {
        payload: { id },
        callback,
      },
      { call }
    ) {
      yield call(deletePermissions, id);
      if (callback) {
        callback();
      }
    },
    *assignPermissions(
      {
        payload: { id, permissions },
        callback,
      },
      { call }
    ) {
      yield call(assignPermissions, id, permissions);
      if (callback) {
        callback();
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
  },
};
