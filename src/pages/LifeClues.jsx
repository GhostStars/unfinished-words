import { useState, useEffect } from 'react';
import { getState } from '../utils/storage.js';
import { demoCase } from '../data/demoCase.js';
import PageHeader from '../components/PageHeader.jsx';

const StarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color: 'var(--warning)', flexShrink: 0 }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

function LifeClues({ navigate, goBack }) {
  const [lifeClues, setLifeClues] = useState([]);

  useEffect(() => {
    const state = getState();
    if (state?.lifeClues && state.lifeClues.length > 0) {
      setLifeClues(state.lifeClues);
    } else {
      setLifeClues(demoCase.lifeClues);
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <PageHeader title="生命线索" onBack={goBack} />

      <div>
        <h2 className="brand-h2">生命线索</h2>
        <p className="brand-caption" style={{ marginTop: 'var(--space-xs)' }}>
          了解这些背景，也许能帮你更贴近TA想表达的
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {lifeClues.map((clue) => (
          <div
            key={clue.id}
            className="brand-card"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 'var(--space-sm)',
            }}
          >
            <StarIcon />
            <p className="brand-body" style={{ lineHeight: 'var(--line-height-relaxed)', flex: 1 }}>
              {clue.content}
            </p>
          </div>
        ))}
      </div>

      <div
        className="brand-card"
        style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <p className="brand-small" style={{ color: 'var(--text-tertiary)' }}>
          生命线索仅作为理解参考，最终以患者当下反馈为准
        </p>
      </div>

      <button
        className="brand-btn-primary"
        onClick={() => navigate('candidates')}
        style={{ width: '100%', marginTop: 'var(--space-md)' }}
      >
        下一步
      </button>
    </div>
  );
}

export default LifeClues;
