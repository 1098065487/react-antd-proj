/*
 * @Author: wjw
 * @Date: 2020-08-06 09:10:12
 * @LastEditTime: 2020-09-21 09:10:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\services\review.js
 */

import http from '@/utils/http';

/**
 * @description: 获取竞品列表列表
 * @return: {object} response
 */
export async function fetchCompetitiveProduct(params) {
  return http.get('/api/competitive-product', params);
}

/**
 * @description: 删除竞品
 * @return: {object} response
 */
export async function deleteCompetitiveProduct(params) {
  const { productId } = params;
  return http.delete(`/api/competitive-product/${productId}`, params);
}

/**
 * @description: 添加竞品
 * @return: {object} response
 */
export async function addCompetitiveProduct(params) {
  return http.post('/api/competitive-product/batch-add', params);
}

/**
 * @description: 搜索品牌
 * @return: {object} response
 */
export async function fetchBrand(params) {
  return http.get('/api/competitive-brand', params);
}

/**
 * @description: 搜索分类
 * @return: {object} response
 */
export async function fetchCategory(params) {
  return http.get('/api/competitive-category', params);
}

/**
 * @description: 获取星评分布饼图
 * @return: {object} response
 */
export async function fetchRatingDistribution(params) {
  return http.get(`/api/competitive-product/${params.productId}/rating-percentage`, params);
}

/**
 * @description: 获取颜色尺码组合饼图
 * @return: {object} response
 */
export async function fetchColorSizeChart(params) {
  return http.get(`/api/competitive-product/${params.productId}/color-size-percentage`, params);
}

/**
 * @description: 获取评论列表
 * @return: {object} response
 */
export async function fetchReviewList(params) {
  return http.get('/api/competitive-product-reviews', params);
}

/**
 * @description: 搜索尺寸
 * @return: {object} response
 */
export async function fetchProductSize(params) {
  return http.get('/api/competitive-product-reviews/size-select', params);
}

/**
 * @description: 搜索颜色
 * @return: {object} response
 */
export async function fetchProductColor(params) {
  return http.get('/api/competitive-product-reviews/color-select', params);
}

/**
 * @description: 获取评论,星评,二级分类排名,售价统计图
 * @return: {object} response
 */
export async function fetchLineChart(params) {
  return http.get(`/api/competitive-product/${params.productId}/daily-review-analysis`, params);
}

/**
 * @description: 获取评论、星评统计图
 * @return: {object} response
 */
export async function fetchRatingProductionChart(params) {
  return http.get(`/api/competitive-product/${params.productId}/color-size-analysis`, params);
}

/**
 * @description: 获取星评监控图
 * @return: {object} response
 */
export async function fetchStarMonitorChart(params) {
  return http.get(`/api/competitive-product/${params.productId}/rating-control`, params);
}
