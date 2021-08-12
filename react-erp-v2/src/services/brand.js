import http from '@/utils/http';

export async function fetchList(params) {
  return http.get('/api/brands', params);
}

export async function fetchOptions(params) {
  return http.get('/api/brand-options', params);
}

export async function create(data) {
  return http.post('/api/brands', data);
}

export async function update(id, data) {
  return http.put(`/api/brands/${id}`, data);
}

export async function destroy(id) {
  return http.delete(`/api/brands/${id}`);
}
