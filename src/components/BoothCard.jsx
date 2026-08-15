import { Link } from 'react-router-dom';

export default function BoothCard({ line }) {
  const slug = line.slug || `line-${line.id}`;
  return (
    <Link to={`/line/${slug}`} className="booth-card">
      <div className="card-top">
        <span className="line-label">LINE {String(line.number || line.id).padStart(2, '0')}</span>
        <span className="status-badge">
          <span className="pulse-dot"></span> {line.viewers || 0}
        </span>
      </div>
      <div className="question-text">{line.question || 'Untitled'}</div>
      <div className="card-footer">
        <span>{line.message_count || 0} messages</span>
        <span className="pickup-link">pick up →</span>
      </div>
    </Link>
  );
}
