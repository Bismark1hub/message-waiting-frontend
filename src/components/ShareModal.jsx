import { useEffect, useRef, useState } from 'react';

export default function ShareModal({ message, line, onClose }) {
  const canvasRef = useRef(null);
  const [imageData, setImageData] = useState(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    const render = async () => {
      setRendering(true);
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = 1080,
          h = 1080;

        canvas.width = w;
        canvas.height = h;

        // Background
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#14181f');
        grad.addColorStop(1, '#1e2530');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Border accent
        ctx.strokeStyle = '#e8a33d';
        ctx.lineWidth = 6;
        ctx.strokeRect(30, 30, w - 60, h - 60);

        // Line label
        ctx.fillStyle = '#8b93a1';
        ctx.font = '400 28px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
          `LINE ${String(line?.number ?? '??').padStart(2, '0')} · MESSAGE WAITING`,
          70, 110
        );

        // Question (muted, smaller)
        ctx.fillStyle = '#8b93a1';
        ctx.font = '400 32px "Fraunces", serif';
        ctx.textAlign = 'left';
        const q = line?.question || 'Untitled';
        const qLines = wrapText(ctx, q, w - 140, 42);
        qLines.forEach((l, i) => {
          ctx.fillText(l, 70, 180 + i * 50);
        });

        // Message text (large, primary)
        ctx.fillStyle = '#f2ede3';
        ctx.font = '500 48px "Fraunces", serif';
        const msg = message?.text || '';
        const mLines = wrapText(ctx, msg, w - 140, 58);
        const startY = 320;
        mLines.forEach((l, i) => {
          ctx.fillText(l, 70, startY + i * 70);
        });

        // Footer: site URL
        ctx.fillStyle = '#5b6270';
        ctx.font = '400 22px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('messagewaiting.com', w / 2, h - 60);

        setImageData(canvas.toDataURL('image/png'));
      } catch (e) {
        console.warn('Share render error', e);
      } finally {
        setRendering(false);
      }
    };
    render();
  }, [message, line]);

  // helper: wrap text for canvas
  function wrapText(ctx, text, maxWidth, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const w of words) {
      const test = current ? current + ' ' + w : w;
      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = w;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  const handleDownload = () => {
    if (!imageData) return;
    const a = document.createElement('a');
    a.href = imageData;
    a.download = `message-${line?.slug || 'line'}.png`;
    a.click();
  };

  const handleShare = async () => {
    if (!imageData) return;
    try {
      const blob = await (await fetch(imageData)).blob();
      const file = new File([blob], `message-${line?.slug || 'line'}.png`, { type: 'image/png' });
      if (navigator.share) {
        await navigator.share({
          title: 'Message Waiting',
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch (e) {
      if (e.name !== 'AbortError') handleDownload();
    }
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share as image</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="share-preview-wrap">
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          {rendering && <div className="loading">Rendering…</div>}
        </div>
        <div className="share-actions">
          <button className="download-btn" onClick={handleDownload} disabled={!imageData}>
            Download image
          </button>
          <button className="share-btn" onClick={handleShare} disabled={!imageData}>
            {navigator.share ? 'Share' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
