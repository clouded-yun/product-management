import { useState, useEffect, useRef } from 'react';
import { Storage } from '../utils/storage';
import { imageUtils } from '../utils/imageUtils';
import { exportUtils } from '../utils/exportUtils';
import { importUtils } from '../utils/importUtils';
import ColumnEditor from './ColumnEditor';
import '../styles/DataTable.css';

export default function DataTable({ page, user }) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [showColumnEditor, setShowColumnEditor] = useState(false);
  const [newRow, setNewRow] = useState({});
  const [filters, setFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState({}); // 控制哪些列显示筛选框
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [columnWidths, setColumnWidths] = useState({});
  const [resizingColumn, setResizingColumn] = useState(null);
  const tableRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (page) {
      const cols = page.columns || [];
      setColumns(cols);
      // 加载保存的列宽
      const savedWidths = Storage.getItem(`columnWidths_${page.id}`) || {};
      setColumnWidths(savedWidths);
      loadData();
    }
  }, [page]);

  useEffect(() => {
    applyFilters();
  }, [data, filters]);

  const loadData = () => {
    if (page) {
      const pageData = Storage.getData(page.id);
      setData(pageData);
      setFilteredData(pageData);
    }
  };

  const applyFilters = () => {
    let result = [...data];
    
    Object.keys(filters).forEach(colKey => {
      const filterValue = filters[colKey];
      if (filterValue && filterValue.trim() !== '') {
        result = result.filter(row => {
          const value = String(row[colKey] || '').toLowerCase();
          return value.includes(filterValue.toLowerCase());
        });
      }
    });

    setFilteredData(result);
    setSelectedRows(new Set()); // 清空选择
  };

  const handleFilterToggle = (colKey) => {
    setActiveFilters(prev => ({
      ...prev,
      [colKey]: !prev[colKey]
    }));
    // 如果关闭筛选，清空该列的筛选值
    if (activeFilters[colKey]) {
      const newFilters = { ...filters };
      delete newFilters[colKey];
      setFilters(newFilters);
    }
  };

  const handleFilterChange = (colKey, value) => {
    setFilters({ ...filters, [colKey]: value });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(filteredData.map(row => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowId, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
  };

  const handleAddRow = () => {
    const row = { id: Date.now().toString() };
    columns.forEach(col => {
      if (col.type === 'number') {
        row[col.key] = null; // 允许为空
      } else if (col.type === 'select') {
        row[col.key] = '';
      } else {
        row[col.key] = '';
      }
    });
    setNewRow(row);
    setEditingRow(row);
  };

  const handleSaveRow = () => {
    if (editingRow) {
      const newData = editingRow.id && data.find(d => d.id === editingRow.id)
        ? data.map(d => d.id === editingRow.id ? editingRow : d)
        : [...data, editingRow];
      
      Storage.saveData(page.id, newData);
      setData(newData);
      setEditingRow(null);
      setNewRow({});
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setNewRow({});
  };

  const handleDeleteRow = (id) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      const newData = data.filter(d => d.id !== id);
      Storage.saveData(page.id, newData);
      setData(newData);
    }
  };

  const handleEditRow = (row) => {
    setEditingRow({ ...row });
  };

  const handleFieldChange = (field, value) => {
    setEditingRow({ ...editingRow, [field]: value });
  };

  const handleImageUpload = async (field, file) => {
    if (file) {
      try {
        const base64 = await imageUtils.fileToBase64(file);
        const compressed = await imageUtils.compressImage(base64);
        handleFieldChange(field, compressed);
      } catch (error) {
        alert('图片上传失败：' + error.message);
      }
    }
  };

  const handleUpdateColumns = (newColumns) => {
    const pageConfigs = Storage.getPageConfigs();
    const updatedConfigs = pageConfigs.map(p => 
      p.id === page.id ? { ...p, columns: newColumns } : p
    );
    Storage.savePageConfigs(updatedConfigs);
    setColumns(newColumns);
    setShowColumnEditor(false);
    
    const updatedPage = updatedConfigs.find(p => p.id === page.id);
    if (updatedPage) {
      setColumns(updatedPage.columns);
    }
  };

  const handleExport = (format) => {
    if (format === 'csv') {
      exportUtils.exportToCSV(data, columns, `${page.name}_${Date.now()}.csv`);
    } else if (format === 'json') {
      exportUtils.exportToJSON(data, `${page.name}_${Date.now()}.json`);
    }
  };

  const handleExportSelected = (format) => {
    if (selectedRows.size === 0) {
      alert('请先选择要导出的记录');
      return;
    }

    const selectedData = data.filter(row => selectedRows.has(row.id));
    
    if (format === 'csv') {
      exportUtils.exportToCSV(selectedData, columns, `${page.name}_selected_${Date.now()}.csv`);
    } else if (format === 'json') {
      exportUtils.exportToJSON(selectedData, `${page.name}_selected_${Date.now()}.json`);
    }
  };

  const handleImport = async (file) => {
    try {
      let importedData;
      
      if (file.name.endsWith('.csv')) {
        importedData = await importUtils.parseCSV(file);
      } else if (file.name.endsWith('.json')) {
        importedData = await importUtils.parseJSON(file);
      } else {
        alert('不支持的文件格式，请选择CSV或JSON文件');
        return;
      }

      // 智能映射：为每个导入的列找到最匹配的WEB列
      const columnMapping = {};
      importedData.headers.forEach(importHeader => {
        // 尝试精确匹配（列名或显示名称）
        let matchedCol = columns.find(col => 
          col.key === importHeader || col.label === importHeader
        );
        
        // 如果精确匹配失败，尝试模糊匹配
        if (!matchedCol) {
          matchedCol = columns.find(col => 
            col.key.toLowerCase().includes(importHeader.toLowerCase()) ||
            col.label.toLowerCase().includes(importHeader.toLowerCase()) ||
            importHeader.toLowerCase().includes(col.key.toLowerCase()) ||
            importHeader.toLowerCase().includes(col.label.toLowerCase())
          );
        }
        
        if (matchedCol) {
          columnMapping[importHeader] = matchedCol;
        }
      });

      // 将导入的数据映射到WEB列
      const mappedData = importedData.data.map((row, index) => {
        const newRow = { id: Date.now().toString() + '_import_' + index };
        columns.forEach(col => {
          // 查找映射的源列
          const sourceHeader = Object.keys(columnMapping).find(
            header => columnMapping[header].key === col.key
          );
          
          if (sourceHeader !== undefined && row[sourceHeader] !== undefined) {
            let value = row[sourceHeader];
            
            // 类型转换
            if (col.type === 'number') {
              value = value === '' || value === null || value === undefined 
                ? null 
                : parseFloat(value);
              if (isNaN(value)) value = null;
            } else if (col.type === 'select') {
              value = value || '';
            } else {
              value = value || '';
            }
            
            newRow[col.key] = value;
          } else {
            // 如果没有匹配的列，使用默认值
            if (col.type === 'number') {
              newRow[col.key] = null;
            } else {
              newRow[col.key] = '';
            }
          }
        });
        return newRow;
      });

      // 合并到现有数据
      const mergedData = [...data, ...mappedData];
      Storage.saveData(page.id, mergedData);
      setData(mergedData);
      setShowImportDialog(false);
      alert(`成功导入 ${mappedData.length} 条记录`);
    } catch (error) {
      alert('导入失败：' + error.message);
    }
  };

  const formatDisplayValue = (value, colType) => {
    if (colType === 'number') {
      if (value === null || value === undefined || value === '') {
        return 'NONE';
      }
      return value;
    }
    return value || '-';
  };

  // 列宽调整相关
  const handleColumnResizeStart = (colKey, e) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(colKey);
    const startX = e.clientX;
    const startWidth = columnWidths[colKey] || 150;
    let currentWidth = startWidth;

    const handleMouseMove = (e) => {
      const diff = e.clientX - startX;
      currentWidth = Math.max(50, startWidth + diff);
      setColumnWidths(prev => {
        const newWidths = { ...prev, [colKey]: currentWidth };
        return newWidths;
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setResizingColumn(null);
      // 保存列宽（使用当前计算的宽度）
      if (page) {
        setColumnWidths(prev => {
          const finalWidths = { ...prev, [colKey]: currentWidth };
          Storage.setItem(`columnWidths_${page.id}`, finalWidths);
          return finalWidths;
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getColumnWidth = (colKey) => {
    return columnWidths[colKey] || 'auto';
  };

  if (!page) {
    return <div className="empty-content">请选择一个数据界面</div>;
  }

  const isAdmin = user.role === 'admin';
  const allSelected = filteredData.length > 0 && selectedRows.size === filteredData.length;

  return (
    <div className="data-table-container">
      <div className="table-header">
        <h2>{page.name}</h2>
        <div className="table-actions">
          {isAdmin && (
            <>
              <button className="btn-secondary" onClick={() => setShowColumnEditor(true)}>
                编辑列
              </button>
              <button className="btn-secondary" onClick={() => setShowImportDialog(true)}>
                导入数据
              </button>
              <button className="btn-primary" onClick={handleAddRow}>
                添加记录
              </button>
            </>
          )}
          <button className="btn-secondary" onClick={() => handleExport('csv')}>
            导出CSV
          </button>
          <button className="btn-secondary" onClick={() => handleExport('json')}>
            导出JSON
          </button>
          {selectedRows.size > 0 && (
            <>
              <button className="btn-secondary" onClick={() => handleExportSelected('csv')}>
                导出选中(CSV)
              </button>
              <button className="btn-secondary" onClick={() => handleExportSelected('json')}>
                导出选中(JSON)
              </button>
            </>
          )}
        </div>
      </div>

      {columns.length === 0 ? (
        <div className="empty-table">
          {isAdmin ? (
            <p>请先编辑列定义</p>
          ) : (
            <p>该界面暂无列定义</p>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table" ref={tableRef}>
            <thead>
              <tr>
                <th className="select-column" style={{ width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                {columns.map((col) => (
                  <th 
                    key={col.key}
                    style={{ width: getColumnWidth(col.key) }}
                  >
                    <div className="th-content">
                      <span>{col.label}</span>
                      <button
                        className={`filter-toggle-btn ${activeFilters[col.key] ? 'active' : ''}`}
                        onClick={() => handleFilterToggle(col.key)}
                        title="筛选"
                      >
                        🔍
                      </button>
                      {isAdmin && (
                        <div
                          className="column-resizer"
                          onMouseDown={(e) => handleColumnResizeStart(col.key, e)}
                          title="拖拽调整列宽"
                        ></div>
                      )}
                    </div>
                  </th>
                ))}
                {isAdmin && <th style={{ width: '120px' }}>操作</th>}
              </tr>
              {Object.keys(activeFilters).some(key => activeFilters[key]) && (
                <tr className="filter-row">
                  <th></th>
                  {columns.map((col) => (
                    <th key={col.key} className="filter-cell">
                      {activeFilters[col.key] ? (
                        <input
                          type="text"
                          className="filter-input"
                          placeholder="筛选..."
                          value={filters[col.key] || ''}
                          onChange={(e) => handleFilterChange(col.key, e.target.value)}
                        />
                      ) : null}
                    </th>
                  ))}
                  {isAdmin && <th></th>}
                </tr>
              )}
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id}>
                  <td className="select-column">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.type === 'image' && row[col.key] ? (
                        <img
                          src={row[col.key]}
                          alt={col.label}
                          className="table-image"
                          onClick={() => window.open(row[col.key], '_blank')}
                        />
                      ) : (
                        <span>{formatDisplayValue(row[col.key], col.type)}</span>
                      )}
                    </td>
                  ))}
                  {isAdmin && (
                    <td className="action-cells">
                      <button
                        className="btn-small btn-edit"
                        onClick={() => handleEditRow(row)}
                      >
                        编辑
                      </button>
                      <button
                        className="btn-small btn-delete"
                        onClick={() => handleDeleteRow(row.id)}
                      >
                        删除
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={columns.length + (isAdmin ? 2 : 1)} className="empty-row">
                    {data.length === 0 ? '暂无数据' : '没有匹配的筛选结果'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingRow && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingRow.id && data.find(d => d.id === editingRow.id) ? '编辑记录' : '新增记录'}</h3>
            <div className="edit-form">
              {columns.map((col) => (
                <div key={col.key} className="form-group">
                  <label>
                    {col.label}
                    {col.description && (
                      <span className="help-icon" title={col.description}>
                        ?
                      </span>
                    )}
                  </label>
                  {col.type === 'image' ? (
                    <div className="image-upload-group">
                      {editingRow[col.key] && (
                        <img
                          src={editingRow[col.key]}
                          alt="预览"
                          className="image-preview"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(col.key, e.target.files[0])}
                      />
                    </div>
                  ) : col.type === 'number' ? (
                    <input
                      type="number"
                      value={editingRow[col.key] === null || editingRow[col.key] === undefined ? '' : editingRow[col.key]}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : parseFloat(e.target.value);
                        handleFieldChange(col.key, isNaN(value) ? null : value);
                      }}
                    />
                  ) : col.type === 'select' ? (
                    <select
                      value={editingRow[col.key] || ''}
                      onChange={(e) => handleFieldChange(col.key, e.target.value)}
                    >
                      <option value="">请选择</option>
                      {(col.options || '').split(',').map((option, idx) => {
                        const opt = option.trim();
                        return opt ? (
                          <option key={idx} value={opt}>{opt}</option>
                        ) : null;
                      })}
                    </select>
                  ) : col.type === 'textarea' ? (
                    <textarea
                      value={editingRow[col.key] || ''}
                      onChange={(e) => handleFieldChange(col.key, e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <input
                      type="text"
                      value={editingRow[col.key] || ''}
                      onChange={(e) => handleFieldChange(col.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
              <div className="form-actions">
                <button className="btn-primary" onClick={handleSaveRow}>
                  保存
                </button>
                <button className="btn-secondary" onClick={handleCancelEdit}>
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showColumnEditor && (
        <ColumnEditor
          columns={columns}
          onSave={handleUpdateColumns}
          onClose={() => setShowColumnEditor(false)}
        />
      )}

      {showImportDialog && (
        <div className="modal-overlay" onClick={() => setShowImportDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>导入数据</h3>
            <div className="import-form">
              <p>支持CSV和JSON格式的文件导入</p>
              <p className="import-hint">系统会自动识别并映射列，无需严格匹配列名</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImport(file);
                  }
                }}
                style={{ marginTop: '15px' }}
              />
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowImportDialog(false)}>
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
