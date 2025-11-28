import React, { useState, useEffect } from 'react';
import { FaSearch, FaArrowDown, FaArrowUp, FaDownload } from 'react-icons/fa';
import { exportToExcel } from '../utils/exportToExcel';
import { fetchWithAuth } from '../utils/api'; 

const RiwayatTransaksi = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    const userId = user.id; 

    // Ganti fetch dengan fetchWithAuth
    fetchWithAuth(`http://localhost:5000/api/transaksi/${userId}`)
      .then(response => response.json())
      .then(data => {
        setTransactions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error:", error);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const filteredData = transactions.filter(item => {
    const desc = item.keterangan ? item.keterangan.toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    const matchesSearch = desc.includes(search);
    const matchesType = filterType === 'all' || item.tipe === filterType;
    return matchesSearch && matchesType;
  });

  const handleDownload = () => {
    const dataToExport = filteredData.map(item => ({
      Tanggal: formatDate(item.tanggal),
      Keterangan: item.keterangan, 
      Tipe: item.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
      Jumlah: item.jumlah
    }));
    exportToExcel(dataToExport, 'Riwayat_Transaksi_Siswa');
  };

  return (
    <div className="riwayat-container">
      <div className="dashboard-card controls-card">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Cari transaksi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-actions">
          <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Semua Tipe</option>
            <option value="masuk">Pemasukan</option>
            <option value="keluar">Pengeluaran</option>
          </select>
          <button className="btn-download" onClick={handleDownload}><FaDownload /> Export Excel</button>
        </div>
      </div>

      <div className="dashboard-card table-card">
        <div className="table-responsive">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Tipe</th>
                <th className="text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="empty-state">Sedang memuat data...</td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.tanggal)}</td>
                    <td><span className="tx-desc">{item.keterangan}</span></td>
                    <td>
                      <span className={`badge-type ${item.tipe}`}>
                        {item.tipe === 'masuk' ? <FaArrowUp /> : <FaArrowDown />}
                        {item.tipe === 'masuk' ? 'Setor' : 'Tarik'}
                      </span>
                    </td>
                    <td className={`text-right amount-cell ${item.tipe}`}>
                      {item.tipe === 'masuk' ? '+' : '-'} {formatRupiah(item.jumlah)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="empty-state">Tidak ada transaksi ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination"><button disabled>Previous</button><button className="active">1</button><button>Next</button></div>
      </div>
    </div>
  );
};

export default RiwayatTransaksi;