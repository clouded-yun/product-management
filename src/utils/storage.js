// 本地存储工具类
export class Storage {
  static getItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('读取存储失败:', error);
      return null;
    }
  }

  static setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('保存存储失败:', error);
      return false;
    }
  }

  static removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('删除存储失败:', error);
      return false;
    }
  }

  // 用户相关
  static getUsers() {
    return this.getItem('users') || [];
  }

  static saveUsers(users) {
    return this.setItem('users', users);
  }

  static getCurrentUser() {
    return this.getItem('currentUser');
  }

  static setCurrentUser(user) {
    return this.setItem('currentUser', user);
  }

  static logout() {
    return this.removeItem('currentUser');
  }

  // 界面配置相关
  static getPageConfigs() {
    return this.getItem('pageConfigs') || [];
  }

  static savePageConfigs(configs) {
    return this.setItem('pageConfigs', configs);
  }

  // 数据相关
  static getData(pageId) {
    const allData = this.getItem('pageData') || {};
    return allData[pageId] || [];
  }

  static saveData(pageId, data) {
    const allData = this.getItem('pageData') || {};
    allData[pageId] = data;
    return this.setItem('pageData', allData);
  }

  static getAllPageData() {
    return this.getItem('pageData') || {};
  }
}

