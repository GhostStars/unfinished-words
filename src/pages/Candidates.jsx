import { useState, useEffect } from 'react';
import { getState, setState } from '../utils/storage.js';
import { demoCase } from '../data/demoCase.js';
import PageHeader from '../components/PageHeader.jsx';

function Candidates({ navigate, goBack }) {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const state = getState();
    if (state?.candidates && state.candidates.length > 0) {
      setCandidates(state.candidates);
    } else {
      setCandidates(demoCase.candidates);
    }
  }, []);

  const persistCandidates = (next) => {
    setCandidates(next);
    const state = getState() || {};
    setState({ ...state, candidates: next });
  };

  const handleEdit = (id) => {
    const target = candidates.find((c) => c.id === id);
    if (!target) return;
    const newMeaning = window.prompt('编辑候选含义', target.meaning);
    if (newMeaning === null || newMeaning.trim() === '') return;
    const next = candidates.map((c) =>
      c.id === id ? { ...c, meaning: newMeaning.trim() } : c
    );
    persistCandidates(next);
  };

  const handleDelete = (id) => {
    if (!window.confirm('确定要删除这条候选含义吗？')) return;
    const next = candidates.filter((c) => c.id !== id);
    persistCandidates(next);
  };

  const handleDismiss = (id) => {
    const next = candidates.filter((c) => c.id !== id);
    persistCandidates(next);
  };

  const handleAdd = () => {
    const meaning = window.prompt('请输入新的候选含义');
    if (!meaning || meaning.trim() === '') return;
    const next = [
      ...candidates,
      { id: Date.now(), meaning: meaning.trim(), confidence: 0.5 },
    ];
    persistCandidates(next);
  };

  const confidenceLabel = (c) => {
    if (c >= 0.8) return '置信度：高';
    if (c >= 0.6) return '置信度：中高';
    if (c >= 0.4) return '置信度：中等';
    return '置信度：较低';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <PageHeader title="候选含义" onBack={goBack} />

      <div>
        <h2 className="brand-h2">可能含义</h2>
        <p className="brand-caption" style={{ marginTop: 'var(--space-xs)' }}>
          结合你提供的线索，这是TA可能想表达的意思
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {candidates.map((c) => (
          <div
            key={c.id}
            className="brand-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm)',
            }}
          >
            <h3 className="brand-h3" style={{ color: 'var(--text-primary)' }}>
              {c.meaning}
            </h3>
            <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
              依据：{confidenceLabel(c.confidence)}
            </p>
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                marginTop: 'var(--space-xs)',
              }}
            >
              <button
                className="brand-btn-outline"
                onClick={() => handleEdit(c.id)}
                style={{
                  minHeight: '48px',
                  padding: '0 var(--space-md)',
                  fontSize: 'var(--font-size-sm)',
                  flex: 1,
                }}
              >
                编辑
              </button>
              <button
                className="brand-btn-outline"
                onClick={() => handleDismiss(c.id)}
                style={{
                  minHeight: '48px',
                  padding: '0 var(--space-md)',
                  fontSize: 'var(--font-size-sm)',
                  flex: 1,
                }}
              >
                暂不考虑
              </button>
              <button
                className="brand-btn-danger"
                onClick={() => handleDelete(c.id)}
                style={{
                  minHeight: '48px',
                  padding: '0 var(--space-md)',
                  fontSize: 'var(--font-size-sm)',
                  flex: 1,
                }}
              >
                删除
              </button>
            </div>
          </div>
        ))}

        {candidates.length === 0 && (
          <div
            className="brand-card"
            style={{
              textAlign: 'center',
              padding: 'var(--space-xl) var(--space-md)',
            }}
          >
            <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
              暂无可选候选含义
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <button
          className="brand-btn-outline"
          onClick={handleAdd}
          style={{ width: '100%' }}
        >
          新增候选
        </button>

        <div
          className="brand-card"
          style={{
            background: 'var(--info-bg)',
            border: '1px solid var(--info)',
            textAlign: 'center',
          }}
        >
          <p className="brand-caption" style={{ color: 'var(--info)' }}>
            如果以上都不符合，可以选择&quot;不知道&quot;进入下一步继续探索
          </p>
        </div>

        <button
          className="brand-btn-primary"
          onClick={() => navigate('calibration')}
          style={{ width: '100%' }}
        >
          下一步
        </button>
      </div>
    </div>
  );
}

export default Candidates;
