import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Star, 
  Truck, 
  BrainCircuit, 
  BarChart3,
  Search,
  Activity,
  Database
} from 'lucide-react';

const MainLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/sellers', label: 'Sellers', icon: Users },
    { path: '/categories', label: 'Products & Categories', icon: Package },
    { path: '/satisfaction', label: 'Customer Satisfaction', icon: Star },
    { path: '/delivery', label: 'Delivery Analytics', icon: Truck },
    { path: '/predictive', label: 'Predictive Analytics', icon: BrainCircuit },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide leading-none">Seller Intelligence</h1>
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold mt-1 inline-block">Olist BI Platform</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Analytics Dimensions</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: linkActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    (linkActive && item.path === location.pathname) || (item.path !== '/' && location.pathname.startsWith(item.path))
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* System Info Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Database className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="font-medium text-slate-300">Olist Brazilian E-Commerce</p>
              <p className="text-[10px] text-slate-500">Live FastAPI Connection</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 z-10">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-white capitalize">
              {navItems.find(i => i.path === location.pathname)?.label || 'Seller Intelligence'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Dataset Loaded: 99.4k Orders</span>
            </div>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
