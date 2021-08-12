import http from '@/utils/http';

export async function queryPlatforms(params: any) {
  return http.get('/api/platforms', params);
}

export async function createPlatform(params: any) {
  return http.post('/api/platforms', params);
}

export async function updatePlatform(id: number, params: any) {
  return http.put(`/api/platforms/${id}`, params);
}

export async function removePlatform(id: number, params?: any) {
  return http.delete(`/api/platforms/${id}`, params);
}
