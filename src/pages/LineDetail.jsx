import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import MessageCard from '../components/MessageCard';
import ShareModal from '../components/ShareModal';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

export default function LineDetail() {
  const { slug } = useParams();
  const [line, setLine] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newText, setNewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [shareMessage, setShareMessage] = useState(null);
  const [urlCopied, setUrlCopied] = useState(false);

  const fetchLine = useCallback(async (p = 1, append = false) => {
    try {
      const data = await api.getLine(slug, p, 20);
      if (p === 1) {
        setLine(data.line);
        setMessages(data.messages || []);
      } else {
        setMessages((prev) => [...prev, ...(data.messages || [])]);
      }
      setHasMore(data.has_more || false);
      setPage(p);
      setLoading(false);
      setError(null);
    } catch (err) {
      if (err.message === 'not-found') {
        setError('not-found');
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    fetchLine(1, false);
  }, [slug, fetchLine]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newText.trim() || submitting || !line) return;
    setSubmitting(true);
    try {
      const res = await api.postMessage(line.id, newText.trim());
      const newMsg = {
        id: res.message_id || Date.now(),
        text: newText.trim(),
        created_at: new Date().toISOString(),
        relate_count: 0,
        reported: false,
      };
      setMessages((prev) => [newMsg, ...prev]);
      setNewText('');
      setLine((prev) => prev ? { ...prev, message_count: (prev.message_count || 0) + 1 } : prev);
    } catch (err) {
      alert('Failed to post message: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRelate = async (msgId, idx) => {
    try {
      await api.relateMessage(msgId);
      setMessages((prev) =>
        prev.map((m, i) => i === idx ? { ...m, relate_count: (m.relate_count || 0) + 1 } : m)
      );
    } catch (err) {
      alert('Failed to relate: ' + err.message);
    }
  };

  const handleReport = async (msgId, idx) => {
    try {
      await api.reportMessage(msgId);
      setMessages((prev) =>
        prev.map((m, i) => i === idx ? { ...m, reported: true } : m)
      );
    } catch (err) {
      alert('Failed to report: ' + err.message);
    }
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    fetchLine(page + 1, true);
  };

  const sortedMessages = useMemo(() => {
    const copy = [...messages];
    if (sortOrder === 'newest') {
      copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      copy.sort((a, b) => (b.relate_count || 0) - (a.relate_count || 0));
    }
    return copy;
  }, [messages, sortOrder]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    }).catch(() => {
      const el = document.createElement('input');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    });
  };

  if (loading && !line) return <Loader />;
  if (error === 'not-found') {
    return (
      <div>
        <Link to="/" className="back-link">← Back to home</Link>
        <div className="error-msg">
          This line doesn't exist. <br />
          <Link to="/" style={{ color: '#e8a33d' }}>Go home</Link>
        </div>
      </div>
    );
  }
  if (error) return <ErrorMessage message={error} />;
  if (!line) return null;

  return (
    <>
      <Link to="/" className="back-link">← Back</Link>
      <div className="line-header">
        <div className="line-number">LINE {String(line.number || line.id).padStart(2, '0')}</div>
        <div className="line-question">{line.question}</div>
        <div className="line-pickup-count">{line.message_count || 0} people have picked up this line</div>
      </div>
      <div className="share-row">
        <span className="url-display">{shareUrl}</span>
        <button className={`copy-btn ${urlCopied ? 'copied' : ''}`} onClick={handleCopyUrl}>
          {urlCopied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
      <form className="composer" onSubmit={handleSubmit}>
        <textarea placeholder="Leave an anonymous message…" maxLength={400} value={newText} onChange={(e) => setNewText(e.target.value)} disabled={submitting} />
        <div className="composer-actions">
          <span className={`char-count ${newText.length > 350 ? 'warning' : ''} ${newText.length > 380 ? 'danger' : ''}`}>
            {newText.length}/400
          </span>
          <button type="submit" className="btn-primary" disabled={!newText.trim() || submitting}>
            {submitting ? 'Sending…' : 'Leave message'}
          </button>
        </div>
      </form>
      <div className="feed-controls">
        <span className="count-label">{messages.length} messages</span>
        <div className="sort-toggle">
          <button className={sortOrder === 'newest' ? 'active' : ''} onClick={() => setSortOrder('newest')}>Newest</button>
          <button className={sortOrder === 'related' ? 'active' : ''} onClick={() => setSortOrder('related')}>Most related</button>
        </div>
      </div>
      <div className="feed">
        {sortedMessages.map((msg, idx) => {
          const realIdx = messages.findIndex((m) => m.id === msg.id);
          return (
            <MessageCard
              key={msg.id || idx}
              message={msg}
              line={line}
              onRelate={() => handleRelate(msg.id, realIdx)}
              onReport={() => handleReport(msg.id, realIdx)}
              onShare={() => setShareMessage({ message: msg, line })}
            />
          );
        })}
      </div>
      {hasMore && (
        <div className="load-more-wrap">
          <button className="btn-secondary" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
      {shareMessage && <ShareModal {...shareMessage} onClose={() => setShareMessage(null)} />}
    </>
  );
}
