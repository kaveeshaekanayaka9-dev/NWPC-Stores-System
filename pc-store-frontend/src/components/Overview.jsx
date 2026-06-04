import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Overview = ({ rackData, statusData }) => {
  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '10px' }}>
      <h2>📊 Quick Overview</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
         <div style={{ width: '50%' }}>
            <Bar data={rackData} />
         </div>
         <div style={{ width: '50%' }}>
            <Pie data={statusData} />
         </div>
      </div>
    </div>
  );
};

export default Overview;