import React, { useState } from 'react';
import axios from 'axios';

// 🎯 App.jsx එකෙන් එන goToLogin ප්‍රොප් එක නිවැරදිව මෙතනට සම්බන්ධ කර ඇත
const Register = ({ goToLogin }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      if (response.status === 201) {
        setMessage(response.data.message);
        setIsSuccess(true);
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'ලියාපදිංචි වීමට නොහැකි වුණා.');
      setIsSuccess(false);
    }
  };

  return (
    <div style={styles.container}>
      
      {/* 👈 LEFT SIDE: LOGO & TOPIC (Login එකට ගැලපෙන සේ) */}
      <div style={styles.leftSide}>
        <div style={styles.logoWrapper}>
          <img 
            src="image\Nwp_sri_lanka.jpg" 
            alt="NWPC Logo" 
            style={styles.logoImg} 
          />
          <h1 style={styles.mainTopic}>NWPC STORES</h1>
          <h3 style={styles.subTopic}>නිලධාරී ලියාපදිංචි කිරීමේ පුවරුව</h3>
          <p style={styles.descText}>වයඹ පළාත් සභා ලිපිගොනු පාලන මධ්‍යම පද්ධතිය</p>
        </div>
      </div>

      {/* 🔲 VERTICAL DIVIDER LINE (මැදින් වෙන් කරන කෙලින් ඉර) */}
      <div style={styles.verticalLine}></div>

      {/* 👉 RIGHT SIDE: REGISTER FORM (දකුණු පැත්තට මාරු කර ඇත) */}
      <div style={styles.rightSide}>
        <div style={styles.formWrapper}>
          <h2 style={styles.formTitle}>Create Account 📝</h2>
          <p style={styles.formSubtitle}>පද්ධතියට ඇතුළත් වීම සඳහා ඔබේ තොරතුරු ඇතුළත් කර ගිණුමක් සාදාගන්න.</p>
          
          {/* සාර්ථක/අසාර්ථක පණිවිඩ පෙන්වන කොටස */}
          {message && (
            <div style={{ 
              ...styles.alert, 
              backgroundColor: isSuccess ? '#def7ec' : '#fde8e8', 
              color: isSuccess ? '#03543f' : '#9b1c1c', 
              borderLeft: `4px solid ${isSuccess ? '#31c48d' : '#f05252'}` 
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>සම්පූර්ණ නම (Full Name)</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                style={styles.input} 
                placeholder="උදා: එස්. එන්. පෙරේරා" 
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>රාජකාරී ඊමේල් ලිපිනය</label>
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
              <label style={styles.label}>නව මුරපදය (Password)</label>
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

            <button type="submit" style={styles.button}>ගිණුම නිර්මාණය කරන්න</button>
          </form>
          
          {/* 🎯 App.jsx එකට ගැලපෙන සේ onClick={goToLogin} ලෙස නිවැරදි කර ඇත */}
          <p style={styles.footerText}>
            දැනටමත් ගිණුමක් තිබේද? <span onClick={goToLogin} style={styles.link}>මෙහි ලොග් වන්න</span>
          </p>
        </div>
      </div>

    </div>
  );
};

// 🎨 REGISTER PAGE SPLIT LIGHT BLUE STYLES
const styles = {
  container: { 
    display: 'flex', 
    width: '100vw',
    height: '100vh', 
    backgroundColor: '#8b96f3', // Login එකේ වගේම ලා නිල් පසුබිම
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    overflow: 'hidden'
  },
  
  // LEFT SIDE (LOGO AREA)
  leftSide: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' },
  logoWrapper: { textAlign: 'center' },
  logoImg: { width: '130px', height: '130px', objectFit: 'contain', marginBottom: '30px' },
  mainTopic: { fontSize: '40px', fontWeight: '800', color: '#f2f5fa', letterSpacing: '1px', margin: '0 0 8px 0' },
  subTopic: { fontSize: '18px', fontWeight: '600', color: '#f3ebeb', margin: '0 0 8px 0', lineHeight: '1.4' },
  descText: { fontSize: '14px', color: '#efeaea', fontWeight: '500', margin: 0 },

  // VERTICAL DIVIDER LINE
  verticalLine: { width: '2px', backgroundColor: '#cbd5e1', height: '70%', alignSelf: 'center' },

  // RIGHT SIDE (FORM AREA)
  rightSide: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' },
  formWrapper: { width: '100%', maxWidth: '420px' },
  formTitle: { fontSize: '32px', fontWeight: 'bold', color: '#0c0c0c', margin: '0 0 10px 0' },
  formSubtitle: { fontSize: '14px', color: '#07070a', margin: '0 0 30px 0', lineHeight: '1.6' },
  form: { display: 'flex', flexDirection: 'column', gap: '22px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' },
  label: { fontSize: '14px', fontWeight: '600', color: '#060606' },
  input: { 
    width: '100%', padding: '14px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', 
    fontSize: '15px', boxSizing: 'border-box', backgroundColor: '#ffffff', outline: 'none',
    color: '#0f172a', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  },
  button: { 
    width: '100%', padding: '14px', backgroundColor: '#42ec28', color: '#fff', border: 'none', 
    borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '15px', 
    boxShadow: '0 4px 12px rgba(6, 6, 6, 0.2)'
  },
  alert: { padding: '14px', borderRadius: '10px', fontSize: '14px', marginBottom: '25px', textAlign: 'left' },
  footerText: { marginTop: '25px', fontSize: '14px', color: '#0c0c0c', textAlign: 'center' },
  link: { color: '#17e721', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }
};

export default Register;