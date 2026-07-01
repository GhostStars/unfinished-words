import { useState, useEffect } from 'react';
import { getState, setState } from '../utils/storage.js';

const SIGNALS = [
  {
    key: 'blink',
    label: '眨眼约定',
    rules: { yes: '眨眼一次', no: '眨眼两次', unknown: '无明显反应' },
  },
  {
    key: 'hand',
    label: '握手约定',
    rules: { yes: '轻握一次', no: '轻握两次', unknown: '无握动' },
  },
  {
    key: 'nod',
    label: '头部约定',
    rules: { yes: '头微微偏左', no: '头微微偏右', unknown: '无明显偏转' },
  },
];

const QUESTIONS = [
  '你能听到我说话吗？',
  '我是你的家人，对吗？',
  '我们现在在医院，对吗？',
];

function Calibration({ navigate }) {
  const [signal, setSignal] = useState('');

  useEffect(() => {
    const state = getState();
    if (state?.calibration?.signal) {
      setSignal(state.calibration.signal);
    }
  }, []);

  const saveCalibrationState = (partial) => {
    const state = getState() || {};
    const existing = state.calibration || {};
    setState({ ...state, calibration: { ...existing, ...partial } });
  };

  const current = SIGNALS.find((s) => s.key === signal);

  const handleSelect = (key) => {
    setSignal(key);
    saveCalibrationState({ signal: key });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* 标题 */}
      <div>
        <h2 className="brand-h2">确认本次反馈约定</h2>
        <p className="brand-caption" style={{ marginTop: 'var(--space-xs)' }}>
          选定一种患者能用的反馈信号，然后依次提问确认可辨识度
        </p>
      </div>

      {/* 约定方式卡片组 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <label className="brand-caption" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          约定方式
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {SIGNALS.map((s) => {
            const active = signal === s.key;
            return (
              <button
                key={s.key}
                onClick={() => handleSelect(s.key)}
                style={{
                  flex: 1,
                  minHeight: '56px',
                  borderRadius: 'var(--radius-md)',
                  border: active
                    ? '1.5px solid var(--primary-btn)'
                    : '1px solid var(--border-medium)',
                  background: active ? 'rgba(184, 149, 106, 0.08)' : 'rgba(255, 255, 255, 0.5)',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: 'inherit',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--space-sm)',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 约定详情 + 校准问题 */}
      {current && (
        <div
          className="brand-card"
          style={{
            background: 'var(--card-bg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
          }}
        >
          {/* 约定详情 */}
          <div
            style={{
              background: 'var(--info-bg)',
              border: '1px solid var(--info)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-sm) var(--space-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-xs)',
            }}
          >
            <p className="brand-caption" style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--info)' }}>
              本次约定
            </p>
            <p className="brand-body" style={{ fontSize: 'var(--font-size-sm)' }}>
              <strong>是：</strong>{current.rules.yes}
            </p>
            <p className="brand-body" style={{ fontSize: 'var(--font-size-sm)' }}>
              <strong>不是：</strong>{current.rules.no}
            </p>
            <p className="brand-body" style={{ fontSize: 'var(--font-size-sm)' }}>
              <strong>不确定：</strong>{current.rules.unknown}
            </p>
          </div>

          {/* 校准问题 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <p className="brand-caption" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)' }}>
              校准问题（请依次向患者提问并观察反馈）
            </p>
            {QUESTIONS.map((q, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span
                  className="brand-caption"
                  style={{
                    color: 'var(--text-tertiary)',
                    fontWeight: 'var(--font-weight-semibold)',
                    flexShrink: 0,
                    width: '20px',
                    textAlign: 'center',
                  }}
                >
                  {i + 1}
                </span>
                <p className="brand-body" style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>
                  {q}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 人工判断按钮 */}
      {current && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <button
            className="brand-btn-primary"
            onClick={() => {
              saveCalibrationState({ passed: true });
              navigate('questionChain');
            }}
            style={{ width: '100%' }}
          >
            反馈基本稳定，开始提问
          </button>
          <button
            className="brand-btn-outline"
            onClick={() => {
              saveCalibrationState({ passed: false });
              navigate('pauseGuess');
            }}
            style={{ width: '100%' }}
          >
            暂不适合继续，进入暂停记录
          </button>
        </div>
      )}
    </div>
  );
}

export default Calibration;
