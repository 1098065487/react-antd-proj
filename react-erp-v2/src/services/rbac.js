import http from '@/utils/http';

export async function fetchAllRoles(params) {
  return http.get('/api/rbac/roles/all', params);
}

export async function fetchRoles(params) {
  return http.get('/api/rbac/roles', params);
}

export async function createRoles(params) {
  return http.post('/api/rbac/roles', params);
}

export async function updateRoles(id, params) {
  return http.put(`/api/rbac/roles/${id}`, params);
}

export async function deleteRoles(id) {
  return http.delete(`/api/rbac/roles/${id}`);
}

export async function fetchRolePermissions(roleId) {
  return http.get(`/api/rbac/roles/${roleId}/permissions`);
}

export async function assignPermissions(roleId, permissions) {
  return http.put(`/api/rbac/roles/${roleId}/permissions`, { permissions });
}

export async function fetchAllPermissions(params) {
  return http.get('/api/rbac/permissions/all', params);
}

export async function fetchPermissions(params) {
  return http.get('/api/rbac/permissions', params);
}

export async function createPermissions(params) {
  return http.post('/api/rbac/permissions', params);
}

export async function updatePermissions(id, params) {
  return http.put(`/api/rbac/permissions/${id}`, params);
}

export async function deletePermissions(id) {
  return http.delete(`/api/rbac/permissions/${id}`);
}
