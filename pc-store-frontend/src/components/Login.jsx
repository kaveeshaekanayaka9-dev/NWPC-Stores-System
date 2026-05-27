import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess, switchToRegister }) => {
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
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <h2 style={styles.title}>NWPC</h2>
          <p style={styles.subtitle}>ලිපිගොනු පාලන පද්ධතිය | වයඹ පළාත් සභාව</p>
        </div>
        
        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>රාජකාරී ඊමේල් ලිපිනය (Email)</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={styles.input} placeholder="username@nw.gov.lk" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>මුරපදය (Password)</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={styles.input} placeholder="••••••••" />
          </div>
          <button type="submit" style={styles.button}>🔑 ආරක්ෂිතව ඇතුල් වන්න</button>
        </form>

        <p style={styles.footerText}>
          පද්ධතියේ ගිණුමක් නොමැතිද? <span onClick={switchToRegister} style={styles.link}>මෙහි ලියාපදිංචි වන්න</span>
        </p>
      </div>
    </div>
  );
};

// 🎨 MODERN MINIMALIST STYLES
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh', backgroundColor: '#f4f6f9' },
  card: { backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' },
  logoArea: { marginBottom: '30px' },
  title: { margin: 0, color: '#007bff', fontSize: '32px', fontWeight: '800', letterSpacing: '1px' },
  subtitle: { margin: '5px 0 0 0', color: '#666', fontSize: '13px', fontWeight: '500' },
  inputGroup: { marginBottom: '20px', textAlign: 'left' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#333' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px', boxSizing: 'border-box', transition: '0.3s', backgroundColor: '#f8fafc' },
  button: { width: '100%', padding: '14px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', boxShadow: '0 4px 12px rgba(0,123,255,0.2)' },
  errorAlert: { backgroundColor: '#fde8e8', color: '#9b1c1c', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', textAlign: 'left', borderLeft: '4px solid #f05252' },
  footerText: { marginTop: '25px', fontSize: '14px', color: '#666' },
  link: { color: '#007bff', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }
};

export default Login;