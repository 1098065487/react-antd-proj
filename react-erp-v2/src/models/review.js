/*
 * @Author: wjw
 * @Date: 2020-08-06 09:09:09
 * @LastEditTime: 2020-08-25 09:35:02
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\models\review.js
 */

import {
  fetchReviewAnalysis,
  fetchReviewDetail,
  fetchTrendChart,
  fetchRatingDistribution,
  fetchColorSizeChart,
  fetchRatingProduction,
  fetchStarMonitor,
} from '@/services/review';

export default {
  namespace: 'review',
  state: {
    reviewAnalysisList: {}, // 评论分析列表
    reviewDetailList: {}, // 评论详情列表
  },
  effects: {
    /**
     * @description: 获取评论分析列表
     * @return: void
     */
    *getReviewAnalysis({ payload }, { call, put }) {
      const response = yield call(fetchReviewAnalysis, payload);
      yield put({
        type: 'save',
        payload: { reviewAnalysisList: response.body },
      });
    },

    /**
     * @description: 获取评论详情列表
     * @return: void
     */
    *getReviewDetail({ payload }, { call, put }) {
      const response = yield call(fetchReviewDetail, payload);
      yield put({
        type: 'save',
        payload: { reviewDetailList: response.body },
      });
    },

    /**
     * @description: 获取评论，星评，销售额趋势图
     * @return: void
     */
    *getTrendChart({ payload, callback }, { call }) {
      const response = yield call(fetchTrendChart, payload);
      callback(response.body);
    },

    /**
     * @description: 获取星评分布 饼图
     * @return: void
     */
    *getRatingDistribution({ payload, callback }, { call }) {
      const response = yield call(fetchRatingDistribution, payload);
      callback(response.body);
    },

    /**
     * @description: 获取颜色尺码 饼图
     * @return: void
     */
    *getColorSizeChart({ payload, callback }, { call }) {
      const response = yield call(fetchColorSizeChart, payload);
      callback(response.body);
    },

    /**
     * @description: 获取星评产品 图
     * @return: void
     */
    *getRatingProduction({ payload, callback }, { call }) {
      const response = yield call(fetchRatingProduction, payload);
      callback(response.body);
    },

    /**
     * @description: 获取星评监控列表
     * @return: void
     */
    *getStarMonitor({ payload, callback }, { call }) {
      const response = yield call(fetchStarMonitor, payload);
      callback(response.body);
    },
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
