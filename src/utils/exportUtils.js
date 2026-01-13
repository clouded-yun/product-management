// 导出工具
export const exportUtils = {
  // 导出为CSV
  exportToCSV(data, columns, filename = 'export.csv') {
    if (!data || data.length === 0) {
      alert('没有数据可导出');
      return;
    }

    // 构建CSV内容
    const headers = columns.map(col => col.label || col.key);
    const rows = data.map(row => {
      return columns.map(col => {
        let value = row[col.key];
        // 处理图片字段
        if (col.type === 'image' && value) {
          value = '[图片]';
        }
        // 处理包含逗号的值
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // 添加BOM以支持中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // 导出为JSON
  exportToJSON(data, filename = 'export.json') {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

