import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, lowStock: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.products.list(), api.customers.list(), api.orders.list(), api.inventory.list()])
      .then(([products, customers, orders, inventory]) => {
        setStats({
          products: products.length,
          customers: customers.length,
          orders: orders.length,
          lowStock: inventory.filter((p) => p.stock_quantity <= 5).length,
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="empty-state">Loading dashboard...</p>

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Products</div>
          <div className="value">{stats.products}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Customers</div>
          <div className="value">{stats.customers}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Orders</div>
          <div className="value">{stats.orders}</div>
        </div>
        <div className="stat-card">
          <div className="label">Low Stock Items</div>
          <div className="value" style={{ color: stats.lowStock > 0 ? 'var(--warning)' : 'inherit' }}>
            {stats.lowStock}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn btn-primary">Manage Products</Link>
          <Link to="/customers" className="btn btn-secondary">Manage Customers</Link>
          <Link to="/orders" className="btn btn-secondary">Create Order</Link>
          <Link to="/inventory" className="btn btn-secondary">View Inventory</Link>
        </div>
      </div>
    </div>
  )
}
