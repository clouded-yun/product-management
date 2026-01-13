import { useState, useEffect } from 'react';
import { Storage } from '../utils/storage';
import '../styles/Login.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [role, setRole] = useState('user');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const users = Storage.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      Storage.setCurrentUser(user);
      onLogin(user);
    } else {
      setError('用户名或密码错误');
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    setError('');

    if (!newUsername || !newPassword) {
      setError('请填写完整信息');
      return;
    }

    const users = Storage.getUsers();
    if (users.find(u => u.username === newUsername)) {
      setError('用户名已存在');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      username: newUsername,
      password: newPassword,
      role: role
    };

    users.push(newUser);
    Storage.saveUsers(users);
    setError('账号创建成功，请登录');
    setIsCreating(false);
    setNewUsername('');
    setNewPassword('');
  };

  // 初始化默认管理员账号（如果不存在）
  useEffect(() => {
    const users = Storage.getUsers();
    if (users.length === 0) {
      const admin = {
        id: '1',
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      };
      Storage.saveUsers([admin]);
    }
  }, []);

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>产品参数管理系统</h2>
        
        {!isCreating ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn-primary">登录</button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsCreating(true)}
            >
              创建新账号
            </button>
            <div className="login-hint">
              <p>默认管理员账号：admin / admin123</p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateUser} className="login-form">
            <h3>创建新账号</h3>
            <div className="form-group">
              <label>用户名</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>密码</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>角色</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn-primary">创建</button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsCreating(false);
                setError('');
              }}
            >
              返回登录
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

