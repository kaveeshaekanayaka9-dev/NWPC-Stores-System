import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GraphicalRack = () => {
  // States මඟින් දත්ත පාලනය කිරීම
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Form එකේ දත්ත සටහන් කරගන්නා State එක
  const [formData, setFormData] = useState({
    fileNumber: '',
    fileName: '',
    category: '',
    description: ''
  });

  // 1. Backend Server එකෙන් දැනට ඩේටාබේස් එකේ තියෙන ඔක්කොම ෆයිල්ස් ටික ලෝඩ් කරගැනීම (GET)
  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/files/all');
      setFiles(response.data);
    } catch (error) {
      console.error("❌ Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // 2. Form එකට Type කරද්දී දත්ත වෙනස් වීම පාලනය කිරීම
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. අලුත් ෆයිල් එකක් සේව් කිරීම (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fileNumber || !formData.fileName || !formData.category) {
      alert("කරුණාකර අනිවාර්යය විස්තර ටික ඇතුලත් කරන්න!");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/files/add', formData);
      if (response.status === 201) {
        alert("🎉 ෆයිල් එක සාර්ථකව ඩේටාබේස් එකට ඇතුලත් කළා!");
        // Form එක හිස් කිරීම
        setFormData({ fileNumber: '', fileName: '', category: '', description: '' });
        // ලිස්ට් එක අලුත් කිරීම
        fetchFiles();
      }
    } catch (error) {
      console.error("❌ Error saving file:", error);
      alert("ෆයිල් එක සේව් කිරීමට නොහැකි වුණා. Backend Server එක පරීක්ෂා කරන්න.");
    }
  };

  // 4. Search සහ Filter Logic එක ක්‍රියාත්මක කිරීම
  const filteredFiles = files.filter(file => {
    const matchesSearch = 
      file.fileNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || file.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      
      {/* 📊 TOP STATS CARDS */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '5px solid #007bff' }}>
          <h4 style={{ margin: 0, color: '#666' }}>මුළු ෆයිල් ප්‍රමාණය</h4>
          <h2 style={{ margin: '10px 0 0 0', color: '#333' }}>{files.length}</h2>
        </div>
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '5px solid #28a745' }}>
          <h4 style={{ margin: 0, color: '#666' }}>දැනට ස්ටෝර් එකේ ඇති ෆයිල්ස්</h4>
          <h2 style={{ margin: '10px 0 0 0', color: '#28a745' }}>{files.filter(f => f.status === 'AVAILABLE').length}</h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        
        {/* 📝 LEFT: NEW FILE INSERT FORM */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, color: '#007bff', borderBottom: '2px solid #f4f6f9', paddingBottom: '10px' }}>🆕 අලුත් ෆයිල් එකක් ඇතුලත් කිරීම</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ෆයිල් අංකය (File Number) *</label>
              <input type="text" name="fileNumber" value={formData.fileNumber} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="උදා: PC/2026/FIN/01" />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ෆයිල් එකේ නම (File Name) *</label>
              <input type="text" name="fileName" value={formData.fileName} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="උදා: වැටුප් වර්ධක වාර්තා" />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>විෂය පථය (Category) *</label>
              <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="">තෝරන්න...</option>
                <option value="Finance">මුදල් (Finance)</option>
                <option value="Administration">පරිපාලන (Administration)</option>
                <option value="Establishment">ආයතන (Establishment)</option>
                <option value="Legal">නීතිමය (Legal)</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>වෙනත් විස්තර (Description)</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', height: '8px' }} placeholder="ෆයිල් එක පිළිබඳ කෙටි විස්තරයක්..."></textarea>
            </div>

            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>📁 සුරකින්න (Save File)</button>
          </form>
        </div>

        {/* 🔍 RIGHT: SEARCH & RACK VIEW */}
        <div style={{ flex: 2, backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>🔍 ඉක්මන් සෙවුම සහ භෞතික පිහිටීම</h3>
          
          {/* SEARCH FILTERS */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <input type="text" placeholder="ෆයිල් අංකයෙන් හෝ නමෙන් සොයන්න..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 2, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="All">සියලුම අංශ</option>
              <option value="Finance">Finance</option>
              <option value="Administration">Administration</option>
              <option value="Establishment">Establishment</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          {/* 🗄️ GRAPHICAL FILE GRID (RACK REPRESENTATION) */}
          <h4 style={{ color: '#555' }}>📦 සෙවුමට අනුව ලැබුණු ෆයිල්ස් ({filteredFiles.length}):</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '2px dashed #ddd', minHeight: '200px' }}>
            {filteredFiles.length === 0 ? (
              <p style={{ color: '#999', gridColumn: '1/-1', textAlign: 'center', marginTop: '80px' }}>දත්ත කිසිවක් හමු නොවීය.</p>
            ) : (
              filteredFiles.map((file) => (
                <div key={file._id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderTop: `4px solid ${file.category === 'Finance' ? '#e11d48' : file.category === 'Administration' ? '#2563eb' : '#16a34a'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>{file.category}</span>
                    <h4 style={{ margin: '5px 0', color: '#333', fontSize: '15px' }}>{file.fileNumber}</h4>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>{file.fileName}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px' }}>
                    <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '12px', backgroundColor: file.status === 'AVAILABLE' ? '#d4edda' : '#f8d7da', color: file.status === 'AVAILABLE' ? '#155724' : '#721c24', fontWeight: 'bold' }}>
                      {file.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default GraphicalRack;