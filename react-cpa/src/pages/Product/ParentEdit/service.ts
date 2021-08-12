import http from '@/utils/http';

export async function getAllChildren(params: any) {
  return http.get('/api/v1/store-product-items', params);
}

export async function UpdateParent(id: number, params: any) {
  return http.put(`/api/v1/store-products/${id}`, params);
}

export async function CreateParent(params: any) {
  return http.post('/api/v1/store-products', params);
}
