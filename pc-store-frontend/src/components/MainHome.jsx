import React, { useState, useEffect } from 'react';

const MainHome = ({ setView }) => {
  const [greeting, setGreeting] = useState('');
  const [bgStyle, setBgStyle] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // 🗄️ Graphical Rack එක සඳහා Sample Data
 // ඔබේ component එකේ උඩින්ම මේ දත්ත ටික තබා ගන්න
// ඔබේ component එකේ උඩින්ම (useState තියෙන තැන)
const [selectedRack, setSelectedRack] = useState('Rack 01');

// රාක්ක වර්ග 3කටම දත්ත අඩංගු වන පරිදි මෙය වෙනස් කරන්න
const [rackData, setRackData] = useState({
  'Rack 01': {
    'shelf 04': [1, 0, 1, 1, 0, 1, 0, 0],
    'shelf 03': [1, 1, 0, 1, 1, 0, 1, 1],
    'shelf 02': [0, 0, 1, 0, 1, 1, 0, 1],
    'shelf 01': [1, 1, 1, 1, 0, 0, 1, 1]
  },
  'Rack 02': {
    'shelf 04': [0, 1, 0, 0, 1, 0, 1, 0],
    'shelf 03': [0, 0, 0, 1, 0, 1, 0, 0],
    'shelf 02': [1, 1, 0, 1, 1, 1, 0, 1],
    'shelf 01': [0, 0, 0, 0, 0, 0, 0, 0]
  },
  'Rack 03': {
    'shelf 04': [1, 1, 1, 1, 1, 1, 1, 1],
    'shelf 03': [0, 0, 0, 0, 0, 0, 0, 0],
    'shelf 02': [1, 0, 1, 0, 1, 0, 1, 0],
    'shelf 01': [0, 1, 0, 1, 0, 1, 0, 1]
  }
});
const shelves = ['shelf 04', 'shelf 03', 'shelf 02', 'shelf 01'];
const columns = [1, 2, 3, 4, 5, 6, 7, 8];

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
  setBgStyle("url('/image/e1.jpg.jpg')");

  return () => clearInterval(timer);
}, [currentTime]);

  useEffect(() => {
    const fetchRackData = async () => {
        try {
            // ඔබේ Backend එකේ port එක (උදා: 5000) නිවැරදිදැයි බලන්න
            const response = await fetch(`http://localhost:5000/api/racks/${selectedRack}`);
            const data = await response.json();
            
            // ලැබුණු දත්ත වලින් rackData එක Update කරන්න
            setRackData(prev => ({
                ...prev,
                [selectedRack]: data
            }));
        } catch (err) {
            console.error("API Error:", err);
        }
    };
    fetchRackData();
}, [selectedRack]); // selectedRack වෙනස් වන සෑම විටම API එක Call වේ

  return (
    <div style={{ ...styles.container, backgroundImage: bgStyle }}>

      <div style={{
  position: 'fixed',
  top: 0, left: 0, width: '100%', height: '100%',
  backgroundImage: "url('/image/e1.jpg')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  zIndex: -10 // Force it to the back
}}></div>
      
      {/* 1. 🛡️ NEW MODERN NAVBAR WITH LOGO */}
      <nav style={styles.navbar}>
        <div style={styles.logoSection}>
          {/* 💡 ඔයාගේ ලෝගෝ ඉමේජ් එක පහත src එකට දාන්න */}
          <img src="image\Nwp_sri_lanka.jpg"  style={styles.logoImg} />
          <div style={styles.logoText}>
            NWPC <span style={styles.logoHighlight}>STORES MANAGEMENT SYSTEM</span>
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
          <h1 style={styles.mainTitle}>ලිපිගොනු කළමනාකරණ<br /><span style={{color: '#000000f5'}}>මධ්‍යම පද්ධතිය</span></h1>
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
  <option value="Rack 01">Rack 01 (General Files)</option>
  <option value="Rack 02">Rack 02 (Account Files)</option>
  <option value="Rack 03">Rack 03 (Legal Documents)</option>
</select>
        </div>

        <div style={styles.legendContainer}>
  <div style={styles.legendItem}>
    <div style={{ ...styles.legendBox, background: '#2ecc71' }}></div> 
    <span>පිරිලා (File Available)</span>
  </div>
  
  <div style={styles.legendItem}>
    <div style={{ ...styles.legendBox, background: 'rgba(255, 255, 255, 0.1)' }}></div> 
    <span>හිස් ඉඩක් (Empty Slot)</span>
  </div>
</div>

        <div style={styles.rackGrid}>
         {shelves.map((shelf) => (
  <div key={shelf} style={styles.shelfRow}>
    <div style={styles.shelfLabel}>{shelf}</div>
    <div style={styles.slotsContainer}>
      {/* මෙතැනදී rackData තිබේදැයි බලන්න */}
      {(rackData[selectedRack]?.[shelf] || Array(8).fill(0)).map((col, index) => {
        const isOccupied = (rackData[selectedRack]?.[shelf]?.[index]) === 1;
        
        return (
          <div key={index} style={{ ...styles.slotBox, background: isOccupied ? '#2ecc71' : 'rgba(255, 255, 255, 0.05)' }}>
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
            <p style={{color:'#000000', fontSize:'14px', marginTop:'5px'}}>Provincial Council Complex, Kurunegala</p>
          </div>
          <div style={styles.contactCard}>
            <span style={{fontSize:'24px'}}>📧</span>
            <h4>Email Address</h4>
            <p style={{color:'#1df919', fontSize:'14px', marginTop:'5px'}}>csnwp@sltnet.lk</p>
          </div>
          <div style={styles.contactCard}>
            <span style={{fontSize:'24px'}}>📞</span>
            <h4>Hotline Numbers</h4>
            <p style={{color:'#010304', fontSize:'14px', marginTop:'5px'}}>+94 37 22 31769</p>
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
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center',
  overflowX: 'hidden', 
  
  // මේ විදිහට Gradient එකත් එක්ක Image එක එකම පේළියේ දාන්න:
 container: {
  // ... අනෙක් ස්ටයිල්ස් ...
  backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/image/e1.jpg')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
  
  // මෙන්න මේක එකතු කරන්න (පින්තූරය වැහෙන එක නවත්වන්න)
  isolation: 'isolate', 
}
},
  

  navbar: {
    width: '90%', maxWidth: '1300px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '20px 30px', margin: '20px',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(15px)',
    borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  logoSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  logoImg: { height: '40px', width: '40px', borderRadius: '8px', objectFit: 'cover' },
  logoText: { fontSize: '18px', fontWeight: '800', letterSpacing: '1px',color: '#10b981' },
  logoHighlight: { color: '#10b981', marginLeft: '5px' },
  
  navLinks: { display: 'flex', gap: '30px' },
  navLink: { textDecoration: 'none', color: '#cbd5e1', fontSize: '14px', fontWeight: '500', transition: '0.3s' },
  
  navButtons: { display: 'flex', gap: '15px' },
  loginBtn: {
    background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600'
  },
  registerBtn: {
    background: 'transparent', color: '#faf5f5', border: '1px solid rgba(255,255,255,0.3)',
    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600'
  },




  heroSection: {
    width: '90%', maxWidth: '1300px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '60px', borderRadius: '30px',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(25px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
    marginTop: '20px', marginBottom: '40px', gap: '40px'
  },
  heroLeft: { flex: '1', textAlign: 'left' },
  timeGreetingBadge: {
    display: 'inline-block', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981',
    padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px'
  },
  mainTitle: { fontSize: '52px', fontWeight: '900', margin: '0 0 20px 0', lineHeight: '1.1',color: '#040404' },
  subTitle: { fontSize: '16px', color: '#f0f3f7', marginBottom: '40px', lineHeight: '1.7', maxWidth: '500px' },
  heroBtnPrimary: { textDecoration: 'none', background: '#10b981', color: '#080000', padding: '15px 30px', borderRadius: '12px', fontWeight: '700' },
  heroBtnSecondary: { textDecoration: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '15px 30px', borderRadius: '12px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)' },
  
  clockContainer: { background: 'rgba(0,0,0,0.3)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' },
  clockLabel: { fontSize: '10px', color: '#030303', letterSpacing: '3px', marginBottom: '10px', display: 'block' },
  clockBox: { fontSize: '40px', fontWeight: '800', color: '#10b981', fontFamily: 'monospace' },

  sectionContainer: { width: '90%', maxWidth: '1300px', padding: '80px 0', textAlign: 'center' },
  sectionTitle: { fontSize: '36px', fontWeight: '800', marginBottom: '10px' , color: '#f3f6f9'},
  sectionSubtitle: { color: '#f3f6f9', marginBottom: '50px' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.47)', padding: '40px', borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', transition: '0.4s'
  },
  featureIcon: { fontSize: '32px', marginBottom: '20px' },
  featureCardTitle: { fontSize: '20px', marginBottom: '10px', color: '#060606' },
  featureCardDesc: { fontSize: '14px', color: '#ffffff', lineHeight: '1.6' },

  rackSection: {
    width: '90%', maxWidth: '1300px', background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(30px)', padding: '50px', borderRadius: '30px',
    border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
  },
  rackHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  rackTitle: { fontSize: '28px', fontWeight: '800',color: '#f6f7fa' },
  rackSubtitle: { color: '#94a3b8', marginTop: '5px' },
  dropdown: {
    background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
    padding: '12px 25px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer'
  },
  rackGrid: {
    background: 'rgba(0,0,0,0.2)', padding: '30px', borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px'
  },
  shelfRow: { display: 'flex', alignItems: 'center', gap: '20px', padding: '10px' },
  shelfLabel: { width: '80px', fontSize: '12px', fontWeight: 'bold', color: '#10b981', letterSpacing: '1px' },
  slotsContainer: { flex: 1, display: 'flex', gap: '10px' },
  slotBox: {
    flex: 1, height: '70px', borderRadius: '10px', transition: '0.3s',
    display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  infoFooter: { fontSize: '12px', color: '#f59e0b', textAlign: 'center', marginTop: '30px' },
  aboutSection: { width: '100%', background: 'rgba(255,255,255,0.02)', padding: '80px 0', textAlign: 'center' },
  aboutContent: { width: '90%', maxWidth: '800px', margin: 'auto' },
  aboutText: { fontSize: '18px', color: '#cbd5e1', lineHeight: '1.8' },
  contactGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '40px' },
  contactCard: { background: 'rgba(255, 255, 255, 0.47)', padding: '30px', borderRadius: '16px',color: '#02060a' },
  footer: { width: '100%', padding: '40px 0', textAlign: 'center', color: '#d9dde1', fontSize: '12px' },

   legendContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '14px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  legendBox: {
    width: '20px',
    height: '20px',
    borderRadius: '4px', // පොඩි රවුම් කොනක්
    border: '1px solid rgba(255,255,255,0.3)' // බොක්ස් එක පේන්න පොඩි බෝඩර් එකක්
  }

};


export default MainHome;