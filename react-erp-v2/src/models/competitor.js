/*
 * @Author: wjw
 * @Date: 2020-08-06 09:09:09
 * @LastEditTime: 2020-09-21 17:16:05
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\models\review.js
 */

import {
  fetchCompetitiveProduct,
  deleteCompetitiveProduct,
  addCompetitiveProduct,
  fetchBrand,
  fetchCategory,
  fetchRatingDistribution,
  fetchColorSizeChart,
  fetchReviewList,
  fetchProductSize,
  fetchProductColor,
  fetchLineChart,
  fetchRatingProductionChart,
  fetchStarMonitorChart
} from '@/services/competitor';

export default {
  namespace: 'competitor',
  state: {
    competitiveProductList: {}, // 竞品列表
    brandList: [], // 品牌列表
    categoryList: [], // 分类列表
    reviewList: {}, // 评论列表
    sizeList: [], // 尺码列表
    colorList: [], // 颜色列表
  },
  effects: {
    /**
     * @description: 获取竞品列表
     * @return: void
     */
    *getCompetitiveProduct({ payload, callback }, { call, put }) {
      const response = yield call(fetchCompetitiveProduct, payload);
      yield put({
        type: 'save',
        payload: { competitiveProductList: response.body },
      });
      callback(response.body.data);
    },

    /**
     * @description: 删除竞品
     * @return: void
     */
    *deleteCompetitiveProduct({ payload, callback }, { call }) {
      const response = yield call(deleteCompetitiveProduct, payload);
      callback(response);
    },

    /**
     * @description: 添加竞品
     * @return: void
     */
    *addCompetitiveProduct({ payload, callback }, { call }) {
      const response = yield call(addCompetitiveProduct, payload);
      callback(response);
    },

    /**
     * @description: 获取品牌列表
     * @return: void
     */
    *getBrand({ payload, callback }, { call, put }) {
      const response = yield call(fetchBrand, payload);
      yield put({
        type: 'save',
        payload: { brandList: response.body.data },
      });
      if (callback) {
        callback(response.body.data);
      }
    },

    /**
     * @description: 获取分类列表
     * @return: void
     */
    *getCategory({ payload, callback }, { call, put }) {
      const response = yield call(fetchCategory, payload);
      yield put({
        type: 'save',
        payload: { categoryList: response.body.data },
      });
      if (callback) {
        callback(response.body.data);
      }
    },

    /**
     * @description: 获取星评分布饼图
     * @return: void
     */
    *getRatingDistribution({ payload, callback }, { call }) {
      const response = yield call(fetchRatingDistribution, payload);
      callback(response.body);
    },

    /**
     * @description: 获取颜色尺码组合饼图
     * @return: void
     */
    *getColorSizeChart({ payload, callback }, { call }) {
      const response = yield call(fetchColorSizeChart, payload);
      callback(response.body);
    },

    /**
     * @description: 获取评论列表
     * @return: void
     */
    *getReviewList({ payload }, { call, put }) {
      const response = yield call(fetchReviewList, payload);
      yield put({
        type: 'save',
        payload: { reviewList: response.body },
      });
    },

    /**
     * @description: 获取尺码列表
     * @return: void
     */
    *getProductSizeList({ payload }, { call, put }) {
      const response = yield call(fetchProductSize, payload);
      yield put({
        type: 'save',
        payload: { sizeList: response.body },
      });
    },

    /**
     * @description: 获取颜色列表
     * @return: void
     */
    *getProductColorList({ payload }, { call, put }) {
      const response = yield call(fetchProductColor, payload);
      yield put({
        type: 'save',
        payload: { colorList: response.body },
      });
    },

    /**
     * @description: 获取评论,星评,二级分类排名,售价统计图
     * @return: void
     */
    *getLineChart({ payload, callback }, { call }) {
      const response = yield call(fetchLineChart, payload);
      callback(response.body);
    },

    /**
     * @description: 获取评论、星评统计图
     * @return: void
     */
    *getRatingProductionChart({ payload, callback }, { call }) {
      const response = yield call(fetchRatingProductionChart, payload);
      callback(response.body);
    },

    /**
     * @description: 获取星评监控图
     * @return: void
     */
    *getStarMonitorChart({ payload, callback }, { call }) {
      const response = yield call(fetchStarMonitorChart, payload);
      callback(response.body);
    },
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
