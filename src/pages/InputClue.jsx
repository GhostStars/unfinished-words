import { useState, useEffect, useRef } from 'react';
import { getState, setState } from '../utils/storage.js';
import { demoCase } from '../data/demoCase.js';

const DESC_HINT = '举例：反复眨眼，右手微微抬起指向门口';

function InputClue({ navigate }) {
  const [keyword, setKeyword] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [descHint, setDescHint] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const state = getState();
    if (state?.inputClue) {
      const k = state.inputClue.keyword || '';
      const d = state.inputClue.description || '';
      const isDemoDesc = d === demoCase.inputClue.description;
      const hasDesc = !isDemoDesc && d.trim().length > 0;
      setKeyword(k);
      setDescription(hasDesc ? d : DESC_HINT);
      setImage(state.inputClue.image || null);
      setDescHint(!hasDesc);
    } else {
      setKeyword('');
      setDescription(DESC_HINT);
      setImage(null);
      setDescHint(true);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const saveAndGo = (nextPage) => {
    const state = getState() || {};
    setState({
      ...state,
      inputClue: {
        keyword: keyword.trim(),
        description: descHint ? '' : description,
        image,
      },
    });
    navigate(nextPage);
  };

  const handleUseDemo = () => {
    setDescription(demoCase.inputClue.description);
    setImage(null);
    setDescHint(false);
  };

  const handleDescFocus = () => {
    if (descHint) {
      setDescription('');
      setDescHint(false);
    }
  };

  const handleDescBlur = () => {
    if (!description.trim()) {
      setDescription(DESC_HINT);
      setDescHint(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', minHeight: '100dvh' }}>
      {/* Top Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '12px 0 16px',
          minHeight: '44px',
        }}
      >
        <button
          onClick={() => navigate('home')}
          aria-label="返回首页"
          style={{
            position: 'absolute',
            left: '0',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-full, 9999px)',
            color: 'var(--text-secondary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.15s ease, background 0.15s ease',
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(61,61,61,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span
          style={{
            fontSize: 'var(--font-size-md, 18px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            color: 'var(--text-primary)',
            textAlign: 'center',
            padding: '0 44px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          输入线索
        </span>
      </div>

      {/* Page Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', paddingBottom: '32px' }}>
        {/* Upload Card */}
        <div
          role="button"
          tabIndex={0}
          aria-label="上传模糊字迹图片"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          style={{
            background: 'var(--card-bg-solid, #FAFAF7)',
            border: '2px dashed var(--border-medium)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-2xl) var(--space-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-sm)',
            minHeight: '140px',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-btn)';
            e.currentTarget.style.background = 'rgba(184,149,106,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-medium)';
            e.currentTarget.style.background = 'var(--card-bg-solid, #FAFAF7)';
          }}
        >
          {image ? (
            <div style={{ position: 'relative', width: '100%' }}>
              <img
                src={image}
                alt="预览"
                style={{
                  width: '100%',
                  maxHeight: '200px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="brand-btn-danger"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  minHeight: '32px',
                  padding: '0 var(--space-sm)',
                  fontSize: 'var(--font-size-xs)',
                }}
              >
                移除
              </button>
            </div>
          ) : (
            <>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                点击上传模糊字迹图片
              </span>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
