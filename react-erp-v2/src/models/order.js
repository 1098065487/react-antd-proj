import {
  fetchOrders,
  fetchAnOrders,
} from '@/services/order';

export default {
  namespace: 'order',

  state: {
    list: {},
    order: {},
  },
  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const res = yield call(fetchOrders, payload);
      if (callback) {
        callback(res.body);
      }
      yield put({
        type: 'save',
        payload: { list: res.body },
      });
    },
    *fetchAnOrder({ payload, callback }, { call, put }) {
      const { id, params } = payload;
      const res = yield call(fetchAnOrders, id, params);
      if (callback) {
        callback(res.body);
      } else {
        yield put({
          type: 'save',
          payload: { marketplace: res.body },
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
