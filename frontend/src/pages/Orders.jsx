import { useEffect, useState } from 'react'
import { api } from '../api/client'
import Modal from '../components/Modal'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([api.orders.list(), api.customers.list(), api.products.list()])
      .then(([o, c, p]) => {
        setOrders(o)
        setCustomers(c)
        setProducts(p)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setCustomerId('')
    setItems([{ product_id: '', quantity: 1 }])
    setError('')
    setSuccess('')
    setShowModal(true)
  }

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }])
  }

  const removeItem = (index) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const payload = {
      customer_id: parseInt(customerId, 10),
      items: items.map((item) => ({
        product_id: parseInt(item.product_id, 10),
        quantity: parseInt(item.quantity, 10),
      })),
    }

    try {
      await api.orders.create(payload)
      setShowModal(false)
      setSuccess('Order placed successfully. Stock has been reduced automatically.')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const getStock = (productId) => {
    const product = products.find((p) => p.id === parseInt(productId, 10))
    return product ? product.stock_quantity : null
  }

  return (
    <div>
      <div className="page-header">
        <h2>Orders</h2>
        <button className="btn btn-primary" onClick={openCreate}>Create Order</button>
      </div>

      {error && !showModal && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        {loading ? (
          <p className="empty-state">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="empty-state">No orders yet. Create your first order.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>
                      <div>{o.customer_name}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{o.customer_email}</small>
                    </td>
                    <td>
                      {o.items.map((item) => (
                        <div key={item.id} style={{ fontSize: '0.85rem' }}>
                          {item.product_name} × {item.quantity}
                        </div>
                      ))}
                    </td>
                    <td>${Number(o.total_amount).toFixed(2)}</td>
                    <td><span className="badge badge-success">{o.status}</span></td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Create Order" onClose={() => setShowModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                Order Items
              </label>
              {items.map((item, index) => {
                const stock = getStock(item.product_id)
                return (
                  <div key={index} className="order-item-row">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <select
                        value={item.product_id}
                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                        required
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (SKU: {p.sku}) — Stock: {p.stock_quantity}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <input
                        type="number"
                        min="1"
                        max={stock || undefined}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    <button type="button" className="btn btn-danger" onClick={() => removeItem(index)}>×</button>
                  </div>
                )
              })}
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginTop: '0.5rem' }}>
                + Add Item
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Place Order</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
