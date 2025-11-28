import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown, FaBullseye, FaEdit } from 'react-icons/fa';
import SavingsChart from '../components/SavingsChart'; 
import { fetchWithAuth } from '../utils/api'; 

const LihatSaldo = () => {
  const [saldo, setSaldo] = useState(0);
  const [target, setTarget] = useState(0);
  const [stats, setStats] = useState({ incomeMonth: 0, expenseMonth: 0, percentage: 0 });
  const [chartData, setChartData] = useState([]);
  const [studentInfo, setStudentInfo] = useState({ nama: 'Loading...', nis: '...' });
  
  const [isEditTargetOpen, setIsEditTargetOpen] = useState(false);
  const [newTarget, setNewTarget] = useState('');
  
  const userId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    if (!userId) return;

    fetchWithAuth(`/api/siswa/${userId}`)
      .then(res => res.json())
      .then(data => {
        setSaldo(data.saldo || 0);
        setTarget(data.target_tabungan || 0);
        setStudentInfo({ nama: data.nama, nis: data.nis });
      })
      .catch(err => console.error("Gagal ambil siswa:", err));

    fetchWithAuth(`/api/transaksi/${userId}`)
      .then(res => res.json())
      .then(data => {
          if(Array.isArray(data)) processTransactionData(data);
      })
      .catch(err => console.error("Gagal ambil transaksi:", err));
  }, [userId]);

  // ... (Bagian processTransactionData, useEffect target, handleUpdateTarget SAMA)
  
  useEffect(() => {
    if (target > 0) {
      const percent = Math.min(100, (saldo / target) * 100).toFixed(1);
      setStats(prev => ({ ...prev, percentage: percent }));
    } else {
      setStats(prev => ({ ...prev, percentage: 0 }));
    }
  }, [saldo, target]);

  const processTransactionData = (transactions) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    let mIn = 0, mOut = 0;
    const monthlyBalances = Array(12).fill(0); 
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    const sortedTx = [...transactions].reverse();
    let runningBalance = 0;

    sortedTx.forEach(tx => {
      const txDate = new Date(tx.tanggal);
      const amount = parseInt(tx.jumlah);

      if (txDate.getMonth() === currentMonth) {
        if (tx.tipe === 'masuk') mIn += amount; else mOut += amount;
      }

      if (tx.tipe === 'masuk') runningBalance += amount;
      else runningBalance -= amount;
      
      monthlyBalances[txDate.getMonth()] = runningBalance;
    });

    for (let i = 1; i < 12; i++) {
      if (monthlyBalances[i] === 0 && monthlyBalances[i-1] !== 0) {
        monthlyBalances[i] = monthlyBalances[i-1];
      }
    }

    const formattedChartData = monthNames.map((name, index) => ({
      name: name,
      saldo: monthlyBalances[index]
    }));

    setChartData(formattedChartData);
    setStats(prev => ({ ...prev, incomeMonth: mIn, expenseMonth: mOut }));
  };

  const handleUpdateTarget = async (e) => {
    e.preventDefault();
    if (!newTarget || newTarget < 0) return alert("Target tidak valid!");

    try {
      const response = await fetchWithAuth(`/api/siswa/${userId}/target`, {
        method: 'PUT',
        body: JSON.stringify({ target: newTarget })
      });

      if (response.ok) {
        setTarget(parseInt(newTarget));
        setIsEditTargetOpen(false);
        alert("✅ Target Tabungan Berhasil Diupdate!");
      } else {
        alert("Gagal update target");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const recentTx = []; 

  return (
    <div className="saldo-container">
      <div className="saldo-header-grid">
        <div className="atm-card">
          <div className="atm-content">
            <div className="atm-top">
              <span>Tabungan Siswa</span>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Chip" className="atm-logo" style={{height: '30px'}} />
            </div>
            <div className="atm-balance">
              <p>Total Saldo</p>
              <h2>Rp {saldo.toLocaleString('id-ID')}</h2>
            </div>
            <div className="atm-bottom">
              <p>{studentInfo.nama}</p>
              <p>{studentInfo.nis}</p>
            </div>
          </div>
        </div>

        <div className="stats-card dashboard-card">
          <h3>Statistik Bulan Ini</h3>
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-icon green"><FaArrowUp /></div>
              <div><p>Pemasukan</p><span className="green-text">+Rp {stats.incomeMonth.toLocaleString('id-ID')}</span></div>
            </div>
            <div className="stat-item">
              <div className="stat-icon red"><FaArrowDown /></div>
              <div><p>Pengeluaran</p><span className="red-text">-Rp {stats.expenseMonth.toLocaleString('id-ID')}</span></div>
            </div>
          </div>
          
          <div className="target-progress">
             <div className="target-header">
                <p style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <FaBullseye /> Target: Rp {target.toLocaleString('id-ID')}
                  <button 
                    onClick={() => { setNewTarget(target); setIsEditTargetOpen(true); }}
                    style={{border: 'none', background: 'transparent', cursor: 'pointer', color: '#999'}}
                    title="Ubah Target"
                  >
                    <FaEdit />
                  </button>
                </p>
                <span>{stats.percentage}%</span>
             </div>
             <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{width: `${stats.percentage}%`}}></div>
             </div>
          </div>
        </div>
      </div>

      <SavingsChart chartData={chartData} />

      {isEditTargetOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '400px'}}>
            <h3>Ubah Target Tabungan</h3>
            <form onSubmit={handleUpdateTarget}>
              <div className="form-group">
                <label>Target Baru (Rp)</label>
                <input 
                  type="number" 
                  value={newTarget} 
                  onChange={(e) => setNewTarget(e.target.value)} 
                  placeholder="Contoh: 1000000"
                  autoFocus
                />
              </div>
              <div className="modal-actions" style={{marginTop: '20px'}}>
                <button type="button" className="btn-cancel" onClick={() => setIsEditTargetOpen(false)}>Batal</button>
                <button type="submit" className="btn-submit">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LihatSaldo;