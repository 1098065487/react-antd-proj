import {
  fetchList,
  create,
  fetchProofingList,
  fetchProcess,
  fetchAttributes,
  submitToNext,
  fetchDevelopInfo,
  fetchProofingInfo,
  fetchWorkflowLog,
  fetchStepOption,
} from '@/services/newProduct';

export default {
  namespace: 'newProduct',

  state: {
    list: {},
    process: {},
    info: {},
    proofingInfo: {},
    workflowLogs: [],
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const res = yield call(fetchList, payload);
      yield put({
        type: 'save',
        payload: { list: res.body },
      });
    },
    *create({ payload, callback }, { call }) {
      const res = yield call(create, payload);
      if (callback) {
        callback(res);
      }
    },
    *fetchProofingList({ payload }, { call, put }) {
      const res = yield call(fetchProofingList, payload);
      yield put({
        type: 'save',
        payload: { proofingList: res.body }
      });
    },
    *fetchProcess({ payload, callback }, { call, put }) {
      const res = yield call(fetchProcess, payload);
      yield put({
        type: 'save',
        payload: { process: res.body }
      });
      if (callback) {
        callback(res);
      }
    },
    *fetchAttributes({ payload, callback }, { call }) {
      const res = yield call(fetchAttributes, payload);
      if (callback) {
        callback(res.body);
      }
    },
    *submitToNext({ payload, callback }, { call }) {
      const { id, data } = payload;
      const res = yield call(submitToNext, id, data);
      if (callback) {
        callback(res);
      }
    },
    *fetchDevelopInfo({ payload, callback }, { call, put }) {
      const { id, params } = payload;
      const res = yield call(fetchDevelopInfo, id, params);
      yield put({
        type: 'save',
        payload: { info: res.body }
      });
      if (callback) {
        callback(res);
      }
    },
    *fetchProofingInfo({ payload, callback }, { call, put }) {
      const { id, params } = payload;
      const res = yield call(fetchProofingInfo, id, params);
      yield put({
        type: 'save',
        payload: { proofingInfo: res.body }
      })
      if (callback) {
        callback(res);
      }
    },
    *fetchWorkflowLog({ payload }, { call, put }) {
      const res = yield call(fetchWorkflowLog, payload);
      yield put({
        type: 'save',
        payload: { workflowLogs: res.body.data }
      })
    },
    *fetchStepOption({ payload, callback }, { call }) {
      const res = yield call(fetchStepOption, payload);
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
  },
};
