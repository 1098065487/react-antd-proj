import {
  fetchPlatforms,
  fetchOptions,
  fetchTree,
} from '@/services/system';
import {
  fetchPlatformProducts,
  fetchAnPlatformProduct,
  createAnPlatformProduct,
  updateOnePlatformProduct,
  fetchDemands,
  fetchItemDemand,
  saveDemands,
  fetchPlatformProductReports,
  fetchPlatformProductMonthlyReports,
  fetchPlatformProductDailyReports,
  createPlatformDailyNote,
  updateProductDetail,  // 平台商品子级详情更新
  fetchSellerProductItems,
  getReviewsList,
  getQuestionAnswerList,
  ifMatch,
} from '@/services/product';
import {
  fetchOrders,
  createOrder,
  fetchAnOrders,
  fetchOrderItems,
  shipOrder,
  editShipOrder,
  updateOrder,
  updateOrderProductItem,
} from '@/services/order';

export default {
  namespace: 'platform',

  state: {
    list: {},
    platformOptions: [],
    platform: {},
    platformTree: [],
    products: {},
    orders: {},
    platformOrder: {},
    OrderItemList: {},
    demands: {},
    itemDemand: {},
    productFilters: {},
    orderFilters: {},
    demandFilters: {},
    reportFilters: {},
    reports: {},
    monthlyReports: [],
    dailyReports: [],
    reviewList: {},
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const res = yield call(fetchPlatforms, payload);
      yield put({
        type: 'save',
        payload: { list: res.body },
      });
    },
    *fetchOptions(_, { call, put }) {
      const res = yield call(fetchOptions);
      yield put({
        type: 'save',
        payload: { platformOptions: res.body },
      });
    },
    *fetchTree({ callback }, { call, put }) {
      const res = yield call(fetchTree);
      if (callback) {
        callback(res.body);
      } else {
        yield put({
          type: 'save',
          payload: { platformTree: res.body },
        });
      }
    },
    *fetchProducts({ payload, callback }, { call, put }) {
      const res = yield call(fetchPlatformProducts, payload);
      if (callback) {
        callback(res.body);
      } else {
        yield put({
          type: 'save',
          payload: { products: res.body },
        });
      }
    },
    *fetchProductsSku({ payload, callback }, { call, put }) {
      const res = yield call(fetchPlatformProducts, payload);
      if (callback) {
        callback(res.body);
      } else {
        yield put({
          type: 'save',
          payload: { products: res.body },
        });
      }
    },
    *fetchOneProduct({ payload, callback }, { call }) {
      const { id, params } = payload;
      const res = yield call(fetchAnPlatformProduct, id, params);
      if (callback) {
        callback(res.body);
      }
    },
    *createOneProduct({ payload, callback }, { call }) {
      const res = yield call(createAnPlatformProduct, payload);
      if(callback) {
        callback(res)
      }
    },
    *updateOneProduct({ payload, callback }, { call }) {
      const { id, params } = payload;
      const res = yield call(updateOnePlatformProduct, id, params);
      if (callback) {
        callback(res);
      }
    },
    *fetchOrders({ payload }, { call, put }) {
      const res = yield call(fetchOrders, payload);
      yield put({
        type: 'save',
        payload: { orders: res.body },
      });
    },
    *updateOrder({ payload, callback }, { call }) {
      const { id, data } = payload;
      const res = yield call(updateOrder, id, data);
      if (callback) {
        callback(res);
      }
    },
    *createOrder({ payload, callback }, { call }) {
      yield call(createOrder, payload);
      if (callback) {
        callback();
      }
    },
    *fetchOneOrder({ payload }, { call, put }) {
      const { id, data } = payload;
      const res = yield call(fetchAnOrders, id, data);
      yield put({
        type: 'save',
        payload: { platformOrder: res.body },
      });
    },
    *fetchOrderItems({ payload }, { call, put }) {
      const res = yield call(fetchOrderItems, payload);
      yield put({
        type: 'save',
        payload: { OrderItemList: res.body },
      });
    },
    *fetchDemands({ payload }, { call, put }) {
      const res = yield call(fetchDemands, payload);
      yield put({
        type: 'save',
        payload: { demands: res.body },
      });
    },
    *fetchItemDemand({ payload }, { call, put }) {
      const { id, data } = payload;
      const res = yield call(fetchItemDemand, id, data);
      yield put({
        type: 'save',
        payload: { itemDemand: res.body },
      });
    },
    *saveDemands({ payload, callback }, { call }) {
      const res = yield call(saveDemands, payload);
      if (callback) {
        callback(res);
      }
    },
    *shipOrder({ payload, callback }, { call }) {
      const { id, data } = payload;
      const res = yield call(shipOrder, id, data);
      if (callback) {
        callback(res);
      }
    },
    *editShipOrder({ payload, callback }, { call }) {
      const { id, data } = payload;
      const res = yield call(editShipOrder, id, data);
      if(callback) {
        callback(res);
      }
    },
    *fetchProductReports({ payload }, { call, put }) {
      const res = yield call(fetchPlatformProductReports, payload);
      yield put({
        type: 'save',
        payload: { reports: res.body },
      });
    },
    *fetchProductMonthlyData({ payload, callback }, { call, put }) {
      const { id } = payload;
      const res = yield call(fetchPlatformProductMonthlyReports, id);
      if (callback) {
        callback(res.body);
      }
      yield put({
        type: 'save',
        payload: { monthlyReports: res.body },
      });
    },
    *fetchProductDailyData({ payload, callback }, { call }) {
      const { id, params } = payload;
      const res = yield call(fetchPlatformProductDailyReports, id, params);
      if(callback) {
        callback(res.body);
      }
    },
    *createDailyNote({ payload, callback }, { call }) {
      const { id, params } = payload;
      const res = yield call(createPlatformDailyNote, id, params);
      if (callback) {
        callback(res);
      }
    },
    *updateProductDetail({ payload, callback }, { call }) {
      const { id, data } = payload;
      const res = yield call(updateProductDetail, id, data);
      if (callback) {
        callback(res.body);
      }
    },
    *fetchSellerSku({ payload, callback }, { call }) {
      const res = yield call(fetchSellerProductItems, payload);
      if (callback) {
        callback(res.body);
      }
    },
    *getReviewsList({ payload, callback }, { call, put }) {
      const res = yield call(getReviewsList, payload);
      yield put({
        type: 'save',
        payload: { reviewList: res.body },
      });
      if(callback) {
        callback(res.body);
      }
    },
    *getQuestionAnswerList({ payload, callback }, { call }) {
      const res = yield call(getQuestionAnswerList, payload);
      if(callback) {
        callback(res.body);
      }
    },
    *updateOrderProductItem({ payload, callback }, { call }) {
      const { id, data } = payload;
      const res = yield call(updateOrderProductItem, id, data);
      if(callback) {
        callback(res);
      }
    },
    *ifMatch({ payload, callback }, { call }) {
      const res = yield call(ifMatch, payload);
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
      };
    },
    removeTree(state) {
      return {
        ...state,
        platformTree: [],
      };
    },
    removeItemDemand(state) {
      return {
        ...state,
        itemDemand: {},
      };
    },
    remove(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
