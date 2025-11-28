import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../utils/api'; 

const AdminDashboard = () => {
  const [totalSiswa, setTotalSiswa] = useState(0);

  useEffect(() => {
    fetchWithAuth('/api/admin/students')
      .then(res => res.json())
      .then(data => {
         if(Array.isArray(data)) setTotalSiswa(data.length);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2 style={{marginBottom: '20px'}}>Selamat Datang, Admin!</h2>
      <div className="dashboard-grid">
        <div className="dashboard-card" style={{borderLeft: '5px solid #4a148c'}}>
          <h3 style={{color: '#666'}}>Total Siswa</h3>
          <h1 style={{fontSize: '40px', margin: '10px 0', color: '#333'}}>{totalSiswa}</h1>
          <p style={{color: '#999'}}>Siswa terdaftar</p>
        </div>
        <div className="dashboard-card" style={{borderLeft: '5px solid #ffb300'}}>
          <h3 style={{color: '#666'}}>Transaksi Hari Ini</h3>
          <h1 style={{fontSize: '40px', margin: '10px 0', color: '#333'}}>0</h1>
          <p style={{color: '#999'}}>Belum ada data</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;