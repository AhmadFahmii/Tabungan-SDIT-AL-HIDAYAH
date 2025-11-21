import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Hapus data dummy hardcoded di sini. 
// Sekarang kita terima 'data' dari props.

const formatCurrency = (value) => `Rp ${value.toLocaleString('id-ID')}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="recharts-default-tooltip">
        <p className="tooltip-label">{`${label}`}</p>
        <p className="tooltip-intro">{`Saldo: ${formatCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

// TERIMA PROP 'chartData' DI SINI
const SavingsChart = ({ chartData }) => {
  return (
    <div className="dashboard-card savings-chart">
      <h4>PERKEMBANGAN TABUNGAN</h4>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            // Gunakan data dari props. Jika kosong, pakai array kosong []
            data={chartData || []} 
            margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            {/* Format Y-Axis agar lebih rapi (jutaan) */}
            <YAxis tickFormatter={(val) => val.toLocaleString('id-ID')} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="saldo"
              stroke="#ffb300"
              strokeWidth={3}
              dot={{ r: 5, fill: '#ffb300', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 8, fill: '#4a148c', stroke: '#ffb300' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SavingsChart;