import http from '@/utils/http';

export async function queryBrands(params: any) {
  return http.get('/api/brands', params);
}

export async function updateBrand(id: number, params: any) {
  return http.put(`/api/brands/${id}`, params);
}

export async function createBrand(params: any) {
  return http.post('/api/brands', params);
}

export async function removeBrand(id: number, params?: any) {
  return http.delete(`/api/brands/${id}`, params);
}

export async function getAllBrandList(params: any) {
  return http.get('/api/brand/options', params);
}
