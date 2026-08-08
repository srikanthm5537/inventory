// import React from 'react';
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
// } from 'recharts';
// import './Dashboard.css';

// const movementData = [
//   { name: 'Mon', inventory: 950 },
//   { name: 'Tue', inventory: 1020 },
//   { name: 'Wed', inventory: 980 },
//   { name: 'Thu', inventory: 1125 },
//   { name: 'Fri', inventory: 1060 },
//   { name: 'Sat', inventory: 1180 },
//   { name: 'Sun', inventory: 1248 },
// ];

// function Dashboard() {
//   return (
//     <>
//       <div className="content-header">
//         <div>
//           <h1>Dashboard</h1>
//         </div>
//         <div>
//           <h2 className="status-live">Live Status</h2>
//         </div>
//       </div>

//       <div className="dashboard-grid">
//         <div className="dashboard-card">
//           <p className="dashboard-card-title">Total Active SKUS</p>
//           <p className="dashboard-card-value">142</p>
//         </div>
//         <div className="dashboard-card">
//           <p className="dashboard-card-title">Total Stock Vakue</p>
//           <p className="dashboard-card-value">1,84,500</p>
//         </div>
//         <div className="dashboard-card">
//           <p className="dashboard-card-title">AT / Below Reorder Level</p>
//           <span className="dashboard-card-value" style={{color:"#b45309"}}>4</span>
//             <span className="action-required">Action Required</span>
//         </div>
//         <div className="dashboard-card">
//           <p className="dashboard-card-title">Transactions Today</p>
//           <p className="dashboard-card-value">28</p>
//         </div>
//       </div>

//       <div className="dashboard-section">
//         <div className="chart-card">
//           <h2>Inward vs Outward Movement (Last 14 Days)</h2>
//           <div className="chart-wrapper">
//             <ResponsiveContainer width="100%" height={280}>
//               <AreaChart data={movementData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
//                 <defs>
//                   <linearGradient id="inventoryGradient" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
//                     <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
//                 <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
//                 <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
//                 <Tooltip contentStyle={{ borderRadius: '0.75rem', borderColor: '#cbd5e1' }} />
//                 <Area type="monotone" dataKey="inventory" stroke="#2563eb" fill="url(#inventoryGradient)" strokeWidth={3} />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//         <div className="activity-card">
//           <h2>Recent Activity</h2>
//           <div className="activity-list">
//             <div className="activity-item">
//               <p>Stock updated for Item A in Warehouse 1.</p>
//               <span>5 minutes ago</span>
//             </div>
//             <div className="activity-item">
//               <p>New purchase order created for Item B.</p>
//               <span>22 minutes ago</span>
//             </div>
//             <div className="activity-item">
//               <p>Low stock alert triggered for Item C.</p>
//               <span>1 hour ago</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="dashboard-section">
//         <div className="table-card custm-table-card">
//           <h2>Low-Stock Severity Alert</h2>
//           <table className="low-stock-table">
//             <thead>
//               <tr>
//                 <th>SKU/Item</th>
//                 <th>Current</th>
//                 <th>Reorder</th>
//                 <th>Severity</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>Item C</td>
//                 <td>8</td>
//                 <td>20</td>
//                 <td><span className="status-low">Low</span></td>
//               </tr>
//               <tr>
//                 <td>Item D</td>
//                 <td>14</td>
//                 <td>30</td>
//                 <td><span className="status-medium">Medium</span></td>
//               </tr>
//               <tr>
//                 <td>Item E</td>
//                 <td>3</td>
//                 <td>15</td>
//                 <td><span className="status-low">Low</span></td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </>
//   );
// }

// export default Dashboard;


import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { fetchDashboardData } from '../Services/DashboardService';
import './Dashboard.css';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setLoading(true);
        const result = await fetchDashboardData();
        setData(result);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading" style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="dashboard-error" style={{ color: 'red', padding: '2rem' }}>{error}</div>;
  }

  const { metrics, movementData, recentTransactions, lowStockItems } = data;

  return (
    <>
      <div className="content-header">
        <div>
          <h1>Dashboard</h1>
        </div>
        <div>
          <h2 className="status-live">Live Status</h2>
        </div>
      </div>

      {/* FR-40: Dynamic KPI Tiles */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <p className="dashboard-card-title">Total Active SKUs</p>
          <p className="dashboard-card-value">{metrics.totalActiveSKUs}</p>
        </div>
        <div className="dashboard-card">
          <p className="dashboard-card-title">Total Stock Value</p>
          <p className="dashboard-card-value">${metrics.totalStockValue}</p>
        </div>
        <div className="dashboard-card">
          <p className="dashboard-card-title">AT / Below Reorder Level</p>
          <span className="dashboard-card-value" style={{ color: "#b45309" }}>{metrics.reorderLevelCount}</span>
          <span className="action-required">Action Required</span>
        </div>
        <div className="dashboard-card">
          <p className="dashboard-card-title">Transactions Today</p>
          <p className="dashboard-card-value">{metrics.transactionsToday}</p>
        </div>
      </div>

      <div className="dashboard-section">
        {/* FR-41: Inward vs Outward Bar Chart (Last 14 Days) */}
        <div className="chart-card" style={{ flex: 2 }}>
          <h2>Inward vs Outward Movement (Last 14 Days)</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={movementData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '0.75rem', borderColor: '#cbd5e1' }} />
                <Legend />
                <Bar dataKey="inward" name="Inward" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outward" name="Outward" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FR-42: 10 Most Recent Transactions */}
        <div className="activity-card" style={{ flex: 1 }}>
          <h2>Recent Transactions (10)</h2>
          <div className="activity-list" style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="activity-item" style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>{tx.item} ({tx.quantity} units)</span>
                  <span style={{ color: tx.type === 'INWARD' ? '#16a34a' : '#dc2626' }}>{tx.type}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>By {tx.user}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FR-43: Low-Stock Severity Alert Table */}
      <div className="dashboard-section">
        <div className="table-card custm-table-card" style={{ width: '100%' }}>
          <h2>Low-Stock Severity Alert</h2>
          <table className="low-stock-table">
            <thead>
              <tr>
                <th>SKU/Item</th>
                <th>Current Qty</th>
                <th>Reorder Level</th>
                <th>Shortfall</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map((item) => {
                const shortfall = item.reorderLevel - item.currentQty;
                return (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong> ({item.sku})</td>
                    <td>{item.currentQty}</td>
                    <td>{item.reorderLevel}</td>
                    <td style={{ color: '#dc2626', fontWeight: 'bold' }}>-{shortfall}</td>
                    <td>
                      <span className={`status-${item.severity.toLowerCase()}`}>
                        {item.severity}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Dashboard;