/*
 * @Author: wjw
 * @Date: 2020-08-06 09:10:12
 * @LastEditTime: 2020-08-21 16:39:54
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\services\review.js
 */

import http from '@/utils/http';

/**
 * @description: 获取评论分析列表
 * @return: {object} response
 */
export async function fetchReviewAnalysis(params) {
  return http.get('/api/platform/products/review-analysis', params);
}

/**
 * @description: 获取评论详情列表
 * @return: {object} response
 */
export async function fetchReviewDetail(params) {
  return http.get(`/api/platform/products/${params.currentId}/reviews`, params);
}

/**
 * @description: 获取评论，星评，销售额趋势图
 * @return: {object} response
 */
export async function fetchTrendChart(params) {
  return http.get(`/api/platform/products/${params.currentId}/daily-review-analysis`, params);
}

/**
 * @description: 获取星评分布 饼图
 * @return: {object} response
 */
export async function fetchRatingDistribution(params) {
  return http.get(`/api/platform/products/${params.currentId}/rating-percentage`, params);
}

/**
 * @description: 获取颜色尺码组合分布 饼图
 * @return: {object} response
 */
export async function fetchColorSizeChart(params) {
  return http.get(`/api/platform/products/${params.currentId}/color-size-percentage`, params);
}

/**
 * @description: 获取评论，星评统计 柱状图
 * @return: {object} response
 */
export async function fetchRatingProduction(params) {
  return http.get(`/api/platform/products/${params.currentId}/color-size-analysis`, params);
}

/**
 * @description: 获取星评监控列表
 * @return: {object} response
 */
export async function fetchStarMonitor(params) {
  return http.get(`/api/platform/products/${params.currentId}/rating-control`, params);
}
