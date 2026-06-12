import React, { useState, useEffect } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import GraphicalRack from './GraphicalRack';

const SubjectOfficerDashboard = ({ user, goToHome, goToFileCreation, goToMainHome }) => {
  const [activeTab, setActiveTab] = useState('DASHBOARD'); 
  const [searchTerm, setSearchTerm] = useState('');

  // Data States
  const [myFiles, setMyFiles] = useState([]); 
  const [allVerifiedFiles, setAllVerifiedFiles] = useState([]); 
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
const [currentFile, setCurrentFile] = useState(null);
const [newFile, setNewFile] = useState(null);

// ඉහළින් මෙය එකතු කරන්න
const [officerData, setOfficerData] = useState({});
const [selectedFiles, setSelectedFiles] = useState([]);
const [allSelected, setAllSelected] = useState(false);
const [historyLogs, setHistoryLogs] = useState([]);
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);


  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/all-officers'); // ඔබේ officerලා ඉන්න route එක
        // දත්ත Map කරගන්න: { "id123": "kumara@gmail.com", ... }
        const map = {};
        res.data.forEach(user => { map[user._id] = user.email; });
        setOfficerData(map);
      } catch (err) {
        console.error("Officer data fetch failed", err);
      }
    };
    fetchOfficers();
  }, []);

  const fetchNotifications = async () => {
    if (!user || !user.email) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/${user.email}`);
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Notifications fetch failed", err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Mark read failed", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || !user.email) return;
    try {
      await axios.put(`http://localhost:5000/api/notifications/read-all/${user.email}`);
      fetchNotifications();
    } catch (err) {
      console.error("Mark all read failed", err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error("Delete notification failed", err);
    }
  };

  useEffect(() => {
    if (!user || !user.email) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (user && user.email && activeTab === 'NOTIFICATIONS') {
      fetchNotifications();
    }
  }, [activeTab]);

const toggleFileSelection = (id) => {
  if (selectedFiles.includes(id)) {
    setSelectedFiles(selectedFiles.filter(item => item !== id));
  } else {
    setSelectedFiles([...selectedFiles, id]);
  }
};

const toggleAll = () => {
  if (allSelected) {
    setSelectedFiles([]);
  } else {
    setSelectedFiles(myFiles.map(f => f._id));
  }
  setAllSelected(!allSelected);
};

const exportToExcel = () => {
  // කුමන දත්තද බාගත කළ යුත්තේ? (උදා: myFiles)
  const worksheet = XLSX.utils.json_to_sheet(myFiles);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "MyFiles");
  
  // ෆයිල් එක Save කිරීම
  XLSX.writeFile(workbook, "My_Files_Report.xlsx");
  
  // Audit log එකට එක් කිරීම (Optional)
  axios.post('http://localhost:5000/api/audit-logs/add', {
    officerId: user.email,
    action: "EXPORTED_TO_EXCEL",
    fileName: "My_Files_Report.xlsx",
    timestamp: new Date()
  });
};




// නිවැරදි ආකාරය:
const handleWhatsAppShare = async (file) => { // මෙතන 'async' අනිවාර්යයි
  const message = `PC-Store Update: ${file.fileName} - Status: ${file.isVerified}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  
  try {
    await axios.post('http://localhost:5000/api/audit-logs/add', {
      officerId: user.email,
      action: "SHARED_FILE",
      fileName: file.fileName,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("History log update failed", err);
  }
};


const handleDownload = async (elementId) => {
  const input = document.getElementById(elementId);
  
  if (!input) {
    console.error("Element not found with ID:", elementId);
    alert("ලිපිගොනුව බාගත කිරීමට දත්ත හමු නොවීය.");
    return;
  }

  html2canvas(input, { useCORS: true, scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('l', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 10, 10, 280, 20); 
    pdf.save(`file_${elementId}.pdf`);
  });

   try {
    await axios.post('http://localhost:5000/api/audit-logs/add', {
      officerId: user.email,
      action: "DOWNLOADED_FILE",
      fileName: file.fileName,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("History log update failed", err);
  }
};



   // Add these to your SubjectOfficerDashboard component
const handleView = (file) => {
  if (file.fileUrl) {
    window.open(`http://localhost:5000${file.fileUrl}`, '_blank');
  } else {
    alert("සමාවන්න, මෙම ලිපිගොනුවට අදාළ PDF එකක් නොමැත.");
  }
};

