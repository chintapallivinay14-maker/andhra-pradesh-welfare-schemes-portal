import React from 'react';
import { NavLink } from 'react-router-dom';
import { Landmark, Search, Bot, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-brand">
        <div className="brand-icon-box">
          <Landmark size={20} color="#ffffff" />
        </div>
        <span>AI Schemes Navigator</span>
      </NavLink>
      
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Home
        </NavLink>
        <NavLink to="/browse" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Search size={15} /> Browse Directory
        </NavLink>
        <NavLink to="/ai-assistant" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Bot size={15} /> Buddy AI
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <LayoutDashboard size={15} /> Dashboard
        </NavLink>
      </div>
    </nav>
  );
}