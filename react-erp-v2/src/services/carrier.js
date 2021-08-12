import http from '@/utils/http';

export async function fetchList(params) {
  return http.get('/api/carriers', params);
}

export async function fetchOption(params) {
  return http.get('/api/carrier-options', params)
}

export async function create(params) {
  return http.post('/api/carriers', params);
}

export async function update(id, params) {
  return http.put(`/api/carriers/${id}`, params);
}

export async function remove(id) {
  return http.delete(`/api/carriers/${id}`);
}
