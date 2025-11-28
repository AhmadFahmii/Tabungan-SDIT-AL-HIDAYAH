import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaChevronDown, FaUser, FaSignOutAlt } from 'react-icons/fa';
import BoyProfile from '../assets/boy.png';
import GirlProfile from '../assets/girl.png';
import LogoSekolah from '../assets/logo-sdit-alhidayah.png'; 
import { fetchWithAuth } from '../utils/api'; 

const Header = () => {
  const [studentName, setStudentName] = useState('Pengguna'); 
  const [userPhoto, setUserPhoto] = useState(LogoSekolah); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userString = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.nama) {
          setStudentName(user.nama.split(' ')[0]);
        }

        if (role === 'admin') {
          setUserPhoto(LogoSekolah);
        } else if (role === 'siswa') {
          if (user && user.jenis_kelamin) {
               setUserPhoto(user.jenis_kelamin === 'P' ? GirlProfile : BoyProfile);
          } else {
               if (user && user.id) {
                   fetchWithAuth(`/api/siswa/${user.id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.jenis_kelamin) {
                            setUserPhoto(data.jenis_kelamin === 'P' ? GirlProfile : BoyProfile);
                        } else {
                            setUserPhoto(BoyProfile); 
                        }
                    })
                    .catch(err => {
                        console.error("Gagal load foto header:", err);
                        setUserPhoto(BoyProfile); 
                    });
               }
          }
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    localStorage.clear();
    setIsDropdownOpen(false);
    window.location.href = '/login'; 
  };

  const role = localStorage.getItem('role');
  const titleRole = role === 'admin' ? 'Admin' : 'Siswa';

  return (
    <header className="dashboard-header">
      <h1 className="header-title">Dashboard {titleRole}</h1>
      <div className="header-controls">
        <FaBell className="header-notification-icon" />
        <div className="header-user-menu" onClick={toggleDropdown}>
          <div className="header-user-info clickable">
            <img src={userPhoto} alt="User Avatar" className="header-user-avatar" />
            <span className="header-user-name">Halo, {studentName}!</span>
            <FaChevronDown className={`header-chevron ${isDropdownOpen ? 'rotate' : ''}`} />
          </div>
          {isDropdownOpen && (
            <div className="header-dropdown">
              <div className="dropdown-arrow"></div>
              {role === 'siswa' && (
                <Link to="/profil" className="dropdown-item"><FaUser /> Profil Saya</Link>
              )}
              <div className="dropdown-item logout" onClick={handleLogout}><FaSignOutAlt /> Keluar</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;