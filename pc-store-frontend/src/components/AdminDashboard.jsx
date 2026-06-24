import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Overview from './Overview';
import GraphicalRack from './GraphicalRack';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';



ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = ({ user, goToHome , goToMainHome }) => {
  // 🔄 Active Tab එකට 'VERIFIED_LIST' එකතු කළා
 const [activeTab, setActiveTab] = useState('USERS');

  // Data States
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  
  // 🔍 සර්ච් කරන්න පාවිච්චි කරන State එක
  const [searchTerm, setSearchTerm] = useState('');

  // Rack Input States (For Assignment)
  const [selectedFileId, setSelectedFileId] = useState(null); 
  const [rackNumber, setRackNumber] = useState('');
  const [shelfNumber, setShelfNumber] = useState('');
  const [reapprovalLocations, setReapprovalLocations] = useState({});
  // AdminDashboard.jsx එකේ ඉහළින්ම මෙය එකතු කරන්න
const [chartData, setChartData] = useState({ rackStats: [], statusStats: [], categoryStats: [] });
  



  useEffect(() => {
    const fetchChartData = async () => {
        const res = await axios.get('http://localhost:5000/api/reports/chart-data');
        setChartData(res.data);
    };
    fetchChartData();
}, []);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const usersRes = await axios.get('http://localhost:5000/api/admin/pending-users');
      setPendingUsers(usersRes.data);

      const filesRes = await axios.get('http://localhost:5000/api/files/pending-files');
      setPendingFiles(filesRes.data);
      
      const allFilesRes = await axios.get('http://localhost:5000/api/files/all-files');
      setAllFiles(allFilesRes.data);
    } catch (err) {
      console.error("දත්ත ලෝඩ් කිරීමේදී ගැටලුවක්:", err);
    }
  };

  const handleUserApproval = async (id, action) => {
  try {
    if (action === 'APPROVE') {
      // 1. Backend එකේ API එකට PUT Request එක යැවීම
     // නිවැරදි කේතය:
const res = await axios.put(`http://localhost:5000/api/files/approve-file/${fileId}`);
      
      // 🎯 2. වැදගත්ම කොටස: ලිස්ට් එකෙන් අයින් නොකර, එම යූසර්ගේ 'isAdminApproved' ස්ටේට් එක පමණක් true කරයි
      setPendingUsers(prevUsers => 
        prevUsers.map(u => u._id === id ? { ...u, isAdminApproved: true } : u)
      );
      
      alert("🎯 නිලධාරියා සාර්ථකව අනුමත කළා!");
      
    } else if (action === 'REJECT') {
      // 3. Reject කළොත් පමණක් ඔහුව දැනට තියෙන ලැයිස්තුවෙන් ඉවත් කරයි
      setPendingUsers(prevUsers => prevUsers.filter(u => u._id !== id));
      alert("❌ ඉල්ලීම ප්‍රතික්ෂේප කළා!");
    }
  } catch (err) {
    console.error("Approval Error:", err);
    alert("🛑 ක්‍රියාවලිය අසාර්ථකයි. නැවත උත්සාහ කරන්න.");
  }
};




const handleFileApproval = async (fileId) => {
  try {
    await axios.put(`http://localhost:5000/api/files/approve-file/${fileId}`);
    alert("✅ ලිපිගොනුව සාර්ථකව අනුමත කරන ලදී!");
    loadAdminData(); // ලැයිස්තුව නැවුම් කරයි
  } catch (err) {
    alert("❌ අනුමත කිරීම අසාර්ථකයි.");
  }
};

const handleReapprovalLocationChange = (fileId, field, value) => {
  setReapprovalLocations(prev => ({
    ...prev,
    [fileId]: {
      ...prev[fileId],
      [field]: value
    }
  }));
};

