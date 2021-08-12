import {
  fetchImports,
  fetchAnImport,
  createImports,
  acknowledgeImports,
} from '@/services/system';

export default {
  namespace: 'excel',

  state: {
    step: 0,
    list: [],
    platformList: {},
    marketplaceList: {},
    platformItemList: {},
    importList: {},
    import: {},
  },

  effects: {
    *fetchImports({ payload }, { call, put }) {
      const res = yield call(fetchImports, payload);
      yield put({
        type: 'save',
        payload: { importList: res.body },
      });
    },
    *fetchAnImport({ payload, callback }, { call, put }) {
      const { id, params } = payload;
      const res = yield call(fetchAnImport, id, params);
      if (callback) {
        callback(res.body);
      } else {
        yield put({
          type: 'save',
          payload: { import: res.body },
        });
      }
    },
    *createImports({ payload, callback }, { call, put }) {
      const res = yield call(createImports, payload);
      if (callback) {
        callback(res.body);
      } else {
        yield put({
          type: 'save',
          payload: { import: res.body },
        });
      }
    },
    *acknowledgeImports({ payload, callback }, { call, put }) {
      const { id, params } = payload;
      const res = yield call(acknowledgeImports, id, params);
      if (callback) {
        callback(res.body);
      } else {
        yield put({
          type: 'save',
          payload: { import: res.body },
        });
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
