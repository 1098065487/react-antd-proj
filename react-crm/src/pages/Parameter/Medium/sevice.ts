import http from '@/utils/http';

export async function queryMedium(params: any) {
  return http.get('/api/mediums', params);
}

export async function createMedium(params: any) {
  return http.post('/api/mediums', params);
}

export async function updateMedium(id: number, params: any) {
  return http.put(`/api/mediums/${id}`, params);
}

export async function removeMedium(id: number, params?: any) {
  return http.delete(`/api/mediums/${id}`, params);
}
