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
            borderRadius: '9999px',
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
            fontSize: '18px',
            fontWeight: 600,
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
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
            borderRadius: '20px',
            padding: '48px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
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
                  borderRadius: '12px',
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  minHeight: '32px',
                  padding: '0 12px',
                  fontSize: '12px',
                  color: '#fff',
                  background: '#E04A36',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
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
              <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                点击上传模糊字迹图片
              </span>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />

        {/* Keyword Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              paddingLeft: '2px',
            }}
            htmlFor="keyword-input"
          >
            可能含义
          </label>
          <input
            id="keyword-input"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="举例：北，北京"
            autoComplete="off"
            style={{
              width: '100%',
              minHeight: '48px',
              padding: '12px 16px',
              fontSize: '16px',
              fontFamily: 'inherit',
              color: 'var(--text-primary)',
              background: 'var(--card-bg-solid, #FAFAF7)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              outline: 'none',
              transition: 'box-shadow 0.15s ease',
              WebkitAppearance: 'none',
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 0 0 2px rgba(184,149,106,0.25)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
            }}
          />
        </div>

        {/* Description Textarea */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              paddingLeft: '2px',
            }}
            htmlFor="desc-input"
          >
            补充描述
          </label>
          <textarea
            id="desc-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={handleDescFocus}
            onBlur={handleDescBlur}
            rows={4}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px 16px',
              fontSize: '16px',
              fontFamily: 'inherit',
              color: descHint ? 'var(--text-tertiary)' : 'var(--text-primary)',
              background: 'var(--card-bg-solid, #FAFAF7)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              outline: 'none',
              resize: 'vertical',
              lineHeight: 1.7,
              transition: 'box-shadow 0.15s ease',
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 0 0 2px rgba(184,149,106,0.25)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
              handleDescBlur();
            }}
          />
        </div>

        {/* Hint Card */}
        <div
          style={{
            background: 'rgba(232,240,254,0.65)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: '#4A6FA5', flexShrink: 0, marginTop: '1px' }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            提示：尽量描述患者的状态，比如能否眨眼、手指能否活动、最近关注的方向等。
          </span>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
          <button
            onClick={() => saveAndGo('lifeClues')}
            style={{
              width: '100%',
              minHeight: '48px',
              padding: '0 16px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#fff',
              background: '#B8956A',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(184,149,106,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            下一步
          </button>
          <button
            onClick={handleUseDemo}
            style={{
              width: '100%',
              minHeight: '48px',
              fontSize: '16px',
              fontWeight: 500,
              color: 'var(--primary-btn)',
              background: 'transparent',
              border: '1px solid var(--primary-btn)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(184,149,106,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            使用示例体验
          </button>
          <button
            onClick={() => navigate('home')}
            style={{
              width: '100%',
              minHeight: '48px',
              fontSize: '16px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              background: 'transparent',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(61,61,61,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputClue;
