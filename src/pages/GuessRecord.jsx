import { useState, useEffect } from 'react';
import { getState, archiveCurrentSession } from '../utils/storage.js';
import PageHeader from '../components/PageHeader.jsx';

const DEFAULT_FEEDBACK_MAP = {
  yes: '眨眼一次',
  no: '眨眼两次',
  unknown: '无明显反应',
};

function GuessRecord({ navigate, goBack }) {
  const [state, setState] = useState(null);
  const [feedbackMethodMap, setFeedbackMethodMap] = useState(null);

  useEffect(() => {
    const s = getState();
    setState(s);
    const cal = s?.calibration;
    if (cal?.feedbackMethodMap) {
      setFeedbackMethodMap(cal.feedbackMethodMap);
    }
  }, []);

  const handleContinueLater = () => {
    navigate('home');
  };

  const handleEndAndSave = () => {
    archiveCurrentSession('paused');
    navigate('home');
  };

  if (!state) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <PageHeader title="猜测记录" onBack={goBack} />
        <h2 className="brand-h2">当前猜测记录</h2>
        <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
          暂无记录
        </p>
      </div>
    );
  }

  const inputClue = state?.inputClue;
  const candidates = state?.candidates || [];
  const progress = state?.questionChainProgress;
  const feedbackLog = progress?.feedbackLog || [];
  const calibration = state?.calibration;

  const getFeedbackLabel = (key) => {
    const map = feedbackMethodMap || DEFAULT_FEEDBACK_MAP;
    return map[key] || DEFAULT_FEEDBACK_MAP[key];
  };

  const getStatusLabel = () => {
    if (calibration?.result === 'fail') return '反馈暂不稳定';
    if (progress?.consecutiveUnknown >= 3) return '连续多次无法确认';
    if (progress?.roundCount >= 8) return '已达最大尝试轮次';
    return '主动暂停猜测';
  };

  const getAnswerLabel = (answer) => {
    if (answer === 'yes') return '是';
    if (answer === 'no') return '不是';
    if (answer === 'unknown') return '不知道';
    if (answer === 'pause') return '暂停';
    return answer;
  };

  const getAnswerColor = (answer) => {
    if (answer === 'yes') return 'var(--success)';
    if (answer === 'no') return 'var(--error)';
    return 'var(--warning)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <PageHeader title="猜测记录" onBack={goBack} />

      <div>
        <h2 className="brand-h2">当前猜测记录</h2>
      </div>

      <div
        className="brand-card"
        style={{
          background: 'var(--warning-bg)',
          border: '1px solid var(--warning)',
          textAlign: 'center',
        }}
      >
        <p
          className="brand-caption"
          style={{ color: 'var(--warning)', fontWeight: 'var(--font-weight-medium)' }}
        >
          {getStatusLabel()}
        </p>
      </div>

      {/* 本次反馈约定 */}
      <div className="brand-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <h3 className="brand-h3">本次反馈约定</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span
              className="brand-small"
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--success)',
                flexShrink: 0,
              }}
            />
            <span className="brand-caption" style={{ color: 'var(--text-secondary)' }}>
              是：{getFeedbackLabel('yes')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span
              className="brand-small"
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--error)',
                flexShrink: 0,
              }}
            />
            <span className="brand-caption" style={{ color: 'var(--text-secondary)' }}>
              不是：{getFeedbackLabel('no')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span
              className="brand-small"
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--warning)',
                flexShrink: 0,
              }}
            />
            <span className="brand-caption" style={{ color: 'var(--text-secondary)' }}>
              我不知道：{getFeedbackLabel('unknown')}
            </span>
          </div>
        </div>
      </div>

      <div
        className="brand-card"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
      >
        <h3 className="brand-h3">已输入线索</h3>
        {inputClue?.image && (
          <img
            src={inputClue.image}
            alt="线索图片"
            style={{
              width: '100%',
              maxHeight: '180px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
            }}
          />
        )}
        {inputClue?.description && (
          <p className="brand-body" style={{ color: 'var(--text-secondary)' }}>
            {inputClue.description}
          </p>
        )}
        {inputClue?.context && (
          <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
            情境：{inputClue.context}
          </p>
        )}
        {!inputClue?.description && !inputClue?.image && (
          <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
            暂无线索
          </p>
        )}
      </div>

      <div
        className="brand-card"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
      >
        <h3 className="brand-h3">当前保留候选</h3>
        {candidates.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {candidates.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span className="brand-body" style={{ fontSize: 'var(--font-size-sm)' }}>
                  {c.meaning}
                </span>
                <span
                  className="brand-small"
                  style={{
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {(c.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
            暂无候选
          </p>
        )}
      </div>

      <div
        className="brand-card"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
      >
        <h3 className="brand-h3">已问过的问题</h3>
        {feedbackLog.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {feedbackLog.map((log, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-xs)',
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span
                    className="brand-small"
                    style={{
                      color: 'var(--text-tertiary)',
                      flexShrink: 0,
                      minWidth: '44px',
                    }}
                  >
                    第{idx + 1}轮
                  </span>
                  <span
                    className="brand-caption"
                    style={{ flex: 1, color: 'var(--text-secondary)' }}
                  >
                    {log.questionText}
                  </span>
                  <span
                    className="brand-small"
                    style={{
                      fontWeight: 'var(--font-weight-medium)',
                      color: getAnswerColor(log.answer),
                      flexShrink: 0,
                    }}
                  >
                    {getAnswerLabel(log.answer)}
                  </span>
                </div>
                <div style={{ paddingLeft: '52px' }}>
                  <span className="brand-small" style={{ color: 'var(--text-tertiary)' }}>
                    观察到的反馈：{log.observedFeedback || getFeedbackLabel(log.answer)}，记录为：{getAnswerLabel(log.answer)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
            尚未提问
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <button
          className="brand-btn-outline"
          onClick={handleContinueLater}
          style={{ width: '100%' }}
        >
          稍后继续
        </button>
        <button
          className="brand-btn-primary"
          onClick={handleEndAndSave}
          style={{ width: '100%' }}
        >
          结束并保存
        </button>
      </div>
    </div>
  );
}

export default GuessRecord;
