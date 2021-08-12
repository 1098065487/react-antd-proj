/*
 * @Author: wjw
 * @Date: 2020-08-06 09:10:12
 * @LastEditTime: 2020-10-21 09:39:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\services\review.js
 */

import http from '@/utils/http';

/**
 * @description: 获取需求单列表
 * @return: {object} response
 */
export async function fetchDemandList(params) {
  return http.get('/api/transfer', params);
}

/**
 * @description: 新建需求单
 * @return: {object} response
 */
export async function postDemand(params) {
  return http.post(`/api/transfer`, params);
}

/**
 * @description: 删除需求单
 * @return: {object} response
 */
export async function deleteDemand(params) {
  const { demandId } = params;
  return http.delete(`/api/transfer/${demandId}`, params);
}

/**
 * @description: 获取调拨单列表
 * @return: {object} response
 */
export async function fetchAllocationList(params) {
  return http.get('/api/transfer-order/order-data', params);
}

/**
 * @description: 修改调拨单状态
 * @return: {object} response
 */
export async function putAllocationStatus(params) {
  const { id } = params;
  return http.put(`/api/transfer-order/${id}/change-status`, params);
}

/**
 * @description: 修改调拨单离岸时间
 * @return: {object} response
 */
export async function putAllocationLeaveTime(params) {
  const { id } = params;
  return http.put(`/api/transfer-order/${id}/change-leave-time`, params);
}

/**
 * @description: 修改调拨单Package状态
 * @return: {object} response
 */
export async function putPackageStatus(params) {
  return http.put(`/api/transfer-order-item/change-status`, params);
}

/**
 * @description: 获取需求单详情
 * @return: {object} response
 */
export async function fetchDemandDetail(params) {
  const { id } = params;
  return http.get(`/api/transfer/${id}/detail`, params);
}

/**
 * @description: 获取统计列表
 * @return: {object} response
 */
export async function fetchStatisticsList(params) {
  return http.get('/api/transfer/statistics', params);
}
