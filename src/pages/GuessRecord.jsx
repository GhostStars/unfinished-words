import { useState, useEffect } from 'react';
import { getState } from '../utils/storage.js';

const SIGNAL_RULES = {
  blink: { yes: '眨眼一次', no: '眨眼两次', unknown: '无明显反应' },
  hand: { yes: '轻握一次', no: '轻握两次', unknown: '无握动' },
  nod: { yes: '头微微偏左', no: '头微微偏右', unknown: '无明显偏转' },
};

const PAUSE_REASON_MAP = {
  user_pause: '家属主动暂停',
  consecutive_unknown: '连续多次选择不确定',
  contradiction: '反馈前后不一致',
  max_rounds: '问题到达上限仍未形成稳定理解',
  calibration_unclear: '校准阶段反馈不够清楚',
};

function GuessRecord({ navigate }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    const s = getState();
    setState(s);
  }, []);

  if (!state) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
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

  const signalKey = calibration?.signal;
  const feedbackMap = signalKey && SIGNAL_RULES[signalKey] ? SIGNAL_RULES[signalKey] : SIGNAL_RULES.blink;

  const pauseReasonKey = progress?.pauseReason || 'unknown';
  const pauseReasonText = PAUSE_REASON_MAP[pauseReasonKey] || '当前反馈不足以继续判断';

  const getStatusLabel = () => {
    if (state?.expressionResult) return '已完成';
    if (calibration?.result === 'fail' || calibration?.passed === false) return '反馈暂不稳定';
    if (progress?.consecutiveUnknown >= 3) return '连续多次无法确认';
    if (progress?.roundCount >= 8) return '已达最大尝试轮次';
    return pauseReasonText;
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
      <div>
        <h2 className="brand-h2">当前猜测记录</h2>
      </div>

      {/* 当前状态标签 */}
      <div
        className="brand-card"
        style={{
          background: state?.expressionResult ? 'var(--success-bg)' : 'var(--warning-bg)',
          border: `1px solid ${state?.expressionResult ? 'var(--success)' : 'var(--warning)'}`,
          textAlign: 'center',
        }}
      >
        <p
          className="brand-caption"
          style={{
            color: state?.expressionResult ? 'var(--success)' : 'var(--warning)',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          {getStatusLabel()}
        </p>
      </div>

      {/* 已输入线索 */}
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

      {/* 当前保留候选 */}
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

      {/* 已问过的问题表格 */}
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
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
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
            ))}
          </div>
        ) : (
          <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
            尚未提问
          </p>
        )}
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
              是：{feedbackMap.yes}
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
              不是：{feedbackMap.no}
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
              不确定：{feedbackMap.unknown}
            </span>
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <button
          className="brand-btn-outline"
          onClick={() => navigate('history')}
          style={{ width: '100%' }}
        >
          返回历史记录
        </button>
        <button
          className="brand-btn-primary"
          onClick={() => navigate('home')}
          style={{ width: '100%' }}
        >
          返回首页
        </button>
      </div>
    </div>
  );
}

export default GuessRecord;
