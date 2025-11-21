import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaChevronDown, FaUser, FaSignOutAlt } from 'react-icons/fa';
import BoyProfile from '../assets/boy.png';
import GirlProfile from '../assets/girl.png';
import LogoSekolah from '../assets/logo-sdit-alhidayah.png'; // Default untuk admin

const Header = () => {
  const [studentName, setStudentName] = useState('Pengguna'); 
  const [userPhoto, setUserPhoto] = useState(LogoSekolah); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userString = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    
    if (userString) {
      const user = JSON.parse(userString);
      
  
      if (user.nama) {
        setStudentName(user.nama.split(' ')[0]);
      }

      // Logika Foto Profil Berdasarkan Gender
      if (role === 'admin') {
        setUserPhoto(LogoSekolah);
      } else if (role === 'siswa' && token) {
        // Kita fetch data detail siswa untuk memastikan dapat jenis_kelamin terbaru
        fetch(`http://localhost:5000/api/siswa/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.jenis_kelamin === 'P') {
                setUserPhoto(GirlProfile);
            } else {
                setUserPhoto(BoyProfile); // Default Laki-laki
            }
        })
        .catch(err => {
            console.error("Gagal ambil detail siswa:", err);
            setUserPhoto(BoyProfile); // Fallback jika error
        });
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
            {/* Gunakan state userPhoto yang sudah otomatis berubah */}
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