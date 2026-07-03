import { useState, useEffect } from 'react';
import { getState, setState } from '../utils/storage.js';
import { demoCase } from '../data/demoCase.js';
import PageHeader from '../components/PageHeader.jsx';

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

const DEFAULT_TYPE = '不确定但可能有关的线索';
const DEFAULT_CERTAINTY = '只是观察';

function LifeClues({ navigate, goBack, navigateData }) {
  const [lifeClues, setLifeClues] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formContent, setFormContent] = useState('');
  const [formType, setFormType] = useState(DEFAULT_TYPE);
  const [formCertainty, setFormCertainty] = useState(DEFAULT_CERTAINTY);

  const isFromHome = navigateData?.from === 'home';

  useEffect(() => {
    const state = getState();
    if (state?.lifeClues && state.lifeClues.length > 0) {
      setLifeClues(state.lifeClues);
    } else {
      setLifeClues(demoCase.lifeClues);
      const s = getState() || {};
      setState({ ...s, lifeClues: demoCase.lifeClues });
    }
  }, []);

  const persist = (next) => {
    setLifeClues(next);
    const state = getState() || {};
    setState({ ...state, lifeClues: next });
  };

  const resetForm = () => {
    setFormContent('');
    setFormType(DEFAULT_TYPE);
    setFormCertainty(DEFAULT_CERTAINTY);
    setEditingId(null);
    setIsAdding(false);
  };

  const startEdit = (clue) => {
    setFormContent(clue.content);
    setFormType(clue.type);
    setFormCertainty(clue.certainty);
    setEditingId(clue.id);
    setIsAdding(false);
  };

  const startAdd = () => {
    setFormContent('');
    setFormType(DEFAULT_TYPE);
    setFormCertainty(DEFAULT_CERTAINTY);
    setIsAdding(true);
    setEditingId(null);
  };

  const handleSave = () => {
    const trimmed = formContent.trim();
    if (!trimmed) return;

    if (isAdding) {
      const next = [
        ...lifeClues,
        { id: Date.now(), content: trimmed, type: formType, certainty: formCertainty },
      ];
      persist(next);
    } else if (editingId) {
      const next = lifeClues.map((c) =>
        c.id === editingId
          ? { ...c, content: trimmed, type: formType, certainty: formCertainty }
          : c
      );
      persist(next);
    }
    resetForm();
  };

  const handleDelete = (id) => {
    if (!window.confirm('确定要删除这条生命线索吗？')) return;
    const next = lifeClues.filter((c) => c.id !== id);
    persist(next);
    if (editingId === id) resetForm();
  };

  /* Reusable form UI */
  const renderForm = () => (
    <div
      className="brand-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
        padding: 'var(--space-lg)',
        background: 'rgba(250,250,247,0.8)',
        border: '1px solid var(--border-light)',
      }}
    >
      {/* Content input */}
      <textarea
        value={formContent}
        onChange={(e) => setFormContent(e.target.value)}
        placeholder="请输入生命线索内容"
        rows={3}
        autoFocus
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: 'var(--font-size-base)',
          fontFamily: 'inherit',
          color: 'var(--text-primary)',
          background: '#fff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          resize: 'vertical',
          lineHeight: 'var(--line-height-relaxed)',
          transition: 'box-shadow var(--transition-fast), border-color var(--transition-fast)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--primary-btn)';
          e.target.style.boxShadow = '0 0 0 2px rgba(184,149,106,0.2)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border-light)';
          e.target.style.boxShadow = 'none';
        }}
      />

      {/* Type & Certainty selectors */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '140px' }}>
          <span className="brand-caption" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
            类型
          </span>
          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'inherit',
              color: 'var(--text-primary)',
              background: '#fff',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {CLUE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '140px' }}>
          <span className="brand-caption" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
            确定性
          </span>
          <select
            value={formCertainty}
            onChange={(e) => setFormCertainty(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'inherit',
              color: 'var(--text-primary)',
              background: '#fff',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {CERTAINTY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
        <button
          onClick={resetForm}
          style={{
            minHeight: '36px',
            padding: '0 var(--space-md)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            background: 'transparent',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'background var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(61,61,61,0.04)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
          }}
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={!formContent.trim()}
          style={{
            minHeight: '36px',
            padding: '0 var(--space-md)',
            fontSize: 'var(--font-size-sm)',
            color: '#fff',
            background: formContent.trim() ? 'var(--primary-btn)' : 'var(--border-medium)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: formContent.trim() ? 'pointer' : 'not-allowed',
            transition: 'background var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            if (formContent.trim()) e.target.style.background = 'var(--primary-btn-hover)';
          }}
          onMouseLeave={(e) => {
            if (formContent.trim()) e.target.style.background = 'var(--primary-btn)';
          }}
        >
          保存
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <PageHeader title="生命线索" onBack={goBack} />

      {/* Intro */}
      <p className="brand-body" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
        生命线索是患者一生留下的痕迹——最挂念的人、最熟悉的地方、反复提起的心愿、近期的身体变化。它们不会替患者说话，但能帮我们在猜测时，离患者的心意更近一些。
      </p>

      {/* Subtitle */}
      <p className="brand-caption" style={{ marginBottom: 'var(--space-xs)' }}>
        以下是本次样例中的生命线索，你可以修改、删除或补充，让它更接近真实情况。
      </p>

      {/* Clue Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {lifeClues.map((clue) => {
          const isEditing = editingId === clue.id;
          if (isEditing) return renderForm();

          return (
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
              {/* Type & Certainty badges (static, read-only) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: '#fff',
                    background: typeColor[clue.type] || 'var(--text-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 10px',
                    lineHeight: 1.6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {clue.type}
                </span>
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: certaintyBadgeColor[clue.certainty],
                    background: certaintyBadgeBg[clue.certainty],
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 10px',
                    lineHeight: 1.6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {clue.certainty}
                </span>
              </div>

              {/* Content */}
              <p className="brand-body" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
                {clue.content}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
                <button
                  onClick={() => startEdit(clue)}
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
          );
        })}

        {/* Add form */}
        {isAdding && renderForm()}

        {lifeClues.length === 0 && !isAdding && (
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
      {!isAdding && !editingId && (
        <div>
          <button
            onClick={startAdd}
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
      )}

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

      {/* CTA — hidden when coming from home */}
      {!isFromHome && (
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
      )}
    </div>
  );
}

export default LifeClues;
