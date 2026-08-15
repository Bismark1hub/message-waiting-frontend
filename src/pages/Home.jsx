import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import BoothCard from '../components/BoothCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

export default function Home() {
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getLines()
      .then((data) => {
        setLines(data.lines || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  const divider = (
    <svg className="header-divider" viewBox="0 0 1200 24" preserveAspectRatio="none">
      <path d="M0,12 C100,2 200,22 300,12 C400,2 500,22 600,12 C700,2 800,22 900,12 C1000,2 1100,22 1200,12" stroke="#e8a33d" strokeWidth="2" fill="none" opacity="0.5" />
    </svg>
  );

  return (
    <>
      <header className="app-header">
        <div className="eyebrow">Anonymous · Text only</div>
        <h1>Message Waiting</h1>
        <p className="subtitle">Every line is a question. Pick one up — there's always a message waiting.</p>
      </header>
      {divider}
      <div className="booth-grid">
        {lines.map((line) => (
          <BoothCard key={line.id} line={line} />
        ))}
      </div>
    </>
  );
}
