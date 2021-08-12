import http from '@/utils/http';

export async function fetchProducts(params) {
  return http.get('/api/products', params);
}

export async function fetchOneProduct(id, params) {
  return http.get(`/api/products/${id}`, params);
}

export async function createProducts(params) {
  return http.post('/api/products', params);
}

export async function updateProducts(id, params) {
  return http.put(`/api/products/${id}`, params);
}

export async function deleteProducts(id) {
  return http.delete(`/api/products/${id}`);
}

export async function fetchProductItems(params) {
  return http.get('/api/product-items', params);
}

export async function fetchAnProductItem(id, params) {
  return http.get(`/api/product-items/${id}`, params);
}

export async function updateProductItem(id, data) {
  return http.put(`/api/product-items/${id}`, data);
}

export async function createProductItems(id, specs) {
  return http.post(`/api/products/${id}/items`, specs);
}

export async function batchUpdateProductItems(params) {
  return http.post('/api/product-items/batch-save', params);
}

export async function deleteProductItems(id) {
  return http.delete(`/api/product-items/${id}`);
}

export async function storeProductDetail(id, detail) {
  return http.put(`/api/products/${id}/detail`, detail);
}

// 可售商品Api
export async function fetchSellerProducts(params) {
  return http.get('/api/seller/products', params);
}

export async function fetchAnSellerProduct(id, params) {
  return http.get(`/api/seller/products/${id}`, params);
}

export async function createOne(params) {
  return http.post('/api/seller/products', params);
}

export async function updateOne(id, params) {
  return http.put(`/api/seller/products/${id}`, params);
}

export async function generateSellerSku(params) {
  return http.post('/api/seller/products/sku', params);
}

export async function deleteSellerProduct(id) {
  return http.delete(`/api/seller/products/${id}`);
}

export async function fetchSellerProductItems(params) {
  return http.get('/api/seller/product-items', params);
}

export async function fetchAnSellerProductItem(id, params) {
  return http.get(`/api/seller/product-items/${id}`, params);
}

export async function createSellerProductItem(params) {
  return http.post('/api/seller/product-items', params);
}

export async function updateSellerProductItem(id, params) {
  return http.put(`/api/seller/product-items/${id}`, params);
}

export async function publishSellerProductItem(id, data) {
  return http.post(`/api/seller/product-items/${id}/publish`, data);
}

export async function batchPublishSellerProductItem(data) {
  return http.post(`/api/seller/product-items/do/batch`, data);
}

export async function deleteSellerProductItem(id) {
  return http.delete(`/api/seller/product-items/${id}`);
}

// 市场产品
export async function fetchPlatformProducts(params) {
  return http.get('/api/platform/products', params);
}

export async function createAnPlatformProduct(params) {
  return http.post('/api/platform/products', params);
}

export async function fetchAnPlatformProduct(id, params) {
  return http.get(`/api/platform/products/${id}`, params);
}

export async function updateOnePlatformProduct(id, params) {
  return http.put(`/api/platform/products/${id}`, params);
}

export async function fetchPlatformProductItems(params) {
  return http.get(`/api/platform/product-items`, params);
}

export async function fetchAnPlatformProductItem(id, params) {
  return http.get(`/api/platform/product-items/${id}`, params);
}

export async function deletePlatformProductItem(id) {
  return http.delete(`/api/platform/product-items/${id}`);
}


export async function fetchPlatformProductReports(params) {
  return http.get(`/api/platform/products/do/reports`, params);
}

export async function fetchPlatformProductMonthlyReports(id) {
  return http.get(`/api/platform/products/${id}/reports/monthly`);
}

export async function fetchPlatformProductDailyReports(id, params) {
  return http.get(`/api/platform/products/${id}/reports/daily`, params);
}

export async function createPlatformDailyNote(id, params) {
  return http.put(`/api/platform/products/${id}/reports/daily`, params);
}

export async function fetchDemands(params) {
  return http.get('/api/platform/product-item/demands', params);
}

export async function fetchItemDemand(id, params) {
  return http.get(`/api/platform/product-item/demand/${id}`, params);
}

export async function saveDemands(params) {
  return http.post('/api/platform/product-item/store-demands', params);
}

export async function fetchProductDemands(params) {
  return http.get('/api/product-items/demands', params);
}

export async function fetchSellerProductDemands(params) {
  return http.get('/api/seller/product-items/demands', params);
}

export async function fetchProductDetail(id) {
  return http.get(`/api/product-items/${id}/detail`);
}

export async function updateProductDetail(id, params) {
  return http.put(`/api/platform/product-items/${id}`, params);
}

export async function removeItem(id) {
  return http.delete(`/api/product-items/${id}`);
}

export async function getReviewsList(params) {
  return http.get('/api/platform/product-reviews', params);
}

export async function getQuestionAnswerList(params) {
  return http.get('/api/platform/product-questions', params);
}

export async function ifMatch(params) {
  return http.get('/api/platform/product-item/matchs', params);
}
