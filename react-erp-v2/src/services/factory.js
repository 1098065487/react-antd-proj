import http from '@/utils/http';

export async function fetchProductItems(params) {
  return http.get('/api/factory/product-items', params);
}

export async function createProductItems(params) {
  return http.post('/api/factory/product-items', params);
}

export async function updateProductItems(id, params) {
  return http.put(`/api/factory/product-items/${id}`, params);
}

export async function fetchWarehouses(params) {
  return http.get('/api/factory/warehouses', params);
}

export async function createWarehouse(params) {
  return http.post('/api/factory/warehouses', params);
}

export async function updateWarehouse(id, params) {
  return http.put(`/api/factory/warehouses/${id}`, params);
}

export async function deleteWarehouse(id) {
  return http.delete(`/api/factory/warehouses/${id}`);
}

export async function fetchWarehouseOptions(params) {
  return http.get('/api/factory/warehouse-options', params);
}

export async function fetchWarehouseInventories(params) {
  return http.get('/api/factory/warehouse-inventories', params);
}

export async function createInventory(params) {
  return http.post('/api/factory/warehouse-inventories', params);
}

export async function updateInventory(id, params) {
  return http.put(`/api/factory/warehouse-inventories/${id}`, params);
}

export async function removeInventory(id) {
  return http.delete(`/api/factory/warehouse-inventories/${id}`);
}

export async function fetchProducts(params) {
  return http.get('/api/factory/products', params);
}

export async function createProduct(params) {
  return http.post('/api/factory/product-items', params);
}

export async function updateProduct(id, params) {
  return http.put(`/api/factory/product-items/${id}`, params);
}

export async function createFatherProduct(params) {
  return http.post('/api/factory/products', params);
}

export async function updateFatherProduct(id, params) {
  return http.put(`/api/factory/products/${id}`, params)
}

export async function deleteFatherProduct(id) {
  return http.delete(`/api/factory/products/${id}`);
}

export async function deleteProduct(id) {
  return http.delete(`/api/factory/product-items/${id}`);
}

export async function searchFactorySku(params) {
  return http.get('/api/factory/product-items/options', params);
}

export async function fetchProduction(params) {
  return http.get('/api/factory/productions', params);
}

export async function createProduction(params) {
  return http.post('/api/factory/productions', params);
}

export async function updateProduction(id, params) {
  return http.put(`/api/factory/productions/${id}`, params);
}

export async function deleteProduction(id) {
  return http.delete(`/api/factory/productions/${id}`);
}

export async function fetchProductionDetail(params) {
  return http.get('/api/factory/production-items', params);
}

export async function getFactorySkuOptions(params) {
  return http.get('/api/factory/product-items', params);
}

export async function changeProductionItemStatus(params) {
  return http.put('/api/factory/production-item-status', params);
}

export async function fetchProductionDemand(params) {
  return http.get('/api/factory/orders', params);
}

export async function createProductionDemand(params) {
  return http.post('/api/factory/orders', params);
}

export async function updateProductionDemand(id, params) {
  return http.put(`/api/factory/orders/${id}`, params)
}

export async function deleteProductionDemand(id) {
  return http.delete(`/api/factory/orders/${id}`);
}

export async function getProductionDetailList(params) {
  return http.get('/api/factory/production-items-all', params)
}

export async function getOrderDetail(id, params) {
  return http.get(`/api/factory/orders/${id}`, params);
}


