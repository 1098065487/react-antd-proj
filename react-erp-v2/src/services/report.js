import http from '@/utils/http';

export async function getWeeklyOrder(params) {
  return http.get('/api/reports/orders', params);
}

export async function getSalesDate(params) {
  return http.get('/api/reports/sales', params);
}

export async function getSalesProportion(params) {
  return http.get('/api/reports/sales-proportion', params);
}

export async function getTopSale(params) {
  return http.get('/api/reports/hot-goods-ranking', params);
}
