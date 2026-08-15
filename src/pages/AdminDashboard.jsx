import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { slugify } from '../utils/helpers';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('lines');
  const [lines, setLines] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [slugPreview, setSlugPreview] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchLines = useCallback(async () => {
    try {
      const data = await api.getLines();
      setLines(data.lines || []);
    } catch (err) {
      setError('Failed to load lines');
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const data = await api.adminListReports(token);
      setReports(data.reports || []);
    } catch (err) {
      setError('Failed to load reports');
    }
  }, [token]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchLines(), fetchReports()]);
    setLoading(false);
  }, [fetchLines, fetchReports]);

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    loadAll();
  }, [token, navigate, loadAll]);

  const handleCreateLine = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || creating) return;
    const slug = slugify(newQuestion.trim());
    if (!slug) return;
    setCreating(true);
    try {
      await api.adminCreateLine(newQuestion.trim(), slug, token);
      setNewQuestion('');
      setSlugPreview('');
      await fetchLines();
    } catch (err) {
      alert('Failed to create line: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateLine = async (lineId, updates) => {
    try {
      await api.adminUpdateLine(lineId, updates, token);
      await fetchLines();
    } catch (err) {
      alert('Failed to update line: ' + err.message);
    }
  };

  const handleResolveReport = async (msgId, action) => {
    try {
      await api.adminResolveReport(msgId, action, token);
      await fetchReports();
    } catch (err) {
      alert('Failed to resolve report: ' + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const onQuestionChange = (val) => {
    setNewQuestion(val);
    setSlugPreview(slugify(val));
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  const reportCount = reports.filter((r) => !r.hidden).length;

  return (
    <div className="admin-dash">
      <div className="dash-header">
        <h1>Admin</h1>
        <button className="logout-btn" onClick={handleLogout}>Log out</button>
      </div>
      <div className="tabs">
        <button className={tab === 'lines' ? 'active' : ''} onClick={() => setTab('lines')}>
          Lines
        </button>
        <button className={tab === 'reports' ? 'active' : ''} onClick={() => setTab('reports')}>
          Reports {reportCount > 0 && <span className="badge">{reportCount}</span>}
        </button>
      </div>
      <div className="tab-panel">
        {tab === 'lines' ? (
          <div>
            <form className="new-line-form" onSubmit={handleCreateLine}>
              <label htmlFor="newQuestion">New question</label>
              <input id="newQuestion" type="text" placeholder="Type the question…" value={newQuestion} onChange={(e) => onQuestionChange(e.target.value)} disabled={creating} />
              <div className="form-row">
                <span className="slug-preview">/line/{slugPreview || '…'}</span>
                <button type="submit" className="btn-primary" disabled={!newQuestion.trim() || !slugPreview || creating}>
                  {creating ? 'Publishing…' : 'Publish line'}
                </button>
              </div>
            </form>
            <div className="lines-list">
              {lines.map((line) => (
                <div key={line.id} className="line-item">
                  <span className="line-q">{line.question}</span>
                  <span className="line-slug">/line/{line.slug}</span>
                  <span className="line-count">{line.message_count || 0} msgs</span>
                  <span className={`status-badge-admin ${line.status === 'live' ? 'live' : 'archived'}`}>
                    {line.status || 'live'}
                  </span>
                  <div className="actions">
                    <button onClick={() => handleUpdateLine(line.id, { status: 'live' })}>Set live</button>
                    <button onClick={() => handleUpdateLine(line.id, { status: 'archived' })}>Archive</button>
                    <button className="danger-btn" onClick={() => {
                      if (window.confirm('Delete this line?')) handleUpdateLine(line.id, { status: 'deleted' });
                    }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="reports-list">
              {reports.filter((r) => !r.hidden).length === 0 ? (
                <div className="empty-state">No reports right now.</div>
              ) : (
                reports.filter((r) => !r.hidden).map((r) => (
                  <div key={r.id} className="report-item">
                    <div className="report-line">Line: {r.line_question || 'Unknown'}</div>
                    <div className="report-text">{r.text}</div>
                    <div className="report-actions">
                      <button onClick={() => handleResolveReport(r.id, 'dismiss')}>Dismiss report</button>
                      <button className="hide-btn" onClick={() => handleResolveReport(r.id, 'hide')}>Hide message</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
