import { useState, useEffect } from 'react';
import { Storage } from '../utils/storage';
import '../styles/PageManager.css';

export default function PageManager({ onClose, pages: initialPages }) {
  const [pages, setPages] = useState(initialPages || []);
  const [editingPage, setEditingPage] = useState(null);
  const [pageName, setPageName] = useState('');

  useEffect(() => {
    setPages(Storage.getPageConfigs());
  }, []);

  const handleAddPage = () => {
    setEditingPage({
      id: Date.now().toString(),
      name: '',
      columns: []
    });
    setPageName('');
  };

  const handleEditPage = (page) => {
    setEditingPage({ ...page });
    setPageName(page.name);
  };

  const handleDeletePage = (id) => {
    if (window.confirm('确定要删除这个界面吗？删除后该界面的所有数据也会被删除。')) {
      const newPages = pages.filter(p => p.id !== id);
      Storage.savePageConfigs(newPages);
      setPages(newPages);
      
      // 删除对应的数据
      const allData = Storage.getItem('pageData') || {};
      delete allData[id];
      Storage.setItem('pageData', allData);
    }
  };

  const handleSavePage = () => {
    if (!pageName.trim()) {
      alert('请输入界面名称');
      return;
    }

    const pageConfigs = Storage.getPageConfigs();
    if (editingPage.id && pages.find(p => p.id === editingPage.id)) {
      // 更新
      const updated = pageConfigs.map(p =>
        p.id === editingPage.id ? { ...editingPage, name: pageName } : p
      );
      Storage.savePageConfigs(updated);
      setPages(updated);
    } else {
      // 新建
      const newPage = {
        ...editingPage,
        id: Date.now().toString(),
        name: pageName,
        columns: editingPage.columns || []
      };
      const updated = [...pageConfigs, newPage];
      Storage.savePageConfigs(updated);
      setPages(updated);
    }
    
    setEditingPage(null);
    setPageName('');
  };

  const handleCancelEdit = () => {
    setEditingPage(null);
    setPageName('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content page-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>界面管理</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="page-list-container">
          <div className="page-list-header">
            <h4>数据界面列表</h4>
            <button className="btn-primary" onClick={handleAddPage}>
              创建新界面
            </button>
          </div>
          
          <ul className="page-list-manager">
            {pages.map((page) => (
              <li key={page.id} className="page-item-manager">
                <span className="page-name">{page.name}</span>
                <div className="page-actions">
                  <button
                    className="btn-small btn-edit"
                    onClick={() => handleEditPage(page)}
                  >
                    编辑
                  </button>
                  <button
                    className="btn-small btn-delete"
                    onClick={() => handleDeletePage(page.id)}
                  >
                    删除
                  </button>
                </div>
              </li>
            ))}
            {pages.length === 0 && (
              <li className="empty-page-list">
                <p>暂无数据界面，请创建新界面</p>
              </li>
            )}
          </ul>
        </div>

        {editingPage && (
          <div className="edit-page-form">
            <h4>{editingPage.id && pages.find(p => p.id === editingPage.id) ? '编辑界面' : '创建新界面'}</h4>
            <div className="form-group">
              <label>界面名称</label>
              <input
                type="text"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                placeholder="例如：产品参数、产品类型等"
              />
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={handleSavePage}>
                保存
              </button>
              <button className="btn-secondary" onClick={handleCancelEdit}>
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

