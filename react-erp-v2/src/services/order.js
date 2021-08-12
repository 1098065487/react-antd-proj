import http from '@/utils/http';

export async function fetchOrders(params) {
  return http.get('/api/orders', params);
}

export async function updateOrder(id, params) {
  return http.put(`/api/orders/${id}`, params);
}

export async function createOrder(params) {
  return http.post('/api/orders', params);
}

export async function fetchAnOrders(id, params) {
  return http.get(`/api/orders/${id}`, params);
}

export async function fetchOrderItems(params) {
  return http.get('/api/order-items', params);
}

export async function shipOrder(id, params) {
  return http.post(`/api/orders/${id}/ship`, params);
}

export async function editShipOrder(id, params) {
  return http.put(`/api/orders/${id}/ship`, params);
}

export async function updateOrderProductItem(id, params) {
  return http.put(`/api/order-items/${id}`, params)
}
