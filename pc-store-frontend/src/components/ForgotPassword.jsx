import { useState } from 'react';
import axios from 'axios';

const ForgotPassword = ({ goToLogin }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage('✅ ' + res.data.message);
            setIsError(false);
            setStep(2);
        } catch (err) {
            setIsError(true);
            setMessage('❌ ' + (err.response?.data?.message || 'OTP කේතය යැවීම අසාර්ථක විය.'));
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (password !== confirmPassword) {
            setIsError(true);
            setMessage('❌ මුරපද ගැලපෙන්නේ නැත.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/reset-password-otp', {
                email,
                otpCode,
                newPassword: password
            });
            setMessage('✅ ' + res.data.message);
            setIsError(false);
            setTimeout(() => {
                goToLogin();
            }, 2000);
        } catch (err) {
            setIsError(true);
            setMessage('❌ ' + (err.response?.data?.message || 'මුරපදය වෙනස් කිරීම අසාර්ථක විය.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formCard}>
                <button onClick={goToLogin} style={styles.backBtn}>← Back to Login</button>
                
                <h2 style={styles.title}>Reset Password (OTP) 🔑</h2>
                <p style={styles.desc}>
                    {step === 1 
                        ? "ඔබගේ ඊමේල් ලිපිනය ඇතුළත් කර OTP කේතය ලබාගන්න."
                        : "ඔබගේ ඊමේල් ලිපිනයට ලැබුණු 6-Digit OTP කේතය සහ නව මුරපදය ඇතුළත් කරන්න."}
                </p>

                {message && (
                    <div style={{
                        ...styles.alertBox,
                        background: isError ? '#fde8e8' : '#e6f4ea',
                        color: isError ? '#9b1c1c' : '#137333',
                        borderLeft: isError ? '4px solid #f05252' : '4px solid #10b981'
                    }}>
                        {message}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} style={styles.form}>
                        <label style={styles.label}>රාජකාරී ඊමේල් ලිපිනය (Email)</label>
                        <input 
                            type="email" 
                            style={styles.input} 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="username@nw.gov.lk" 
                            required 
                        />
                        <button type="submit" disabled={loading} style={styles.submitBtn}>
                            {loading ? 'කේතය යැවෙමින් පවතී... ⏳' : 'OTP කේතය එවන්න 📨'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} style={styles.form}>
                        <label style={styles.label}>රාජකාරී ඊමේල් ලිපිනය (Email)</label>
                        <input 
                            type="email" 
                            style={{ ...styles.input, backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} 
                            value={email} 
                            readOnly 
                        />

                        <label style={styles.label}>OTP සත්‍යාපන කේතය (OTP Code)</label>
                        <input 
                            type="text" 
                            style={styles.input} 
                            value={otpCode} 
                            onChange={(e) => setOtpCode(e.target.value)} 
                            placeholder="6-Digit OTP" 
                            maxLength={6}
                            required 
                        />

                        <label style={styles.label}>නව මුරපදය (New Password)</label>
                        <input 
                            type="password" 
                            style={styles.input} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="••••••••" 
                            required 
                        />

                        <label style={styles.label}>නව මුරපදය තහවුරු කරන්න (Confirm Password)</label>
                        <input 
                            type="password" 
                            style={styles.input} 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            placeholder="••••••••" 
                            required 
                        />

                        <button type="submit" disabled={loading} style={{ ...styles.submitBtn, backgroundColor: '#10b981' }}>
                            {loading ? 'මුරපදය යාවත්කාලීන වෙමින් පවතී... ⏳' : 'මුරපදය යාවත්කාලීන කරන්න 💾'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', minHeight: '100vh', background: '#8b96f3', padding: '20px', fontFamily: "'Segoe UI', sans-serif" },
    formCard: { width: '100%', maxWidth: '450px', background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
    backBtn: { background: 'transparent', border: 'none', color: '#2563eb', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px', padding: 0, alignSelf: 'flex-start', display: 'flex' },
    title: { margin: '0 0 10px 0', color: '#1e293b', fontSize: '24px', textAlign: 'left', fontWeight: 'bold' },
    desc: { color: '#64748b', fontSize: '14px', marginBottom: '25px', lineHeight: '1.5', textAlign: 'left' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' },
    label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
    input: { padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
    submitBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', marginTop: '10px', transition: '0.2s', width: '100%' },
    alertBox: { padding: '15px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', marginBottom: '20px', textAlign: 'left' }
};

export default ForgotPassword;