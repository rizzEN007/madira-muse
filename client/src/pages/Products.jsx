import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/productApi';
import ProductForm from '../components/ProductForm';

export default function Products() {
  const [products, setProducts]   = useState([]);
  const [search, setSearch]       = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [loading, setLoading]     = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateProduct(editing._id, data);
      } else {
        await createProduct(data);
      }
      setShowForm(false);
      setEditing(null);
      fetchProducts();
    } catch (err) {
      alert('Error saving product: ' + err.response?.data?.error);
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product?')) return;
    await deleteProduct(id);
    fetchProducts();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>Inventory</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} style={{
          background: '#e94560', color: '#fff', border: 'none',
          padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
        }}>
          + Add Product
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name or SKU..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '0.6rem 1rem', marginBottom: '1rem',
          border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px',
          boxSizing: 'border-box'
        }}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
          <thead style={{ background: '#1a1a2e', color: '#fff' }}>
            <tr>
              {['Name', 'SKU', 'Category', 'Stock', 'Selling Price', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '13px', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No products found</td></tr>
            ) : filtered.map((p, i) => (
              <tr key={p._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem 1rem', fontSize: '14px' }}>{p.name}</td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '13px', color: '#666' }}>{p.sku}</td>
               <td style={{ padding: '0.75rem 1rem', fontSize: '13px' }}>{p.category?.name || '—'}</td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '14px' }}>
                  <span style={{
                    color: p.stockQty <= p.lowStockThreshold ? '#e94560' : '#333',
                    fontWeight: p.stockQty <= p.lowStockThreshold ? 600 : 400
                  }}>
                    {p.stockQty}
                    {p.stockQty <= p.lowStockThreshold && ' ⚠'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '14px' }}>Rs. {p.sellingPrice}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{
                    background: p.isActive ? '#e6f4ea' : '#fce8e8',
                    color: p.isActive ? '#2d6a4f' : '#c0392b',
                    padding: '2px 10px', borderRadius: '20px', fontSize: '12px'
                  }}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <button onClick={() => handleEdit(p)} style={{
                    marginRight: '8px', padding: '4px 12px', fontSize: '12px',
                    border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: '#fff'
                  }}>Edit</button>
                  <button onClick={() => handleDelete(p._id)} style={{
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
        <ProductForm
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}