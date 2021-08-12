import http from '@/utils/http';

export async function fetchPlatforms(params) {
  return http.get('/api/platforms', params);
}

export async function fetchOptions() {
  return http.get('/api/platforms/options');
}

export async function fetchTree() {
  return http.get('/api/platforms/tree');
}

export async function fetchPlatformItems(params) {
  return http.get('/api/platform-items', params);
}

export async function createPlatforms(data) {
  return http.post('/api/platforms', data);
}

export async function updatePlatforms(id, data) {
  return http.put(`/api/platforms/${id}`, data);
}

export async function deletePlatforms(id) {
  return http.delete(`/api/platforms/${id}`);
}

export async function fetchMarketplaces(params) {
  return http.get('/api/marketplaces', params);
}

export async function fetchImports() {
  return http.get('/api/system/imports');
}

export async function fetchAnImport(id, params) {
  return http.get(`/api/system/imports/${id}`, params);
}

export async function createImports(params) {
  return http.post('/api/system/imports', params);
}

export async function acknowledgeImports(id, params) {
  return http.put(`/api/system/imports/${id}/acknowledge`, params);
}

export async function fetchExports(params) {
  return http.get('/api/system/exports', params);
}

export async function fetchAnExports(id, params) {
  return http.get(`/api/system/exports/${id}`, params);
}

export async function createAnExport(params) {
  return http.post('/api/system/exports', params);
}
