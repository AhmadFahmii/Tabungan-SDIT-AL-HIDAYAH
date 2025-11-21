import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaChartLine, 
  FaWallet, 
  FaBook, 
  FaUserCircle, 
  FaRegChartBar,
  FaChevronLeft 
} from 'react-icons/fa';
import LogoSekolah from '../assets/logo-sdit-alhidayah.png';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <FaChevronLeft />
      </button>

      <div className="sidebar-logo">
        <img src={LogoSekolah} alt="Logo SDIT AL-HIDAYAH" className="sidebar-school-logo" />
      </div>

      <nav className="sidebar-menu">
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaChartLine className="sidebar-menu-icon" />
              <span className="menu-text">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/profil" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaUserCircle className="sidebar-menu-icon" />
              <span className="menu-text">Profil</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/saldo" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaWallet className="sidebar-menu-icon" />
              <span className="menu-text">Lihat Saldo</span>
              <span className="sidebar-menu-indicator"></span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/riwayat" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaBook className="sidebar-menu-icon" />
              <span className="menu-text">Riwayat Transaksi</span>
              <span className="sidebar-menu-indicator"></span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/laporan" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaRegChartBar className="sidebar-menu-icon" />
              <span className="menu-text">Laporan</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;