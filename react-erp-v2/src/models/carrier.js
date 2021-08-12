import {
  fetchList,
  fetchOption,
  create,
  update,
  remove,
} from '@/services/carrier';

export default {
  namespace: 'carrier',

  state: {
    list: {},
  },

  effects: {
    *fetchList({ payload }, { call, put }) {
      const res = yield call(fetchList, payload);
      yield put({
        type: 'save',
        payload: { list: res.body },
      });
    },
    *fetchOption({ payload, callback }, { call }) {
      const res = yield call(fetchOption, payload);
      if(callback) {
        callback(res.body);
      }
    },
    *create({ payload, callback }, { call }) {
      const res = yield call(create, payload);
      if(callback) {
        callback(res);
      }
    },
    *update({ payload, callback }, { call }) {
      const { id, data } = payload;
      const res = yield call(update, id, data);
      if(callback) {
        callback(res);
      }
    },
    *delete({ payload, callback }, { call }) {
      const res = yield call(remove, payload);
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
    remove(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
};
