import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaExchangeAlt, 
  FaUsers, 
  FaSignOutAlt, 
  FaChevronLeft,
  FaHandHoldingUsd,
  FaFileAlt,
  FaUserCog
} from 'react-icons/fa';
import LogoSekolah from '../../assets/logo-sdit-alhidayah.png';

const AdminSidebar = ({ isCollapsed, toggleSidebar }) => {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{backgroundColor: '#2c3e50', overflow: 'visible', zIndex: 20}}> 
      
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <FaChevronLeft />
      </button>

      <div className="sidebar-logo">
        <img src={LogoSekolah} alt="Logo" className="sidebar-school-logo" />
      </div>

      <nav className="sidebar-menu">
        <ul>
          <li>
            <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
              <FaTachometerAlt className="sidebar-menu-icon" />
              <span className="menu-text">Admin Dashboard</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink to="/admin/input-transaksi" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaExchangeAlt className="sidebar-menu-icon" />
              <span className="menu-text">Setor Tunai</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/penarikan" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaHandHoldingUsd className="sidebar-menu-icon" />
              <span className="menu-text">Penarikan Tunai</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/laporan" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaFileAlt className="sidebar-menu-icon" />
              <span className="menu-text">Laporan Keuangan</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/data-siswa" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaUsers className="sidebar-menu-icon" />
              {/* UBAH TEKS INI */}
              <span className="menu-text">Kelola Siswa</span> 
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/manage-admin" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaUserCog className="sidebar-menu-icon" />
              <span className="menu-text">Manajemen Admin</span>
            </NavLink>
          </li>
          <li style={{marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px'}}>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaSignOutAlt className="sidebar-menu-icon" />
              <span className="menu-text">Ke Halaman Siswa</span>
            </NavLink>
          </li>

          
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;