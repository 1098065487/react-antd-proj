import {
  fetchList,
  update,
  create,
  destroy,
  fetcAll,
  fetchValueList,
  createValues,
  updateValues,
  destroyValues,
} from '@/services/attribute';

export default {
  namespace: 'attribute',

  state: {
    list: {},
    valueList: {},
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    removeValueList(state) {
      return {
        ...state,
        valueList: {},
      }
    },
  },
  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(fetchList, payload);
      yield put({
        type: 'save',
        payload: { list: response.body },
      });
      if(callback) {
        callback(response.body)
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
    *fetchAll({ payload, callback }, { call }) {
      const response = yield call(fetcAll, payload);
      if (callback) {
        callback(response.body.data);
      }
    },
    *fetchValues({ payload }, { call, put }) {
      const response = yield call(fetchValueList, payload);
      yield put({
        type: 'save',
        payload: { valueList: response.body },
      });
    },
    *createValue({ payload, callback }, { call }) {
      yield call(createValues, payload);
      if (callback) {
        callback();
      }
    },
    *updateValue({ payload, callback }, { call }) {
      const { id, data } = payload;
      yield call(updateValues, id, data);
      if (callback) {
        callback();
      }
    },
    *deleteValue({ payload, callback }, { call }) {
      const { id } = payload;
      yield call(destroyValues, id);
      if (callback) {
        callback();
      }
    },
  },
};
