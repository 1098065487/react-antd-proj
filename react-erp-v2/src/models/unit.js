import {
  fetchList,
  fetchOptions,
  create,
  update,
  destroy,
} from '@/services/unit';

export default {
  namespace: 'unit',

  state: {
    list: {},
    options: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(fetchList, payload);
      yield put({
        type: 'save',
        payload: { list: response.body },
      });
    },
    *fetchOptions({ payload }, { call, put }) {
      const response = yield call(fetchOptions, payload);
      yield put({
        type: 'save',
        payload: { options: response.body },
      });
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
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clear(state) {
      return {
        ...state,
      };
    },
  },
};
