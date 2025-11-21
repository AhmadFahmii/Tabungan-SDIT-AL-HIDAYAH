import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './styles/App.css';

// Halaman
import Login from './pages/Login.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LihatSaldo from './pages/LihatSaldo.jsx';
import RiwayatTransaksi from './pages/RiwayatTransaksi.jsx';
import Profil from './pages/Profil.jsx';
import Laporan from './pages/Laporan.jsx';

// Admin
import AdminSidebar from './admin/components/AdminSidebar.jsx';
import AdminDashboard from './admin/pages/AdminDashboard.jsx';
import InputTransaksi from './admin/pages/InputTransaksi.jsx';
import Penarikan from './admin/pages/Penarikan.jsx';
import DataSiswa from './admin/pages/DataSiswa.jsx';
import LaporanAdmin from './admin/pages/LaporanAdmin.jsx';

// Komponen Pembungkus yang Terproteksi
const ProtectedLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // 1. Cek Status Login dari LocalStorage
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('role'); // 'admin' atau 'siswa'

  // 2. Jika BELUM LOGIN, arahkan ke halaman Login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 3. Proteksi Rute Admin (Siswa tidak boleh masuk ke /admin)
  const isAdminRoute = location.pathname.startsWith('/admin');
  if (isAdminRoute && userRole !== 'admin') {
    return <Navigate to="/" replace />; // Tendang balik ke dashboard siswa
  }

  // 4. Proteksi Rute Siswa (Admin boleh akses siswa? Sebaiknya tidak, fokus ke panel admin)
  // Jika Admin mencoba akses root '/', arahkan ke '/admin'
  if (location.pathname === '/' && userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`app-container ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Tampilkan Sidebar sesuai Role */}
      {userRole === 'admin' ? (
        <AdminSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      ) : (
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      )}

      <main className="main-content">
        {/* Header (Bisa di-custom nanti untuk admin) */}
        <Header /> 
        
        <Routes>
          {/* --- RUTE SISWA --- */}
          {userRole === 'siswa' && (
            <>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/saldo" element={<LihatSaldo />} />
              <Route path="/riwayat" element={<RiwayatTransaksi />} />
              <Route path="/profil" element={<Profil />} />
              <Route path="/laporan" element={<Laporan />} />
            </>
          )}

          {/* --- RUTE ADMIN --- */}
          {userRole === 'admin' && (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/input-transaksi" element={<InputTransaksi />} />
              <Route path="/admin/penarikan" element={<Penarikan />} />
              <Route path="/admin/data-siswa" element={<DataSiswa />} />
              <Route path="/admin/laporan" element={<LaporanAdmin />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik (Hanya Login) */}
        <Route path="/login" element={<Login />} />

        {/* Rute Terproteksi (Semua halaman lain) */}
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </Router>
  );
}

export default App;