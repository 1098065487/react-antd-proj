import http from '@/utils/http';

export async function fetchList(params) {
  return http.get('/api/attributes', params);
}

export async function create(data) {
  return http.post('/api/attributes', data);
}

export async function update(id, data) {
  return http.put(`/api/attributes/${id}`, data);
}

export async function destroy(id) {
  return http.delete(`/api/attributes/${id}`);
}

export async function fetcAll(params) {
  return http.get('/api/attributes/all', params);
}

export async function fetchValueList(params) {
  return http.get('/api/attribute-values', params);
}

export async function createValues(data) {
  return http.post('/api/attribute-values', data);
}

export async function updateValues(id, data) {
  return http.put(`/api/attribute-values/${id}`, data);
}

export async function destroyValues(id) {
  return http.delete(`/api/attribute-values/${id}`);
}