// 1. Modal එක විවෘත කිරීමට
// 1. Edit බොත්තම එබූ විට Modal එක විවෘත කිරීම
const handleEditClick = (file) => {
<<<<<<< HEAD
  setCurrentFile(file);
  setNewFile(null); 
=======
  console.log("Editing file:", file); // මෙය පරීක්ෂා 
  setCurrentFile(file); // මෙතනදී file එකේ _id එක ඇතුළත් විය යුතුයි
>>>>>>> f09a184b766a15eb0f55253d966ac4d8a4a0a8a1
  setIsModalOpen(true);
};

// 2. අලුත් ෆයිල් එක සහ status එක යාවත්කාලීන කිරීම
const handleUpdateSubmit = async () => {
  console.log("Current File ID:", currentFile?._id);
  console.log("Selected New File:", newFile);

  if (!currentFile?._id) {
    alert("Please select a file to update.");
    return;
  }

  // ෆයිල් එක තෝරා නැතිනම් පමණක් Error එකක් පෙන්වන්න
  if (!newFile) {
    alert("කරුණාකර නව ලිපිගොනුව තෝරන්න.");
    return;
  }

  const formData = new FormData();
<<<<<<< HEAD
  formData.append('file', newFile); 
=======
  formData.append('file', newFile); // මෙය ඔබේ backend upload.single('file') සමග ගැලපිය යුතුයි
>>>>>>> f09a184b766a15eb0f55253d966ac4d8a4a0a8a1
  formData.append('isVerified', 'PENDING');

  try {
    const response = await axios.put(`http://localhost:5000/api/files/update/${currentFile._id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    alert("✅ ලිපිගොනුව සාර්ථකව යාවත්කාලීන කරන ලදී.");
    setIsModalOpen(false);
    setNewFile(null);
    fetchMyFiles();
  } catch (err) {
    console.error("Update Error:", err.response ? err.response.data : err.message);
    alert("❌ යාවත්කාලීන කිරීම අසාර්ථකයි.");
  }
};

const handleBulkDelete = async () => {
  if (selectedFiles.length === 0) return alert("කරුණාකර අවම වශයෙන් එක් ෆයිල් එකක් හෝ තෝරන්න.");
  
  if (window.confirm(`තෝරාගත් ෆයිල්ස් ${selectedFiles.length} මකා දැමීමට අවශ්‍යද?`)) {
    try {
      // ලූපයක් මගින් එකින් එක Delete කර Log කිරීම
      for (const fileId of selectedFiles) {
        const file = myFiles.find(f => f._id === fileId);
        await axios.delete(`http://localhost:5000/api/files/${fileId}`);
        
        await axios.post('http://localhost:5000/api/audit-logs/add', {
          officerId: user.email,
          action: "DELETED_FILE",
          fileName: file ? file.fileName : "Unknown File",
          timestamp: new Date()
        });
      }
      
      alert("සාර්ථකව මකා දමන ලදී.");
      setSelectedFiles([]); // Selection clear කරන්න
      fetchMyFiles(); 
    } catch (err) {
      alert("මැකීමේදී දෝෂයක් සිදු විය.");
    }
  }
};
  
  useEffect(() => {
    // 💡 user.email වෙනුවට user.id ඇති විට ක්‍රියාත්මක වේ
    if (user && user.email) {
      fetchMyFiles();
      fetchAllVerifiedFiles();
    }
  }, [user]);

  // 1. 👤 ඔෆිසර්ගේ පෞද්ගලික ෆයිල්ස් ලබාගැනීම
  const fetchMyFiles = async () => {
    if (!user || !user.email) return;
    
    const officerEmail = user.email;

    try {
      // 💡 Method A: කෙලින්ම සර්වර් එකෙන් ID එක හරහා දත්ත ඉල්ලීම
      const res = await axios.get(`http://localhost:5000/api/files/my-files/${officerEmail}`);
      
      if (res.data && res.data.length > 0) {
        setMyFiles(res.data);
        calculateStats(res.data);
      } else {
        // 💡 Method B (Fallback): සර්වර් එකෙන් ආවේ නැත්නම් ඔක්කොම අරන් Frontend එකෙන් ID එකට Filter කරයි
        const allRes = await axios.get('http://localhost:5000/api/files/all-files');
        const filtered = allRes.data.filter(file => {
          return file.submittedBy === officerEmail;
        });
        setMyFiles(filtered);
        calculateStats(filtered);
      }
    } catch (err) {
      console.error("දත්ත ලබාගැනීමේදී ගැටලුවක්, Running client fallback...", err);
      try {
        const allRes = await axios.get('http://localhost:5000/api/files/all-files');
        const filtered = allRes.data.filter(file => file.submittedBy === officerEmail);
        setMyFiles(filtered);
        calculateStats(filtered);
      } catch (fallbackErr) {
        console.error("All data pipelines failed:", fallbackErr);
      }
    }
  };

