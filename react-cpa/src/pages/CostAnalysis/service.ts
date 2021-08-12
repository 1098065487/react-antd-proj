import http from '@/utils/http';

export async function getList(params: any) {
  return http.get('/api/v1/finance/main-data', params);
}

export async function getStoreList(params: any) {
  return http.get('/api/v1/stores', params);
}

export async function getSiteList(params: any) {
  return http.get('/api/v1/site', params);
}

export async function queryTotalData(params?: any) {
  return http.get('/api/v1/finance/header-data', params);
}

export async function setToTop(id: number) {
  return http.post(`/api/v1/store-product-item/top/${id}`);
}

export async function getDefaultRange() {
  return http.get('/api/v1/finance/date');
}
