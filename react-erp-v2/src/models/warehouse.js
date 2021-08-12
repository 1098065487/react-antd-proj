import {
  fetchWarehouses,
  fetchWarehouseOptions,
  fetchWarehouseInventories,
} from '@/services/warehouse';

export default {
  namespace: 'warehouse',

  state: {
    list: {},
    options: [],
    inventoryList: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(fetchWarehouses, payload);
      yield put({
        type: 'save',
        payload: { list: response.body },
      });
    },
    *fetchOptions({ payload }, { call, put }) {
      const response = yield call(fetchWarehouseOptions, payload);
      yield put({
        type: 'save',
        payload: { options: response.body },
      });
    },
    *fetchInventories({ payload }, { call, put }) {
      const response = yield call(fetchWarehouseInventories, payload);
      yield put({
        type: 'save',
        payload: { inventoryList: response.body },
      });
    },
    *updateInventories({ payload }, { call }) {
      yield call(fetchWarehouseInventories, payload);
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
