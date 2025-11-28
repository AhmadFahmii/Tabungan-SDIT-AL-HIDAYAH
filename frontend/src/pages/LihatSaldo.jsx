import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown, FaBullseye } from 'react-icons/fa';
import SavingsChart from '../components/SavingsChart'; 
import { fetchWithAuth } from '../utils/api'; 

const LihatSaldo = () => {
  const [saldo, setSaldo] = useState(0);
  const [stats, setStats] = useState({ incomeMonth: 0, expenseMonth: 0, percentage: 0 });
  const [chartData, setChartData] = useState([]);
  const [studentInfo, setStudentInfo] = useState({ nama: 'Loading...', nis: '...' });
  
  const TARGET_TABUNGAN = 10000000; 

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    const userId = user.id;

    // Fetch dengan Wrapper Auth
    fetchWithAuth(`http://localhost:5000/api/siswa/${userId}`)
      .then(res => res.json())
      .then(data => {
        setSaldo(data.saldo || 0);
        setStudentInfo({ nama: data.nama, nis: data.nis });
      })
      .catch(err => console.error("Gagal ambil saldo:", err));

    fetchWithAuth(`http://localhost:5000/api/transaksi/${userId}`)
      .then(res => res.json())
      .then(data => {
          if(Array.isArray(data)) processTransactionData(data);
      })
      .catch(err => console.error("Gagal ambil transaksi:", err));
  }, []);

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
    setStats({
      incomeMonth: mIn,
      expenseMonth: mOut,
      percentage: Math.min(100, (runningBalance / TARGET_TABUNGAN) * 100).toFixed(1)
    });
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
             <div className="target-header"><p><FaBullseye /> Target: Rp {TARGET_TABUNGAN.toLocaleString('id-ID')}</p><span>{stats.percentage}%</span></div>
             <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: `${stats.percentage}%`}}></div></div>
          </div>
        </div>
      </div>

      <SavingsChart chartData={chartData} />
    </div>
  );
};

export default LihatSaldo;