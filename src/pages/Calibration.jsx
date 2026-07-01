import { useState, useEffect } from 'react';
import { getState, setState } from '../utils/storage.js';

const SIGNALS = [
  {
    key: 'blink',
    label: '眨眼约定',
    rules: {
      yes: '眨眼一次',
      no: '眨眼两次',
      unknown: '无明显反应',
    },
  },
  {
    key: 'hand',
    label: '握手约定',
    rules: {
      yes: '轻握一次',
      no: '轻握两次',
      unknown: '无握动',
    },
  },
  {
    key: 'nod',
    label: '头部约定',
    rules: {
      yes: '头微微偏左',
      no: '头微微偏右',
      unknown: '无明显偏转',
    },
  },
];

const CALIBRATION_QUESTIONS = [
  { id: 1, text: '你能听到我说话吗？' },
  { id: 2, text: '我是你的家人，对吗？' },
  { id: 3, text: '我们现在在医院，对吗？' },
];

function Calibration({ navigate }) {
  const [signal, setSignal] = useState('');
  const [clarity, setClarity] = useState({});

  useEffect(() => {
    const state = getState();
    if (state?.calibration) {
      setSignal(state.calibration.signal || '');
      setClarity(state.calibration.clarity || {});
    }
  }, []);

  const saveCalibrationState = (partial) => {
    const state = getState() || {};
    const existing = state.calibration || {};
    setState({
      ...state,
      calibration: { ...existing, ...partial },
    });
  };

  const currentSignal = SIGNALS.find((s) => s.key === signal);

  const handleSelectSignal = (value) => {
    setSignal(value);
    setClarity({});
    saveCalibrationState({ signal: value, clarity: {} });
  };

  const handleClarity = (questionId, value) => {
    const next = { ...clarity, [questionId]: value };
    setClarity(next);
    saveCalibrationState({ clarity: next });
  };

  const allAnswered =
    signal !== '' && Object.keys(clarity).length === CALIBRATION_QUESTIONS.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* 标题 */}
      <div>
        <h2 className="brand-h2">确认本次反馈约定</h2>
        <p className="brand-caption" style={{ marginTop: 'var(--space-xs)' }}>
          先选定一种患者能用的反馈信号，然后用几个问题确认它的可辨识度
        </p>
      </div>

      {/* 选择约定方式 */}
      <div className="brand-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <label className="brand-caption" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          约定方式
        </label>
        <select
          value={signal}
          onChange={(e) => handleSelectSignal(e.target.value)}
          style={{
            width: '100%',
            minHeight: '48px',
            padding: '0 var(--space-md)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'rgba(255, 255, 255, 0.6)',
            fontFamily: 'inherit',
            fontSize: 'var(--font-size-sm)',
            color: signal ? 'var(--text-primary)' : 'var(--text-tertiary)',
            appearance: 'none',
            WebkitAppearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%239A9A9A' stroke-width='1.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
        >
          <option value="" disabled>
            请选择反馈约定...
          </option>
          {SIGNALS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* 约定详情卡片 */}
      {currentSignal && (
        <div
          className="brand-card"
          style={{
            background: 'var(--info-bg)',
            border: '1px solid var(--info)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
          }}
        >
          <p className="brand-caption" style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--info)' }}>
            本次反馈约定
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <p className="brand-body" style={{ fontSize: 'var(--font-size-sm)' }}>
              <strong>是：</strong>
              {currentSignal.rules.yes}
            </p>
            <p className="brand-body" style={{ fontSize: 'var(--font-size-sm)' }}>
              <strong>不是：</strong>
              {currentSignal.rules.no}
            </p>
            <p className="brand-body" style={{ fontSize: 'var(--font-size-sm)' }}>
              <strong>不确定：</strong>
              {currentSignal.rules.unknown}
            </p>
          </div>
        </div>
      )}

      {/* 校准问题 */}
      {currentSignal && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <p className="brand-caption" style={{ color: 'var(--text-secondary)' }}>
            请用选定的约定向患者依次提问，观察后判断反馈是否清楚
          </p>

          {CALIBRATION_QUESTIONS.map((q, index) => {
            const answered = clarity[q.id];

            return (
              <div
                key={q.id}
                className="brand-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                  <span
                    className="brand-caption"
                    style={{
                      color: 'var(--text-tertiary)',
                      fontWeight: 'var(--font-weight-semibold)',
                      flexShrink: 0,
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-full)',
                      background: answered
                        ? answered === 'clear'
                          ? 'var(--success-bg)'
                          : 'var(--warning-bg)'
                        : 'rgba(61, 61, 61, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  >
                    {index + 1}
                  </span>
                  <p className="brand-body" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
                    {q.text}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginLeft: '32px' }}>
                  {[
                    { key: 'clear', label: '反馈清楚', color: 'var(--success)', bgColor: 'var(--success-bg)' },
                    { key: 'unclear', label: '反馈不清楚', color: 'var(--warning)', bgColor: 'var(--warning-bg)' },
                  ].map((btn) => (
                    <button
                      key={btn.key}
                      onClick={() => handleClarity(q.id, btn.key)}
                      style={{
                        flex: 1,
                        minHeight: '40px',
                        borderRadius: 'var(--radius-sm)',
                        border: answered === btn.key
                          ? `1.5px solid ${btn.color}`
                          : '1px solid var(--border-medium)',
                        background: answered === btn.key ? btn.bgColor : 'rgba(255, 255, 255, 0.5)',
                        color: answered === btn.key ? btn.color : 'var(--text-secondary)',
                        fontFamily: 'inherit',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 人工判断按钮 */}
      {currentSignal && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {!allAnswered && (
            <p
              className="brand-small"
              style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}
            >
              请为全部 3 个问题做出判断后，再选择下方按钮
            </p>
          )}

          <button
            className="brand-btn-primary"
            disabled={!allAnswered}
            onClick={() => {
              saveCalibrationState({ passed: true });
              navigate('questionChain');
            }}
            style={{
              width: '100%',
              opacity: allAnswered ? 1 : 0.5,
              cursor: allAnswered ? 'pointer' : 'not-allowed',
            }}
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
