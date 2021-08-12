import {
  fetchProducts,
  fetchOneProduct,
  createProducts,
  updateProducts,
  fetchAnProductItem,
  updateProductItem,
  fetchProductItems,
  createProductItems,
  storeProductDetail,
  batchUpdateProductItems,
  deleteProductItems,
  fetchProductDemands,
  fetchProductDetail,
  removeItem,
  deleteProducts,
} from '@/services/product';

export default {
  namespace: 'product',

  state: {
    list: {}, // 商品列表
    itemList: {}, // 变体列表
    sellerItemList: {}, // 可售变体列表
    current: {},  // 编辑商品
    filters: {},
    demandList: {},
    productDemandDetail: {},
  },

  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(fetchProducts, payload);
      if (callback) {
        callback(response.body);
      } else {
        yield put({
          type: 'save',
          payload: { list: response.body },
        });
      }
    },
    *fetchParentSku({ payload, callback }, { call }) {
      const response = yield call(fetchProducts, payload);
      if (callback) {
        callback(response.body);
      }
    },
    *fetchOne({ payload, callback }, { call, put }) {
      const { id, params } = payload;
      const response = yield call(fetchOneProduct, id, params);
      if (callback) {
        callback(response.body);
      } else {
        yield put({
          type: 'save',
          payload: { current: response.body },
        });
      }
    },
    *fetchAnItem({ payload, callback }, { call }) {
      const { id, params } = payload;
      const res = yield call(fetchAnProductItem, id, params);
      if (callback) {
        callback(res.body);
      }
    },
    *updateItem({ payload, callback }, { call }) {
      const { id, data } = payload;
      const res = yield call(updateProductItem, id, data);
      if (callback) {
        callback(res.body);
      }
    },
    *fetchItems({ payload, callback }, { call, put }) {
      const response = yield call(fetchProductItems, payload);
      if (callback) {
        callback(response.body);
      } else {
        yield put({
          type: 'save',
          payload: { itemList: response.body },
        });
      }
    },
    *create({ payload, callback }, { call }) {
      const response = yield call(createProducts, payload);
      if (callback) {
        callback(response);
      }
    },
    *createItems({ payload, callback }, { call, put }) {
      const { id, specs } = payload;
      const res = yield call(createProductItems, id, specs);
      yield put({
        type: 'save',
        payload: { current: res.body },
      });
      if (callback) {
        callback(res.body);
      }
    },
    *storeDetail({ payload, callback }, { call, put }) {
      const { id, params } = payload;
      const res = yield call(storeProductDetail, id, params);
      if (callback) {
        callback(res.body);
      } else {
        yield put({
          type: 'save',
          payload: { current: res.body },
        });
      }
    },
    *update({ payload, callback }, { call }) {
      const { id, params } = payload;
      const response = yield call(updateProducts, id, params);
      if (callback) {
        callback(response);
      }
    },
    *batchUpdateItems({ payload, callback }, { call }) {
      const response = yield call(batchUpdateProductItems, payload);
      if (callback) {
        callback(response);
      }
    },
    *deleteItems({ payload, callback }, { call }) {
      const { id } = payload;
      yield call(deleteProductItems, id);
      if (callback) {
        callback();
      }
    },
    *fetchProductDemands({ payload }, { call, put }) {
      const res = yield call(fetchProductDemands, payload);
      yield put({
        type: 'save',
        payload: { demandList: res.body },
      })
    },
    *fetchProductDetail({ payload }, { call, put }) {
      const res = yield call(fetchProductDetail, payload);
      yield put({
        type: 'save',
        payload: { productDemandDetail: res.body },
      })
    },
    *removeItem({ payload, callback }, { call }) {
      const res = yield call(removeItem, payload);
      if(callback) {
        callback(res);
      }
    },
    *deleteProducts({ payload, callback }, { call }) {
      const res = yield call(deleteProducts, payload);
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
    clear(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
