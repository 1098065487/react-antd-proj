import http from '@/utils/http';

export async function getStoreList(params: any) {
  return http.get('/api/v1/stores', params);
}

export async function getSiteList(params: any) {
  return http.get('/api/v1/site', params);
}

export async function getList(params: any) {
  return http.get('/api/v1/report', params);
}

export async function hideSku(id: number) {
  return http.put(`/api/v1/store-products/display/${id}`);
}
