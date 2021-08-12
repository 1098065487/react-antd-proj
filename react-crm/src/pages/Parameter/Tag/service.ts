import http from '@/utils/http';

export async function queryTags(params: any) {
  return http.get('/api/tags', params);
}

export async function createTag(params: any) {
  return http.post('/api/tags', params);
}

export async function updateTag(id: number, params: any) {
  return http.put(`/api/tags/${id}`, params)
}

export async function removeTag(id: number, params?: any) {
  return http.delete(`/api/tags/${id}`, params)
}

export async function getAllTags(params: any) {
  return http.get('/api/tag/all', params);
}
