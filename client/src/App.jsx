import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Products from './pages/Products';
import POS from './pages/POS';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import Categories from './pages/Categories';
import Expenses from './pages/Expenses';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Attendance from './pages/Attendance';
import './App.css';

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f5f5' }}>
      <Sidebar current={page} onNavigate={setPage} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {page === 'dashboard'  && <Dashboard />}
        {page === 'products'   && <Products />}
        {page === 'stock'      && <Stock />}
        {page === 'pos'        && <POS />}
        {page === 'categories' && <Categories />}
        {page === 'expenses'   && <Expenses />}
        {page === 'customers'  && <Customers />}
        {page === 'suppliers'  && <Suppliers />} 
        {page === 'attendance' && <Attendance />}
      </main>
    </div>
  );
}