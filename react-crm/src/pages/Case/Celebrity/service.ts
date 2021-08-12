import http from '@/utils/http';

export async function queryCelebrities(params: any) {
  return http.get('/api/celebrities', params);
}

export async function createCelebrity(params: any) {
  return http.post('/api/celebrities', params);
}

export async function updateCelebrity(id: number, params: any) {
  return http.put(`/api/celebrities/${id}`, params);
}

export async function queryStatistic() {
  return http.get('/api/celebrities/numbers');
}

export async function setStatus(id: number, params: any) {
  return http.put(`/api/celebrities/${id}/status`, params)
}
