import React, { useState } from 'react';
import { FaFileExcel, FaFilePdf, FaCalendarAlt } from 'react-icons/fa';
import { exportToExcel } from '../utils/exportToExcel'; // Import fungsi Excel kita

const Laporan = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data Dummy untuk simulasi download laporan
  // (Nanti data ini akan diambil dari database berdasarkan tanggal yang dipilih)
  const dummyReportData = [
    { Tanggal: '01-05-2024', Keterangan: 'Setoran Awal', Masuk: 500000, Keluar: 0, Saldo: 500000 },
    { Tanggal: '05-05-2024', Keterangan: 'Beli Buku', Masuk: 0, Keluar: 50000, Saldo: 450000 },
    { Tanggal: '10-05-2024', Keterangan: 'Setoran Mingguan', Masuk: 20000, Keluar: 0, Saldo: 470000 },
    { Tanggal: '12-05-2024', Keterangan: 'Uang Gedung', Masuk: 0, Keluar: 150000, Saldo: 320000 },
    { Tanggal: '20-05-2024', Keterangan: 'Tabungan Wajib', Masuk: 50000, Keluar: 0, Saldo: 370000 },
  ];

  const handleDownloadExcel = () => {
    if (!startDate || !endDate) {
      alert("Silakan pilih rentang tanggal (Dari & Sampai) terlebih dahulu!");
      return;
    }
    
    // Panggil fungsi download
    exportToExcel(dummyReportData, `Laporan_Tabungan_${startDate}_sd_${endDate}`);
  };

  const handleDownloadPDF = () => {
    alert("Fitur PDF akan tersedia setelah Backend terhubung nanti.");
  };

  return (
    <div className="laporan-container">
      
      <div className="dashboard-card">
        <h3>Pilih Periode Laporan</h3>
        <p style={{color: '#666', marginBottom: '20px'}}>
          Unduh laporan transaksi tabungan Anda secara lengkap dalam format Excel atau PDF.
        </p>
        
        <div className="date-range-picker">
          {/* Input Tanggal Mulai */}
          <div className="date-input-group">
            <label>Dari Tanggal</label>
            <div className="input-with-icon">
               <FaCalendarAlt className="input-icon" />
               <input 
                 type="date" 
                 value={startDate} 
                 onChange={(e) => setStartDate(e.target.value)} 
               />
            </div>
          </div>
          
          {/* Input Tanggal Selesai */}
          <div className="date-input-group">
            <label>Sampai Tanggal</label>
            <div className="input-with-icon">
               <FaCalendarAlt className="input-icon" />
               <input 
                 type="date" 
                 value={endDate} 
                 onChange={(e) => setEndDate(e.target.value)} 
               />
            </div>
          </div>
        </div>

        {/* Tombol Download */}
        <div className="download-actions">
          <button className="btn-report excel" onClick={handleDownloadExcel}>
            <FaFileExcel /> Download Excel
          </button>
          <button className="btn-report pdf" onClick={handleDownloadPDF}>
            <FaFilePdf /> Download PDF
          </button>
        </div>
      </div>

    </div>
  );
};

export default Laporan;