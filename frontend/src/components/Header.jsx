import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaChevronDown, FaUser, FaSignOutAlt } from 'react-icons/fa';
import FotoProfil from '../assets/fotoprofil.jpg';

const Header = () => {
  const [studentName, setStudentName] = useState('Pengguna'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userString = localStorage.getItem('user');
    
    if (userString) {
      const user = JSON.parse(userString);
      // Gunakan nama dari localStorage
      if (user.nama) {
        setStudentName(user.nama.split(' ')[0]);
      }
    }
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    localStorage.clear(); // Hapus semua sesi
    window.location.href = '/login'; 
  };

  return (
    <header className="dashboard-header">
      <h1 className="header-title">Dashboard {localStorage.getItem('role') === 'admin' ? 'Admin' : 'Siswa'}</h1>
      
      <div className="header-controls">
        <FaBell className="header-notification-icon" />
        
        <div className="header-user-menu" onClick={toggleDropdown}>
          <div className="header-user-info clickable">
            <img src={FotoProfil} alt="User Avatar" className="header-user-avatar" />
            <span className="header-user-name">Halo, {studentName}!</span>
            <FaChevronDown className={`header-chevron ${isDropdownOpen ? 'rotate' : ''}`} />
          </div>

          {isDropdownOpen && (
            <div className="header-dropdown">
              <div className="dropdown-arrow"></div>
              {localStorage.getItem('role') === 'siswa' && (
                <Link to="/profil" className="dropdown-item">
                    <FaUser /> Profil Saya
                </Link>
              )}
              <div className="dropdown-item logout" onClick={handleLogout}>
                <FaSignOutAlt /> Keluar
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;