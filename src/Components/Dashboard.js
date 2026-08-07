import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import './Dashboard.css';

const movementData = [
  { name: 'Mon', inventory: 950 },
  { name: 'Tue', inventory: 1020 },
  { name: 'Wed', inventory: 980 },
  { name: 'Thu', inventory: 1125 },
  { name: 'Fri', inventory: 1060 },
  { name: 'Sat', inventory: 1180 },
  { name: 'Sun', inventory: 1248 },
];

function Dashboard() {
  return (
    <>
      <div className="content-header">
        <div>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <p className="dashboard-card-title">Total Items</p>
          <p className="dashboard-card-value">1,248</p>
        </div>
        <div className="dashboard-card">
          <p className="dashboard-card-title">Stock Movement</p>
          <p className="dashboard-card-value">+22%</p>
        </div>
        <div className="dashboard-card">
          <p className="dashboard-card-title">Low Stock Items</p>
          <p className="dashboard-card-value">12</p>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="chart-card">
          <h2>Movement Chart</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={movementData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="inventoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '0.75rem', borderColor: '#cbd5e1' }} />
                <Area type="monotone" dataKey="inventory" stroke="#2563eb" fill="url(#inventoryGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="activity-card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <p>Stock updated for Item A in Warehouse 1.</p>
              <span>5 minutes ago</span>
            </div>
            <div className="activity-item">
              <p>New purchase order created for Item B.</p>
              <span>22 minutes ago</span>
            </div>
            <div className="activity-item">
              <p>Low stock alert triggered for Item C.</p>
              <span>1 hour ago</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="table-card">
          <h2>Low-Stock Table</h2>
          <table className="low-stock-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Item C</td>
                <td>8</td>
                <td>20</td>
                <td><span className="status-low">Low</span></td>
              </tr>
              <tr>
                <td>Item D</td>
                <td>14</td>
                <td>30</td>
                <td><span className="status-medium">Medium</span></td>
              </tr>
              <tr>
                <td>Item E</td>
                <td>3</td>
                <td>15</td>
                <td><span className="status-low">Low</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Dashboard;