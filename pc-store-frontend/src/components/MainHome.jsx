import React, { useState, useEffect } from 'react';

const MainHome = ({ setView }) => {
  const [greeting, setGreeting] = useState('');
  const [bgStyle, setBgStyle] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // 🗄️ Graphical Rack එක සඳහා Sample Data
  const [selectedRack, setSelectedRack] = useState('Rack 01');
  const shelves = ['Shelf 04', 'Shelf 03', 'Shelf 02', 'Shelf 01'];
  const columns = [1, 2, 3, 4, 5, 6, 7, 8];

  const rackData = {
    'Shelf 04': [1, 0, 1, 1, 0, 1, 0, 0], 
    'Shelf 03': [1, 1, 0, 1, 1, 0, 1, 1],
    'Shelf 02': [0, 0, 1, 0, 1, 1, 0, 1],
    'Shelf 01': [1, 1, 1, 1, 0, 0, 1, 1]
  };

  useEffect(() => {
  const timer = setInterval(() => setCurrentTime(new Date()), 1000);
  const hour = currentTime.getHours();
  
  if (hour < 12) {
    setGreeting('🌅 Good Morning');
  } else if (hour < 16) {
    setGreeting('☀️ Good Afternoon');
  } else {
    setGreeting('🌙 Good Evening');
  }

  // 🎯 සියලුම වෙලාවන් සඳහා රජයේ වෙබ් අඩවියකට ගැලපෙන නිශ්චිත Professional තද පසුබිමක් ස්ථාවරව තබා ගැනීම
  setBgStyle('linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)');

  return () => clearInterval(timer);
}, [currentTime]);

  return (
    <div style={{ ...styles.container, backgroundImage: bgStyle }}>
      
      {/* 1. 🛡️ NEW MODERN NAVBAR WITH LOGO */}
      <nav style={styles.navbar}>
        <div style={styles.logoSection}>
          {/* 💡 ඔයාගේ ලෝගෝ ඉමේජ් එක පහත src එකට දාන්න */}
          <img src="https://cdn-icons-png.flaticon.com/512/12517/12517006.png" alt="NWPC Logo" style={styles.logoImg} />
          <div style={styles.logoText}>
            NWPC <span style={styles.logoHighlight}>STORES</span>
          </div>
        </div>
        
        {/* Navigation Menu Links */}
        <div style={styles.navLinks}>
          <a href="#home" style={styles.navLink}>Home</a>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#rack-preview" style={styles.navLink}>Live Rack</a>
          <a href="#about" style={styles.navLink}>About</a>
          <a href="#contact" style={styles.navLink}>Contact</a>
        </div>

        <div style={styles.navButtons}>
          <button style={styles.loginBtn} onClick={() => setView('LOGIN')}>Sign In 🔑</button>
          <button style={styles.registerBtn} onClick={() => setView('REGISTER')}>Register 📝</button>
        </div>
      </nav>

      {/* 2. 🚀 HERO SECTION (SPLIT LAYOUT) */}
      <div id="home" style={styles.heroSection}>
        <div style={styles.heroLeft}>
          <div style={styles.timeGreetingBadge}>{greeting}</div>
          <h1 style={styles.mainTitle}>ලිපිගොනු කළමනාකරණ<br /><span style={{color: '#10b981'}}>මධ්‍යම පද්ධතිය</span></h1>
          <p style={styles.subTitle}>වයඹ පළාත් සභා ගබඩා පරිශ්‍රය - North Western Provincial Council. ආයතනික ලිපිගොනු සුරක්ෂිතව සහ ක්‍රමවත්ව ඩිජිටල්කරණය කිරීමේ නිල අවකාශය.</p>
          <div style={{display:'flex', gap:'15px'}}>
            <a href="#rack-preview" style={styles.heroBtnPrimary}>View Live Racks</a>
            <a href="#features" style={styles.heroBtnSecondary}>Learn More</a>
          </div>
        </div>
        <div style={styles.heroRight}>
          <div style={styles.clockContainer}>
            <span style={styles.clockLabel}>SYSTEM TIME</span>
            <div style={styles.clockBox}>{currentTime.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* 3. ✨ NEW FEATURES SECTION */}
      <div id="features" style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Key System Features</h2>
          <p style={styles.sectionSubtitle}>පද්ධතිය හරහා නිලධාරීන්ට ලැබෙන ප්‍රධාන පහසුකම්</p>
        </div>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📁</div>
            <h3 style={styles.featureCardTitle}>File Queue Management</h3>
            <p style={styles.featureCardDesc}>ඇඩ්මින් මඟින් ලිපිගොනු පරීක්ෂා කර අනුමත කිරීම සඳහා වන විධිමත් පෝලිම් ක්‍රමවේදය.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📊</div>
            <h3 style={styles.featureCardTitle}>Graphical Rack Tracking</h3>
            <p style={styles.featureCardDesc}>භෞතික ගබඩාවේ රාක්ක සහ තට්ටු වල ගොනු පිරි ඇති ආකාරය සිතියමකින් සජීවීව බැලීම.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🛡️</div>
            <h3 style={styles.featureCardTitle}>Role-Based Security</h3>
            <p style={styles.featureCardDesc}>Admin සහ Subject Officer සඳහා වෙන් වෙන් වශයෙන් පවතින ආරක්ෂිත පිවිසුම් මඟ පෙන්වීම්.</p>
          </div>
        </div>
      </div>

      {/* 4. 📊 LIVE GRAPHICAL FILE RACK PREVIEW SECTION (Your Feature kept untouched) */}
      <div id="rack-preview" style={styles.rackSection}>
        <div style={styles.rackHeader}>
          <div style={{ textAlign: 'left' }}>
            <h3 style={styles.rackTitle}>📊 Live Rack Occupancy Preview</h3>
            <p style={styles.rackSubtitle}>ගබඩාව තුළ භෞතික රාක්ක වල ලිපිගොනු පිරිලා ඇති ආකාරය (සජීවී දර්ශනය)</p>
          </div>
          <select style={styles.dropdown} value={selectedRack} onChange={(e) => setSelectedRack(e.target.value)}>
            <option>Rack 01 (General Files)</option>
            <option>Rack 02 (Account Files)</option>
            <option>Rack 03 (Legal Documents)</option>
          </select>
        </div>

        <div style={styles.legendContainer}>
          <div style={styles.legendItem}><div style={{ ...styles.legendBox, background: '#2ecc71' }}></div> පිරිලා (File Available)</div>
          <div style={styles.legendItem}><div style={{ ...styles.legendBox, background: 'rgba(255,255,255,0.1)' }}></div> හිස් ඉඩක් (Empty Slot)</div>
        </div>

        <div style={styles.rackGrid}>
          {shelves.map((shelf) => (
            <div key={shelf} style={styles.shelfRow}>
              <div style={styles.shelfLabel}>{shelf}</div>
              <div style={styles.slotsContainer}>
                {columns.map((col, index) => {
                  const isOccupied = rackData[shelf][index] === 1;
                  return (
                    <div 
                      key={col} 
                      style={{ 
                        ...styles.slotBox, 
                        background: isOccupied ? '#2ecc71' : 'rgba(255, 255, 255, 0.05)',
                        border: isOccupied ? '1px solid #27ae60' : '1px solid rgba(255,255,255,0.1)',
                        boxShadow: isOccupied ? '0 0 15px rgba(46, 204, 113, 0.2)' : 'none'
                      }}
                      title={isOccupied ? "File is inside this slot" : "Empty Slot"}
                    >
                      {isOccupied && <div style={styles.fileLine}></div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p style={styles.infoFooter}>⚠️ සටහන: ලිපිගොනු වල නම සහ රහස්‍ය තොරතුරු බැලීම සඳහා කරුණාකර පද්ධතියට ලොග් වන්න.</p>
      </div>

      {/* 5. 🏢 NEW ABOUT SECTION */}
      <div id="about" style={styles.aboutSection}>
        <div style={styles.aboutContent}>
          <h2 style={styles.sectionTitle}>About Us</h2>
          <p style={styles.aboutText}>
            මෙම මධ්‍යම පද්ධතිය වයඹ පළාත් සභා ගබඩා පරිශ්‍රයේ කටයුතු වඩාත් කාර්යක්ෂම කිරීම සඳහා නිර්මාණය කර ඇත. සාම්ප්‍රදායික ලේඛන ගොඩගැසීමේ ක්‍රමවේදයන් වෙනුවට, ලිපිගොනු පවතින නිවැරදි ස්ථානය (Rack/Shelf Slot) ක්ෂණිකව හඳුනා ගැනීමටත්, විෂය භාර නිලධාරීන් සහ පරිපාලකයන් අතර ලිපිගොනු හුවමාරුව විනිවිදභාවයකින් යුතුව සිදු කිරීමටත් මෙමඟින් ඉඩ සැලසේ.
          </p>
        </div>
      </div>

      {/* 6. 📞 NEW CONTACT SECTION */}
      <div id="contact" style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Contact & Technical Support</h2>
          <p style={styles.sectionSubtitle}>පද්ධතිය සම්බන්ධ ඕනෑම ගැටලුවකදී අප අමතන්න</p>
        </div>
        <div style={styles.contactGrid}>
          <div style={styles.contactCard}>
            <span style={{fontSize:'24px'}}>🏢</span>
            <h4>NWPC IT Division</h4>
            <p style={{color:'#94a3b8', fontSize:'14px', marginTop:'5px'}}>Provincial Council Complex, Kurunegala</p>
          </div>
          <div style={styles.contactCard}>
            <span style={{fontSize:'24px'}}>📧</span>
            <h4>Email Address</h4>
            <p style={{color:'#10b981', fontSize:'14px', marginTop:'5px'}}>csnwp@sltnet.lk</p>
          </div>
          <div style={styles.contactCard}>
            <span style={{fontSize:'24px'}}>📞</span>
            <h4>Hotline Numbers</h4>
            <p style={{color:'#94a3b8', fontSize:'14px', marginTop:'5px'}}>+94 37 22 31769</p>
          </div>
        </div>
      </div>

      {/* 7. 📝 NEW FOOTER */}
      <footer style={styles.footer}>
        <p>&copy; {new Date().getFullYear()} North Western Provincial Council Stores. All Rights Reserved. Powered by MERN Stack.</p>
      </footer>

    </div>
  );
};

// FULLY RE-STYLED PROFESSIONAL LOOK
const styles = {
  container: {
  width: '100vw', 
  minHeight: '100vh',
  color: '#ffffff', 
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center',
  overflowX: 'hidden', 
  transition: 'all 1s ease', 
  
  // 🎯 මගේ නිර්දේශය: පසුබිම ස්ථාවරව සහ පිරිසිදුව තබා ගැනීමට මේ පේළි 3 එකතු කරන්න
  backgroundAttachment: 'fixed',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat'
},
  navbar: {
    width: '85%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '25px 0', borderBottom: '1px solid rgba(255,255,255,0.08)'
  },
  logoSection: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoImg: { height: '38px', width: '38px', objectFit: 'contain' },
  logoText: { fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#fff' },
  logoHighlight: { color: '#10b981' },
  
  navLinks: { display: 'flex', gap: '25px' },
  navLink: { textDecoration: 'none', color: '#94a3b8', fontSize: '15px', fontWeight: '500', transition: 'color 0.3s' },
  
  navButtons: { display: 'flex', gap: '12px' },
  loginBtn: {
    background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.3s'
  },
  registerBtn: {
    background: '#10b981', color: '#ffffff', border: 'none',
    padding: '8px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'background 0.3s'
  },

  // HERO SECTION SPLIT STYLE
  heroSection: { 
    width: '85%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', 
    alignItems: 'center', marginTop: '70px', marginBottom: '60px', flexWrap: 'wrap', gap: '40px' 
  },
  heroLeft: { flex: '1', minWidth: '300px', textAlign: 'left' },
  heroRight: { flex: '0.8', minWidth: '300px', display: 'flex', justifyContent: 'center' },
  timeGreetingBadge: { 
    display: 'inline-block', background: 'rgba(243, 161, 82, 0.15)', color: '#f3a152', 
    padding: '6px 16px', borderRadius: '50px', fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' 
  },
  mainTitle: { fontSize: '46px', fontWeight: '800', margin: '0 0 15px 0', lineHeight: '1.2', letterSpacing: '-0.5px' },
  subTitle: { fontSize: '16px', color: '#94a3b8', marginBottom: '30px', lineHeight: '1.6', maxWidth: '550px' },
  
  heroBtnPrimary: { textDecoration: 'none', background: '#10b981', color: '#fff', padding: '12px 25px', borderRadius: '8px', fontWeight: '600', fontSize: '15px' },
  heroBtnSecondary: { textDecoration: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '12px 25px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', border: '1px solid rgba(255,255,255,0.1)' },
  
  clockContainer: { background: 'rgba(0,0,0,0.25)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', width: '260px' },
  clockLabel: { fontSize: '11px', color: '#64748b', fontWeight: 'bold', letterSpacing: '2px', display: 'block', marginBottom: '8px' },
  clockBox: { fontSize: '32px', fontWeight: 'bold', color: '#10b981', letterSpacing: '1px' },
  
  // NEW GENERIC SECTION STYLES
  sectionContainer: { width: '85%', maxWidth: '1200px', padding: '60px 0', textAlign: 'center' },
  sectionHeader: { marginBottom: '40px' },
  sectionTitle: { fontSize: '30px', fontWeight: '700', color: '#ffffff' },
  sectionSubtitle: { fontSize: '15px', color: '#94a3b8', marginTop: '5px' },
  
  featuresGrid: { display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center' },
  featureCard: { 
    flex: '1', minWidth: '280px', maxWidth: '360px', background: 'rgba(255,255,255,0.03)', 
    padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'left'
  },
  featureIcon: { fontSize: '28px', marginBottom: '15px' },
  featureCardTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '10px' },
  featureCardDesc: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' },

  // RACK STYLES (Kept intact, just padded and polished)
  rackSection: {
    width: '85%', maxWidth: '1200px', background: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(20px)', padding: '40px', borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
  },
  rackHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' },
  rackTitle: { fontSize: '24px', fontWeight: '700', margin: 0, color: '#ffffff' },
  rackSubtitle: { fontSize: '14px', margin: '5px 0 0 0', color: '#94a3b8' },
  dropdown: {
    background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
    padding: '10px 18px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', outline: 'none'
  },
  legendContainer: { display: 'flex', gap: '20px', marginBottom: '25px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#cbd5e1' },
  legendBox: { width: '16px', height: '16px', borderRadius: '4px' },
  
  rackGrid: {
    background: 'rgba(0, 0, 0, 0.4)', padding: '25px', borderRadius: '20px',
    border: '4px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '15px'
  },
  shelfRow: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', borderBottom: '3px solid #334155' },
  shelfLabel: { width: '90px', fontSize: '13px', fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase' },
  slotsContainer: { flex: 1, display: 'flex', gap: '12px', justifyContent: 'space-around' },
  slotBox: {
    flex: 1, height: '65px', borderRadius: '6px', transition: 'all 0.3s ease',
    display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'
  },
  fileLine: { width: '6px', height: '80%', background: 'rgba(255,255,255,0.25)', borderRadius: '2px' },
  infoFooter: { fontSize: '13px', color: '#f59e0b', textAlign: 'center', marginTop: '25px', marginBottom: 0 },

  // ABOUT SECTION
  aboutSection: { width: '100vw', background: 'rgba(0,0,0,0.2)', padding: '70px 0', display: 'flex', justifyContent: 'center', margin: '40px 0' },
  aboutContent: { width: '85%', maxWidth: '800px', textAlign: 'center' },
  aboutText: { fontSize: '16px', color: '#cbd5e1', lineHeight: '1.8', marginTop: '20px' },

  // CONTACT SECTION
  contactGrid: { display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' },
  contactCard: { 
    flex: '1', minWidth: '250px', background: 'rgba(255,255,255,0.02)', padding: '25px', 
    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' 
  },

  // FOOTER
  footer: { width: '100vw', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '30px 0', textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '40px' }
};

export default MainHome;