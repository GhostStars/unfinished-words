import { useState, useEffect } from 'react';
import { getState, setState } from '../utils/storage.js';
import { demoCase } from '../data/demoCase.js';

/* Inline SVG icons matching the design spec */
const IconChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconInfo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const IconChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

function Candidates({ navigate }) {
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

  const handleAdd = () => {
    const meaning = window.prompt('请输入新的候选含义');
    if (!meaning || meaning.trim() === '') return;
    const next = [
      ...candidates,
      { id: Date.now(), meaning: meaning.trim(), confidence: 0.5 },
    ];
    persistCandidates(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* ===== Top Navigation ===== */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '8px 0 16px',
          minHeight: '44px',
        }}
      >
        <button
          onClick={() => navigate('lifeClues')}
          aria-label="返回上一页"
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-secondary)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'color var(--transition-fast), background var(--transition-fast)',
          }}
        >
          <IconChevronLeft />
        </button>
        <span
          className="brand-h3"
          style={{
            textAlign: 'center',
            padding: '0 44px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          可能含义
        </span>
      </nav>

      {/* ===== Page Content ===== */}
      <div>
        {/* Subtitle */}
        <p className="brand-caption" style={{ marginBottom: 'var(--space-lg)' }}>
          系统根据线索生成了以下候选含义
        </p>

        {/* Candidate Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {candidates.map((c, index) => (
            <div
              key={c.id}
              className="brand-card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-md)',
                padding: 'var(--space-lg)',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
              }}
            >
              {/* Badge */}
              <span
                style={{
                  flexShrink: 0,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--primary-btn)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  lineHeight: 1,
                }}
              >
                {index + 1}
              </span>

              {/* Content */}
              <span
                className="brand-body"
                style={{
                  flex: 1,
                  paddingTop: '4px',
                  lineHeight: 'var(--line-height-relaxed)',
                }}
              >
                {c.meaning}
              </span>

              {/* Actions */}
              <div
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  gap: 'var(--space-sm)',
                  marginLeft: 'auto',
                }}
              >
                <button
                  onClick={() => handleEdit(c.id)}
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-tertiary)',
                    textDecoration: 'none',
                    padding: 'var(--space-xs) var(--space-sm)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'color var(--transition-fast), background var(--transition-fast)',
                    minHeight: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--text-secondary)';
                    e.target.style.background = 'rgba(61,61,61,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--text-tertiary)';
                    e.target.style.background = 'transparent';
                  }}
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-tertiary)',
                    textDecoration: 'none',
                    padding: 'var(--space-xs) var(--space-sm)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'color var(--transition-fast), background var(--transition-fast)',
                    minHeight: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--text-secondary)';
                    e.target.style.background = 'rgba(61,61,61,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--text-tertiary)';
                    e.target.style.background = 'transparent';
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

        {/* Add Candidate Button */}
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <button
            onClick={handleAdd}
            type="button"
            aria-label="新增候选"
            style={{
              width: '100%',
              minHeight: '48px',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-medium)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-sm)',
              transition: 'background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(61,61,61,0.04)';
              e.currentTarget.style.borderColor = 'var(--primary-btn)';
              e.currentTarget.style.color = 'var(--primary-btn)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-medium)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <IconPlus />
            新增候选
          </button>
        </div>

        {/* Hint Card */}
        <div
          className="brand-card"
          style={{
            marginTop: 'var(--space-xl)',
            background: 'var(--info-bg)',
            display: 'flex',
            gap: 'var(--space-md)',
            alignItems: 'flex-start',
            padding: 'var(--space-lg)',
          }}
        >
          <span style={{ flexShrink: 0, width: '20px', height: '20px', color: 'var(--info)', marginTop: '1px' }}>
            <IconInfo />
          </span>
          <p className="brand-caption" style={{ color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
            当前还无法直接判断患者具体含义，需要通过简单问题进一步靠近。
          </p>
        </div>

        {/* CTA: Next Step */}
        <div style={{ marginTop: 'var(--space-2xl)' }}>
          <button
            onClick={() => navigate('calibration')}
            type="button"
            style={{
              width: '100%',
              minHeight: '52px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-btn)',
              color: '#fff',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-medium)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-sm)',
              transition: 'background var(--transition-fast), transform var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-btn-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary-btn)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.97)';
              e.currentTarget.style.background = 'var(--primary-btn-active)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'var(--primary-btn-hover)';
            }}
          >
            下一步
            <IconChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Candidates;
