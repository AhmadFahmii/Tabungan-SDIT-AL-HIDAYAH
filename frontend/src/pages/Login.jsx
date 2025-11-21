import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser } from 'react-icons/fa'; 
import LogoSekolah from '../assets/logo-sdit-alhidayah.png';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('token', result.token); // Simpan Token
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('role', result.role);
        localStorage.setItem('isLoggedIn', 'true');

        alert(`Login Berhasil! Selamat Datang, ${result.user.nama}`);
        
        if (result.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
        window.location.reload(); 
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card center-mode">
        
        <div className="login-header">
          <div className="logo-circle">
             <img src={LogoSekolah} alt="Logo SDIT" className="login-logo" />
          </div>
          <h2>SDIT AL-HIDAYAH</h2>
          <p>Sistem Informasi Tabungan Siswa</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <div className="input-icon"><FaUser /></div>
            <input 
              type="text" 
              name="username" 
              placeholder="Masukkan NIS atau Username Admin" 
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <div className="input-icon"><FaLock /></div>
            <input 
              type="password" 
              name="password" 
              placeholder="Kata Sandi" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Memproses...' : 'MASUK'}
          </button>
        </form>

        <div className="login-footer">
            <p>&copy; {new Date().getFullYear()} SDIT AL-HIDAYAH Subang</p>
        </div>
      </div>
    </div>
  );
};

export default Login;