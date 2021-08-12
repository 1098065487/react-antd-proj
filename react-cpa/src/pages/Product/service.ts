import http from '@/utils/http';

export async function getStoreList(params: any) {
  return http.get('/api/v1/stores', params);
}

export async function getProductList(params: any) {
  return http.get('/api/v1/store-products', params);
}
