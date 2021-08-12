import {
  fetchSellerProducts,
  fetchAnSellerProduct,
  generateSellerSku,
  fetchAnSellerProductItem,
  createSellerProductItem,
  updateSellerProductItem,
  publishSellerProductItem,
  batchPublishSellerProductItem,
  deleteSellerProductItem,
  createOne,
  updateOne,
  fetchSellerProductDemands,
  deleteSellerProduct,
} from '@/services/product';

export default {
  namespace: 'sellerProduct',

  state: {
    list: {}, // 商品列表
    itemList: {}, // 变体列表
    sellerItemList: {}, // 可售变体列表
    current: {},  // 编辑商品
    currentItem: {},
    demandList: {},
    filters: {}
  },

  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(fetchSellerProducts, payload);
      if (callback) {
        callback(response.body);
      } else {
        yield put({
          type: 'save',
          payload: { list: response.body },
        });
      }
    },
    *fetchOne({ payload, callback }, { call, put }) {
      const { id, params } = payload;
      const response = yield call(fetchAnSellerProduct, id, params);
      if (callback) {
        callback(response.body);
      } else {
        yield put({
          type: 'save',
          payload: { current: response.body },
        });
      }
    },
    *createOne({ payload, callback }, { call }) {
      const res = yield call(createOne, payload);
      if(callback) {
        callback(res);
      }
    },
    *updateOne({ payload, callback }, { call }) {
      const { id, params } = payload;
      const res = yield call(updateOne, id, params);
      if (callback) {
        callback(res);
      }
    },
    *generateSku({ payload, callback }, { call }) {
      const response = yield call(generateSellerSku, payload);
      if (callback) {
        callback(response.body);
      }
    },
    *fetchAnItem({ payload, callback }, { call, put }) {
      const { id, params } = payload;
      const response = yield call(fetchAnSellerProductItem, id, params);
      if (callback) {
        callback(response.body);
      } else {
        yield put({
          type: 'save',
          payload: { currentItem: response.body },
        });
      }
    },
    *publishItem({ payload, callback }, { call }) {
      const { id, data } = payload;
      const response = yield call(publishSellerProductItem, id, data);
      if (callback) {
        callback(response.body);
      }
    },
    *batchPublishItems({ payload, callback }, { call }) {
      const response = yield call(batchPublishSellerProductItem, payload);
      if (callback) {
        callback(response.body);
      }
    },
    *createItem({ payload, callback }, { call }) {
      const res = yield call(createSellerProductItem, payload);
      if (callback) {
        callback(res);
      }
    },
    *updateItem({ payload, callback }, { call }) {
      const { id, params } = payload;
      const res = yield call(updateSellerProductItem, id, params);
      if (callback) {
        callback(res);
      }
    },
    *deleteItem({ payload, callback }, { call }) {
      const { id } = payload;
      const response = yield call(deleteSellerProductItem, id);
      if (callback) {
        callback(response);
      }
    },
    *fetchSellerProductDemands({ payload }, { call, put }) {
      const res = yield call(fetchSellerProductDemands, payload);
      yield put({
        type: 'save',
        payload: { demandList: res.body },
      });
    },
    *deleteSellerProduct({ payload, callback }, { call }) {
      const res = yield call(deleteSellerProduct, payload);
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
