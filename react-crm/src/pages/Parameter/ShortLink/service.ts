import http from '@/utils/http';

export async function queryShortLink(params: any) {
  return http.get('/api/short_links', params);
}

export async function updateShortLink(id: number, params: any) {
  return http.put(`/api/short_links/${id}`, params);
}
