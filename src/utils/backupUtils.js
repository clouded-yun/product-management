// 备份和恢复工具
import { Storage } from './storage';

export const backupUtils = {
  // 导出所有数据（完整备份）
  exportAllData() {
    try {
      const backup = {
        version: '1.0.0',
        exportTime: new Date().toISOString(),
        users: Storage.getUsers(),
        pageConfigs: Storage.getPageConfigs(),
        pageData: Storage.getItem('pageData') || {},
        currentUser: Storage.getCurrentUser()
      };

      const jsonContent = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `product_management_backup_${timestamp}.json`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true, filename };
    } catch (error) {
      console.error('备份导出失败:', error);
      return { success: false, error: error.message };
    }
  },

  // 从备份文件导入数据
  async importAllData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          
          // 验证备份文件格式
          if (!backup.pageConfigs || !backup.pageData) {
            throw new Error('备份文件格式不正确');
          }

          // 确认是否覆盖现有数据
          const hasExistingData = 
            Storage.getPageConfigs().length > 0 || 
            Storage.getUsers().length > 0;

          // 恢复数据
          if (backup.users && Array.isArray(backup.users)) {
            Storage.saveUsers(backup.users);
          }

          if (backup.pageConfigs && Array.isArray(backup.pageConfigs)) {
            Storage.savePageConfigs(backup.pageConfigs);
          }

          if (backup.pageData && typeof backup.pageData === 'object') {
            Storage.setItem('pageData', backup.pageData);
          }

          // 注意：不恢复currentUser，让用户重新登录

          resolve({
            success: true,
            message: '数据恢复成功！请刷新页面或重新登录。',
            backupInfo: {
              version: backup.version || '未知',
              exportTime: backup.exportTime || '未知',
              pageCount: backup.pageConfigs?.length || 0,
              userCount: backup.users?.length || 0
            }
          });
        } catch (error) {
          console.error('数据恢复失败:', error);
          reject({
            success: false,
            error: error.message || '备份文件解析失败'
          });
        }
      };

      reader.onerror = (error) => {
        reject({
          success: false,
          error: '文件读取失败'
        });
      };

      reader.readAsText(file);
    });
  }
};
