import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaChevronDown, FaUser, FaSignOutAlt } from 'react-icons/fa';
import BoyProfile from '../assets/boy.png';
import GirlProfile from '../assets/girl.png';
import LogoSekolah from '../assets/logo-sdit-alhidayah.png'; 

// Gunakan fetchWithAuth agar aman
import { fetchWithAuth } from '../utils/api'; 

const Header = () => {
  const [studentName, setStudentName] = useState('Pengguna'); 
  // Default foto menggunakan Logo (aman untuk admin)
  const [userPhoto, setUserPhoto] = useState(LogoSekolah); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    
    if (userString) {
      const user = JSON.parse(userString);
      
      // 1. Set Nama Depan
      if (user.nama) {
        setStudentName(user.nama.split(' ')[0]);
      }

      // 2. Logika Foto Profil Berdasarkan Gender
      if (role === 'admin') {
        setUserPhoto(LogoSekolah);
      } else if (role === 'siswa') {
        // Cek apakah jenis_kelamin sudah ada di localStorage (dari login terbaru)
        if (user.jenis_kelamin) {
             setUserPhoto(user.jenis_kelamin === 'P' ? GirlProfile : BoyProfile);
        } else {
             // Jika tidak ada, fetch detail siswa
             fetchWithAuth(`http://localhost:5000/api/siswa/${user.id}`)
              .then(res => res.json())
              .then(data => {
                  setUserPhoto(data.jenis_kelamin === 'P' ? GirlProfile : BoyProfile);
              })
              .catch(err => {
                  console.error("Gagal load foto header:", err);
                  setUserPhoto(BoyProfile); // Fallback aman
              });
        }
      }
    }
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsDropdownOpen(false);
    window.location.href = '/login'; 
  };

  // Teks Judul berdasarkan role
  const role = localStorage.getItem('role');
  const titleRole = role === 'admin' ? 'Admin' : 'Siswa';

  return (
    <header className="dashboard-header">
      <h1 className="header-title">Dashboard {titleRole}</h1>
      
      <div className="header-controls">
        <FaBell className="header-notification-icon" />
        
        <div className="header-user-menu" onClick={toggleDropdown}>
          <div className="header-user-info clickable">
            {/* Gunakan state userPhoto */}
            <img 
              src={userPhoto} 
              alt="User Avatar" 
              className="header-user-avatar" 
            />
            <span className="header-user-name">Halo, {studentName}!</span>
            <FaChevronDown className={`header-chevron ${isDropdownOpen ? 'rotate' : ''}`} />
          </div>

          {isDropdownOpen && (
            <div className="header-dropdown">
              <div className="dropdown-arrow"></div>
              
              {role === 'siswa' && (
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