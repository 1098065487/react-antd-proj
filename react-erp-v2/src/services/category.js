import http from '@/utils/http';

export async function fetchList(params) {
  return http.get('/api/categories', params);
}

export async function fetchTreeData(params) {
  return http.get('/api/category-trees', params);
}

export async function fetchOptions(params) {
  return http.get('/api/category-options', params);
}

export async function fetchOne(id, params) {
  return http.get(`/api/categories/${id}`, params);
}

export async function create(data) {
  return http.post('/api/categories', data);
}

export async function update(id, data) {
  return http.put(`/api/categories/${id}`, data);
}

export async function removeCategory(id) {
  return http.delete(`/api/categories/${id}`);
}
