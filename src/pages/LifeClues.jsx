import { useState, useEffect } from 'react';
import { getState, setState } from '../utils/storage.js';
import { demoCase } from '../data/demoCase.js';

const CLUE_TYPES = [
  '重要的人',
  '重要的地方',
  '最近反复提到的事',
  '当前身体状态',
  '家属观察到的动作/表情',
  '不确定但可能有关的线索',
];

const CERTAINTY_OPTIONS = ['较确定', '不太确定', '只是观察'];

const typeColor = {
  '重要的人': 'var(--primary-btn)',
  '重要的地方': 'var(--secondary-btn)',
  '最近反复提到的事': 'var(--warning)',
  '当前身体状态': 'var(--success)',
  '家属观察到的动作/表情': 'var(--info)',
  '不确定但可能有关的线索': 'var(--text-tertiary)',
};

const certaintyBadgeBg = {
  '较确定': 'rgba(125,166,126,0.15)',
  '不太确定': 'rgba(196,169,90,0.15)',
  '只是观察': 'rgba(122,155,184,0.15)',
};

const certaintyBadgeColor = {
  '较确定': 'var(--success)',
  '不太确定': 'var(--warning)',
  '只是观察': 'var(--info)',
};

/* Icons */
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

const IconChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
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

  const persist = (next) => {
    setLifeClues(next);
    const state = getState() || {};
    setState({ ...state, lifeClues: next });
  };

  const handleEditContent = (id) => {
    const clue = lifeClues.find((c) => c.id === id);
    if (!clue) return;
    const newContent = window.prompt('编辑生命线索内容', clue.content);
    if (newContent === null) return;
    const next = lifeClues.map((c) =>
      c.id === id ? { ...c, content: newContent.trim() || c.content } : c
    );
    persist(next);
  };

  const handleDelete = (id) => {
    if (!window.confirm('确定要删除这条生命线索吗？')) return;
    const next = lifeClues.filter((c) => c.id !== id);
    persist(next);
  };

  const handleChangeType = (id, newType) => {
    const next = lifeClues.map((c) =>
      c.id === id ? { ...c, type: newType } : c
    );
    persist(next);
  };

  const handleChangeCertainty = (id, newCert) => {
    const next = lifeClues.map((c) =>
      c.id === id ? { ...c, certainty: newCert } : c
    );
    persist(next);
  };

  const handleAdd = () => {
    const content = window.prompt('请输入新的生命线索内容');
    if (!content || content.trim() === '') return;
    const next = [
      ...lifeClues,
      {
        id: Date.now(),
        content: content.trim(),
        type: '不确定但可能有关的线索',
        certainty: '只是观察',
      },
    ];
    persist(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Top Navigation */}
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
          onClick={goBack}
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
          生命线索
        </span>
      </nav>

      {/* Subtitle */}
      <p className="brand-caption" style={{ marginBottom: 'var(--space-xs)' }}>
        以下是本次样例中的生命线索，你可以修改、删除或补充，让它更接近真实情况。
      </p>

      {/* Clue Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {lifeClues.map((clue) => (
          <div
            key={clue.id}
            className="brand-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm)',
              padding: 'var(--space-lg)',
            }}
          >
            {/* Type & Certainty row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <select
                value={clue.type}
                onChange={(e) => handleChangeType(clue.id, e.target.value)}
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: '#fff',
                  background: typeColor[clue.type] || 'var(--text-tertiary)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px 8px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {CLUE_TYPES.map((t) => (
                  <option key={t} value={t} style={{ color: '#333', background: '#fff' }}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={clue.certainty}
                onChange={(e) => handleChangeCertainty(clue.id, e.target.value)}
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: certaintyBadgeColor[clue.certainty],
                  background: certaintyBadgeBg[clue.certainty],
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px 8px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {CERTAINTY_OPTIONS.map((c) => (
                  <option key={c} value={c} style={{ color: '#333', background: '#fff' }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <p className="brand-body" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
              {clue.content}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
              <button
                onClick={() => handleEditContent(clue.id)}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-tertiary)',
                  padding: 'var(--space-xs) var(--space-sm)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'color var(--transition-fast), background var(--transition-fast)',
                  minHeight: '32px',
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
                onClick={() => handleDelete(clue.id)}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-tertiary)',
                  padding: 'var(--space-xs) var(--space-sm)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'color var(--transition-fast), background var(--transition-fast)',
                  minHeight: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--error)';
                  e.target.style.background = 'rgba(201,139,139,0.08)';
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

        {lifeClues.length === 0 && (
          <div
            className="brand-card"
            style={{ textAlign: 'center', padding: 'var(--space-xl) var(--space-md)' }}
          >
            <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
              暂无生命线索，点击下方按钮添加
            </p>
          </div>
        )}
      </div>

      {/* Add Button */}
      <div>
        <button
          onClick={handleAdd}
          type="button"
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
          新增线索
        </button>
      </div>

      {/* Disclaimer */}
      <div
        className="brand-card"
        style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <p className="brand-small" style={{ color: 'var(--text-tertiary)' }}>
          生命线索只作为理解参考，最终仍以患者当下稳定反馈为准。
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('candidates')}
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
  );
}

export default LifeClues;
