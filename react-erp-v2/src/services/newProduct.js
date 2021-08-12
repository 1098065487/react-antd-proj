import http from '@/utils/http';

export async function fetchList(params) {
  return http.get('/api/new-products', params);
}

export async function create(params) {
  return http.post('/api/workflow-runs', params);
}

export async function fetchProofingList(params) {
  return http.get('/api/new-product/proofings', params);
}

export async function fetchProcess(id) {
  return http.get(`/api/workflow-runs/${id}`);
}

export async function fetchAttributes(id) {
  return http.get(`/api/category-configs/${id}`);
}

export async function submitToNext(id, params) {
  return http.put(`/api/workflow-runs/${id}`, params);
}

export async function fetchDevelopInfo(id, params) {
  return http.get(`/api/new-products/${id}`, params);
}

export async function fetchProofingInfo(id, params) {
  return http.get(`/api/new-product/proofings/${id}`, params);
}

export async function fetchWorkflowLog(params) {
  return http.get('/api/workflow-run-steps', params);
}

export async function fetchStepOption(params) {
  return http.get('/api/workflow/step-options', params)
}
