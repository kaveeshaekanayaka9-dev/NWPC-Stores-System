import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
      const res = await axios.put(`http://localhost:5000/api/auth/approve-user/${id}`);
      
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

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>👑 NWPC ADMIN</div>
        <p style={styles.adminName}>👤 {user?.name || 'System Admin'}</p>
        <span style={styles.badge}>Control Center</span>

        <nav style={styles.nav}>
          <div style={{ ...styles.navItem, ...(activeTab === 'USERS' && styles.activeNav) }} onClick={() => setActiveTab('USERS')}>🛡️ User Management</div>
          <div style={{ ...styles.navItem, ...(activeTab === 'QUEUE' && styles.activeNav) }} onClick={() => setActiveTab('QUEUE')}>⏳ Verification Queue</div>
          
          {/* 🗄️ මෙන්න අලුතින් දාපු ටැබ් එක */}
          <div style={{ ...styles.navItem, ...(activeTab === 'VERIFIED_LIST' && styles.activeNav) }} onClick={() => setActiveTab('VERIFIED_LIST')}>🗄️ Managed Rack Inventory</div>
          
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
        )}

        {/* 2. VERIFICATION QUEUE */}
        {activeTab === 'QUEUE' && (
          <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
            <div style={{ ...styles.card, flex: 2, minWidth: '500px' }}>
              <h3>⏳ Verification Queue</h3>
              <p style={styles.desc}>සබ්ජෙක්ට් ඔෆිසර්ලා ඇතුළත් කළ ලිපිගොනු නිවැරදිදැයි බලා ඒවා භෞතිකව තැන්පත් කරන ස්ථාන වෙන් කරන්න.</p>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th>File No</th>
                    <th>File Name</th>
                    <th>Category</th>
                    <th>Officer Email</th>
                    <th>View Document</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingFiles.length === 0 ? (
                    <tr><td colSpan="6" style={styles.emptyTd}>✅ සත්‍යාපනය කිරීමට ලිපිගොනු කිසිවක් පෝලිමේ නොමැත.</td></tr>
                  ) : (
                    pendingFiles.map(f => (
                      <tr key={f._id} style={styles.trRow}>
                        <td style={styles.boldTd}>{f.fileNumber}</td>
                        <td>{f.fileName}</td>
                        <td><span style={styles.catBadge}>{f.category}</span></td>
                        
                        <td style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>
  {(() => {
    // 1. දත්තයක් නැත්නම්, null නම් හෝ "undefined" කියා String එකක් ලෙස ඇත්නම්
    if (!f.submittedBy || f.submittedBy === 'undefined') {
      return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>⚠️ Not Available</span>;
    }
    
    // 2. 📧 ඩේටාබේස් එකේ කෙලින්ම Email එකක්ම සේව් වී ඇත්නම් (@ ලකුණ තිබේ නම්)
    if (f.submittedBy.includes('@')) {
      return <span>{f.submittedBy}</span>;
    }
    
    // 3. 🎯 ඔයාගේ අලුත් ID එක ආවොත් (D.D.S.Kumara මහතාගේ ID එක)
    if (f.submittedBy === '6a1023aa78bf292b93e74773') {
      return <span style={{ color: '#0f766e', fontWeight: 'bold' }}>kumara@gmail.com (D.D.S.Kumara)</span>;
    }
    
    // 4. වෙනත් ඕනෑම ID එකක් ආවොත් පෙන්වන ක්‍රමය (Fallback)
    return <span style={{ color: '#64748b', fontSize: '11px' }}>🆔 ID: {f.submittedBy.substring(0, 8)}...</span>;
  })()}
</td>

                        
                        <td>
                          {f.fileUrl ? (
                            <a href={`http://localhost:5000${f.fileUrl}`} target="_blank" rel="noopener noreferrer" style={styles.viewFileLink}>Open File 👁️</a>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>No File</span>
                          )}
                        </td>
                        <td>
                          <button 
                            style={{
                              ...styles.selectBtn, 
                              background: selectedFileId === f._id ? '#10b981' : '#3b82f6',
                              marginRight: '6px'
                            }} 
                            onClick={() => {
                              setSelectedFileId(f._id);
                              setRackNumber('');
                              setShelfNumber('');
                            }}
                          >
                            {selectedFileId === f._id ? 'Selected 🎯' : 'Select 🗄️'}
                          </button>
                          <button style={styles.rejectBtn} onClick={() => handleRejectFile(f._id)}>Reject ✕</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* RACK ASSIGNMENT BOX */}
            <div style={{ ...styles.card, flex: 1, minWidth: '280px', background: selectedFileId ? '#fff' : '#f8fafc' }}>
              <h3>🗄️ Rack Assignment</h3>
              <p style={styles.desc}>තෝරාගත් ලිපිගොනුව ගබඩා කරන භෞතික Rack සහ Shelf අංක ලබාදෙන්න.</p>
              {selectedFileId ? (
                <form onSubmit={handleAssignRack} style={styles.form}>
                  <div style={{ fontSize: '12px', background: '#eff6ff', padding: '8px', borderRadius: '6px', color: '#1e40af', fontWeight: '600' }}>
                    පෙළගැස්ම ID: {selectedFileId}
                  </div>
                  <label style={styles.label}>Rack Number (රාක්ක අංකය)</label>
                  <input type="text" style={styles.input} placeholder="e.g., Rack 01" value={rackNumber} onChange={(e) => setRackNumber(e.target.value)} required />
                  
                  <label style={styles.label}>Shelf Number (තට්ටු අංකය)</label>
                  <input type="text" style={styles.input} placeholder="e.g., Shelf 03" value={shelfNumber} onChange={(e) => setShelfNumber(e.target.value)} required />
                  
                  <button type="submit" style={styles.submitBtn}>Verify & Confirm Mapping 🚀</button>
                </form>
              ) : (
                <div style={styles.placeholderText}>කරුණාකර වම්පස වගුවෙන් ලිපිගොනුවක් තෝරන්න.</div>
              )}
            </div>
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
              
              {/* 🔍 සර්ච් බාර් එක */}
              <input 
                type="text" 
                placeholder="🔍 Search File No, Name or Rack..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchBar}
              />
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
                      <td style={{ fontSize: '13px', color: '#64748b' }}>{f.submittedBy ? (typeof f.submittedBy === 'object' ? f.submittedBy.name : f.submittedBy) : 'System User'}</td>
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

        {/* 4. SYSTEM-WIDE AUDIT */}
        {activeTab === 'AUDIT' && (
          <div style={styles.card}>
            <h3>📊 System-Wide Audit & Inventory Reports</h3>
            <p style={styles.desc}>ගබඩාව තුළ ඇති සියලුම ලිපිගොනු (Pending, Verified, Rejected) පිළිබඳ සමස්ත වාර්තාව.</p>
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
  sidebar: { width: '260px', background: '#0f172a', color: '#fff', padding: '30px 20px', display: 'flex', flexDirection: 'column' },
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
  
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' },
  thRow: { background: '#f1f5f9', color: '#475569', borderBottom: '2px solid #e2e8f0' },
  trRow: { borderBottom: '1px solid #f1f5f9', height: '50px' },
  boldTd: { fontWeight: 'bold', color: '#0f172a' },
  emptyTd: { textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '15px' },
  
  roleBadge: { background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  catBadge: { background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' },
  statusBadge: { padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 'bold' },
  
  // 🏢 අලුත් Location Badge එකකට Styles
  locationBadge: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' },
  // 🔍 සර්ච් බාර් එකේ ස්ටයිල්
  searchBar: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '250px', outline: 'none', fontSize: '14px' },
  
  approveBtn: { background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', marginRight: '8px', cursor: 'pointer', fontWeight: '600' },
  rejectBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  selectBtn: { color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: '0.2s' },
  
  viewFileLink: { color: '#3b82f6', textDecoration: 'underline', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { fontSize: '13px', fontWeight: '500' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' },
  submitBtn: { background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  placeholderText: { textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '40px 0' }
};

export default AdminDashboard;