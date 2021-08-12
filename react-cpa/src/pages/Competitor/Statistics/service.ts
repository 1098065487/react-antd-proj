import http from '@/utils/http';

// 获取statistics统计数据
export async function getStatistics(params: {
  id: number | undefined;
  siteId: number | undefined;
}) {
  return http.get('/api/statistics', params);
}
