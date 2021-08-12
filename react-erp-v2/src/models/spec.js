import {
  fetchList,
  fetchAll,
  create,
  update,
  destroy,
  fetchValueList,
  createValue,
  updateValue,
  destroyValue,
} from '@/services/spec';

export default {
  namespace: 'spec',

  state: {
    list: {},
    valueList: {},
  },

  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(fetchList, payload);
      yield put({
        type: 'saveList',
        payload: response,
      });
      if (callback) {
        callback(response.body);
      }
    },
    *fetchAll({ payload, callback }, { call }) {
      const response = yield call(fetchAll, payload);
      if (callback) {
        callback(response.body.data);
      }
    },
    *create({ payload, callback }, { call }) {
      yield call(create, payload);
      if (callback) {
        callback();
      }
    },
    *update({ payload, callback }, { call }) {
      const { id, data } = payload;
      yield call(update, id, data);
      if (callback) {
        callback();
      }
    },
    *delete({ payload, callback }, { call }) {
      const { id } = payload;
      yield call(destroy, id);
      if (callback) {
        callback();
      }
    },
    *fetchValues({ payload }, { call, put }) {
      const response = yield call(fetchValueList, payload);
      yield put({
        type: 'saveValueList',
        payload: response,
      });
    },
    *createValue({ payload, callback }, { call }) {
      const res = yield call(createValue, payload);
      if (callback) {
        callback(res);
      }
    },
    *updateValue({ payload, callback }, { call }) {
      const { id, data } = payload;
      yield call(updateValue, id, data);
      if (callback) {
        callback();
      }
    },
    *deleteValue({ payload, callback }, { call }) {
      const { id } = payload;
      yield call(destroyValue, id);
      if (callback) {
        callback();
      }
    },
    *fetchSpecSearchList({ payload, callback }, { call }) {
      const res = yield call(fetchValueList, payload);
      if(callback) {
        callback(res.body);
      }
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        list: payload.body,
      };
    },
    saveValueList(state, { payload }) {
      return {
        ...state,
        valueList: payload.body,
      };
    },
    clearAll(state) {
      return {
        ...state,
        list: {},
        valueList: {},
      };
    },
    clearList(state) {
      return {
        ...state,
        list: {},
      };
    },
    clearValueList(state) {
      return {
        ...state,
        valueList: {},
      };
    },
  },
};
