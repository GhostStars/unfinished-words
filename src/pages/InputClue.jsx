import { useState, useEffect } from 'react';
import { getState, setState } from '../utils/storage.js';
import { demoCase } from '../data/demoCase.js';

const DESC_HINT = '举例：反复眨眼，右手微微抬起指向门口';
const CTX_HINT = '举例：探访快结束了，看到家人准备离开';

function InputClue({ navigate }) {
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [image, setImage] = useState(null);
  const [descHint, setDescHint] = useState(true);
  const [ctxHint, setCtxHint] = useState(true);

  useEffect(() => {
    const state = getState();
    if (state?.inputClue) {
      const d = state.inputClue.description || '';
      const c = state.inputClue.context || '';
      const isDemoDesc = d === demoCase.inputClue.description;
      const isDemoCtx = c === demoCase.inputClue.context;
      const hasDesc = !isDemoDesc && d.trim().length > 0;
      const hasCtx = !isDemoCtx && c.trim().length > 0;
      setDescription(hasDesc ? d : DESC_HINT);
      setContext(hasCtx ? c : CTX_HINT);
      setImage(state.inputClue.image || null);
      setDescHint(!hasDesc);
      setCtxHint(!hasCtx);
    } else {
      setDescription(DESC_HINT);
      setContext(CTX_HINT);
      setDescHint(true);
      setCtxHint(true);
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
        description: descHint ? '' : description,
        context: ctxHint ? '' : context,
        image,
      },
    });
    navigate(nextPage);
  };

  const handleUseDemo = () => {
    setDescription(demoCase.inputClue.description);
    setContext(demoCase.inputClue.context);
    setImage(null);
    setDescHint(false);
    setCtxHint(false);
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

  const handleCtxFocus = () => {
    if (ctxHint) {
      setContext('');
      setCtxHint(false);
    }
  };

  const handleCtxBlur = () => {
    if (!context.trim()) {
      setContext(CTX_HINT);
      setCtxHint(true);
    }
  };

  const handleDescChange = (e) => {
    setDescription(e.target.value);
  };

  const handleCtxChange = (e) => {
    setContext(e.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <div>
        <h2 className="brand-h2">输入线索</h2>
        <p className="brand-caption" style={{ marginTop: 'var(--space-xs)' }}>
          描述你看到的，不用急着下结论
        </p>
      </div>

      <div className="brand-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <label className="brand-caption" htmlFor="description" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            观察到的行为
          </label>
          <textarea
            id="description"
            className="brand-body"
            value={description}
            onChange={handleDescChange}
            onFocus={handleDescFocus}
            onBlur={handleDescBlur}
            rows={4}
            style={{
              width: '100%',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'rgba(255, 255, 255, 0.6)',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '16px',
              lineHeight: 'inherit',
              color: descHint ? 'var(--text-tertiary)' : 'var(--text-primary)',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <label className="brand-caption" htmlFor="context" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            当时的情境（可选）
          </label>
          <textarea
            id="context"
            className="brand-body"
            value={context}
            onChange={handleCtxChange}
            onFocus={handleCtxFocus}
            onBlur={handleCtxBlur}
            rows={3}
            style={{
              width: '100%',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'rgba(255, 255, 255, 0.6)',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '16px',
              lineHeight: 'inherit',
              color: ctxHint ? 'var(--text-tertiary)' : 'var(--text-primary)',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <label className="brand-caption" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            现场照片（仅本地预览，不会上传）
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}
          />
          {image && (
            <div style={{ position: 'relative', marginTop: 'var(--space-sm)' }}>
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
                onClick={handleRemoveImage}
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
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <button
          className="brand-btn-outline"
          onClick={handleUseDemo}
          style={{ width: '100%' }}
        >
          使用示例体验
        </button>
        <button
          className="brand-btn-primary"
          onClick={() => saveAndGo('lifeClues')}
          style={{ width: '100%' }}
        >
          下一步
        </button>
      </div>
    </div>
  );
}

export default InputClue;
