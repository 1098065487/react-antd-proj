import { fetchList, fetchTreeData, fetchOptions, create, update, removeCategory } from '@/services/category';

export default {
  namespace: 'category',

  state: {
    list: {},
    treeData: [],
    options: [],
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clearList(state) {
      return {
        ...state,
        list: {},
      };
    },
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(fetchList, payload);
      yield put({
        type: 'save',
        payload: { list: response.body },
      });
    },
    *create({ payload, callback }, { call }) {
      const response = yield call(create, payload);
      if (callback) {
        callback(response);
      }
    },
    *update({ payload, callback }, { call }) {
      const { id, data } = payload;
      const response = yield call(update, id, data);
      if (callback) {
        callback(response);
      }
    },
    *delete( { payload: { id }, callback }, { call } ) {
      const res = yield call(removeCategory, id);
      if(callback) {
        callback(res);
      }
    },
    *fetchTreeData({ payload }, { call, put }) {
      const response = yield call(fetchTreeData, payload);
      yield put({
        type: 'save',
        payload: { treeData: response.body.data },
      });
    },
    *fetchOptions({ payload, callback }, { call, put }) {
      const res = yield call(fetchOptions, payload);
      if (callback) {
        callback(res.body.data);
      } else {
        yield put({
          type: 'save',
          payload: { options: res.body.data },
        });
      }
    },
  },
};
