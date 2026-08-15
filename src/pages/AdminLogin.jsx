import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function AdminLogin() {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passphrase.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.adminLogin(passphrase.trim());
      if (data.token) {
        login(data.token);
        navigate('/admin/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="card">
        <h2>Enter the booth</h2>
        <p className="sub">Admin access</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="password" placeholder="Passphrase" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} disabled={loading} autoFocus />
            <div className="error">{error}</div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Checking…' : 'Enter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
