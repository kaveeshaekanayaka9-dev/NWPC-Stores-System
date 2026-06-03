import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams(); // URL එකේ ඇති token එක ලබාගනී
    const [password, setPassword] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
            alert("මුරපදය සාර්ථකව වෙනස් කරන ලදී!");
        } catch (err) {
            alert("ලින්ක් එකේ කාලය අවසන් වී ඇත.");
        }
    };

    return (
        <form onSubmit={handleReset}>
            <h3>නව මුරපදය ඇතුළත් කරන්න</h3>
            <input type="password" placeholder="New Password" onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Update Password</button>
        </form>
    );
};