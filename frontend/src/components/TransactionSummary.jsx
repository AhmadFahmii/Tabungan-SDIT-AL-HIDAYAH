import React from 'react';

const TransactionSummary = ({ 
  todaySetoran, 
  todayPenarikan, 
  weekSetoran, 
  weekPenarikan,
  monthSetoran,
  monthPenarikan
}) => {
  return (
    <div className="dashboard-card transaction-summary">
      <h4>RINGKASAN TRANSAKSI</h4>
      
      <div className="transaction-summary-item">
        <p>Hari Ini</p>
        <div className="transaction-summary-details">
          <p>Setoran: <span className="setoran">Rp {todaySetoran.toLocaleString('id-ID')}</span></p>
          <p>Penarikan: <span className="penarikan">Rp {todayPenarikan.toLocaleString('id-ID')}</span></p>
        </div>
      </div>

      <div className="transaction-summary-item">
        <p>Minggu Ini</p>
        <div className="transaction-summary-details">
          <p>Setoran: <span className="setoran">Rp {weekSetoran.toLocaleString('id-ID')}</span></p>
          <p>Penarikan: <span className="penarikan">Rp {weekPenarikan.toLocaleString('id-ID')}</span></p>
        </div>
      </div>

      <div className="transaction-summary-item">
        <p>Bulan Ini</p>
        <div className="transaction-summary-details">
          <p>Setoran: <span className="setoran">Rp {monthSetoran.toLocaleString('id-ID')}</span></p>
          <p>Penarikan: <span className="penarikan">Rp {monthPenarikan.toLocaleString('id-ID')}</span></p>
        </div>
      </div>

    </div>
  );
};

export default TransactionSummary;