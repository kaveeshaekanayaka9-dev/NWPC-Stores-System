import { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            alert("ඔබේ ඊමේල් පණිවිඩය පරීක්ෂා කරන්න.");
        } catch (err) {
            alert("දෝෂයක් ඇතිවිය.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>අමතක වූ මුරපදය</h3>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit">Reset Link එවන්න</button>
        </form>
    );
};