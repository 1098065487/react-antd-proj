/*
 * @Author: wjw
 * @Date: 2020-07-21 10:30:40
 * @LastEditTime: 2020-08-03 10:21:35
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\models\_factory.js
 */
import {
  fetchDemandList,
  fetchNewDemand,
  fetchDemandDetail,
  fetchProductionDetail,
  fetchSkuDetail,
  fetch_ProductionDetail,
  fetchDemandDataStatistics,
  fetchProductDataStatistics,
} from '@/services/_factory';

export default {
  namespace: '_factory',
  state: {
    demandList: {},
    demandDetailList: {},
    productionDetailList: {}, // 工作台页面
    skuDetailList: {},
    _productionDetailList: {}, // 数据分析页面
  },
  effects: {
    /**
     * @description: 获取需求列表
     * @return: void
     */
    *getDemandList({ payload }, { call, put }) {
      const response = yield call(fetchDemandList, payload);
      yield put({
        type: 'save',
        payload: { demandList: response.body },
      });
    },

    /**
     * @description: 新建需求单
     * @return: void
     */
    *getNewDemand({ payload, callback }, { call }) {
      const response = yield call(fetchNewDemand, payload);
      callback(response.body.sn);
    },

    /**
     * @description: 获取需求单详情
     * @return: void
     */
    *getDemandDetail({ payload }, { call, put }) {
      const response = yield call(fetchDemandDetail, payload);
      yield put({
        type: 'save',
        payload: { demandDetailList: response.body },
      });
    },

    /**
     * @description: 获取生产单详情(工作台页面)
     * @return: void
     */
    *getProductionDetail({ payload }, { call, put }) {
      const response = yield call(fetchProductionDetail, payload);
      yield put({
        type: 'save',
        payload: { productionDetailList: response.body },
      });
    },

    /**
     * @description: 获取生产单详情(数据分析页面)
     * @return: void
     */
    *get_ProductionDetail({ payload }, { call, put }) {
      const response = yield call(fetch_ProductionDetail, payload);
      yield put({
        type: 'save',
        payload: { _productionDetailList: response.body },
      });
    },

    /**
     * @description: 获取Sku详情
     * @return: void
     */
    *getSkuDetail({ payload }, { call, put }) {
      const response = yield call(fetchSkuDetail, payload);
      yield put({
        type: 'save',
        payload: { skuDetailList: response.body },
      });
    },

    /**
     * @description: 获取工作台需求数据统计信息
     * @return: void
     */
    *getDemandDataStatistics({ _, callback }, { call }) {
      const response = yield call(fetchDemandDataStatistics);
      callback(response.body);
    },

    /**
     * @description: 获取数据分析页生产数据统计信息
     * @return: void
     */
    *getProductDataStatistics({ payload, callback }, { call }) {
      const response = yield call(fetchProductDataStatistics, payload);
      callback(response.body);
    },
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
