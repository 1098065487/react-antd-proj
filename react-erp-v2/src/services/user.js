import http from '@/utils/http';

export async function fetchCurrent() {
  return http.get('/api/auth/info');
}

export async function fetchAuthNotices(params) {
  return http.get('/api/auth/notices', params);
}

export async function fetchAuthUnreadNotices() {
  return http.get('/api/auth/unread-notices');
}

export async function readAuthNotice(id) {
  return http.put(`/api/auth/notices/${id}`);
}

export async function fetchUsers(params) {
  return http.get('/api/users', params);
}

export async function createUsers(params) {
  return http.post('/api/users', params);
}

export async function updateUsers(id, params) {
  return http.put(`/api/users/${id}`, params);
}

export async function removeUser(id) {
  return http.delete(`/api/users/${id}`);
}

export async function fetchRoles(id) {
  return http.get(`/api/users/${id}/roles`);
}

export async function assignRoles(id, roles) {
  return http.put(`/api/users/${id}/roles`, { roles });
}

export async function fetchUserLists(params) {
  return http.get('/api/user-options', params);
}

export async function fetchPermissions(id) {
  return http.get(`/api/users/${id}/permissions`);
}

export async function assignPermissions(id, permissions) {
  return http.put(`/api/users/${id}/permissions`, { permissions });
}

export async function fetchAuthImports(params) {
  return http.get('/api/auth/imports', params);
}

export async function fetchAuthExports(params) {
  return http.get('/api/auth/exports', params);
}

export async function updateAuthPassword(params) {
  return http.put('/api/auth/password', params);
}

export async function updateAuthInfo(params) {
  return http.put('/api/auth', params);
}

export async function updateAuthDynamic(params) {
  return http.put('/api/auth/dynamic', params);
}

// 后台用户注册
export async function authRegister(params) {
  return http.post('/api/auth/join', params);
}
