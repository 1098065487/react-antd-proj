import {
  fetchWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  fetchWarehouseOptions,
  fetchWarehouseInventory,
  createInventory,
  updateInventory,
  removeInventory,
  createBox,
  updateBox,
  removeBox,
  getProductSkuOptions,
  getDemandReportList,
} from '@/services/logistic';

export default {
  namespace: 'logistic',

  state: {
    warehouse: {},
    warehouseOption: [],
    warehouseInventory: {},
  },

  effects: {
    *fetchWarehouse({ payload }, { call, put }) {
      const response = yield call(fetchWarehouse, payload);
      yield put({
        type: 'save',
        payload: { warehouse: response.body },
      });
    },
    *createWarehouse({ payload, callback }, { call }) {
      const res = yield call(createWarehouse, payload);
      if (callback) {
        callback(res);
      }
    },
    *updateWarehouse({ payload, callback }, { call }) {
      const { id, data } = payload;
      const res = yield call(updateWarehouse, id, data);
      if (callback) {
        callback(res);
      }
    },
    *deleteWarehouse({ payload, callback }, { call }) {
      const res = yield call(deleteWarehouse, payload);
      if (callback) {
        callback(res);
      }
    },
    *fetchWarehouseOptions({ payload, callback }, { call, put }) {
      const res = yield call(fetchWarehouseOptions, payload);
      yield put({
        type: 'initWarehouseOption',
        payload: res,
      });
      if (callback) {
        callback();
      }
    },
    *fetchWarehouseInventory({ payload }, { call, put }) {
      const res = yield call(fetchWarehouseInventory, payload);
      yield put({
        type: 'initWarehouseInventory',
        payload: { warehouseInventory: res.body },
      })
    },
    *createInventory({ payload, callback }, { call }) {
      yield call(createInventory, payload);
      if (callback) {
        callback();
      }
    },
    *updateInventory({ payload, callback }, { call }) {
      const { id, data } = payload;
      yield call(updateInventory, id, data);
      if (callback) {
        callback();
      }
    },
    *removeInventory({ payload, callback }, { call }) {
      yield call(removeInventory, payload);
      if (callback) {
        callback();
      }
    },
    *createBox({ payload, callback }, { call }) {
      yield call(createBox, payload);
      if (callback) {
        callback();
      }
    },
    *updateBox({ payload, callback }, { call }) {
      const { id, data } = payload;
      yield call(updateBox, id, data);
      if (callback) {
        callback();
      }
    },
    *removeBox({ payload, callback }, { call }) {
      yield call(removeBox, payload);
      if (callback) {
        callback();
      }
    },
    *getProductSkuOptions({ payload, callback }, { call }) {
      const res = yield call(getProductSkuOptions, payload);
      if(callback) {
        callback(res.body);
      }
    },
    *getDemandReportList({ payload }, { call, put }) {
      const res = yield call(getDemandReportList, payload);
      yield put({
        type: 'save',
        payload: { 'demandReportList': res.body }
      })
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    initWarehouseOption(state, { payload }) {
      return {
        ...state,
        warehouseOption: payload.body,
      }
    },
    removeWarehouseOptions(state) {
      return {
        ...state,
        warehouseOption: {},
      }
    },
    initWarehouseInventory(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
};
