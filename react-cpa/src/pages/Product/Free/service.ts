import http from '@/utils/http';

export async function getFreeProduct(params: any) {
  return http.get('/api/v1/store-product-items', params);
}
