/*
 * @Author: wjw
 * @Date: 2020-09-03 14:04:08
 * @LastEditTime: 2020-09-10 15:18:05
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\models\storage.js
 */
import {
  // 可售
  fetchMatchedVendibility,
  fetchVendibilityBindingRelation,
  fetchVendibilityStorageSKU,
  putVendibilityBindingRelation,
  clearVendibilityBindingRelation,
  fetchUnMatchedVendibility,
  fetchUnMatchedVendibilitySKU,
  putUnMatchedRelation,
  // 单品
  fetchMatchedSingleItem,
  fetchInflowBindingRelation,
  fetchCNBindingRelation,
  fetchInflowStorageSKU,
  fetchCNtorageSKU,
  putSingleItemBindingRelation,
  clearSingleItemBindingRelation,
  fetchCNUnMatched,
  fetchUnMatchedSingleItemSKU,
  putInflowUnMatchedRelation,
  putCNUnMatchedRelation,
  // 黑名单
  fetchBlackList,
  addInflowBlackList,
  addCNBlackList,
  addWhite,
} from '@/services/storage';

export default {
  namespace: 'storage',

  state: {
    list: {}, // 可售已匹配列表
    vendibilityBindingRelation: [], // 可售绑定关系列表
    vendibilityStorageSKU: [], // 可售仓库SKU
    unMatchedList: {}, // 可售未匹配列表
    unMatchedSKUList: [], // 可售未匹配SKU列表

    singleItemList: {}, // 单品已匹配列表
    inflowBindingRelation: [], // inflow绑定关系列表
    cnBindingRelation: [], // cn绑定关系列表
    inflowStorageSKU: [], // inflow仓库SKU
    cnStorageSKU: [], // CN仓库SKU
    cnUnMatched: [], // 单品CN未匹配列表
    singleItemUnMatchedSKU: [], // 单品未匹配SKU列表

    blackList: {}, // 黑名单列表
  },

  effects: {
    // 获取可售已匹配列表
    *getMatchedVendibility({ payload }, { call, put }) {
      const response = yield call(fetchMatchedVendibility, payload);
      yield put({
        type: 'save',
        payload: { list: response.body },
      });
    },

    // 获取可售已匹配绑定关系列表
    *getVendibilityBindingRelation({ payload }, { call, put }) {
      const response = yield call(fetchVendibilityBindingRelation, payload);
      yield put({
        type: 'save',
        payload: { vendibilityBindingRelation: response.body },
      });
    },

    // 获取可售已匹配仓库SKU
    *getVendibilityStorageSKU({ payload }, { call, put }) {
      const response = yield call(fetchVendibilityStorageSKU, payload);
      yield put({
        type: 'save',
        payload: { vendibilityStorageSKU: response.body },
      });
    },

    // 保存可售已匹配绑定关系
    *saveVendibilityBindingRelation({ payload, callback }, { call }) {
      const response = yield call(putVendibilityBindingRelation, payload);
      callback(response);
    },

    // 清空可售已匹配绑定关系
    *clearVendibilityBindingRelation({ payload, callback }, { call }) {
      const response = yield call(clearVendibilityBindingRelation, payload);
      callback(response);
    },

    // 获取可售未匹配列表(同单品inflow未匹配列表)
    *getUnMatchedVendibility({ payload }, { call, put }) {
      const response = yield call(fetchUnMatchedVendibility, payload);
      yield put({
        type: 'save',
        payload: { unMatchedList: response.body },
      });
    },

    // 获取可售未匹配SKU列表
    *getUnMatchedVendibilitySKU({ payload }, { call, put }) {
      const response = yield call(fetchUnMatchedVendibilitySKU, payload);
      yield put({
        type: 'save',
        payload: { unMatchedSKUList: response.body.data },
      });
    },

    // 绑定可售未匹配SKU
    *setUnMatchedRelation({ payload, callback }, { call }) {
      const response = yield call(putUnMatchedRelation, payload);
      callback(response);
    },

    // 获取单品已匹配列表
    *getMatchedSingleItem({ payload }, { call, put }) {
      const response = yield call(fetchMatchedSingleItem, payload);
      yield put({
        type: 'save',
        payload: { singleItemList: response.body },
      });
    },

    // 获取单品inflow已匹配绑定关系列表
    *getInflowBindingRelation({ payload }, { call, put }) {
      const response = yield call(fetchInflowBindingRelation, payload);
      yield put({
        type: 'save',
        payload: { inflowBindingRelation: response.body },
      });
    },

    // 获取单品cn已匹配绑定关系列表
    *getCNBindingRelation({ payload }, { call, put }) {
      const response = yield call(fetchCNBindingRelation, payload);
      yield put({
        type: 'save',
        payload: { cnBindingRelation: response.body },
      });
    },

    // 获取单品inflow仓库SKU
    *getInflowStorageSKU({ payload }, { call, put }) {
      const response = yield call(fetchInflowStorageSKU, payload);
      yield put({
        type: 'save',
        payload: { inflowStorageSKU: response.body },
      });
    },

    // 获取单品cn仓库SKU
    *getCNStorageSKU({ payload }, { call, put }) {
      const response = yield call(fetchCNtorageSKU, payload);
      yield put({
        type: 'save',
        payload: { cnStorageSKU: response.body },
      });
    },

    // 保存单品已匹配绑定关系
    *saveSingleItemBindingRelation({ payload, callback }, { call }) {
      const response = yield call(putSingleItemBindingRelation, payload);
      callback(response);
    },

    // 清空单品已匹配绑定关系
    *clearSingleItemBindingRelation({ payload, callback }, { call }) {
      const response = yield call(clearSingleItemBindingRelation, payload);
      callback(response);
    },

    // 获取单品CN未匹配列表
    *getCNUnMatched({ payload }, { call, put }) {
      const response = yield call(fetchCNUnMatched, payload);
      yield put({
        type: 'save',
        payload: { cnUnMatched: response.body },
      });
    },

    // 获取单品未匹配SKU列表
    *getUnMatchedSingleItemSKU({ payload }, { call, put }) {
      const response = yield call(fetchUnMatchedSingleItemSKU, payload);
      yield put({
        type: 'save',
        payload: { unMatchedSKUList: response.body.data },
      });
    },

    // 绑定单品inflow未匹配SKU
    *setInflowUnMatchedRelation({ payload, callback }, { call }) {
      const response = yield call(putInflowUnMatchedRelation, payload);
      callback(response);
    },

    // 绑定单品cn未匹配SKU
    *setCNUnMatchedRelation({ payload, callback }, { call }) {
      const response = yield call(putCNUnMatchedRelation, payload);
      callback(response);
    },

    // 获取黑名单列表
    *getBlackList({ payload }, { call, put }) {
      const response = yield call(fetchBlackList, payload);
      yield put({
        type: 'save',
        payload: { blackList: response.body },
      });
    },

    // 加入inflow黑名单
    *addInflowBlackList({ payload, callback }, { call }) {
      const response = yield call(addInflowBlackList, payload);
      callback(response);
    },

    // 加入CN黑名单
    *addCNBlackList({ payload, callback }, { call }) {
      const response = yield call(addCNBlackList, payload);
      callback(response);
    },

    // 恢复白名单
    *addWhite({ payload, callback }, { call }) {
      const response = yield call(addWhite, payload);
      callback(response);
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
