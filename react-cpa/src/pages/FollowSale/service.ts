import http from '@/utils/http';

export async function getFollowSaleList(params: any) {
  return http.get('/api/v1/follow-asins', params);
}

export async function getFollowDetail(params: any) {
  return http.get('/api/v1/follow-asin-records', params);
}
