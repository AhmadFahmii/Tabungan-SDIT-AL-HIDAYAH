import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaDownload, FaFilter, FaFilePdf } from 'react-icons/fa'; 
import { exportToExcel } from '../../utils/exportToExcel'; 
import { exportToPDF } from '../../utils/exportToPDF'; 
import { fetchWithAuth } from '../../utils/api'; 

const LaporanAdmin = () => {
  const [transactions, setTransactions] = useState([]);
  const [reportType, setReportType] = useState('kelas'); 
  const [period, setPeriod] = useState('month'); 
  const [loading, setLoading] = useState(false);

  const getDateRange = (type) => {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    let startDate = new Date();

    if (type === 'week') {
      const day = today.getDay(); 
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
      startDate.setDate(diff);
    } else if (type === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1); 
    }
    return { start: startDate.toISOString().split('T')[0], end: endDate };
  };

  useEffect(() => {
    setLoading(true);
    const { start, end } = getDateRange(period);

    fetchWithAuth(`/api/admin/laporan?startDate=${start}&endDate=${end}`)
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [period]);

  const processData = () => {
    const groups = {};
    transactions.forEach(tx => {
      const key = reportType === 'kelas' ? tx.kelas : `${tx.nama} (${tx.kelas})`;
      if (!groups[key]) {
        groups[key] = { label: key, masuk: 0, keluar: 0, count: 0 };
      }
      if (tx.tipe === 'masuk') groups[key].masuk += parseInt(tx.jumlah);
      else groups[key].keluar += parseInt(tx.jumlah);
      groups[key].count += 1;
    });
    return Object.values(groups).sort((a, b) => a.label.localeCompare(b.label));
  };

  const reportData = processData();

  const handleDownload = () => {
    const dataToExport = reportData.map(item => ({
      [reportType === 'kelas' ? 'Nama Kelas' : 'Nama Siswa']: item.label,
      'Total Pemasukan': item.masuk,
      'Total Pengeluaran': item.keluar,
      'Saldo Bersih': item.masuk - item.keluar,
      'Jumlah Transaksi': item.count
    }));
    exportToExcel(dataToExport, `Laporan_${reportType}_${period}`);
  };

  const handleDownloadPDF = () => {
    const title = `Laporan Keuangan - ${reportType === 'kelas' ? 'Per Kelas' : 'Per Siswa'} (${period.toUpperCase()})`;
    const headers = [reportType === 'kelas' ? 'Nama Kelas' : 'Nama Siswa', 'Pemasukan', 'Pengeluaran', 'Saldo Bersih', 'Jml Trx'];
    const data = reportData.map(item => [
      item.label,
      `Rp ${item.masuk.toLocaleString('id-ID')}`,
      `Rp ${item.keluar.toLocaleString('id-ID')}`,
      `Rp ${(item.masuk - item.keluar).toLocaleString('id-ID')}`,
      item.count
    ]);
    exportToPDF(title, headers, data, `Laporan_PDF_${reportType}_${period}`);
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2 style={{color: '#333', margin: 0}}>Laporan Keuangan</h2>
        <div style={{display: 'flex', gap: '10px'}}>
            <button className="btn-download" onClick={handleDownload}><FaDownload /> Excel</button>
            <button className="btn-report pdf" style={{padding: '12px 20px', borderRadius: '8px'}} onClick={handleDownloadPDF}><FaFilePdf /> PDF</button>
        </div>
      </div>

      <div className="dashboard-card" style={{marginBottom: '20px', padding: '15px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{display: 'flex', gap: '10px'}}>
          <button className={`filter-btn ${period === 'today' ? 'active' : ''}`} onClick={() => setPeriod('today')}>Hari Ini</button>
          <button className={`filter-btn ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')}>Minggu Ini</button>
          <button className={`filter-btn ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>Bulan Ini</button>
        </div>
        <div style={{borderLeft: '1px solid #ddd', height: '30px', margin: '0 10px'}}></div>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <label style={{fontWeight: '600', color: '#555'}}>Kelompokkan:</label>
            <select className="filter-select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="kelas">Per Kelas</option>
                <option value="siswa">Per Siswa</option>
            </select>
        </div>
      </div>

      <div className="dashboard-card table-card">
        <div className="table-responsive">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>{reportType === 'kelas' ? 'Nama Kelas' : 'Nama Siswa'}</th>
                <th className="text-right">Total Pemasukan</th>
                <th className="text-right">Total Pengeluaran</th>
                <th className="text-right">Selisih (Net)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (<tr><td colSpan="4" className="empty-state">Menghitung data...</td></tr>) : reportData.length > 0 ? (
                reportData.map((item, index) => (
                  <tr key={index}>
                    <td style={{fontWeight: '500'}}>{item.label}</td>
                    <td className="text-right amount-cell masuk">+ Rp {item.masuk.toLocaleString('id-ID')}</td>
                    <td className="text-right amount-cell keluar">- Rp {item.keluar.toLocaleString('id-ID')}</td>
                    <td className="text-right" style={{fontWeight: 'bold', color: (item.masuk - item.keluar) >= 0 ? '#333' : 'red'}}>
                      Rp {(item.masuk - item.keluar).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="empty-state">Tidak ada transaksi pada periode ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LaporanAdmin;