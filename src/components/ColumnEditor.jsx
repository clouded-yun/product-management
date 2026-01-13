import { useState } from 'react';
import '../styles/ColumnEditor.css';

export default function ColumnEditor({ columns: initialColumns, onSave, onClose }) {
  const [columns, setColumns] = useState(initialColumns || []);

  const handleAddColumn = () => {
    const newColumn = {
      key: `column_${Date.now()}`,
      label: '新列',
      type: 'text',
      description: '',
      options: '' // 用于选择类型的选项，用逗号分隔
    };
    setColumns([...columns, newColumn]);
  };

  const handleRemoveColumn = (index) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const handleMoveColumn = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === columns.length - 1) return;

    const newColumns = [...columns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
    setColumns(newColumns);
  };

  const handleSave = () => {
    onSave(columns);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content column-editor-modal" onClick={(e) => e.stopPropagation()}>
        <h3>编辑列定义</h3>
        <div className="column-list">
          {columns.map((col, index) => (
            <div key={index} className="column-item">
              <div className="column-order-controls">
                <button
                  className="btn-order"
                  onClick={() => handleMoveColumn(index, 'up')}
                  disabled={index === 0}
                  title="上移"
                >
                  ↑
                </button>
                <button
                  className="btn-order"
                  onClick={() => handleMoveColumn(index, 'down')}
                  disabled={index === columns.length - 1}
                  title="下移"
                >
                  ↓
                </button>
              </div>
              <div className="column-field">
                <label>列名（键）</label>
                <input
                  type="text"
                  value={col.key}
                  onChange={(e) => handleColumnChange(index, 'key', e.target.value)}
                  placeholder="唯一标识（英文）"
                />
              </div>
              <div className="column-field">
                <label>显示名称</label>
                <input
                  type="text"
                  value={col.label}
                  onChange={(e) => handleColumnChange(index, 'label', e.target.value)}
                  placeholder="列头显示的文字"
                />
              </div>
              <div className="column-field">
                <label>类型</label>
                <select
                  value={col.type}
                  onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                >
                  <option value="text">文本</option>
                  <option value="number">数字</option>
                  <option value="textarea">多行文本</option>
                  <option value="image">图片</option>
                  <option value="select">选择</option>
                </select>
              </div>
              {col.type === 'select' && (
                <div className="column-field column-field-full">
                  <label>选项（用逗号分隔）</label>
                  <input
                    type="text"
                    value={col.options || ''}
                    onChange={(e) => handleColumnChange(index, 'options', e.target.value)}
                    placeholder="例如：选项1,选项2,选项3"
                  />
                </div>
              )}
              <div className="column-field column-field-full">
                <label>说明（可选）</label>
                <input
                  type="text"
                  value={col.description || ''}
                  onChange={(e) => handleColumnChange(index, 'description', e.target.value)}
                  placeholder="用户输入时的提示说明"
                />
              </div>
              <button
                className="btn-small btn-delete"
                onClick={() => handleRemoveColumn(index)}
              >
                删除
              </button>
            </div>
          ))}
          {columns.length === 0 && (
            <div className="empty-columns">
              <p>暂无列定义，请添加列</p>
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={handleAddColumn}>
            添加列
          </button>
          <div>
            <button className="btn-primary" onClick={handleSave}>
              保存
            </button>
            <button className="btn-secondary" onClick={onClose}>
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
