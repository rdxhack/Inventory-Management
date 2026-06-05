const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function request(path, options = {}) {
  const headers = { ...options.headers }
  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    const message = typeof error.detail === 'string'
      ? error.detail
      : Array.isArray(error.detail)
        ? error.detail.map((e) => e.msg).join(', ')
        : 'Request failed'
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  products: {
    list: () => request('/products'),
    create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },
  customers: {
    list: () => request('/customers'),
    create: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request('/orders'),
    create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  },
  inventory: {
    list: () => request('/inventory'),
  },
}
