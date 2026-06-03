import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

// Officer ලැයිස්තුව ලබාගැනීමට useEffect එකක්
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

   // Add these to your SubjectOfficerDashboard component
const handleView = (file) => {
  if (file.fileUrl) {
    window.open(`http://localhost:5000${file.fileUrl}`, '_blank');
  } else {
    alert("සමාවන්න, මෙම ලිපිගොනුවට අදාළ PDF එකක් නොමැත.");
  }
};

// 1. Modal එක විවෘත කිරීමට
const handleEditClick = (file) => {
    setCurrentFile(file);
    setIsModalOpen(true);
  };

// 2. අලුත් ෆයිල් එක සහ status එක යාවත්කාලීන කිරීමට
const handleUpdateSubmit = async () => {
  if (!currentFile?._id) {
    alert("Please select a file to update.");
    return;
  }

  if (!newFile) {
    alert("කරුණාකර නව ලිපිගොනුව තෝරන්න.");
    return;
  }

  const formData = new FormData();
  formData.append('file', newFile); // අලුත් ෆයිල් එක
  formData.append('isVerified', 'PENDING'); // status එක PENDING කරයි

  try {
    await axios.put(`http://localhost:5000/api/files/update/${currentFile._id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    alert("✅ ලිපිගොනුව සහ අනුමැතිය නැවත යොමු කරන ලදී.");
    setIsModalOpen(false); // Modal එක වසන්න
    setNewFile(null); // පරණ දත්ත Reset කරන්න
    fetchMyFiles(); // ලැයිස්තුව Refresh කරන්න
  } catch (err) {
    console.error(err);
    alert("❌ යාවත්කාලීන කිරීම අසාර්ථකයි.");
  }
};

const handleDelete = async (fileId) => {
  if (window.confirm("මෙම ලිපිගොනුව මකා දැමීමට අවශ්‍යද?")) {
    try {
      await axios.delete(`http://localhost:5000/api/files/${fileId}`);
      // Refresh the list after delete
      fetchMyFiles(); 
    } catch (err) {
      alert("ලිපිගොනුව මැකීමේදී දෝෂයක් සිදු විය.");
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

          <div style={styles.navItem}>⏳ Transaction History</div>
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
                    <p style={styles.cardDesc}>ඔබ ඇතුළත් කළ ලිපිගොනු වල වත්මන් තත්ත්වය සහ ඒවා වෙන් කර ඇති රාක්ක ස්ථාන.</p>
                  </div>
                  <button style={styles.shortcutBtn} onClick={goToFileCreation}>➕ Create New File</button>
                </div>
                
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                   <thead>
  <tr style={styles.thRow}><th>File No</th><th>File Name</th><th>Category</th><th>Approval Status</th><th>Rack Location</th><th>Actions</th></tr>
</thead>
                    <tbody>
                      {myFiles.length === 0 ? (
                        <tr><td colSpan="5" style={styles.emptyTd}>🗂️ ඔබ විසින් මෙතෙක් කිසිදු ලිපිගොනුවක් පද්ධතියට ඇතුළත් කර නොමැත.</td></tr>
                      ) : (
                        myFiles.map((file, idx) => (
                          <tr key={idx} style={styles.trRow}>
                            <td style={styles.boldTd}>{file.fileNumber}</td>
                            <td>{file.fileName}</td>
                            <td><span style={styles.catBadge}>{file.category}</span></td>
                            <td>
                              <span style={{
                                ...styles.statusBadge,
                                background: file.isVerified === 'VERIFIED' ? '#e8f5e9' : file.isVerified === 'PENDING' ? '#fffde7' : '#ffebee',
                                color: file.isVerified === 'VERIFIED' ? '#2e7d32' : file.isVerified === 'PENDING' ? '#f57f17' : '#c62828'
                              }}>
                                {file.isVerified}
                              </span>
                            </td>
                            <td style={styles.locTd}>
                              {file.rackNumber === 'Unassigned' || !file.rackNumber ? '⏳ රඳවා ඇත' : `🗄️ ${file.rackNumber} - ${file.shelfNumber}`}
                            </td>
                            <td style={styles.actionTd}>
        <button style={styles.viewBtn} onClick={() => handleView(file)}>👁️</button> 
        {/* පරණ බොත්තම: <button style={styles.editBtn} onClick={() => handleEdit(file)}>✏️</button> */}

{/* අලුත් කළ යුතු බොත්තම: */}
<button 
  style={styles.editBtn} 
  onClick={() => handleEditClick(file)} 
>
  ✏️
</button>
        <button style={styles.deleteBtn} onClick={() => handleDelete(file._id)}>🗑️</button>
      </td>
                          </tr>
                        ))
                      )}
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
  sidebar: { width: '260px', background: '#1e293b', color: '#fff', padding: '30px 20px', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.05)' },
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
  statCard: { flex: 1, background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
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
  cancelBtn: { background: '#95a5a6', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }
};

export default SubjectOfficerDashboard;
