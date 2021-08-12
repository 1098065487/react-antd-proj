import {
  getWeeklyOrder,
  getSalesDate,
  getSalesProportion,
  getTopSale,
} from '@/services/report';

export default {
  namespace: 'report',

  state: {
    weeklyOrder: {},
    salesDate: {},
    salesProportion: {},
    topSales: {},
  },

  effects: {
    *getWeeklyOrder({ payload }, { call, put }) {
      const response = yield call(getWeeklyOrder, payload);
      yield put({
        type: 'save',
        payload: { weeklyOrder: response.body },
      });
    },
    *getSalesDate({ payload }, { call, put }) {
      const res = yield call(getSalesDate, payload);
      yield put({
        type: 'save',
        payload: { salesDate: res.body },
      });
    },
    *getSalesProportion({ payload }, { call, put }) {
      const res = yield call(getSalesProportion, payload);
      yield put({
        type: 'save',
        payload: { salesProportion: res.body },
      });
    },
    *getTopSale({ payload }, { call, put }) {
      const res = yield call(getTopSale, payload);
      yield put({
        type: 'save',
        payload: { topSales: res.body },
      });
    }
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
