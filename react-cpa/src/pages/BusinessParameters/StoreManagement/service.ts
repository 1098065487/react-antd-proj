import http from '@/utils/http';

export async function getStoreList(params: any) {
  return http.get('/api/v1/stores', params);
}

export async function updateStore(id: number, params: any) {
  return http.put(`/api/v1/stores/${id}`, params);
}

export async function createStore(params: any) {
  return http.post('/api/v1/stores', params);
}

export async function removeStore(id: number) {
  return http.delete(`/api/v1/stores/${id}`);
}

export async function getSiteList() {
  return http.get('/api/v1/site');
}
