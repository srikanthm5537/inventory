import React, { useState } from 'react';
import './BaseLayout.css';
import { NavLink, Outlet } from 'react-router-dom';

function BaseLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="base-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">Inventory App</div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>Dashboard</NavLink>
          <NavLink to="/itemmaster" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>Master Item</NavLink>
          <NavLink to="/masterslocation" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>Masters Locations</NavLink>
          <NavLink to="/transaction" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>Transaction</NavLink>
          <NavLink to="/stockledger" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>Stock Ledger</NavLink>
          <NavLink to="/report" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>Reports</NavLink>
          <NavLink to="/" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>Logout</NavLink>
        </nav>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">×</button>
      </aside>
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="content-area">
        <header className="mobile-topbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">☰</button>
          <div className="mobile-title">Inventory App</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

export default BaseLayout;