import http from '@/utils/http';

export async function getParentList(params: any) {
  return http.get('/api/v1/store-products', params);
}

export async function updateChild(id: number, params: any) {
  return http.put(`/api/v1/store-product-items/${id}`, params);
}

export async function createChild(params: any) {
  return http.post('/api/v1/store-product-items', params);
}
