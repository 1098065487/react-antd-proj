import http from '@/utils/http';

export async function queryUsers(params: any) {
  return http.get('/api/users', params);
}

export async function createUser(params: any) {
  return http.post('/api/users', params);
}

export async function updateUser(id: number, params: any) {
  return http.put(`/api/users/${id}`, params)
}

export async function removeUser(id: number) {
  return http.delete(`/api/users/${id}`);
}
