import { useState, useEffect } from 'react'
import { Login } from './components/Login'
import { getUserConfig } from './api'
import { PhaserGame } from './game/PhaserGame'
import './App.css'

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'login' | 'dashboard' | 'game'>('login');

  useEffect(() => {
    const checkAuth = async () => {
      const userId = localStorage.getItem('civic_user_id');
      if (userId) {
        try {
          const userData = await getUserConfig(userId);
          setUser(userData);
          setView('dashboard');
        } catch (e) {
          console.error("Could not fetch user, requires re-login", e);
          localStorage.removeItem('civic_user_id');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = async (userData: any) => {
    try {
      const fullProfile = await getUserConfig(userData.user_id);
      setUser(fullProfile);
      setView('dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="pixel-panel"><h2>LOADING...</h2></div>;
  }

  return (
    <>
      {view === 'login' && <Login onLoginSuccess={handleLoginSuccess} />}
      {view === 'dashboard' && (
        <div className="pixel-panel">
          <h2 style={{ color: '#3b82f6' }}>Player Dashboard</h2>
          <div style={{ textAlign: 'left', margin: '20px 0' }}>
            <p><strong>Age:</strong> {user.age}</p>
            <p><strong>Level:</strong> {user.current_level}</p>
            <h3>Community Wellbeing Score</h3>
            <ul>
              <li>Hygiene: {user.civic_scores?.hygiene || 0}</li>
              <li>Empathy: {user.civic_scores?.empathy || 0}</li>
              <li>Discipline: {user.civic_scores?.discipline || 0}</li>
              <li>Environment: {user.civic_scores?.environment || 0}</li>
            </ul>
          </div>
          <button className="pixel-btn" onClick={() => setView('game')}>PLAY MISSIONS</button>
          <button className="pixel-btn" style={{ marginLeft: '10px', backgroundColor: '#ef4444' }} onClick={() => {
            localStorage.removeItem('civic_user_id');
            setUser(null);
            setView('login');
          }}>LOGOUT</button>
        </div>
      )}
      {view === 'game' && user && (
        <PhaserGame 
          user={user} 
          onExit={() => setView('dashboard')} 
          onScoreUpdate={async () => {
             const updated = await getUserConfig(user.user_id);
             setUser(updated);
          }}
        />
      )}
    </>
  )
}

export default App
