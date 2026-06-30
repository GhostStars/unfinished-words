import { useState, useEffect } from 'react';
import { getState, setState } from '../utils/storage.js';
import { demoCase } from '../data/demoCase.js';

function InputClue({ navigate }) {
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    const state = getState();
    if (state?.inputClue) {
      setDescription(state.inputClue.description || '');
      setContext(state.inputClue.context || '');
      setImage(state.inputClue.image || null);
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
        description,
        context,
        image,
      },
    });
    navigate(nextPage);
  };

  const handleUseDemo = () => {
    const state = getState() || {};
    setState({
      ...state,
      inputClue: {
        description: demoCase.inputClue.description,
        context: demoCase.inputClue.context,
        image: null,
      },
      lifeClues: demoCase.lifeClues,
      candidates: demoCase.candidates,
      calibration: demoCase.calibration,
      questionChain: demoCase.questionChain,
    });
    navigate('lifeClues');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <div>
        <h2 className="brand-h2">输入线索</h2>
        <p className="brand-caption" style={{ marginTop: 'var(--space-xs)' }}>
          请描述你观察到的事实，而不是猜测
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
            placeholder="例如：患者反复眨眼，右手微微抬起指向门口方向"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'rgba(255, 255, 255, 0.6)',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              color: 'inherit',
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
            placeholder="例如：探访时间临近结束，患者看到家属准备离开"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'rgba(255, 255, 255, 0.6)',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              color: 'inherit',
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
