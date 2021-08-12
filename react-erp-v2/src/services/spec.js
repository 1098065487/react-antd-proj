import http from '@/utils/http';

export async function fetchList(params) {
  return http.get('/api/specs', params);
}

export async function fetchAll(params) {
  return http.get('/api/specs/all', params);
}

export async function create(data) {
  return http.post('/api/specs', data);
}

export async function update(id, data) {
  return http.put(`/api/specs/${id}`, data);
}

export async function destroy(id) {
  return http.delete(`/api/specs/${id}`);
}

export async function fetchById(id) {
  return http.get(`/api/specs/${id}`);
}

export async function fetchValueList(params) {
  return http.get('/api/spec-values', params);
}

export async function createValue(data) {
  return http.post('/api/spec-values', data);
}

export async function updateValue(id, data) {
  return http.put(`/api/spec-values/${id}`, data);
}

export async function destroyValue(id) {
  return http.delete(`/api/spec-values/${id}`);
}
