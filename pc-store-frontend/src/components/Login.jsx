import React, { useState } from 'react';
import axios from 'axios';

// 🎯 App.jsx එකෙන් එන Props නිවැරදිවම මෙතනට ලබා දී ඇත (goToRegister, goToBack)
const Login = ({ onLoginSuccess, goToRegister, goToBack }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      if (response.status === 200) {
        // ලොගින් සාර්ථක නම් Token එක සහ User විස්තර ප්‍රධාන App එකට යැවීම
        onLoginSuccess(response.data.user, response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'ලොග් වීමට නොහැකි වුණා. නැවත උත්සාහ කරන්න.');
    }
  };

  return (
    <div style={styles.container}>
      
      {/* 👈 LEFT SIDE: SIGN IN FORM */}
      <div style={styles.leftSide}>
        <div style={styles.formWrapper}>
          
          {/* 🔙 ආපසු හැරී යාමේ බටන් එක (Go Back to MainHome) */}
          <button onClick={goToBack} style={styles.backBtn}>⬅️ ආපසු පිටුවට</button>

          <h2 style={styles.formTitle}>Sign In 🔑</h2>
          <p style={styles.formSubtitle}>කරුණාකර පද්ධතියට පිවිසීම සඳහා ඔබේ රාජකාරී ගිණුම් විස්තර ඇතුළත් කරන්න.</p>
          
          {error && <div style={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>රාජකාරී ඊමේල් ලිපිනය (Email)</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                style={styles.input} 
                placeholder="username@nw.gov.lk" 
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>මුරපදය (Password)</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                style={styles.input} 
                placeholder="••••••••" 
              />
            </div>

            <button type="submit" style={styles.button}>ආරක්ෂිතව ඇතුල් වන්න</button>
          </form>
          
          {/* 🎯 App.jsx එකට ගැලපෙන සේ onClick={goToRegister} ලෙස නිවැරදි කර ඇත */}
          <p style={styles.footerText}>
            පද්ධතියේ ගිණුමක් නොමැතිද? <span onClick={goToRegister} style={styles.link}>මෙහි ලියාපදිංචි වන්න</span>
          </p>
        </div>
      </div>

      {/* 🔲 VERTICAL DIVIDER LINE */}
      <div style={styles.verticalLine}></div>

      {/* 👉 RIGHT SIDE: LOGO & TOPIC */}
      <div style={styles.rightSide}>
        <div style={styles.logoWrapper}>
          <img 
            src="image\Nwp_sri_lanka.jpg" 
            alt="NWPC Logo" 
            style={styles.logoImg} 
          />
          <h1 style={styles.mainTopic}>NWPC STORES</h1>
          <h3 style={styles.subTopic}>ලිපිගොනු පාලන පද්ධතිය</h3>
          <p style={styles.descText}>වයඹ පළාත් සභාව - North Western Provincial Council</p>
        </div>
      </div>

    </div>
  );
};

// 🎨 PREMIUM STYLES
const styles = {
  container: { 
    display: 'flex', 
    width: '100vw',
    height: '100vh', 
    backgroundColor: '#8b96f3', 
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    overflow: 'hidden'
  },
  leftSide: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', position: 'relative' },
  formWrapper: { width: '100%', maxWidth: '420px' },
  backBtn: {
    background: 'none', border: 'none', color: '#020202', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px', padding: 0
  },
  formTitle: { fontSize: '32px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 10px 0' },
  formSubtitle: { fontSize: '14px', color: '#0a0a0a', margin: '0 0 30px 0', lineHeight: '1.6' },
  form: { display: 'flex', flexDirection: 'column', gap: '22px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' },
  label: { fontSize: '14px', fontWeight: '600', color: '#050505' },
  input: { 
    width: '100%', padding: '14px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', 
    fontSize: '15px', boxSizing: 'border-box', backgroundColor: '#ffffff', outline: 'none',
    color: '#0f172a', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  },
  button: { 
    width: '100%', padding: '14px', backgroundColor: '#3bf931', color: '#fff', border: 'none', 
    borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '15px', 
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
  },
  errorAlert: { 
    backgroundColor: '#fde8e8', color: '#9b1c1c', padding: '14px', borderRadius: '10px', 
    fontSize: '14px', marginBottom: '25px', textAlign: 'left', borderLeft: '4px solid #f05252'
  },
  footerText: { marginTop: '25px', fontSize: '14px', color: '#0a0b0b', textAlign: 'center' },
  link: { color: '#1be632', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' },
  verticalLine: { width: '2px', backgroundColor: '#090909', height: '70%', alignSelf: 'center' },
  rightSide: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' },
  logoWrapper: { textAlign: 'center' },
  logoImg: { width: '130px', height: '130px', objectFit: 'contain', marginBottom: '30px' },
  mainTopic: { fontSize: '40px', fontWeight: '800', color: '#eff1f7', letterSpacing: '1px', margin: '0 0 8px 0' },
  subTopic: { fontSize: '18px', fontWeight: '600', color: '#f8fdfb', margin: '0 0 8px 0', lineHeight: '1.4' },
  descText: { fontSize: '14px', color: '#eef2f6', fontWeight: '500', margin: 0 }
};

export default Login;