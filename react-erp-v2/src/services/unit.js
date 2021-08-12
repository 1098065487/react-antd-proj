import http from '@/utils/http';

export async function fetchList(params) {
  return http.get('/api/units', params);
}

export async function fetchOptions(params) {
  return http.get('/api/unit-options', params);
}

export async function create(data) {
  return http.post('/api/units', data);
}

export async function update(id, data) {
  return http.put(`/api/units/${id}`, data);
}

export async function destroy(id) {
  return http.delete(`/api/units/${id}`);
}
