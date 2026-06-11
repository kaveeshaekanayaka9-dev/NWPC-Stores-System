import React, { useState } from 'react';
import MainHome from './components/MainHome';     // 🏢 සැමට විවෘත පොදු පිටුව
import Login from './components/Login';           // 🔑 ලොගින් පිටුව
import Register from './components/Register';     // 📝 ලියාපදිංචි වීමේ පිටුව
import Home from './components/Home';             // 🏠 ලොග් වූ පසු පෙනෙන ප්‍රධාන පිටුව
import FileCreationPage from './components/FileCreationPage';

import AdminDashboard from './components/AdminDashboard'; 
import SubjectOfficerDashboard from './components/SubjectOfficerDashboard'; 
import ForgotPassword from './components/ForgotPassword'; 

function App() {
  // ඇප් එක පටන් ගනිද්දීම මුලින්ම පෙන්වන්නේ පොදු පිටුවයි (MainHome)
  const [view, setView] = useState('MAIN_HOME'); 
  const [user, setUser] = useState(null); // ලොග් වන පරිශීලකයාගේ දත්ත තබා ගැනීමට

  // 🔑 සාර්ථකව ලොග් වූ පසු ක්‍රියාත්මක වන Function එක
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setView('HOME'); // කෙලින්ම ලොග් වූවන්ගේ Home එකට යයි
  };

  // 🚪 ලොග් අවුට් වීමේදී User දත්ත මකා දමා Main Home වෙත යවන පොදු ශ්‍රිතය
  const handleLogout = () => {
    setUser(null);          // User State එක හිස් කරයි
    localStorage.clear();   // LocalStorage දත්ත ක්ලියර් කරයි
    setView('MAIN_HOME');   // කෙලින්ම ප්‍රධාන පොදු පිටුවට (MainHome) යවයි
  };

  return (
    <div className="app-container">
      
      {/* 1. PUBLIC MAIN HOME VIEW (කාටත් පොදු පිටුව) */}
      {view === 'MAIN_HOME' && (
        <MainHome setView={setView} />
      )}

      {/* 2. LOGIN VIEW */}
      {view === 'LOGIN' && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          goToRegister={() => setView('REGISTER')} 
          goToBack={() => setView('MAIN_HOME')} 
          goToForgotPassword={() => setView('FORGOT_PASSWORD')}
        />
      )}

      {/* 3. REGISTER VIEW */}
      {view === 'REGISTER' && (
        <Register 
          onRegisterSuccess={() => setView('LOGIN')} 
          goToLogin={() => setView('LOGIN')} 
        />
      )}

      {/* 4. LOGGED IN HOME VIEW (ලොග් වූ පසු පෙනෙන පිටුව) */}
      {view === 'HOME' && (
        <Home user={user} setView={setView} />
      )}

      {/* 5. 🎛️ ROLE-BASED DASHBOARD ROUTING */}
      {view === 'DASHBOARD' && (
        user?.role === 'ADMIN' ? (
          <AdminDashboard 
            user={user} 
            goToHome={() => setView('HOME')} 
            goToMainHome={handleLogout} // 👈 👑 මෙන්න ඇඩ්මින්ට අලුතින්ම පාස් කළා! (දැන් Error එක එන්නේ නැහැ)
          />
        ) : (
          <SubjectOfficerDashboard 
            user={user} 
            goToHome={() => setView('HOME')} 
            goToMainHome={handleLogout} // 👈 🧑‍💼 ඔෆිසර්ටත් ඕනෙ නම් පාවිච්චි කරන්න පාස් කළා!
            goToFileCreation={() => setView('FILE_CREATION')} 
          />
        )
      )}

      {/* 6. 📂 SEPARATE FILE CREATION PAGE VIEW */}
      {view === 'FILE_CREATION' && (
        <FileCreationPage 
          user={user} 
          goToDashboard={() => setView('DASHBOARD')} 
        />
      )}

      {/* 7. 🔑 FORGOT PASSWORD / OTP RESET VIEW */}
      {view === 'FORGOT_PASSWORD' && (
        <ForgotPassword 
          goToLogin={() => setView('LOGIN')} 
        />
      )}

    </div>
  );
}

export default App;