import {
  fetchProductItems,
  createProductItems,
  updateProductItems,
  fetchWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  fetchWarehouseOptions,
  fetchWarehouseInventories,
  createInventory,
  updateInventory,
  removeInventory,
  fetchProducts,
  createProduct,
  updateProduct,
  createFatherProduct,
  updateFatherProduct,
  deleteFatherProduct,
  deleteProduct,
  searchFactorySku,
  fetchProduction,
  createProduction,
  updateProduction,
  deleteProduction,
  fetchProductionDetail,
  getFactorySkuOptions,
  changeProductionItemStatus,
  fetchProductionDemand,
  createProductionDemand,
  updateProductionDemand,
  deleteProductionDemand,
  getProductionDetailList,
  getOrderDetail,
} from '@/services/factory';

export default {
  namespace: 'factory',

  state: {
    itemList: {},
    warehouseList: {},
    warehouseOptions: [],
    inventoryList: {},
    productList: {},
    productionList: {},
    detailList: {},
    demands: {},
  },

  effects: {
    *fetchItems({ payload }, { call, put }) {
      const response = yield call(fetchProductItems, payload);
      yield put({
        type: 'save',
        payload: { itemList: response.body },
      });
    },
    *create({ payload, callback }, { call }) {
      yield call(createProductItems, payload);
      if (callback) {
        callback();
      }
    },
    *update({ payload, callback }, { call }) {
      const { id, params } = payload;
      yield call(updateProductItems, id, params);
      if (callback) {
        callback();
      }
    },
    *searchItems({ payload, callback }, { call }) {
      const { body } = yield call(fetchProductItems, payload);
      if (callback) {
        callback(body);
      }
    },
    *fetchWarehouses({ payload }, { call, put }) {
      const response = yield call(fetchWarehouses, payload);
      yield put({
        type: 'save',
        payload: { warehouseList: response.body },
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
      const response = yield call(fetchWarehouseOptions, payload);
      yield put({
        type: 'save',
        payload: { warehouseOptions: response.body },
      });
      if (callback) {
        callback();
      }
    },
    *fetchInventories({ payload }, { call, put }) {
      const response = yield call(fetchWarehouseInventories, payload);
      yield put({
        type: 'save',
        payload: { inventoryList: response.body },
      });
    },
    *createInventory({ payload, callback }, { call }) {
      const res = yield call(createInventory, payload);
      if (callback) {
        callback(res);
      }
    },
    *updateInventory({ payload, callback }, { call }) {
      const { id, data } = payload;
      const res = yield call(updateInventory, id, data);
      if (callback) {
        callback(res);
      }
    },
    *removeInventory({ payload, callback }, { call }) {
      const res = yield call(removeInventory, payload);
      if (callback) {
        callback(res);
      }
    },
    *fetchProducts({ payload }, { call, put }) {
      const res = yield call(fetchProducts, payload);
      yield put({
        type: 'save',
        payload: { productList: res.body },
      })
    },
    *createProduct({ payload, callback }, { call }) {
      const res = yield call(createProduct, payload);
      if (callback) {
        callback(res);
      }
    },
    *updateProduct({ payload, callback }, { call }) {
      const { id, data } = payload;
      const res = yield call(updateProduct, id, data);
      if (callback) {
        callback(res);
      }
    },
    *createFatherProduct({ payload, callback }, { call }) {
      const res = yield call(createFatherProduct, payload);
      if (callback) {
        callback(res);
      }
    },
    *updateFatherProduct({ payload, callback }, { call }) {
      const { id, data } = payload;
      const res = yield call(updateFatherProduct, id, data);
      if(callback) {
        callback(res);
      }
    },
    *deleteFatherProduct({ payload, callback }, { call }) {
      const res = yield call(deleteFatherProduct, payload);
      if (callback) {
        callback(res);
      }
    },
    *deleteProduct({ payload, callback }, { call }) {
      const res = yield call(deleteProduct, payload);
      if (callback) {
        callback(res);
      }
    },
    *searchFactorySku({ payload, callback }, { call }) {
      const res = yield call(searchFactorySku, payload);
      if (callback) {
        callback(res.body);
      }
    },
    *fetchProduction({ payload }, { call, put }) {
      const res = yield call(fetchProduction, payload);
      yield put({
        type: 'save',
        payload: { productionList: res.body },
      });
    },
    *createProduction({ payload, callback }, { call }) {
      const res = yield call(createProduction, payload);
      if(callback) {
        callback(res);
      }
    },
    *updateProduction({ payload, callback }, { call }) {
      const { id, data } = payload;
      const res = yield call(updateProduction, id, data);
      if(callback) {
        callback(res);
      }
    },
    *deleteProduction({ payload, callback }, { call }) {
      const res = yield call(deleteProduction, payload);
      if(callback) {
        callback(res);
      }
    },
    *fetchProductionDetail({ payload }, { call, put }) {
      const res = yield call(fetchProductionDetail, payload);
      yield put({
        type: 'save',
        payload: { detailList: res.body },
      });
    },
    *getFactorySkuOptions({ payload, callback }, { call }) {
      const res = yield call(getFactorySkuOptions, payload);
      if(callback) {
        callback(res.body)
      }
    },
    *changeProductionItemStatus({ payload, callback }, { call }) {
      const res = yield call(changeProductionItemStatus, payload);
      if(callback) {
        callback(res);
      }
    },
    *getProductionDemand({ payload }, { call, put }) {
      const res = yield call(fetchProductionDemand, payload);
      yield put({
        type: 'save',
        payload: { demands: res.body }
      })
    },
    *createProductionDemand({ payload, callback }, { call }) {
      const res = yield call(createProductionDemand, payload);
      if(callback) {
        callback(res)
      }
    },
    *updateProductionDemand({ payload, callback }, { call }) {
      const { id, params } = payload;
      const res = yield call(updateProductionDemand, id, params);
      if(callback) {
        callback(res);
      }
    },
    *deleteProductionDemand({ payload, callback }, { call }) {
      const res = yield call(deleteProductionDemand, payload);
      if(callback) {
        callback(res);
      }
    },
    *getPlacedOrders({ payload, callback }, { call }) {
      const res = yield call(fetchProductionDemand, payload);
      if(callback) {
        callback(res.body);
      }
    },
    *getReceivedOrders({ payload, callback }, { call }) {
      const res = yield call(fetchProductionDemand, payload);
      if(callback) {
        callback(res.body);
      }
    },
    *getRejectedOrders({ payload, callback }, { call }) {
      const res = yield call(fetchProductionDemand, payload);
      if(callback) {
        callback(res.body);
      }
    },
    *getProductionDetailList({ payload, callback }, { call }) {
      const res = yield call(getProductionDetailList, payload);
      if(callback) {
        callback(res.body);
      }
    },
    *getOrderDetail({ payload, callback }, { call }) {
      const { id, params } = payload;
      const res = yield call(getOrderDetail, id, params);
      if(callback) {
        callback(res.body);
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
    clear(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
};