// මෙම කොටස සොයාගෙන වෙනස් කරන්න:


  // 2. 🗄️ ඇඩ්මින් වෙරිෆයි කරපු සියලුම ඔෆිසර්ලගේ ෆයිල්ස් ලබාගැනීම (Rack Locator සඳහා)
  const fetchAllVerifiedFiles = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/files/all-files');
      const verifiedOnly = res.data.filter(file => file.isVerified === 'VERIFIED');
      setAllVerifiedFiles(verifiedOnly);
    } catch (err) {
      console.error("සියලුම රාක්ක දත්ත ලබාගැනීම අසාර්ථකයි:", err);
    }
  };

  const calculateStats = (files) => {
    const total = files.length;
    const pending = files.filter(f => f.isVerified === 'PENDING').length;
    const verified = files.filter(f => f.isVerified === 'VERIFIED').length;
    setStats({ total, pending, verified });
  };

 
// History data fetch කරන function එක
const fetchHistory = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/audit-logs/${user.email}`);
    setHistoryLogs(res.data);
  } catch (err) {
    console.error("History fetch failed", err);
  }
};

// activeTab 'HISTORY' වූ විට පමණක් මෙය කැඳවන්න
useEffect(() => {
  if (activeTab === 'HISTORY') {
    fetchHistory();
  }
}, [activeTab]);

  return (
    <div style={styles.dashboardContainer}>
      
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>🏢 NWPC STORES</div>
        <p style={styles.userTag}>👤 {user?.name || 'Officer'}</p>
        <span style={styles.roleBadge}>Subject Officer</span>
        
        <nav style={styles.sidebarNav}>
          <div 
            style={{ ...styles.navItemLink, background: '#2d3748', color: '#3498db', border: '1px solid #3498db', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }} 
            onClick={goToHome}
          >
            🏠 Go to Main Home
          </div>

          <div 
            style={{...styles.navItemLink, ...(activeTab === 'DASHBOARD' && styles.activeNav)}}
            onClick={() => setActiveTab('DASHBOARD')}
          >
            📊 Main Dashboard
          </div>
          
          <div style={styles.navItemLink} onClick={goToFileCreation}>
            📂 Digital File Creation
          </div>
          
          <div 
            style={{...styles.navItemLink, ...(activeTab === 'LOCATOR' && styles.activeNav)}}
            onClick={() => {
              setActiveTab('LOCATOR');
              fetchAllVerifiedFiles(); 
            }}
          >
            🗄️ Rack Locator
          </div>

         
<div 
  style={{...styles.navItemLink, ...(activeTab === 'GRAPHICAL_RACK' && styles.activeNav)}}
  onClick={() => setActiveTab('GRAPHICAL_RACK')}
>
  🗄️ Graphical Racks
</div>
<div 
  style={{...styles.navItemLink, ...(activeTab === 'HISTORY' && styles.activeNav)}}
  onClick={() => setActiveTab('HISTORY')}
>
  ⏳ Transaction History
</div>

<div 
  style={{
    ...styles.navItemLink, 
    ...(activeTab === 'NOTIFICATIONS' && styles.activeNav),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}
  onClick={() => setActiveTab('NOTIFICATIONS')}
>
  <span>🔔 Notifications</span>
  {unreadCount > 0 && (
    <span style={styles.sidebarBadge}>{unreadCount}</span>
  )}
</div>
        </nav>

        <button 
          style={{ ...styles.logoutBtn, background: '#ef4444', color: '#fff', border: 'none', marginTop: 'auto', width: '100%' }} 
          onClick={() => {
            if(window.confirm("ඔබට පද්ධතියෙන් ඉවත් වීමට අවශ්‍යද?")) {
              goToMainHome(); 
            }
          }}
        >
          🛑 Log Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={styles.mainContent}>
        
        <header style={styles.topHeader}>
          <h2>Subject Officer Dashboard</h2>
          <div style={styles.headerRight}>Year:2026</div>
        </header>

        {/* ==========================================
            TAB 1: MAIN DASHBOARD VIEW (Personal Logs)
           ========================================== */}
        {activeTab === 'DASHBOARD' && (
          <>
            <section style={styles.statsContainer}>
              <div style={{ ...styles.statCard, borderLeft: '5px solid #3498db' }}>
                <h3>Submitted Files</h3>
                <div style={styles.statNumber}>{stats.total}</div>
              </div>
              <div style={{ ...styles.statCard, borderLeft: '5px solid #f1c40f' }}>
                <h3>Pending Verification</h3>
                <div style={styles.statNumber}>{stats.pending}</div>
              </div>
              <div style={{ ...styles.statCard, borderLeft: '5px solid #2ecc71' }}>
                <h3>Approved Files</h3>
                <div style={styles.statNumber}>{stats.verified}</div>
              </div>
            </section>

            <div style={styles.workspace}>
              <div style={styles.tableCard}>
                <div style={styles.tableHeaderZone}>
  <div>
    <h3>🗂️ Personal Log & Verification Queue</h3>
    <p style={styles.cardDesc}>ලිපිගොනු කළමනාකරණය කිරීමට තෝරා ඉහළින් ඇති බොත්තම් භාවිතා කරන්න.</p>
  </div>
  
  <div style={{ display: 'flex', gap: '8px' }}>
    <button style={styles.shortcutBtn} onClick={goToFileCreation}>➕ Create New File</button>
    <button 
  style={styles.viewBtn} 
  onClick={() => {
    if (selectedFiles.length > 0) {
      // selectedFiles[0] හි ඇති ID එකට අදාළ ෆයිල් එක සොයාගන්න
      const fileToView = myFiles.find(f => f._id === selectedFiles[0]);
      handleView(fileToView);
    } else {
      alert("කරුණාකර VIEW කිරීමට ෆයිල් එකක් තෝරන්න.");
    }
  }}
>
  VIEW
</button>
<<<<<<< HEAD
    <button style={styles.editBtn} onClick={() => handleEditClick(myFiles.find(f => f._id === selectedFiles[0]))}>EDITE</button>
=======
    
<button style={styles.editBtn} onClick={() => handleEditClick(selectedFiles[0] ? myFiles.find(f => f._id === selectedFiles[0]) : null)}>
  EDITE
</button>
>>>>>>> f09a184b766a15eb0f55253d966ac4d8a4a0a8a1
    <button style={styles.deleteBtn} onClick={handleBulkDelete}> DELETE</button>
    <button style={{ ...styles.viewBtn, background: '#25D366' }} onClick={handleWhatsAppShare}> SHARE</button>
     <button 
  style={{ ...styles.viewBtn, background: '#695251', color: 'white' }} 
  onClick={() => {
    if (selectedFiles.length > 0) {
      handleDownload(`record-${selectedFiles[0]}`);
    } else {
      alert("කරුණාකර බාගත කිරීමට ෆයිල් එකක් තෝරන්න.");
    }
  }}
>
  DOWNLOAD
</button> 

    <button 
  style={{ ...styles.viewBtn, background: '#27ae60', marginLeft: '10px' }} 
  onClick={exportToExcel}
>
   Export to Excel
</button>

  </div>
</div>
                

                
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
  <thead>
    <tr style={styles.thRow}>
      <th><input type="checkbox" onChange={toggleAll} checked={allSelected} /></th>
      <th>File No</th>
      <th>File Name</th>
      <th>Category</th>
      <th>Status</th>
      <th>Rack Location</th>
    </tr>
  </thead>
  <tbody>
    {myFiles.map((file) => (
     
      <tr key={file._id} id={`record-${file._id}`} style={styles.trRow}>
        <td>
          <input 
            type="checkbox" 
            checked={selectedFiles.includes(file._id)}
            onChange={() => toggleFileSelection(file._id)}
          />
        </td>
        <td style={styles.boldTd}>{file.fileNumber}</td>
        <td>{file.fileName}</td>
        <td><span style={styles.catBadge}>{file.category}</span></td>
        <td>
          <span style={{ ...styles.statusBadge, background: file.isVerified === 'VERIFIED' ? '#9bf693' : '#f8aa9e' }}>
            {file.isVerified}
          </span>
        </td>
        <td style={styles.locTd}>{file.rackNumber || '⏳ රඳවා ඇත'}</td>
      </tr>
    ))}
  </tbody>
</table>
                </div>
              </div>
            </div>
          </>
        )}

        

        {/* ==========================================
            TAB 2: GLOBAL RACK LOCATOR VIEW (All Verified Files)
           ========================================== */}
        {activeTab === 'LOCATOR' && (
          <div style={styles.tableCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ margin: 0 }}>🗄️ Master Rack Locator (පොදු රාක්ක සෙවුම)</h3>
                <p style={styles.cardDesc}>ඇඩ්මින් විසින් සත්‍යාපනය කර ගබඩා කරන ලද <b>සියලුම නිලධාරීන්ගේ</b> ලිපිගොනු සහ ඒවායේ රාක්ක අංක මෙතැනින් සොයන්න.</p>
              </div>
              
              <input 
                type="text" 
                placeholder="🔍 Search File No, Name or Category..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchBar}
              />
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ ...styles.thRow, background: '#e2e8f0' }}>
                    <th>File Number</th>
                    <th>File Name</th>
                    <th>Category</th>
                    <th>Submitted By (Officer)</th>
                    <th>🗄️ Physical Location</th>
                  </tr>
                </thead>
                <tbody>
                  {allVerifiedFiles.filter(f => 
                    f.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.category.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 ? (
                    <tr><td colSpan="5" style={styles.emptyTd}>🔍 සොයන ලද ලිපිගොනුවට අදාළ කිසිදු රාක්ක දත්තයක් පද්ධතියේ හමුනොවීය.</td></tr>
                  ) : (
                    allVerifiedFiles
                      .filter(f => 
                        f.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        f.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        f.category.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((f, idx) => (
                        <tr key={idx} style={styles.trRow}>
                          <td style={styles.boldTd}>{f.fileNumber}</td>
                          <td>{f.fileName}</td>
                          <td><span style={styles.catBadge}>{f.category}</span></td>
                         
                         <td style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>
  👤 {f.submittedBy ? f.submittedBy : 'N/A'}
</td>
                          

                                  
                          <td>
                            <span style={styles.locationBadge}>
                              📍 {f.rackNumber} — {f.shelfNumber}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

          {activeTab === 'HISTORY' && (
  <div style={styles.tableCard}>
    <h3>📜 Transaction History (ඔබේ ක්‍රියාකාරකම්)</h3>
    <p style={styles.cardDesc}>ඔබ සිදු කළ පසුගිය සියලුම ගනුදෙනු ලැයිස්තුව.</p>
    
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.thRow}>
            <th>Date/Time</th>
            <th>Action</th>
            <th>File Name</th>
          </tr>
        </thead>
        <tbody>
          {historyLogs.length === 0 ? (
            <tr><td colSpan="3" style={styles.emptyTd}>කිසිදු වාර්තාවක් හමු නොවීය.</td></tr>
          ) : (
            historyLogs.map((log) => (
              <tr key={log._id} style={styles.trRow}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', 
                    background: log.action.includes('DELETE') ? '#fee2e2' : '#dcfce7' 
                  }}>
                    {log.action}
                  </span>
                </td>
                <td>{log.fileName}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

        {activeTab === 'GRAPHICAL_RACK' && (
          <GraphicalRack />
        )}

        {activeTab === 'NOTIFICATIONS' && (
          <div style={styles.tableCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0 }}>🔔 Notifications System</h3>
                <p style={styles.cardDesc}>ඔබගේ ලිපිගොනු පිළිබඳ තත්‍ය කාලීන දැනුම්දීම්.</p>
              </div>
              {notifications.length > 0 && (
                <button 
                  style={{ ...styles.shortcutBtn, background: '#475569' }} 
                  onClick={handleMarkAllAsRead}
                >
                  Mark All as Read ✓
                </button>
              )}
            </div>

            <div style={styles.notificationList}>
              {notifications.length === 0 ? (
                <div style={styles.emptyNotification}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                  <p>කිසිදු දැනුම්දීමක් නොමැත.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  let indicatorColor = '#3498db'; // Submitted
                  let indicatorBg = 'rgba(52, 152, 219, 0.1)';
                  let icon = '📂';
                  
                  if (notif.type === 'FILE_APPROVED') {
                    indicatorColor = '#2ecc71'; // Approved
                    indicatorBg = 'rgba(46, 204, 113, 0.1)';
                    icon = '✅';
                  } else if (notif.type === 'FILE_REJECTED') {
                    indicatorColor = '#e74c3c'; // Rejected
                    indicatorBg = 'rgba(231, 76, 60, 0.1)';
                    icon = '❌';
                  }

                  return (
                    <div 
                      key={notif._id} 
                      style={{
                        ...styles.notificationItem,
                        background: notif.isRead ? '#ffffff' : '#f0f9ff',
                        borderLeft: `5px solid ${indicatorColor}`,
                        boxShadow: notif.isRead ? 'none' : '0 2px 8px rgba(14, 165, 233, 0.08)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', width: '100%' }}>
                        <div style={{ ...styles.notificationIcon, color: indicatorColor, background: indicatorBg }}>
                          {icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#1e293b', fontWeight: 'bold' }}>
                              {notif.type === 'FILE_SUBMITTED' ? 'File Submitted' : notif.type === 'FILE_APPROVED' ? 'File Approved' : 'File Rejected'}
                            </h4>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                              {new Date(notif.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#475569', lineHeight: '1.4' }}>
                            {notif.message}
                          </p>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {!notif.isRead && (
                              <button 
                                style={{ ...styles.actionBtnTiny, background: indicatorBg, color: indicatorColor }}
                                onClick={() => handleMarkAsRead(notif._id)}
                              >
                                Mark as Read ✓
                              </button>
                            )}
                            <button 
                              style={{ ...styles.actionBtnTiny, background: '#f1f5f9', color: '#64748b' }}
                              onClick={() => handleDeleteNotification(notif._id)}
                            >
                              Delete 🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {isModalOpen && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalContent}>
      <h3>📂 Update: {currentFile?.fileName}</h3>
      <p>නව ලිපිගොනුවක් තෝරන්න (එය ස්වයංක්‍රීයව අනුමැතිය සඳහා යොමු වේ):</p>
      
      <input type="file" onChange={(e) => setNewFile(e.target.files[0])} />
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={handleUpdateSubmit} style={styles.saveBtn}>Upload & Submit</button>
        <button onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
      </div>
    </div>
  </div>
)}

      </main>
    </div>
  );
};

// CSS-IN-JS PROFESSIONAL THEME STYLES
const styles = {
  dashboardContainer: { display: 'flex', width: '100vw', minHeight: '100vh', background: '#f4f6f9', fontFamily: "'Segoe UI', sans-serif", color: '#333' },
  sidebar: { textAlign: 'left',width: '260px', background: '#0f172a', color: '#fff', padding: '30px 20px', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.05)' },
  sidebarBrand: { fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '20px', color: '#3498db' },
  userTag: { fontSize: '15px', margin: '5px 0 0 0', fontWeight: '500' },
  roleBadge: { fontSize: '11px', background: 'rgba(52, 152, 219, 0.2)', color: '#3498db', padding: '3px 10px', borderRadius: '50px', alignSelf: 'flex-start', marginBottom: '30px', fontWeight: 'bold' },
  sidebarNav: { display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 },
  navItem: { padding: '12px 15px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#cbd5e1' },
  navItemLink: { padding: '12px 15px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#cbd5e1', cursor: 'pointer', transition: '0.2s', '&:hover': { background: '#2d3748' } },
  activeNav: { background: '#3498db', color: '#fff', fontWeight: 'bold' },
  logoutBtn: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },

 
  // ... ඔබේ පවතින styles
  actionTd: { display: 'flex', gap: '8px', padding: '10px' },
  viewBtn: { background: '#3498db', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' },
  editBtn: { background: '#f1c40f', color: '#000', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { background: '#e74c3c', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' },

  
  mainContent: { flex: 1, padding: '35px', overflowY: 'auto' },
  topHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '30px' },
  headerRight: { fontSize: '14px', fontWeight: 'bold', color: '#64748b', background: '#e2e8f0', padding: '5px 15px', borderRadius: '20px' },
  
  statsContainer: { display: 'flex', gap: '20px', marginBottom: '30px' },
  statCard: { flex: 1, background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(45, 40, 40, 0.02)' },
  statNumber: { fontSize: '28px', fontWeight: 'bold', marginTop: '10px', color: '#1e293b' },
  
  workspace: { display: 'flex', gap: '25px', alignItems: 'flex-start', flexWrap: 'wrap' },
  tableCard: { flex: '1', minWidth: '500px', background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
  tableHeaderZone: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  shortcutBtn: { background: '#3498db', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  cardDesc: { fontSize: '13px', color: '#64748b', margin: '5px 0 0 0', lineHeight: '1.4' },
  
  tableWrapper: { overflowX: 'auto', marginTop: '15px' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
  thRow: { background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b', height: '40px' },
  trRow: { borderBottom: '1px solid #f1f5f9', height: '50px' },
  boldTd: { fontWeight: 'bold', color: '#1e293b' },
  emptyTd: { textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '15px' },
  catBadge: { background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', color: '#475569' },
  statusBadge: { padding: '4px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' },
  locTd: { fontSize: '13px', fontWeight: '500', color: '#334155' },
  
  searchBar: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '250px', outline: 'none', fontSize: '14px' },
  locationBadge: { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  saveBtn: { background: '#2ecc71', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' },
  cancelBtn: { background: '#95a5a6', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' },

  notificationList: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  notificationItem: { 
    padding: '20px', 
    borderRadius: '12px', 
    border: '1px solid #e2e8f0', 
    transition: '0.2s', 
    display: 'flex',
    alignItems: 'flex-start',
    boxSizing: 'border-box',
    textAlign: 'left'
  },
  notificationIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    flexShrink: 0
  },
  actionBtnTiny: {
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.2s',
    outline: 'none'
  },
  emptyNotification: {
    textAlign: 'center',
    padding: '50px 20px',
    color: '#94a3b8',
    fontSize: '15px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1'
  },
  sidebarBadge: {
    background: '#ef4444',
    color: '#fff',
    borderRadius: '50%',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: 'bold',
    minWidth: '15px',
    textAlign: 'center'
  }
};

export default SubjectOfficerDashboard;
