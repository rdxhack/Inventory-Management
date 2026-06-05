import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Inventory() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.inventory.list()
      .then(setInventory)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const getStockBadge = (qty) => {
    if (qty === 0) return 'badge-danger'
    if (qty <= 5) return 'badge-warning'
    return 'badge-success'
  }

  const getStockLabel = (qty) => {
    if (qty === 0) return 'Out of Stock'
    if (qty <= 5) return 'Low Stock'
    return 'In Stock'
  }

  return (
    <div>
      <div className="page-header">
        <h2>Inventory Tracking</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {loading ? (
          <p className="empty-state">Loading inventory...</p>
        ) : inventory.length === 0 ? (
          <p className="empty-state">No inventory data. Add products first.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.product_name}</td>
                    <td><code>{item.product_sku}</code></td>
                    <td>${Number(item.price).toFixed(2)}</td>
                    <td>{item.stock_quantity}</td>
                    <td>
                      <span className={`badge ${getStockBadge(item.stock_quantity)}`}>
                        {getStockLabel(item.stock_quantity)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
