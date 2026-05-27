import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ switchToLogin }) => {
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
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <h2 style={styles.title}>NWPC</h2>
          <p style={styles.subtitle}>නිලධාරී ලියාපදිංචි කිරීමේ පුවරුව</p>
        </div>

        {message && (
          <div style={{ ...styles.alert, backgroundColor: isSuccess ? '#def7ec' : '#fde8e8', color: isSuccess ? '#03543f' : '#9b1c1c', borderLeft: `4px solid ${isSuccess ? '#31c48d' : '#f05252'}` }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>සම්පූර්ණ නම (Full Name)</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={styles.input} placeholder="උදා: එස්. එන්. පෙරේරා" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>රාජකාරී ඊමේල් ලිපිනය</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={styles.input} placeholder="username@nw.gov.lk" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>නව මුරපදය (Password)</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={styles.input} placeholder="••••••••" />
          </div>
          <button type="submit" style={styles.button}>📝 ගිණුම නිර්මාණය කරන්න</button>
        </form>

        <p style={styles.footerText}>
          දැනටමත් ගිණුමක් තිබේද? <span onClick={switchToLogin} style={styles.link}>මෙහි ලොග් වන්න</span>
        </p>
      </div>
    </div>
  );
};

// (Login එකේ තියෙන Styles ම මේකටත් සමාන වේ)
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh', backgroundColor: '#f4f6f9' },
  card: { backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' },
  logoArea: { marginBottom: '25px' },
  title: { margin: 0, color: '#007bff', fontSize: '32px', fontWeight: '800' },
  subtitle: { margin: '5px 0 0 0', color: '#666', fontSize: '13px' },
  inputGroup: { marginBottom: '18px', textAlign: 'left' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#333' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px', boxSizing: 'border-box', backgroundColor: '#f8fafc' },
  button: { width: '100%', padding: '14px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', boxShadow: '0 4px 12px rgba(40,167,69,0.2)' },
  alert: { padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', textAlign: 'left' },
  footerText: { marginTop: '25px', fontSize: '14px', color: '#666' },
  link: { color: '#007bff', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }
};

export default Register;