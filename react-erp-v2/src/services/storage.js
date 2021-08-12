/*
 * @Author: wjw
 * @Date: 2020-09-03 14:06:17
 * @LastEditTime: 2020-09-17 13:07:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\services\storage.js
 */
import http from '@/utils/http';

// 获取可售已匹配列表
export async function fetchMatchedVendibility(params) {
  return http.get('/api/seller/product-items/inventory', params);
}

// 获取可售已匹配绑定关系列表
export async function fetchVendibilityBindingRelation(params) {
  return http.get(`/api/seller/product-items/${params.manageId}/product-inventory`);
}

// 搜索已匹配仓库SKU
export async function fetchVendibilityStorageSKU(params) {
  return http.get('/api/warehouse-inventories/search-inventories', params);
}

// 保存可售已匹配绑定关系
export async function putVendibilityBindingRelation(params) {
  return http.put(`/api/seller/product-items/${params.manageId}/save-product-inventory`, params);
}

// 清空可售已匹配绑定关系
export async function clearVendibilityBindingRelation(params) {
  return http.put(`/api/seller/product-items/${params.manageId}/un-bind-product-inventory`, params);
}

// 获取可售未匹配列表(同单品inflow未匹配列表)
export async function fetchUnMatchedVendibility(params) {
  return http.get('/api/warehouse-inventories', params);
}

// 获取可售未匹配SKU列表
export async function fetchUnMatchedVendibilitySKU(params) {
  return http.get('/api/seller/product-items', params);
}

// 绑定可售未匹配
export async function putUnMatchedRelation(params) {
  return http.put(`/api/warehouse-inventories/${params.manageId}`, params);
}

// 获取单品已匹配列表
export async function fetchMatchedSingleItem(params) {
  return http.get('/api/factory/product-items/inventory', params);
}

// 获取单品Inflow已匹配绑定关系列表
export async function fetchInflowBindingRelation(params) {
  return http.get(`/api/factory/product-items/${params.manageId}/product-inventory`);
}

// 获取单品cn已匹配绑定关系列表
export async function fetchCNBindingRelation(params) {
  return http.get(`/api/factory/product-items/${params.manageId}/product-cn-inventory`, params);
}

// 获取单品Inflow仓库sku
export async function fetchInflowStorageSKU(params) {
  return http.get('/api/warehouse-inventories/search-inventories', params);
}

// 获取单品cn仓库sku
export async function fetchCNtorageSKU(params) {
  return http.get('/api/factory/warehouse-inventories/search-inventories', params);
}

// 保存单品已匹配绑定关系
export async function putSingleItemBindingRelation(params) {
  return http.put(`/api/factory/product-items/${params.manageId}/save-product-inventory`, params);
}

// 清空单品已匹配绑定关系
export async function clearSingleItemBindingRelation(params) {
  return http.put(
    `/api/factory/product-items/${params.manageId}/un-bind-product-inventory`,
    params
  );
}

// 获取单品cn未匹配列表
export async function fetchCNUnMatched(params) {
  return http.get('/api/factory/product-items/inventory-data', params);
}

// 获取单品未匹配SKU列表
export async function fetchUnMatchedSingleItemSKU(params) {
  return http.get('/api/product-items', params);
}

// 绑定单品inflow未匹配
export async function putInflowUnMatchedRelation(params) {
  return http.put(`/api/warehouse-inventories/${params.manageId}`, params);
}

// 绑定单品cn未匹配
export async function putCNUnMatchedRelation(params) {
  return http.put(`/api/factory/product-items/${params.manageId}/bind-product`, params);
}

// 获取黑名单列表
export async function fetchBlackList(params) {
  return http.get('/api/warehouse-inventories/black-list', params);
}

// inflow加入黑名单
export async function addInflowBlackList(params) {
  return http.post('/api/warehouse-inventories/add-black-list', params);
}

// cn加入黑名单
export async function addCNBlackList(params) {
  return http.post('/api/factory/warehouse-inventories/add-black-list', params);
}

// 还原黑名单
export async function addWhite(params) {
  return http.delete('/api/black-list/rollback', params);
}
