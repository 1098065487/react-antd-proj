import http from '@/utils/http';

export async function fetchWarehouse(params) {
  return http.get('/api/warehouses', params);
}

export async function createWarehouse(params) {
  return http.post('/api/warehouses', params);
}

export async function updateWarehouse(id, params) {
  return http.put(`/api/warehouses/${id}`, params);
}

export async function deleteWarehouse(id) {
  return http.delete(`/api/warehouses/${id}`);
}

export async function fetchWarehouseOptions() {
  return http.get('/api/warehouse-options');
}

export async function fetchWarehouseInventory(params) {
  return http.get('/api/warehouse-inventories', params);
}

export async function createInventory(params) {
  return http.post('/api/warehouse-inventories', params);
}

export async function updateInventory(id, params) {
  return http.put(`/api/warehouse-inventories/${id}`, params);
}

export async function removeInventory(id) {
  return http.delete(`/api/warehouse-inventories/${id}`);
}

export async function createBox(params) {
  return http.post('/api/warehouse-inventories/locations', params);
}

export async function updateBox(id, params) {
  return http.put(`/api/warehouse-inventories/locations/${id}`, params);
}

export async function removeBox(id) {
  return http.delete(`/api/warehouse-inventories/locations/${id}`);
}

export async function getProductSkuOptions(params) {
  return http.get('/api/seller/product-items', params);
}

export async function getDemandReportList(params) {
  return http.get('/api/product/reports', params);
}
