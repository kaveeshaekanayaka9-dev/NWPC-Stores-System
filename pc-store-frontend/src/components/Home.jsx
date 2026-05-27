import React, { useState, useEffect } from 'react';

const Home = ({ user, setView }) => {
  const [greeting, setGreeting] = useState('');
  const [bgStyle, setBgStyle] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // සජීවීව වෙලාව අප්ඩේට් කිරීම
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // වෙලාව අනුව Greeting සහ Background තීරණය කිරීම
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting('🌅 Good Morning');
      setBgStyle('linear-gradient(135deg, #1e3c72 0%, #f3a152 100%)'); // Morning Gold-Blue
    } else if (hour < 16) {
      setGreeting('☀️ Good Afternoon');
      setBgStyle('linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'); // Professional Slate Blue
    } else {
      setGreeting('🌙 Good Evening');
      setBgStyle('linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)'); // Royal Purple-Night
    }

    return () => clearInterval(timer);
  }, [currentTime]);

  // වෙලාව ලස්සනට Format කිරීම (e.g., 12:45:30 PM)
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ ...styles.container, backgroundImage: bgStyle }}>
      {/* BACKGROUND DECORATIONS */}
      <div style={styles.circle1}></div>
      <div style={styles.circle2}></div>

      {/* MAIN CARD */}
      <div style={styles.glassCard}>
        <div style={styles.headerZone}>
          <span style={styles.govTag}>🏢 NORTH WESTERN PROVINCIAL COUNCIL</span>
          <h1 style={styles.title}>Store Management System</h1>
          <p style={styles.dateText}>{formattedDate}</p>
          <div style={styles.clockBox}>{formattedTime}</div>
        </div>

        <hr style={styles.divider} />

        {/* GREETING ZONE */}
        <div style={styles.welcomeZone}>
          <h2 style={styles.greetingText}>{greeting}, {user?.name || 'Officer'}!</h2>
          <p style={styles.subtitle}>පද්ධතියට සාදරයෙන් පිළිගනිමු. ඔබගේ රාජකාරි කටයුතු සඳහා පහතින් පිවිසෙන්න.</p>
        </div>

        {/* QUICK ACCESS BUTTONS */}
        <div style={styles.actionZone}>
          {user?.role === 'ADMIN' ? (
            <div style={styles.cardAccess} onClick={() => setView('DASHBOARD')}>
              <div style={styles.icon}>👑</div>
              <h3>Admin Control Panel</h3>
              <p>ගිණුම් අනුමත කිරීම, ලිපිගොනු පරීක්ෂාව සහ රැක් වෙන්කිරීම් කළමනාකරණය.</p>
              <button style={styles.btn}>පාලන පුවරුවට පිවිසෙන්න →</button>
            </div>
          ) : (
            <div style={styles.cardAccess} onClick={() => setView('DASHBOARD')}>
              <div style={styles.icon}>📂</div>
              <h3>Subject Officer Dashboard</h3>
              <p>නව ලිපිගොනු ඇතුළත් කිරීම සහ Graphical Racks මඟින් ලිපිගොනු ඇති ස්ථාන සෙවීම.</p>
              <button style={styles.btn}>දත්ත පුවරුවට පිවිසෙන්න →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// MODERN CSS-IN-JS STYLES (Glassmorphic Theme)
const styles = {
  container: {
    width: '100vw', height: '100vh',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden', position: 'relative', transition: 'all 1s ease',
  },
  circle1: {
    position: 'absolute', width: '400px', height: '400px',
    background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%',
    top: '-100px', left: '-100px', zIndex: 1
  },
  circle2: {
    position: 'absolute', width: '500px', height: '500px',
    background: 'rgba(255, 255, 255, 0.03)', borderRadius: '50%',
    bottom: '-150px', right: '-100px', zIndex: 1
  },
  glassCard: {
    width: '85%', maxWidth: '900px',
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '40px', color: '#ffffff', zIndex: 2,
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)', textAlign: 'center'
  },
  govTag: {
    fontSize: '13px', letterSpacing: '2px', fontWeight: 'bold',
    color: '#f3a152', background: 'rgba(243, 161, 82, 0.15)',
    padding: '6px 16px', borderRadius: '50px', display: 'inline-block'
  },
  title: { fontSize: '42px', margin: '15px 0 5px 0', fontFamily: "'Segoe UI', sans-serif", fontWeight: '700' },
  dateText: { fontSize: '16px', color: '#e2e8f0', margin: '0 0 15px 0' },
  clockBox: {
    fontSize: '32px', fontWeight: 'bold', background: 'rgba(0,0,0,0.2)',
    display: 'inline-block', padding: '8px 25px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)', letterSpacing: '1px'
  },
  divider: { border: 'none', height: '1px', background: 'rgba(255,255,255,0.15)', margin: '25px 0' },
  greetingText: { fontSize: '28px', margin: '0 0 10px 0', color: '#ffffff' },
  subtitle: { fontSize: '16px', color: '#cbd5e1', margin: '0 0 30px 0', lineHeight: '1.5' },
  actionZone: { display: 'flex', justifyContent: 'center', marginTop: '20px' },
  cardAccess: {
    background: 'rgba(255, 255, 255, 0.08)', padding: '25px',
    borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer', transition: 'all 0.3s ease', maxWidth: '450px',
    textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  },
  icon: { fontSize: '45px', marginBottom: '10px' },
  btn: {
    background: '#ffffff', color: '#1e3c72', border: 'none',
    padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold',
    cursor: 'pointer', marginTop: '15px', transition: '0.2s', width: '100%'
  }
};

export default Home;