const handleReapproval = async (fileId) => {
  const location = reapprovalLocations[fileId] || {};
  const rack = location.rackNumber?.trim();
  const shelf = location.shelfNumber?.trim();

  if (!rack || !shelf) {
    alert("Please enter rack number and shelf number before re-approval.");
    return;
  }

  try {
    await axios.put(`http://localhost:5000/api/files/verify-file/${fileId}`, {
      rackNumber: rack,
      shelfNumber: shelf
    });

    setReapprovalLocations(prev => {
      const next = { ...prev };
      delete next[fileId];
      return next;
    });

    alert("File re-approved with rack and shelf location.");
    loadAdminData();
  } catch (err) {
    alert("Re-approval failed: " + (err.response?.data?.message || err.message));
  }
};

  const handleAssignRack = async (e) => {
    e.preventDefault();
    if (!selectedFileId) {
      alert("කරුණාකර ප්‍රථමයෙන් ලිපිගොනුවක් තෝරාගන්න.");
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/files/verify-file/${selectedFileId}`, { rackNumber, shelfNumber });
      alert("✅ ලිපිගොනුව සාර්ථකව සත්‍යාපනය කර රාක්ක අංකය වෙන් කරන ලදී!");
      
      setSelectedFileId(null);
      setRackNumber(''); 
      setShelfNumber('');
      loadAdminData(); 
    } catch (err) {
      alert("❌ රාක්ක වෙන් කිරීම අසාර්ථකයි: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectFile = async (fileId) => {
    if (window.confirm("මෙම ලිපිගොනුව ප්‍රතික්ෂේප කිරීමට ඔබට අවශ්‍යද?")) {
      try {
        await axios.put(`http://localhost:5000/api/files/reject-file/${fileId}`);
        alert("📁 ලිපිගොනුව ප්‍රතික්ෂේප කරන ලදී.");
        if (selectedFileId === fileId) {
          setSelectedFileId(null);
          setRackNumber('');
          setShelfNumber('');
        }
        loadAdminData(); 
      } catch (err) {
        alert("❌ ප්‍රතික්ෂේප කිරීම අසාර්ථකයි: " + (err.response?.data?.message || err.message));
      }
    }
  };

  

  // 🗄️ රාක්ක වෙන් කර අවසන් වූ (VERIFIED) ෆයිල් ටික විතරක් වෙන් කර ගැනීම
  const verifiedFiles = allFiles.filter(f => f.isVerified === 'VERIFIED');

  // 🔍 සර්ච් බාර් එකට අනුව ෆයිල් ෆිල්ටර් කිරීම (Rack අංකයෙන් හෝ ෆයිල් නමින්)
  const filteredVerifiedFiles = verifiedFiles.filter(f => 
    f.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.rackNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📝 PDF & Excel Export Functions
  const handleExportPDF = (data, title, fileName) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`NWPC Stores Management System`, 14, 22);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(title, 14, 30);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);

    const tableColumn = ["File No", "File Name", "Category", "Officer", "Status", "Location"];
    const tableRows = [];

    data.forEach(f => {
      const locationData = f.rackNumber === 'Unassigned' ? 'Unassigned' : `Rack ${f.rackNumber} / Shelf ${f.shelfNumber}`;
      const fileData = [
        f.fileNumber || 'N/A',
        f.fileName || 'N/A',
        f.category || 'N/A',
        f.submittedBy || 'N/A',
        f.isVerified || 'N/A',
        locationData
      ];
      tableRows.push(fileData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
    });

    doc.save(`${fileName}.pdf`);
  };

  const handleExportExcel = (data, fileName) => {
    const formattedData = data.map(f => ({
      "File Number": f.fileNumber,
      "File Name": f.fileName,
      "Category": f.category,
      "Officer": f.submittedBy,
      "Status": f.isVerified,
      "Physical Location": f.rackNumber === 'Unassigned' ? 'Unassigned' : `Rack ${f.rackNumber} / Shelf ${f.shelfNumber}`,
      "Date Created": f.createdAt ? new Date(f.createdAt).toLocaleString() : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>👑 NWPC ADMIN</div>
        <p style={styles.adminName}>👤 {user?.name || 'System Admin'}</p>
        <span style={styles.badge}>Control Center</span>

        <nav style={styles.nav}>

          <div style={{ ...styles.navItem, ...(activeTab === 'OVERVIEW' && styles.activeNav) }} onClick={() => setActiveTab('OVERVIEW')}>📊 Quick Overview
</div>          

          <div style={{ ...styles.navItem, ...(activeTab === 'USERS' && styles.activeNav) }} onClick={() => setActiveTab('USERS')}>🛡️ User Management</div>
          <div style={{ ...styles.navItem, ...(activeTab === 'QUEUE' && styles.activeNav) }} onClick={() => setActiveTab('QUEUE')}>⏳ Verification Queue</div>
          
          <div 
  style={{ ...styles.navItem, ...(activeTab === 'RE_APPROVAL' && styles.activeNav) }} 
  onClick={() => setActiveTab('RE_APPROVAL')}
>
  🔄 Need Re-approval
</div>
          {/* 🗄️ මෙන්න අලුතින් දාපු ටැබ් එක */}
          <div style={{ ...styles.navItem, ...(activeTab === 'VERIFIED_LIST' && styles.activeNav) }} onClick={() => setActiveTab('VERIFIED_LIST')}>🗄️ Managed Rack Inventory</div>
          
          <div style={{ ...styles.navItem, ...(activeTab === 'GRAPHICAL_RACK' && styles.activeNav) }} onClick={() => setActiveTab('GRAPHICAL_RACK')}>🗄️ Graphical Racks</div>

          <div style={{ ...styles.navItem, ...(activeTab === 'AUDIT' && styles.activeNav) }} onClick={() => setActiveTab('AUDIT')}>📊 System-Wide Audit</div>
          
        </nav>

        {/* 🚪 පද්ධතියෙන් සම්පූර්ණයෙන්ම ඉවත් වීමේ බටන් එක */}
{/* 🚪 පද්ධතියෙන් සම්පූර්ණයෙන්ම ඉවත් වී Main Home වෙත යාමේ බටන් එක */}
<button 
  style={{
    background: '#ef4444', 
    color: '#fff', 
    border: 'none', 
    padding: '12px', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    marginTop: 'auto', // පතුලටම තල්ලු කිරීමට
    width: '100%'
   
  }} 
  onClick={() => {
    if(window.confirm("ඔබට පද්ධතියෙන් ඉවත් වී ප්‍රධාන පිටුවට යාමට අවශ්‍යද?")) {
      
      // 🔐 Session හෝ LocalStorage දත්ත ක්ලියර් කිරීම (ආරක්ෂාව සඳහා)
      localStorage.removeItem('token'); // ඔයා token පාවිච්චි කරනවා නම්
      localStorage.removeItem('user');  // ඔයා user data සේව් කරනවා නම්
      
      // 🚀 2. මෙතනදී කෙලින්ම Main Home එකට රීඩිරෙක්ට් කරයි
      goToMainHome(); 
    }
  }}
>
  🛑 Log Out
</button>
      </aside>

      {/* MAIN WORKSPACE */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h2>Admin Control Dashboard</h2>
          <div style={styles.yearTag}>Year: 2026</div>
        </header>

        
{activeTab === 'OVERVIEW' && (
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        
        {/* Bar Chart - Files per Rack */}
<div style={styles.chartContainer}>
    <Bar 
        data={{
            labels: chartData.rackStats.map(item => item._id || 'Unassigned'),
            datasets: [{
                label: 'Files Count',
                data: chartData.rackStats.map(item => item.count),
                backgroundColor: [
                  '#3b82f6','#6366f1','#8b5cf6','#ec4899','#f59e0b'
                ],
                borderRadius: 6,
            }]
        }}
        options={{ 
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Files Distribution per Rack',
                    font: { size: 16, weight: 'bold' }
                },
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }}
    />
</div>

{/* Pie Chart - Verification Status */}
<div style={styles.chartContainer}>
    <Pie 
    data={{
        labels: chartData.statusStats.map(item => item._id), 
        datasets: [{
            label: 'Verification Status',
            data: chartData.statusStats.map(item => item.count),
            backgroundColor: [
                '#10b981',
                '#f59e0b',
                '#ef4444' 
            ],
            hoverOffset: 8
        }]
    }}
    options={{ 
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Verification Status Overview',
                font: { size: 16, weight: 'bold' }
            },
            legend: { position: 'bottom' }
        }
    }}
/>
</div>

{/* Doughnut Chart - Files by Category */}
<div style={styles.chartContainer}>
    <Doughnut
        data={{
            labels: chartData.categoryStats.map(item => item._id || 'Uncategorized'),
            datasets: [{
                label: 'Files by Category',
                data: chartData.categoryStats.map(item => item.count),
                backgroundColor: [
                    '#06b6d4',
                    '#f97316',
                    '#a855f7',
                    '#84cc16',
                    '#f43f5e',
                    '#14b8a6'
                ],
                hoverOffset: 8,
                borderWidth: 2
            }]
        }}
        options={{
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                title: {
                    display: true,
                    text: 'Files by Category',
                    font: { size: 16, weight: 'bold' }
                },
                legend: { position: 'bottom' }
            }
        }}
    />
</div>

      </div>
    )}
      
    

        {/* 1. USER MANAGEMENT TAB */}
        {activeTab === 'USERS' && (
          <div style={styles.card}>
            <h3>🛡️ User Management</h3>
            <p style={styles.desc}>පද්ධතියට අලුතෙන් ලියාපදිංචි වූ නිලධාරීන්ගේ ගිණුම් පරීක්ෂා කර අනුමැතිය ලබා දීම.</p>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th>Officer Name</th>
                  <th>Email Address</th>
                  <th>Requested Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
  {pendingUsers.length === 0 ? (
    <tr><td colSpan="4" style={styles.emptyTd}>⏳ පද්ධතිය තුළ නිලධාරීන් කිසිවෙකු නොමැත.</td></tr>
  ) : (
    pendingUsers.map(u => (
      <tr key={u._id} style={styles.trRow}>
        <td style={styles.boldTd}>{u.name}</td>
        <td>{u.email}</td>
        <td><span style={styles.roleBadge}>{u.role}</span></td>
        <td>
          {/* 🎯 යූසර් දැනටමත් Approved නම් ලස්සන ස්ටේටස් එකක් පෙන්වයි */}
          {u.isAdminApproved ? (
            <span style={{ 
              background: '#e8f5e9', 
              color: '#2e7d32', 
              padding: '6px 14px', 
              borderRadius: '50px', 
              fontWeight: 'bold',
              fontSize: '13px',
              display: 'inline-block',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              🟢 Active / Approved
            </span>
          ) : (
            /* 🟡 තවමත් Pending නම් පරණ විදිහටම Approve / Reject බොත්තම් පෙන්වයි */
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                style={{ ...styles.approveBtn, padding: '6px 12px' }} 
                onClick={() => handleUserApproval(u._id, 'APPROVE')}
              >
                Approve ✓
              </button>
              <button 
                style={{ ...styles.rejectBtn, padding: '6px 12px' }} 
                onClick={() => handleUserApproval(u._id, 'REJECT')}
              >
                Reject ✕
              </button>
            </div>
          )}
        </td>
      </tr>
    ))
  )}
</tbody>
            </table>
          </div>
        )};

        

        {/* 2. VERIFICATION QUEUE */}
       {/* 2. VERIFICATION QUEUE */}
{activeTab === 'QUEUE' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
    
    {/* TOP SECTION: FULL-WIDTH SPACIOUS FILE TABLE */}
    <div style={{ ...styles.card, width: '100%', padding: '20px', boxSizing: 'border-box' }}>
      
      {/* HEADER INFO */}
      <div style={{ borderBottom: '3px solid #f1f5f9', paddingBottom: '18px', marginBottom: '25px' }}>
        <h3 style={{ margin: 0, fontSize: '22px', color: '#0b0b0b', fontWeight: '700', letterSpacing: '0.5px' }}>⏳ File Verification Queue</h3>
        <p style={{ ...styles.desc, margin: '6px 0 0 0', fontSize: '14px' }}>සබ්ජෙක්ට් ඔෆිසර්ලා ඇතුළත් කළ ලිපිගොනු නිවැරදිදැයි බලා ඒවා භෞතිකව තැන්පත් කරන ස්ථාන වෙන් කරන්න.</p>
      </div>

      {/* WIDE PROFESSIONAL TABLE */}
      <table style={styles.proWideTable}>
        <thead>
          <tr style={styles.proThRow}>
            <th style={{ ...styles.proTh, width: '25%',textAlign: 'left' }}>File Details (අංකය සහ නම)</th>
            <th style={{ ...styles.proTh, width: '15%',textAlign:  'left'}}>Category</th>
            <th style={{ ...styles.proTh, width: '25%',textAlign: 'left' }}>Officer Email / Identity</th>
            <th style={{ ...styles.proTh, width: '15%', textAlign: 'left' }}>Document</th>
            <th style={{ ...styles.proTh, width: '20%', textAlign: 'left' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingFiles.length === 0 ? (
            <tr>
              <td colSpan="5" style={styles.emptyTd}>
                ✅ සත්‍යාපනය කිරීමට ලිපිගොනු කිසිවක් පෝලිමේ නොමැත.
              </td>
            </tr>
          ) : (
            pendingFiles.map(f => {
              const isSelected = selectedFileId === f._id;
              return (
                <tr 
                  key={f._id} 
                  style={{ 
                    ...styles.proTrRow, 
                    backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                    borderLeft: isSelected ? '5px solid #10b981' : '5px solid transparent'
                  }}
                >
                  {/* ෆයිල් විස්තර */}
                  <td style={styles.proTd}>
                    <div style={{ fontWeight: '700', color: '#101011', fontSize: '13px', letterSpacing: '0.5px' }}>{f.fileNumber}</div>
                    <div style={{ color: '#64748b', fontSize: '15px', marginTop: '4px', lineHeight: '1.4' }}>{f.fileName}</div>
                  </td>
                  
                  {/* වර්ගීකරණය */}
                  <td style={styles.proTd}>
                    <span style={styles.catBadge}>{f.category}</span>
                  </td>
                  
                  {/* නිලධාරියා */}
                  <td style={styles.proTd}>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' , fontSize: '15px' }}>
    {(() => {
      // 1. කිසිදු දත්තයක් නොමැති නම්
      if (!f.submittedBy) {
        return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>⚠️ Not Available</span>;
      }

      // 2. submittedBy යනු Object එකක් නම් (Populate කර ඇත්නම්)
      if (typeof f.submittedBy === 'object' && f.submittedBy !== null) {
        return (
          <div>
            <span style={{ color: '#0f766e', fontWeight: 'bold', display: 'block' }}>👤 {f.submittedBy.name || 'Officer'}</span>
            <span style={{ color: '#64748b', fontSize: '13px' }}>{f.submittedBy.email}</span>
          </div>
        );
      }

      // 3. submittedBy යනු තවමත් ID එකක් හෝ Email string එකක් නම්
      if (typeof f.submittedBy === 'string') {
        if (f.submittedBy.includes('@')) {
          return <span style={{ color: '#0d0d0e', fontWeight: '400' }}>{f.submittedBy}</span>;
        }
        return <span style={{ color: '#64748b', fontSize: '12px' }}>🆔 ID: {f.submittedBy.substring(0, 10)}...</span>;
      }
    })()}
  </div>
</td>
                  
                  {/* ඩිජිටල් ලිපිය */}
                  <td style={{ ...styles.proTd, textAlign: 'center' , fontSize:'15px'}}>
                    {f.fileUrl ? (
                      <a 
                        href={`http://localhost:5000${f.fileUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={styles.proPdfBtn}
                      >
                        View PDF 📄
                      </a>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '12px', fontStyle: 'italic' }}>No File</span>
                    )}
                  </td>
                  
                  {/* බොත්තම් */}
                  <td style={{ ...styles.proTd, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '12px' }}>
                      <button 
                        style={{
                          ...styles.proSelectBtn, borderRadius: '5px',backgroundColor: '#3d33f9' , color:'#fff',
                          background: isSelected ? '#1d52ee' : '#196cf1',
                          boxShadow: isSelected ? '0 3px 8px rgba(16,185,129,0.25)' : '0 3px 8px rgba(59,130,246,0.15)'
                        }} 
                        onClick={() => {
                          setSelectedFileId(f._id);
                          let defaultRack = '';
                          const cat = f.category?.toLowerCase() || '';
                          if (cat.includes('general')) defaultRack = 'Rack 01';
                          else if (cat.includes('finance') || cat.includes('account')) defaultRack = 'Rack 02';
                          else if (cat.includes('legal')) defaultRack = 'Rack 03';
                          else if (cat.includes('inventory')) defaultRack = 'Rack 04';
                          else if (cat.includes('establishment')) defaultRack = 'Rack 05';
                          
                          setRackNumber(defaultRack);
                          setShelfNumber(defaultRack ? 'Shelf 01' : '');
                        }}
                      >
                        {isSelected ? 'Selected 🎯' : 'Select 🗄️'}
                      </button>
                      <button style={{ ...styles.proRejectBtn, borderRadius: '5px',backgroundColor: '#f31515', color: '#fff' }} onClick={() => handleRejectFile(f._id)}>
                        Reject ✕
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>

    {/* BOTTOM SECTION: RACK ASSIGNMENT BOX (⚠️ දැන් පහළට ගෙනාවා) */}
    <div 
      style={{ 
        ...styles.card, 
        width: '100%', 
        background: selectedFileId ? '#72ef72' : '#f8fafc', 
        padding: '30px', 
        border: selectedFileId ? '1px solid #10b981' : '1px solid #6ff36f', 
        boxSizing: 'border-box',
        transition: 'all 0.3s' 
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>🗄️ Physical Rack & Shelf Assignment</h3>
        {!selectedFileId && <span style={{ fontSize: '12px', background: '#2e85f7', padding: '3px 10px', borderRadius: '50px', color: '#0c0c0c' }}>Waiting for selection</span>}
      </div>
      
      {selectedFileId ? (
        <form onSubmit={handleAssignRack} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Selected File Details Banner */}
          <div style={{ fontSize: '14px', background: '#f0fdf4', padding: '15px', borderRadius: '8px', color: '#166534', fontWeight: '600', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between' }}>
            <span>🎯 දැනට තෝරාගත් ලිපිගොනුව (Active Mapping ID)</span>
            <span style={{ fontFamily: 'monospace', color: '#15803d' }}>{selectedFileId}</span>
          </div>
          
          {/* Dual Column Inputs */}
          {/* Rack Number Dropdown */}
{/* Rack Number Dropdown */}
<div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
  <label style={styles.newLabel}>Rack Number (රාක්ක අංකය)</label>
  <select 
    style={styles.newInput} 
    value={rackNumber} 
    onChange={(e) => setRackNumber(e.target.value)} 
    required
  >
    <option value="">Select Rack</option>
    <option value="Rack 01">Rack 01 - General</option>
    <option value="Rack 02">Rack 02 - Finance/Account</option>
    <option value="Rack 03">Rack 03 - Legal</option>
    <option value="Rack 04">Rack 04 - Inventory</option>
    <option value="Rack 05">Rack 05 - Establishment</option>
  </select>
</div>

{/* Shelf Number Dropdown */}
<div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
  <label style={styles.newLabel}>Shelf Number (තට්ටු අංකය)</label>
  <select 
    style={styles.newInput} 
    value={shelfNumber} 
    onChange={(e) => setShelfNumber(e.target.value)} 
    required
  >
    <option value="">Select Shelf</option>
    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
        <option key={num} value={`Shelf 0${num}`}>{`Shelf 0${num}`}</option>
    ))}
  </select>
</div>
          
          {/* Action Button */}
          <button type="submit" style={{ ...styles.newSubmitBtn, alignSelf: 'flex-start', padding: '14px 35px',color :'#090909', backgroundColor: '#6773fa', borderRadius: '8px', fontWeight: 'bold' }}>
            Verify & Confirm Location Mapping 🚀
          </button>
        </form>
      ) : (
        <div style={{ ...styles.newPlaceholder, padding: '40px 20px' }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}> </span>
          ඉහත වගුවෙන් ලිපිගොනුවක් තෝරාගත් පසු (Select කළ පසු) රාක්ක අංක ඇතුළත් කිරීමේ පෝරමය මෙතනින් දිස්වේවි.
        </div>
      )}
    </div>

  </div>
)}

{/* 3. RE-APPROVAL TAB */}
{activeTab === 'RE_APPROVAL' && (
  <div style={styles.card}>
    <h3>🔄 Need Re-approval</h3>
    <p style={styles.desc}>පරිශීලකයා විසින් යාවත්කාලීන කරන ලද සහ නැවත අනුමැතිය බලාපොරොත්තුවෙන් පවතින ලිපිගොනු.</p>
    <table style={{ ...styles.table, minWidth: '900px' }}>
      <thead>
        <tr style={styles.thRow}>
          <th style={{ width: '16%' }}>File Number</th>
          <th style={{ width: '14%' }}>File Name</th>
          <th style={{ width: '14%' }}>Status</th>
          <th style={{ width: '14%' }}>Rack Number</th>
          <th style={{ width: '14%' }}>Shelf Number</th>
          <th style={{ width: '18%' }}>Action</th>
        </tr>
      </thead>
      <tbody>
        {allFiles.filter(f => f.isVerified === 'PENDING' && f.needsReapproval === true).map(f => {
          const location = reapprovalLocations[f._id] || {};

          return (
          <tr key={f._id} style={styles.trRow}>
            <td style={styles.boldTd}>{f.fileNumber}</td>
            <td>{f.fileName}</td>
            <td><span style={{ color: '#d97706', fontWeight: 'bold' }}>Pending Re-approval</span></td>
            <td>
              <input
                type="text"
                style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
                placeholder="Rack 03"
                value={location.rackNumber || ''}
                onChange={(e) => handleReapprovalLocationChange(f._id, 'rackNumber', e.target.value)}
              />
            </td>
            <td>
              <input
                type="text"
                style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
                placeholder="Shelf 02"
                value={location.shelfNumber || ''}
                onChange={(e) => handleReapprovalLocationChange(f._id, 'shelfNumber', e.target.value)}
              />
            </td>
            <td>
              
              <div style={styles.reapprovalActions}>
              {f.fileUrl && (
                <a
                  href={`http://localhost:5000${f.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...styles.reapprovalActionBtn, ...styles.reapprovalViewBtn }}
                >
                  View
                </a>
              )}
               
              <button
                style={{ ...styles.reapprovalActionBtn, ...styles.reapprovalApproveBtn, padding:'6px 12px', backgroundColor: '#1e4eed',borderRadius:'6px',color:'#f8fafc',width:'fit-content'  }}
                onClick={() => handleReapproval(f._id)}
              >
                Re-approve
              </button>
              <button
                style={{ ...styles.reapprovalActionBtn, ...styles.reapprovalRejectBtn, padding:'6px 12px', backgroundColor: '#dc2626',color:'#f8fafc',borderRadius:'6px' , width:'fit-content' , gap:'12px'}}
                onClick={() => handleRejectFile(f._id)}
              >
                Reject
              </button>
              </div>
            </td>
            
          </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}

        {/* 🗄️ 3. NEW TAB: MANAGED RACK INVENTORY (රාක්ක ගත කළ ෆයිල් පමණක් පෙන්වන පේජය) */}
        {activeTab === 'VERIFIED_LIST' && (
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ margin: 0 }}>🗄️ Managed Rack Inventory (රාක්ක ගත කළ ලිපිගොනු)</h3>
                <p style={{ ...styles.desc, margin: '5px 0 0 0' }}>රාක්ක අංක සහ තට්ටු අංක සාර්ථකව වෙන් කර, දැනට භෞතික ගබඩාවේ තැන්පත් කර ඇති ලිපිගොනු ලේඛනය.</p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  onClick={() => handleExportExcel(filteredVerifiedFiles, 'Verified_Rack_Inventory')} 
                  style={{ padding: '8px 15px', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#10b981' }}
                >
                  Export Excel 📊
                </button>
                <button 
                  onClick={() => handleExportPDF(filteredVerifiedFiles, 'Managed Rack Inventory Report', 'Verified_Rack_Inventory')} 
                  style={{ padding: '8px 15px', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#ef4444' }}
                >
                  Export PDF 📄
                </button>
                {/* 🔍 සර්ච් බාර් එක */}
                <input 
                  type="text" 
                  placeholder="🔍 Search File No, Name or Rack..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchBar}
                />
              </div>
            </div>

            <table style={styles.table}>
              <thead>
                <tr style={{ ...styles.thRow, background: '#e2e8f0' }}>
                  <th>Physical Location (රාක්කය / තට්ටුව)</th>
                  <th>File Number</th>
                  <th>File Name</th>
                  <th>Category</th>
                  <th>Officer</th>
                  <th>Digital File</th>
                </tr>
              </thead>
              <tbody>
                {filteredVerifiedFiles.length === 0 ? (
                  <tr><td colSpan="6" style={styles.emptyTd}>🗄️ රාක්ක ගත කරන ලද ලිපිගොනු කිසිවක් සොයාගත නොහැක.</td></tr>
                ) : (
                  filteredVerifiedFiles.map((f) => (
                    <tr key={f._id} style={styles.trRow}>
                      {/* රාක්ක අංකය කැපී පෙනෙන ලෙස */}
                      <td>
                        <span style={styles.locationBadge}>
                          🗄️ {f.rackNumber} — 📁 {f.shelfNumber}
                        </span>
                      </td>
                      <td style={styles.boldTd}>{f.fileNumber}</td>
                      <td>{f.fileName}</td>
                      <td><span style={styles.catBadge}>{f.category}</span></td>
                    
<td style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>
  👤 {f.submittedBy ? f.submittedBy : 'N/A'}
</td>
                      <td>
                        {f.fileUrl ? (
                          <a href={`http://localhost:5000${f.fileUrl}`} target="_blank" rel="noopener noreferrer" style={{ ...styles.viewFileLink, color: '#10b981' }}>
                            View PDF 📄
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>None</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'GRAPHICAL_RACK' && (
          <GraphicalRack />
        )}

        {/* 4. SYSTEM-WIDE AUDIT */}
        {activeTab === 'AUDIT' && (
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{margin:0}}>📊 System-Wide Audit & Inventory Reports</h3>
                <p style={{...styles.desc, margin:'5px 0 0 0'}}>ගබඩාව තුළ ඇති සියලුම ලිපිගොනු (Pending, Verified, Rejected) පිළිබඳ සමස්ත වාර්තාව.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleExportExcel(allFiles, 'System_Wide_Audit')} 
                  style={{ padding: '8px 15px', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#10b981' }}
                >
                  Export Excel 📊
                </button>
                <button 
                  onClick={() => handleExportPDF(allFiles, 'System-Wide Audit & Inventory Report', 'System_Wide_Audit')} 
                  style={{ padding: '8px 15px', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#ef4444' }}
                >
                  Export PDF 📄
                </button>
              </div>
            </div>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th>File Number</th>
                  <th>File Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Physical Location</th>
                </tr>
              </thead>
              <tbody>
                {allFiles.length === 0 ? (
                  <tr><td colSpan="5" style={styles.emptyTd}>📊 පද්ධතිය තුළ තවමත් ලිපිගොනු කිසිවක් නොමැත.</td></tr>
                ) : (
                  allFiles.map((f, i) => (
                    <tr key={i} style={styles.trRow}>
                      <td style={styles.boldTd}>{f.fileNumber}</td>
                      <td>{f.fileName}</td>
                      <td><span style={styles.catBadge}>{f.category}</span></td>
                      <td>
                        <span style={{
                          ...styles.statusBadge,
                          background: f.isVerified === 'VERIFIED' ? '#e8f5e9' : f.isVerified === 'PENDING' ? '#fffde7' : '#ffebee',
                          color: f.isVerified === 'VERIFIED' ? '#2e7d32' : f.isVerified === 'PENDING' ? '#f57f17' : '#c62828'
                        }}>{f.isVerified}</span>
                      </td>
                      <td style={{ fontWeight: '500', color: '#1e293b' }}>
                        {f.rackNumber === 'Unassigned' ? (f.isVerified === 'REJECTED' ? '❌ ප්‍රතික්ෂේපිතයි' : '⏳ තීරණය වෙමින් පවතී') : `🗄️ ${f.rackNumber} / ${f.shelfNumber}`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}


      </main>
    </div>
       

  );
};

// CSS-IN-JS STYLES
const styles = {
  container: { display: 'flex', width: '100vw', minHeight: '100vh', background: '#f8fafc', color: '#334155', fontFamily: "'Segoe UI', sans-serif" },
  sidebar: { textAlign: 'left', width: '260px', background: '#0f172a', color: '#fff', padding: '30px 20px', display: 'flex', flexDirection: 'column' , },
  brand: { fontSize: '20px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '15px', letterSpacing: '1px' },
  adminName: { fontSize: '15px', margin: '5px 0' },
  badge: { fontSize: '11px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 12px', borderRadius: '50px', alignSelf: 'flex-start', fontWeight: 'bold', marginBottom: '35px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  navItem: { padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8', fontSize: '14px', fontWeight: '500', transition: '0.2s' },
  activeNav: { background: '#1e293b', color: '#38bdf8', fontWeight: 'bold' },
  homeBtn: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  
  main: { flex: 1, padding: '35px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '30px' },
  yearTag: { background: '#cbd5e1', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  
  card: { background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%', border: '1px solid #e2e8f0' },
  desc: { fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' },
  
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem', fontSize: '14px', textAlign: 'left', minWidth: '720px' },
  thRow: { background: '#f1f5f9', color: '#475569', borderBottom: '2px solid #e2e8f0', letterSpacing: '0.02em' },
  trRow: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', height: '56px', transition: 'transform 0.18s ease, box-shadow 0.18s ease', boxShadow: '0 1px 2px rgba(15,23,42,0.06)' },
  boldTd: { fontWeight: '700', color: '#0f172a', padding: '16px 14px' },
  emptyTd: { textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '15px' },
  
  riskCard: { border: '1px solid #dbeafe', boxShadow: '0 14px 28px rgba(15,23,42,0.08)' },
  
  roleBadge: { background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  catBadge: { background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' },
  statusBadge: { padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 'bold' },
  
  // 🏢 අලුත් Location Badge එකකට Styles
  locationBadge: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' },
  // 🔍 සර්ච් බාර් එකේ ස්ටයිල්
  searchBar: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #2cdfeb', width: '250px', outline: 'none', fontSize: '14px' },
  
  approveBtn: { background: '#2b28ec', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', marginRight: '8px', cursor: 'pointer', fontWeight: '600' },
  rejectBtn: { background: '#fc1717', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  selectBtn: { color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: '0.2s' },
  
  viewFileLink: { color: '#2945e6', textDecoration: 'underline', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { fontSize: '13px', fontWeight: '500' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' },
  submitBtn: { background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  placeholderText: { textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '40px 0' },

  // Styles Object එක තුළ
proTh: { 
  padding: '15px 25px', // උඩ/පහළ 15px, වම්/දකුණු 25px (පරතරය වැඩි කරන්න 25 වෙනුවට 30 හෝ 40 දාන්න)
  fontWeight: '600', 
  color: '#64748b', 
  // ...
},
proTd: { 
  padding: '20px 25px', // මෙහි අගය වැඩි කිරීමෙන් පේළි අතර සහ අකුරු අතර පරතරය තවත් වැඩි වේ.
  verticalAlign: 'middle',
  // ...
},



// Styles Object එක තුළ
proWideTable: { 
  width: '100%', 
  borderCollapse: 'separate', 
  borderSpacing: '0 20px', // මෙතන 20px කළොත් පේළි අතර පරතරය තවත් වැඩි වෙනවා
  // ...
},
tableCard: { 
  width: '100%',      // පවතින ඉඩ ප්‍රමාණයට පමණක් සීමා වේ
  maxWidth: '100%',   // තිරයෙන් පිටතට යාම වළක්වයි
  overflowX: 'auto'   // Table එක පළල් නම් Table එක ඇතුළත පමණක් Scroll වේ
},

chartContainer: {
    width: '45%',
    height: '400px', // මෙය අනිවාර්යයි
    padding: '20px',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 8px 16px -2px rgba(0,0,0,0.1)'
  },
  
  


};

export default AdminDashboard;
