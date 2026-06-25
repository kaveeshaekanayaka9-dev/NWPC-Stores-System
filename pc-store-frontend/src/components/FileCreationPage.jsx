import React, { useState } from 'react';
import axios from 'axios';


const FileCreationPage = ({ user, goToDashboard }) => {
  const [adNumber, setAdNumber] = useState('01');
  const [fileNumberInSlot, setFileNumberInSlot] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [fileName, setFileName] = useState('');
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
      console.log("🔥 User Object එකේ තියෙන දත්ත:", JSON.stringify(user, null, 2));
      console.log("📧 සර්වර් එකට යන ඊමේල් එක:", user?.email);

      const generatedFileNumber = `NWP/CS/AD/${adNumber}/${fileNumberInSlot}/${year}`;
      
      const formData = new FormData();
      formData.append('fileNumber', generatedFileNumber);
      formData.append('fileName', fileName);
      formData.append('adNumber', adNumber);
      formData.append('fileNumberInSlot', fileNumberInSlot);
      formData.append('year', year);
      formData.append('description', description);
      formData.append('submittedBy', user.email );
      formData.append('attachedFile', attachedFile); // 👈 Backend Multer එක බලාපොරොත්තු වන නම (Key)

      await axios.post('http://localhost:5000/api/files/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Add Create Audit Log
      try {
        await axios.post('http://localhost:5000/api/audit-logs/add', {
          officerId: user.email,
          action: "CREATED_FILE",
          fileName: fileName,
          timestamp: new Date()
        });
      } catch (logErr) {
        console.error("Audit log failed", logErr);
      }
      
      setMessage(`✅ ලිපිගොනුව (${generatedFileNumber}) සාර්ථකව ඇතුළත් කළා! එය Admin අනුමැතිය සඳහා යොමු කෙරුණි.`);
      
      // Form එක රීසෙට් කිරීම
      setFileNumberInSlot(''); 
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
          
          <label style={styles.label}>AD Number (Slot)</label>
          <select style={styles.select} value={adNumber} onChange={(e) => setAdNumber(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => {
              const num = (i + 1).toString().padStart(2, '0');
              return <option key={num} value={num}>AD/{num}</option>;
            })}
          </select>

          <label style={styles.label}>File Number In Slot (උදා: 102)</label>
          <input type="text" style={styles.input} value={fileNumberInSlot} onChange={(e) => setFileNumberInSlot(e.target.value)} placeholder="e.g., 102" required />

          <label style={styles.label}>Year (වර්ෂය)</label>
          <input type="text" style={styles.input} value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g., 2026" required />

          <label style={styles.label}>Generated File Identity</label>
          <div style={styles.generatedIdBox}>
            NWP/CS/AD/{adNumber}/{fileNumberInSlot || '___'}/{year || '____'}
          </div>

          <label style={styles.label}>File Name (ලිපිගොනුවේ නම)</label>
          <input type="text" style={styles.input} value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="e.g., වාර්ෂික ප්‍රාග්ධන වියදම් වාර්තාව" required />

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
  alertBox: { padding: '15px', background: '#e6f4ea', color: '#137333', borderRadius: '8px', fontSize: '14px', fontWeight: '500', marginBottom: '20px' },
  generatedIdBox: { padding: '12px', background: '#f0fdf4', border: '1px dashed #22c55e', borderRadius: '8px', color: '#166534', fontWeight: 'bold', fontSize: '15px', textAlign: 'center', letterSpacing: '1px' }
};

export default FileCreationPage;