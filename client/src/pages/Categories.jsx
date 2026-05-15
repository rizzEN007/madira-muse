import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categoryApi';
import CategoryForm from '../components/CategoryForm';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);
  const [loading, setLoading]       = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateCategory(editing._id, data);
      } else {
        await createCategory(data);
      }
      setShowForm(false);
      setEditing(null);
      fetchCategories();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      alert('Error deleting category.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>Categories</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} style={{
          background: '#e94560', color: '#fff', border: 'none',
          padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
        }}>
          + Add Category
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : categories.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '10px', padding: '3rem', textAlign: 'center', color: '#888' }}>
          No categories yet. Add your first one.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
          <thead style={{ background: '#1a1a2e', color: '#fff' }}>
            <tr>
              {['Name', 'Description', 'Created', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '13px', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem 1rem', fontSize: '14px', fontWeight: 500 }}>{cat.name}</td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '13px', color: '#666' }}>{cat.description || '—'}</td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '13px', color: '#666' }}>
                  {new Date(cat.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <button onClick={() => handleEdit(cat)} style={{
                    marginRight: '8px', padding: '4px 12px', fontSize: '12px',
                    border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: '#fff'
                  }}>Edit</button>
                  <button onClick={() => handleDelete(cat._id)} style={{
                    padding: '4px 12px', fontSize: '12px',
                    border: '1px solid #e94560', borderRadius: '4px',
                    cursor: 'pointer', background: '#fff', color: '#e94560'
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <CategoryForm
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}