import React, { useState, useEffect } from 'react';
import BalanceCard from '../components/BalanceCard';
import TransactionSummary from '../components/TransactionSummary';
import SavingsChart from '../components/SavingsChart';
import { fetchWithAuth } from '../utils/api'; 

const DashboardPage = () => {
  const [saldo, setSaldo] = useState(0);
  const [rawTransactions, setRawTransactions] = useState([]); 
  const [summary, setSummary] = useState({ todayIn: 0, todayOut: 0, weekIn: 0, weekOut: 0, monthIn: 0, monthOut: 0 });
  const [chartData, setChartData] = useState([]);

  const currentMonthIndex = new Date().getMonth();
  const currentSemester = currentMonthIndex > 5 ? 'ganjil' : 'genap'; 
  const semesterLabel = currentSemester === 'ganjil' ? 'SEMESTER GANJIL (JUL - DES)' : 'SEMESTER GENAP (JAN - JUN)';

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    const userId = user.id;

    fetchWithAuth(`/api/siswa/${userId}`)
      .then(res => res.json())
      .then(data => setSaldo(data.saldo || 0))
      .catch(err => console.error("Gagal ambil saldo:", err));

    fetchWithAuth(`/api/transaksi/${userId}`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setRawTransactions(data);
      })
      .catch(err => console.error("Gagal ambil transaksi:", err));
  }, []);

  useEffect(() => {
    if (rawTransactions.length > 0) {
      processTransactionData(rawTransactions);
    }
  }, [rawTransactions]);

  const processTransactionData = (transactions) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); 
    const currentMonth = today.getMonth();

    let tIn = 0, tOut = 0, wIn = 0, wOut = 0, mIn = 0, mOut = 0;
    const monthlyBalances = Array(12).fill(0); 
    const allMonths = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

    const sortedTx = [...transactions].reverse();
    let runningBalance = 0;

    sortedTx.forEach(tx => {
      const txDate = new Date(tx.tanggal);
      const amount = parseInt(tx.jumlah);

      if (txDate.toDateString() === today.toDateString()) {
        if (tx.tipe === 'masuk') tIn += amount; else tOut += amount;
      }
      if (txDate >= startOfWeek) {
        if (tx.tipe === 'masuk') wIn += amount; else wOut += amount;
      }
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

    let startIndex = currentSemester === 'genap' ? 0 : 6;
    let endIndex = currentSemester === 'genap' ? 6 : 12;

    const formattedChartData = allMonths.slice(startIndex, endIndex).map((name, index) => ({
      name: name,
      saldo: monthlyBalances[startIndex + index]
    }));

    setSummary({ todayIn: tIn, todayOut: tOut, weekIn: wIn, weekOut: wOut, monthIn: mIn, monthOut: mOut });
    setChartData(formattedChartData);
  };

  const todayString = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <div className="dashboard-grid">
        <BalanceCard saldo={saldo} lastUpdate={todayString} />
        <TransactionSummary
          todaySetoran={summary.todayIn} todayPenarikan={summary.todayOut}
          weekSetoran={summary.weekIn} weekPenarikan={summary.weekOut}
          monthSetoran={summary.monthIn} monthPenarikan={summary.monthOut}
        />
      </div>
      
      <div className="dashboard-card">
        <div style={{marginBottom: '20px'}}>
          <h4 style={{margin: 0, textTransform: 'uppercase'}}>PERKEMBANGAN TABUNGAN - {semesterLabel}</h4>
        </div>
        <SavingsChart chartData={chartData} />
      </div>
    </>
  );
};

export default DashboardPage;