import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const formatCurrency = (value) => `Rp ${value.toLocaleString('id-ID')}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="recharts-default-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <p className="tooltip-label" style={{ fontWeight: 'bold', margin: 0, color: '#333' }}>{`${label}`}</p>
        <p className="tooltip-intro" style={{ color: '#4a148c', margin: '5px 0 0 0', fontWeight: '500' }}>
            {`Saldo: ${formatCurrency(payload[0].value)}`}
        </p>
      </div>
    );
  }
  return null;
};

const SavingsChart = ({ chartData }) => {
  const data = (chartData && chartData.length > 0) ? chartData : [];

  return (
    /* PERBAIKAN DI SINI: Tambahkan minWidth: 0 agar tidak error saat resize */
    <div style={{ width: '100%', height: 300, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{fill: '#888', fontSize: 12}} 
            axisLine={false} 
            tickLine={false} 
            dy={10}
          />
          <YAxis 
            tickFormatter={(val) => val >= 1000000 ? `${val/1000000}jt` : val >= 1000 ? `${val/1000}rb` : val} 
            tick={{fill: '#888', fontSize: 12}} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4a148c', strokeWidth: 1, strokeDasharray: '5 5' }} />
          <Line
            type="monotone"
            dataKey="saldo"
            stroke="#ffb300"
            strokeWidth={4}
            dot={{ r: 4, fill: '#ffb300', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: '#4a148c', stroke: '#fff', strokeWidth: 3 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SavingsChart;