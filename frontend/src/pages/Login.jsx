import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser } from 'react-icons/fa'; 
import LogoSekolah from '../assets/logo-sdit-alhidayah.png';

const Login = () => {
  const navigate = useNavigate();
  
  // State untuk menyimpan data form (username & password)
  const [formData, setFormData] = useState({ username: '', password: '' });
  
  // State untuk menyimpan pesan error jika login gagal
  const [error, setError] = useState('');
  
  // State untuk loading saat proses login
  const [loading, setLoading] = useState(false);

  // Handler saat input diketik
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler saat form di-submit (Tombol Masuk ditekan)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error sebelum mencoba login
    setLoading(true); // Aktifkan loading

    try {
      // Panggil API Login
      // Backend akan otomatis mengecek ke tabel admin dulu, lalu tabel siswa
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // JIKA LOGIN SUKSES:
        
        // 1. Simpan data sesi ke LocalStorage agar tidak hilang saat refresh
        localStorage.setItem('token', result.token); // Simpan Token JWT
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('role', result.role);
        localStorage.setItem('isLoggedIn', 'true');

        // 2. Tampilkan pesan sukses
        alert(`Login Berhasil! Selamat Datang, ${result.user.nama}`);
        
        // 3. Redirect ke halaman yang sesuai berdasarkan peran (role)
        if (result.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
        
        // 4. Reload halaman agar komponen App.jsx membaca ulang localStorage
        // dan memperbarui tampilan header/sidebar
        window.location.reload(); 
      } else {
        // JIKA LOGIN GAGAL (Password salah / User tidak ditemukan)
        setError(result.message);
      }
    } catch (err) {
      // JIKA GAGAL KONEKSI KE SERVER
      console.error(err);
      setError("Gagal terhubung ke server. Pastikan backend menyala.");
    } finally {
      setLoading(false); // Matikan loading
    }
  };

  return (
    <div className="login-container">
      <div className="login-card center-mode">
        
        {/* Header Login dengan Logo */}
        <div className="login-header">
          <div className="logo-circle">
             <img src={LogoSekolah} alt="Logo SDIT" className="login-logo" />
          </div>
          <h2>SDIT AL-HIDAYAH</h2>
          <p>Sistem Informasi Tabungan Siswa</p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="login-form">
          
          {/* Pesan Error jika ada */}
          {error && <div className="error-message">{error}</div>}
          
          {/* Input Username / NIS */}
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

          {/* Input Password */}
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

          {/* Tombol Masuk */}
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