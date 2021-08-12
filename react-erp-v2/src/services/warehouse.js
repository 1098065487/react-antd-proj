import http from '@/utils/http';

export async function fetchWarehouses(params) {
  return http.get('/api/warehouses', params);
}

export async function fetchWarehouseOptions(params) {
  return http.get('/api/warehouse-options', params);
}

export async function fetchWarehouseInventories(params) {
  return http.get('/api/warehouse-inventories', params);
}
