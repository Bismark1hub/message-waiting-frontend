import { useState } from 'react';
import { timeAgo } from '../utils/helpers';

export default function MessageCard({ message, line, onRelate, onReport, onShare }) {
  const [reported, setReported] = useState(false);

  const handleReportClick = () => {
    if (reported) return;
    onReport();
    setReported(true);
  };

  const ts = message.created_at ? new Date(message.created_at) : new Date();
  const relTime = timeAgo(ts);

  return (
    <div className="message-card">
      <div className="msg-text">{message.text}</div>
      <div className="msg-meta">
        <span className="timestamp">{relTime}</span>
        <div className="msg-actions">
          <button className="relate-btn" onClick={onRelate}>❤ {message.relate_count || 0}</button>
          <button className="share-img-btn" onClick={onShare}>🖼 Share</button>
          <button className="report-link" onClick={handleReportClick} disabled={reported}>
            {reported ? 'Reported' : 'Report'}
          </button>
          {reported && <span className="report-confirm">— thanks</span>}
        </div>
      </div>
    </div>
  );
}
