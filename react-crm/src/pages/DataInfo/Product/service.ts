import http from '@/utils/http';

export async function queryProducts(params: any) {
  return http.get('/api/products', params);
}

export async function createProduct(params: any) {
  return http.post('/api/products', params);
}

export async function updateProduct(id: number, params: any) {
  return http.put(`/api/products/${id}`, params);
}
