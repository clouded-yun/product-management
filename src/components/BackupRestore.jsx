import { useState, useRef } from 'react';
import { backupUtils } from '../utils/backupUtils';
import '../styles/BackupRestore.css';

export default function BackupRestore({ onClose, onRestore }) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const result = backupUtils.exportAllData();
    if (result.success) {
      alert(`备份文件已导出：${result.filename}`);
    } else {
      alert(`导出失败：${result.error}`);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.name.endsWith('.json')) {
      alert('请选择JSON格式的备份文件');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const result = await backupUtils.importAllData(file);
      if (result.success) {
        setImportResult({
          type: 'success',
          message: result.message,
          info: result.backupInfo
        });
        // 触发父组件刷新
        setTimeout(() => {
          if (onRestore) {
            onRestore(result.backupInfo);
          }
          // 3秒后关闭对话框，让用户看到成功信息
          setTimeout(() => {
            onClose();
            // 建议刷新页面以确保数据完全加载
            window.location.reload();
          }, 2000);
        }, 1000);
      }
    } catch (error) {
      setImportResult({
        type: 'error',
        message: error.error || '导入失败'
      });
    } finally {
      setImporting(false);
      // 清空文件选择，允许重新选择同一个文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content backup-restore-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>数据备份与恢复</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="backup-restore-content">
          <div className="backup-section">
            <h4>备份数据</h4>
            <p className="section-description">
              导出所有数据到本地文件，包括：用户账号、界面配置、所有数据记录。
              建议在更新代码前先备份数据。
            </p>
            <button 
              className="btn-primary" 
              onClick={handleExport}
              disabled={importing}
            >
              导出备份文件
            </button>
          </div>

          <div className="restore-section">
            <h4>恢复数据</h4>
            <p className="section-description">
              从备份文件恢复所有数据。注意：恢复操作会覆盖当前所有数据，请谨慎操作。
              恢复成功后建议刷新页面。
            </p>
            <div className="file-input-wrapper">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
                id="backup-file-input"
              />
              <label htmlFor="backup-file-input" className="file-input-label">
                {importing ? '正在导入...' : '选择备份文件'}
              </label>
            </div>
          </div>

          {importResult && (
            <div className={`import-result ${importResult.type}`}>
              <div className="result-icon">
                {importResult.type === 'success' ? '✓' : '✗'}
              </div>
              <div className="result-content">
                <div className="result-message">{importResult.message}</div>
                {importResult.info && (
                  <div className="result-info">
                    <p>备份版本：{importResult.info.version}</p>
                    <p>导出时间：{importResult.info.exportTime}</p>
                    <p>界面数量：{importResult.info.pageCount}</p>
                    <p>用户数量：{importResult.info.userCount}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="backup-tips">
            <h5>使用提示</h5>
            <ul>
              <li>更新代码前，请先导出备份文件</li>
              <li>备份文件包含所有配置和数据，请妥善保管</li>
              <li>恢复数据后，需要重新登录系统</li>
              <li>建议定期备份重要数据，避免数据丢失</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
