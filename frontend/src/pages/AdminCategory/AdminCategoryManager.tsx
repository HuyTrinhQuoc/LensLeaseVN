import React, { useState, useEffect } from 'react';
// Nhớ sửa lại đường dẫn trỏ đúng đến file chứa instance axios "api" của bạn
import api from '../../services/api';
import { Plus, Pencil, Trash2, Folder, Layers, X, Check } from 'lucide-react';

// 1. Định nghĩa Interface dữ liệu
export interface Category {
  id: string;
  name: string;
  description: string | null;
  _count?: {
    lens_listings: number;
  };
}

export const AdminCategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Hiển thị thông báo tạm thời rồi tự tắt
  const showToast = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // 2. Lấy danh sách danh mục qua Axios Instance
  const fetchCategories = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Axios tự động ghép nối với baseURL
      const res = await api.get<Category[]>('/categories'); 
      setCategories(res.data);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Không thể tải danh sách danh mục', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 3. Xử lý Thêm / Sửa danh mục
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!name.trim()) return showToast('Vui lòng nhập tên danh mục!', 'error');

    const payload = { name, description };
    try {
      if (editingId) {
        // Gọi API cập nhật
        await api.put(`/categories/${editingId}`, payload);
        showToast('Cập nhật danh mục thành công! ✨', 'success');
      } else {
        // Gọi API tạo mới
        await api.post('/categories', payload);
        showToast('Thêm danh mục mới thành công! 🎉', 'success');
      }
      handleCancelEdit();
      fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Thao tác thất bại!', 'error');
    }
  };

  // 4. Xóa danh mục
  const handleDelete = async (id: string, name: string): Promise<void> => {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${name}" không?`)) return;

    try {
      await api.delete(`/categories/${id}`);
      showToast('Xóa danh mục thành công!', 'success');
      fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Không thể xóa danh mục này!', 'error');
    }
  };

  const handleEditClick = (cat: Category): void => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
  };

  const handleCancelEdit = (): void => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  return (
    <div style={styles.container}>
      {/* Toast thông báo góc màn hình cực xịn */}
      {message && (
        <div style={{ ...styles.toast, backgroundColor: message.type === 'success' ? '#10b981' : '#ef4444' }}>
          {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tiêu đề trang */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconWrapper}>
            <Layers size={24} color="#4f46e5" />
          </div>
          <div>
            <h1 style={styles.title}>Quản Lý Danh Mục</h1>
            <p style={styles.subtitle}>Thêm, sửa, xóa và cấu hình các danh mục thiết bị trên hệ thống</p>
          </div>
        </div>
      </div>

      {/* Bố cục Grid chia đôi: Bên trái nhập liệu - Bên phải Danh sách */}
      <div style={styles.grid}>
        
        {/* THẺ FORM NHẬP LIỆU */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            {editingId ? 'Cập Nhật Danh Mục' : 'Tạo Danh Mục Mới'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tên danh mục <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                placeholder="Ví dụ: Máy ảnh Mirrorless, Ống kính Sony..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mô tả danh mục</label>
              <textarea
                placeholder="Nhập vài dòng mô tả ngắn về danh mục này..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...styles.input, height: '100px', resize: 'none' }}
              />
            </div>
            <div style={styles.btnGroup}>
              <button type="submit" style={editingId ? styles.btnUpdate : styles.btnSubmit}>
                <Plus size={18} />
                {editingId ? 'Cập nhật ngay' : 'Thêm mới'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} style={styles.btnCancel}>
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* THẺ BẢNG DANH SÁCH DANH MỤC */}
        <div style={{ ...styles.card, flex: 1.5 }}>
          <h3 style={styles.cardTitle}>Danh Sách Hiện Có ({categories.length})</h3>
          
          {isLoading ? (
            <div style={styles.loadingState}>Đang tải dữ liệu hệ thống...</div>
          ) : categories.length === 0 ? (
            <div style={styles.emptyState}>
              <Folder size={48} color="#94a3b8" />
              <p>Chưa có danh mục nào được tạo.</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '30%' }}>Tên danh mục</th>
                    <th style={styles.th}>Mô tả</th>
                    <th style={{ ...styles.th, textAlign: 'center', width: '15%' }}>Số thiết bị</th>
                    <th style={{ ...styles.th, textAlign: 'right', width: '20%' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.catName}>{cat.name}</span>
                      </td>
                      <td style={{ ...styles.td, color: '#64748b', fontSize: '14px' }}>
                        {cat.description || <em style={{ color: '#cbd5e1' }}>Chưa có mô tả</em>}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <span style={styles.badge}>
                          {cat._count?.lens_listings ?? 0} máy
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <button 
                          onClick={() => handleEditClick(cat)} 
                          title="Sửa danh mục"
                          style={styles.actionBtnEdit}
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id, cat.name)} 
                          title="Xóa danh mục"
                          style={styles.actionBtnDelete}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// 5. Hệ thống CSS-in-JS Style chuẩn Dashboard Hiện đại (Clean UI)
const styles = {
  container: {
    padding: '32px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconWrapper: {
    padding: '12px',
    backgroundColor: '#eef2ff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0 0',
  },
  grid: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap' as const,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
    border: '1px solid #e2e8f0',
    flex: 1,
    minWidth: '320px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
    marginTop: 0,
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f1f5f9',
  },
  formGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#334155',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  },
  btnGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  btnSubmit: {
    flex: 1,
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  btnUpdate: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  btnCancel: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#64748b',
    fontSize: '14px',
    cursor: 'pointer',
  },
  tableWrapper: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    textAlign: 'left' as const,
  },
  th: {
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
  },
  catName: {
    fontWeight: 600,
    color: '#1e293b',
    fontSize: '15px',
  },
  badge: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: 500,
    display: 'inline-block',
  },
  actionBtnEdit: {
    border: 'none',
    background: 'none',
    color: '#6366f1',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    marginRight: '8px',
    transition: 'background-color 0.2s',
  },
  actionBtnDelete: {
    border: 'none',
    background: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  loadingState: {
    textAlign: 'center' as const,
    padding: '40px 0',
    color: '#64748b',
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px 0',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
  },
  toast: {
    position: 'fixed' as const,
    top: '24px',
    right: '24px',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '10px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    zIndex: 1000,
    fontSize: '14px',
    fontWeight: 500,
    animation: 'slideIn 0.3s ease',
  }
};