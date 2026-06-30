import { useState, useEffect } from 'react';
import { getState, setState } from '../utils/storage.js';

const FEEDBACK_OPTIONS = [
  {
    value: 'blink',
    label: '眨眼一次 = 是，眨眼两次 = 不是，无反应 = 我不知道',
  },
  {
    value: 'hand',
    label: '握一次 = 是，握两次 = 不是，不动 = 我不知道',
  },
  {
    value: 'nod',
    label: '头偏左 = 是，头偏右 = 不是，不动 = 我不知道',
  },
];

const CALIBRATION_QUESTIONS = [
  { id: 1, text: '你能听到我说话吗？', expected: 'yes' },
  { id: 2, text: '我是你的家人，对吗？', expected: 'yes' },
  { id: 3, text: '我们现在在医院，对吗？', expected: 'yes' },
];

function Calibration({ navigate }) {
  const [feedbackMethod, setFeedbackMethod] = useState('');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null); // 'pass' | 'fail' | null

  useEffect(() => {
    const state = getState();
    if (state?.calibration) {
      setFeedbackMethod(state.calibration.feedbackMethod || '');
      if (state.calibration.answers) {
        setAnswers(state.calibration.answers);
      }
      if (state.calibration.result) {
        setResult(state.calibration.result);
      }
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

  const handleSelectMethod = (value) => {
    setFeedbackMethod(value);
    setResult(null);
    setAnswers({});
    saveCalibrationState({ feedbackMethod: value, answers: {}, result: null });
  };

  const handleAnswer = (questionId, answer) => {
    const next = { ...answers, [questionId]: answer };
    setAnswers(next);
    saveCalibrationState({ answers: next, result: null });

    // Check if all 3 questions are answered
    if (Object.keys(next).length === 3) {
      evaluateResult(next);
    }
  };

  const evaluateResult = (currentAnswers) => {
    let validCount = 0;
    let matchCount = 0;

    CALIBRATION_QUESTIONS.forEach((q) => {
      const answer = currentAnswers[q.id];
      if (answer && answer !== 'unknown') {
        validCount++;
        if (answer === q.expected) {
          matchCount++;
        }
      }
    });

    // Pass: at least 2 valid answers AND at least 2 match expected
    const passed = validCount >= 2 && matchCount >= 2;
    const outcome = passed ? 'pass' : 'fail';

    setResult(outcome);
    saveCalibrationState({ answers: currentAnswers, result: outcome });
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    saveCalibrationState({ answers: {}, result: null });
  };

  const handleNextPage = () => {
    if (result === 'pass') {
      navigate('questionChain');
    } else {
      navigate('pauseGuess');
    }
  };

  const allAnswered = Object.keys(answers).length === 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Header */}
      <div>
        <h2 className="brand-h2">确认患者的反馈方式</h2>
        <p className="brand-caption" style={{ marginTop: 'var(--space-xs)' }}>
          选择一种TA能使用的反馈信号，再用 3 个简单问题确认是否稳定
        </p>
      </div>

      {/* Feedback Method Selector */}
      <div className="brand-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <label className="brand-caption" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          反馈方式
        </label>
        <select
          value={feedbackMethod}
          onChange={(e) => handleSelectMethod(e.target.value)}
          style={{
            width: '100%',
            minHeight: '48px',
            padding: '0 var(--space-md)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'rgba(255, 255, 255, 0.6)',
            fontFamily: 'inherit',
            fontSize: '16px',
            color: feedbackMethod ? 'var(--text-primary)' : 'var(--text-tertiary)',
            appearance: 'none',
            WebkitAppearance: 'none',
            backgroundImage: feedbackMethod
              ? 'none'
              : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%239A9A9A' stroke-width='1.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
        >
          <option value="" disabled>
            请选择反馈方式...
          </option>
          {FEEDBACK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Calibration Questions */}
      {feedbackMethod && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <p className="brand-caption" style={{ color: 'var(--text-secondary)' }}>
            请用选定的方式依次提问，观察反馈后点选对应按钮
          </p>

          {CALIBRATION_QUESTIONS.map((q, index) => {
            const answered = answers[q.id];
            const isActive = result === null;
            const isDisabled = !isActive;

            return (
              <div
                key={q.id}
                className="brand-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)',
                  opacity: isDisabled ? 0.8 : 1,
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
                        ? answered === 'yes'
                          ? 'var(--success-bg)'
                          : answered === 'no'
                            ? 'var(--error-bg)'
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
                    { key: 'yes', label: '是', color: 'var(--success)', bgColor: 'var(--success-bg)' },
                    { key: 'no', label: '不是', color: 'var(--error)', bgColor: 'var(--error-bg)' },
                    { key: 'unknown', label: '我不知道', color: 'var(--warning)', bgColor: 'var(--warning-bg)' },
                  ].map((btn) => (
                    <button
                      key={btn.key}
                      onClick={() => handleAnswer(q.id, btn.key)}
                      disabled={isDisabled}
                      style={{
                        flex: 1,
                        minHeight: '48px',
                        borderRadius: 'var(--radius-sm)',
                        border: answered === btn.key
                          ? `1.5px solid ${btn.color}`
                          : '1px solid var(--border-medium)',
                        background: answered === btn.key ? btn.bgColor : 'rgba(255, 255, 255, 0.5)',
                        color: answered === btn.key ? btn.color : 'var(--text-secondary)',
                        fontFamily: 'inherit',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        cursor: isDisabled ? 'default' : 'pointer',
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

      {/* Result Banner */}
      {result === 'pass' && (
        <div
          className="brand-card"
          style={{
            background: 'var(--success-bg)',
            border: '1px solid var(--success)',
            textAlign: 'center',
          }}
        >
          <p className="brand-body" style={{ color: 'var(--success)', fontWeight: 'var(--font-weight-medium)' }}>
            校准通过，可以开始理解
          </p>
        </div>
      )}

      {result === 'fail' && (
        <div
          className="brand-card"
          style={{
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning)',
            textAlign: 'center',
          }}
        >
          <p className="brand-body" style={{ color: 'var(--warning)', fontWeight: 'var(--font-weight-medium)' }}>
            反馈不够稳定，建议暂停猜测
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {result && (
          <>
            <button
              className="brand-btn-primary"
              onClick={handleNextPage}
              style={{ width: '100%' }}
            >
              {result === 'pass' ? '开始理解' : '暂停并查看'}
            </button>
            <button
              className="brand-btn-outline"
              onClick={handleRetry}
              style={{ width: '100%' }}
            >
              重新校准
            </button>
          </>
        )}

        {!result && allAnswered && feedbackMethod && (
          <div
            className="brand-small"
            style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}
          >
            正在评估校准结果...
          </div>
        )}

        {!result && !allAnswered && feedbackMethod && (
          <p
            className="brand-small"
            style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}
          >
            请回答全部 3 个问题后查看结果
          </p>
        )}
      </div>
    </div>
  );
}

export default Calibration;
