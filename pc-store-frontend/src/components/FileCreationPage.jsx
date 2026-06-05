import React, { useState } from 'react';
import axios from 'axios';


const FileCreationPage = ({ user, goToDashboard }) => {
  const [fileNumber, setFileNumber] = useState('');
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [attachedFile, setAttachedFile] = useState(null); // 👈 1. ෆයිල් එක තබා ගැනීමට State එකක්
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // 👈 අප්ලෝඩ් වෙනකම් බටන් එක ඩිසේබල් කරන්න

  const handleSubmitFile = async (e) => { 
    e.preventDefault();
    
    // ෆයිල් එකක් සිලෙක්ට් කරලා නැත්නම් නවත්වනවා
    if (!attachedFile) {
      setMessage('❌ කරුණාකර ලැප්ටොප් එකෙන් හෝ ෆෝන් එකෙන් අදාළ ලේඛනය (File) තෝරන්න.');
      return;
    }

    setLoading(true);
    try {
      // ⚠️ 2. ෆයිල් අප්ලෝඩ් කිරීමේදී JSON වෙනුවට අනිවාර්යයෙන්ම FormData පාවිච්චි කළ යුතුයි
      console.log("🔥 User Object එකේ තියෙන දත්ත:", JSON.stringify(user, null, 2));
    console.log("📧 සර්වර් එකට යන ඊමේල් එක:", user?.email);


      
      const formData = new FormData();
      formData.append('fileNumber', fileNumber);
      formData.append('fileName', fileName);
      formData.append('category', category);
      formData.append('description', description);
      // user?.email වෙනුවට user?.id ලෙස මාරු කරන්න
      formData.append('submittedBy', user.email );
      formData.append('attachedFile', attachedFile); // 👈 Backend Multer එක බලාපොරොත්තු වන නම (Key)

      // Axios හරහා Multipart දත්ත සර්වර් එකට යැවීම
      await axios.post('http://localhost:5000/api/files/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage('✅ ලිපිගොනුව සහ ඇමුණුම සාර්ථකව ඇතුළත් කළා! එය Admin අනුමැතිය සඳහා යොමු කෙරුණි.');
      
      // Form එක රීසෙට් කිරීම
      setFileNumber(''); 
      setFileName(''); 
      setDescription(''); 
      setAttachedFile(null);
      
      // File Input එක රීසෙට් කිරීමට (UI)
      document.getElementById('fileInputElement').value = '';
    } catch (err) {
      setMessage('❌ ඇතුළත් කිරීම අසාර්ථකයි: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        {/* Back Button */}
        <button onClick={goToDashboard} style={styles.backBtn}>← Back to Dashboard</button>
        
        <h2 style={styles.title}>📂 New Digital File Creation</h2>
        <p style={styles.desc}>පළාත් සභා ගබඩා පද්ධතියට අලුත් ලිපිගොනුවක් ඇතුළත් කර සත්‍යාපන පෝලිමට යොමු කරන්න.</p>
        
        {message && <div style={styles.alertBox}>{message}</div>}

        <form onSubmit={handleSubmitFile} style={styles.form}>
          <label style={styles.label}>File Number (ලිපිගොනු අංකය)</label>
          <input type="text" style={styles.input} value={fileNumber} onChange={(e) => setFileNumber(e.target.value)} placeholder="e.g., NWPC/GEN/2026/102" required />

          <label style={styles.label}>File Name (ලිපිගොනුවේ නම)</label>
          <input type="text" style={styles.input} value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="e.g., වාර්ෂික ප්‍රාග්ධන වියදම් වාර්තාව" required />

          <label style={styles.label}>Category (ප්‍රවර්ගය)</label>
          <select style={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="General">General (පොදු)</option>
            <option value="Finance">Finance (මුදල්)</option>
            <option value="Inventory">Inventory (ගබඩා ලේඛන)</option>
            <option value="Legal">Legal (නීතිමය)</option>
          </select>

          {/* 📥 3. මෙන්න අලුතින් එකතු කළ CHOOSE FILE INPUT එක */}
          <label style={styles.label}>Upload Document (ලේඛනය අප්ලෝඩ් කරන්න - PDF / Images)</label>
          <input 
            id="fileInputElement"
            type="file" 
            accept=".pdf, image/*" // PDF සහ පින්තූර පමණක් තේරීමට
            style={styles.fileInput} 
            onChange={(e) => setAttachedFile(e.target.files[0])} // තෝරාගත් ෆයිල් එක State එකට දමයි
            required 
          />

          <label style={styles.label}>Description (විස්තරය)</label>
          <textarea style={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ලිපිගොනුව පිළිබඳ කෙටි විස්තරයක් ඇතුළත් කරන්න..." rows="4"></textarea>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'ගොනුව අප්ලෝඩ් වෙමින් පවතී... ⏳' : 'සුරැකීමේ පද්ධතියට ඇතුළත් කරන්න 💾'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', minHeight: '100vh', background: '#f4f6f9', padding: '20px', fontFamily: "'Segoe UI', sans-serif" },
  formCard: { width: '100%', maxWidth: '600px', background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
  backBtn: { background: 'transparent', border: 'none', color: '#3498db', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px', padding: 0 },
  title: { margin: '0 0 10px 0', color: '#1e293b', fontSize: '24px' },
  desc: { color: '#64748b', fontSize: '14px', marginBottom: '25px', lineHeight: '1.5' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' },
  select: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff', outline: 'none' },
  fileInput: { padding: '12px', borderRadius: '8px', border: '2px dashed #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontSize: '14px' }, // 👈 File Input Style එක
  textarea: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'none', outline: 'none' },
  submitBtn: { background: '#10b981', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', marginTop: '10px', transition: '0.2s' },
  alertBox: { padding: '15px', background: '#e6f4ea', color: '#137333', borderRadius: '8px', fontSize: '14px', fontWeight: '500', marginBottom: '20px' }
};

export default FileCreationPage;