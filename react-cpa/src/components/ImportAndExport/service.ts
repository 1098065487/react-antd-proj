import http from '@/utils/http';

export async function upload(params: any) {
  return http.post('/api/v1/system/imports/direct', params);
}

export async function getUploadResult(id: number) {
  return http.get(`/api/v1/system/imports/${id}`);
}

export async function queryImports(params: any) {
  return http.get('/api/v1/system/imports', params);
}

export async function queryExports(params: any) {
  return http.get('/api/v1/system/exports', params);
}

export async function systemExport(params: any) {
  return http.post('/api/v1/system/exports', params);
}
