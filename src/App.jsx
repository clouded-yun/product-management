import { useState, useEffect } from 'react';
import { Storage } from './utils/storage';
import Login from './components/Login';
import MainLayout from './components/MainLayout';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查是否已有登录用户
    const currentUser = Storage.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="App">
      {user ? (
        <MainLayout user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;

