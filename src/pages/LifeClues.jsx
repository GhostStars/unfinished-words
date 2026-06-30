import { useState, useEffect } from 'react';
import { getState } from '../utils/storage.js';
import { demoCase } from '../data/demoCase.js';

function LifeClues({ navigate }) {
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
              flexDirection: 'column',
              gap: 'var(--space-sm)',
            }}
          >
            <p className="brand-body" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
              {clue.content}
            </p>
          </div>
        ))}
      </div>

      <p
        className="brand-small"
        style={{
          textAlign: 'center',
          color: 'var(--text-tertiary)',
          padding: 'var(--space-sm) var(--space-md)',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        生命线索仅作为理解参考，最终以患者当下反馈为准
      </p>

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
