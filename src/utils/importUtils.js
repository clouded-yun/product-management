// 导入工具
export const importUtils = {
  // 从CSV文件导入
  parseCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            reject(new Error('CSV文件为空'));
            return;
          }

          // 处理BOM
          const firstLine = lines[0].startsWith('\uFEFF') 
            ? lines[0].slice(1) 
            : lines[0];
          
          // 解析表头
          const headers = this.parseCSVLine(firstLine);
          
          // 解析数据行
          const data = [];
          for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
              const row = { id: Date.now().toString() + '_' + i };
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              data.push(row);
            }
          }

          resolve({ headers, data });
        } catch (error) {
          reject(new Error('CSV解析失败: ' + error.message));
        }
      };

      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };

      reader.readAsText(file, 'UTF-8');
    });
  },

  // 解析CSV行（处理引号和逗号）
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    
    return result;
  },

  // 从JSON文件导入
  parseJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (!Array.isArray(data)) {
            reject(new Error('JSON文件应包含数组格式的数据'));
            return;
          }

          // 获取所有列名
          const headers = new Set();
          data.forEach(row => {
            Object.keys(row).forEach(key => {
              if (key !== 'id') headers.add(key);
            });
          });

          // 确保每行都有id
          const processedData = data.map((row, index) => ({
            id: row.id || (Date.now().toString() + '_' + index),
            ...row
          }));

          resolve({ headers: Array.from(headers), data: processedData });
        } catch (error) {
          reject(new Error('JSON解析失败: ' + error.message));
        }
      };

      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };

      reader.readAsText(file);
    });
  }
};
