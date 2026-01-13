import { useState, useEffect } from 'react';
import { Storage } from '../utils/storage';
import DataTable from './DataTable';
import PageManager from './PageManager';
import BackupRestore from './BackupRestore';
import '../styles/MainLayout.css';

export default function MainLayout({ user, onLogout }) {
  const [currentPage, setCurrentPage] = useState(null);
  const [pages, setPages] = useState([]);
  const [showPageManager, setShowPageManager] = useState(false);
  const [showBackupRestore, setShowBackupRestore] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = () => {
    const pageConfigs = Storage.getPageConfigs();
    setPages(pageConfigs);
    if (pageConfigs.length > 0 && !currentPage) {
      setCurrentPage(pageConfigs[0]);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageManagerClose = () => {
    setShowPageManager(false);
    loadPages();
  };

  const handleLogout = () => {
    Storage.logout();
    onLogout();
  };

  return (
    <div className="main-layout">
      <header className="header">
        <div className="header-left">
          <h1>产品参数管理系统</h1>
        </div>
        <div className="header-right">
          <span className="user-info">
            {user.username} ({user.role === 'admin' ? '管理员' : '普通用户'})
          </span>
          {user.role === 'admin' && (
            <>
              <button
                className="btn-secondary"
                onClick={() => setShowBackupRestore(true)}
              >
                备份/恢复
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowPageManager(true)}
              >
                界面管理
              </button>
            </>
          )}
          <button className="btn-secondary" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <h3>数据界面</h3>
          <ul className="page-list">
            {pages.map((page) => (
              <li
                key={page.id}
                className={currentPage?.id === page.id ? 'active' : ''}
                onClick={() => handlePageChange(page)}
              >
                {page.name}
              </li>
            ))}
          </ul>
          {pages.length === 0 && (
            <div className="empty-pages">
              {user.role === 'admin' ? (
                <p>暂无数据界面，请点击"界面管理"创建</p>
              ) : (
                <p>暂无数据界面</p>
              )}
            </div>
          )}
        </aside>

        <main className="content-area">
          {currentPage ? (
            <DataTable page={currentPage} user={user} />
          ) : (
            <div className="empty-content">
              {user.role === 'admin' ? (
                <p>请创建数据界面或选择一个现有界面</p>
              ) : (
                <p>暂无可用数据界面</p>
              )}
            </div>
          )}
        </main>
      </div>

      {showPageManager && (
        <PageManager
          onClose={handlePageManagerClose}
          pages={pages}
        />
      )}

      {showBackupRestore && (
        <BackupRestore
          onClose={() => setShowBackupRestore(false)}
          onRestore={(info) => {
            // 数据恢复后刷新页面列表
            loadPages();
          }}
        />
      )}
    </div>
  );
}

