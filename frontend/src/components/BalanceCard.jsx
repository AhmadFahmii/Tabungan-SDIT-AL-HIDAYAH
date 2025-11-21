import React from 'react';

const BalanceCard = ({ saldo, lastUpdate }) => {
  return (
    <div className="dashboard-card balance-card">
      <h3>SALDO TABUNGAN TERBARU</h3>
      <div className="balance-amount">
        Rp {saldo.toLocaleString('id-ID')}
      </div>
      <p className="balance-update-info">Update Terakhir, {lastUpdate}</p>
    </div>
  );
};

export default BalanceCard;