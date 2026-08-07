import React from 'react';
import './BaseLayout.css';
import { NavLink, Outlet } from 'react-router-dom';

function BaseLayout() {
  return (
    <div className="base-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">Inventory App</div>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `sidebar-item${isActive ? ' active' : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/itemmaster"
            className={({ isActive }) =>
              `sidebar-item${isActive ? ' active' : ''}`
            }
          >
            Master Item
          </NavLink>
          <NavLink
            to="/masterslocation"
            className={({ isActive }) =>
              `sidebar-item${isActive ? ' active' : ''}`
            }
          >
            Masters Locations
          </NavLink>
          <NavLink
            to="/transaction"
            className={({ isActive }) =>
              `sidebar-item${isActive ? ' active' : ''}`
            }
          >
            Transaction
          </NavLink>
          <NavLink
            to="/stockledger"
            className={({ isActive }) =>
              `sidebar-item${isActive ? ' active' : ''}`
            }
          >
            Stock Ledger
          </NavLink>
           <NavLink
            to="/report"
            className={({ isActive }) =>
              `sidebar-item${isActive ? ' active' : ''}`
            }
          >
            Reports
          </NavLink>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `sidebar-item${isActive ? ' active' : ''}`
            }
          >
            Logout
          </NavLink>
        </nav>
      </aside>

      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
}

export default BaseLayout;