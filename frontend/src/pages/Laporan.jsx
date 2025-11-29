import React, { useState, useEffect } from 'react';
import { FaFileExcel, FaFilePdf, FaCalendarAlt } from 'react-icons/fa';
import { exportToExcel } from '../utils/exportToExcel';
import { exportToPDF } from '../utils/exportToPDF';

const Laporan = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ambil data transaksi dari backend saat komponen dimuat
  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');

      if (!token || !userString) return;

      const user = JSON.parse(userString);
      const userId = user.id;

      setLoading(true);
      try {
        const response = await fetch(getApiUrl(`/api/transaksi/${userId}`), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          setTransactions(data);
        }
      } catch (error) {
        console.error("Gagal mengambil data transaksi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Fungsi untuk memfilter data berdasarkan rentang tanggal
  const getFilteredData = () => {
    if (!startDate || !endDate) {
      alert("Silakan pilih rentang tanggal terlebih dahulu!");
      return [];
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set waktu end ke akhir hari agar transaksi di tanggal tersebut tetap masuk
    end.setHours(23, 59, 59, 999);

    return transactions.filter(item => {
      const itemDate = new Date(item.tanggal);
      return itemDate >= start && itemDate <= end;
    });
  };

  // Format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  // Format Tanggal
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const handleDownloadExcel = () => {
    const filteredData = getFilteredData();
    if (filteredData.length === 0) {
        if(startDate && endDate) alert("Tidak ada data transaksi pada rentang tanggal tersebut.");
        return;
    }

    // Format data untuk Excel
    const dataToExport = filteredData.map(item => ({
      Tanggal: formatDate(item.tanggal),
      Keterangan: item.keterangan,
      Tipe: item.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
      Jumlah: parseInt(item.jumlah), // Pastikan angka
      ID_Transaksi: item.id
    }));

    exportToExcel(dataToExport, `Laporan_Tabungan_${startDate}_sd_${endDate}`);
  };

  const handleDownloadPDF = () => {
    const filteredData = getFilteredData();
    if (filteredData.length === 0) {
        if(startDate && endDate) alert("Tidak ada data transaksi pada rentang tanggal tersebut.");
        return;
    }

    const title = `Laporan Tabungan Siswa (${formatDate(startDate)} s/d ${formatDate(endDate)})`;
    const headers = ['Tanggal', 'Keterangan', 'Tipe', 'Jumlah'];
    
    // Format data untuk PDF (Array of Arrays)
    const data = filteredData.map(item => [
        formatDate(item.tanggal),
        item.keterangan,
        item.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
        formatRupiah(item.jumlah)
    ]);

    exportToPDF(title, headers, data, `Laporan_PDF_${startDate}_${endDate}`);
  };

  return (
    <div className="laporan-container">
      
      <div className="dashboard-card">
        <h3>Pilih Periode Laporan</h3>
        <p style={{color: '#666', marginBottom: '20px'}}>
          Unduh laporan transaksi tabungan Anda secara lengkap dalam format Excel atau PDF.
        </p>
        
        {loading && <p style={{fontStyle: 'italic', color: '#888'}}>Sedang memuat data...</p>}

        <div className="date-range-picker">
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

        <div className="download-actions">
          <button className="btn-report excel" onClick={handleDownloadExcel} disabled={loading}>
            <FaFileExcel /> Download Excel
          </button>
          
          <button className="btn-report pdf" onClick={handleDownloadPDF} disabled={loading}>
            <FaFilePdf /> Download PDF
          </button>
        </div>
      </div>

    </div>
  );
};

export default Laporan;