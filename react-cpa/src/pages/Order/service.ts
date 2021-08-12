import http from '@/utils/http';

export async function getStoreList(params: any) {
  return http.get('/api/v1/stores', params);
}

export async function getOrderList(params: any) {
  return http.get('/api/v1/orders', params);
}
