import { useState, useEffect } from 'react';
import { getState, archiveCurrentSession } from '../utils/storage.js';

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

function PauseGuess({ navigate }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    const s = getState();
    setState(s);
    archiveCurrentSession('paused');
  }, []);

  const inputClue = state?.inputClue;
  const progress = state?.questionChainProgress;
  const feedbackLog = progress?.feedbackLog || [];
  const calibration = state?.calibration;
  const lifeClues = state?.lifeClues || [];
  const candidates = state?.candidates || [];

  const signalKey = calibration?.signal;
  const feedbackMap = signalKey && SIGNAL_RULES[signalKey] ? SIGNAL_RULES[signalKey] : SIGNAL_RULES.blink;

  const pauseReasonKey = progress?.pauseReason || 'unknown';
  const pauseReasonText = PAUSE_REASON_MAP[pauseReasonKey] || '当前反馈不足以继续判断';

  const getAnswerLabel = (answer) => {
    if (answer === 'yes') return '是';
    if (answer === 'no') return '不是';
    if (answer === 'unknown') return '不确定';
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
        <h2 className="brand-h2">本次尝试已暂停</h2>
        <p
          className="brand-body"
          style={{
            marginTop: 'var(--space-md)',
            lineHeight: 'var(--line-height-relaxed)',
            color: 'var(--text-secondary)',
          }}
        >
          当前反馈不足以继续判断。线索、图片、问题和反馈已保留，可稍后从历史记录中重新校准并继续。
        </p>
      </div>

      {/* 暂停原因 */}
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
          暂停原因：{pauseReasonText}
        </p>
      </div>

      {/* 原始线索 */}
      <div className="brand-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <h3 className="brand-h3">原始线索</h3>
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
          <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>暂无线索</p>
        )}
      </div>

      {/* 生命线索 */}
      {lifeClues.length > 0 && (
        <div className="brand-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <h3 className="brand-h3">生命线索</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {lifeClues.map((clue, idx) => (
              <div
                key={clue.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span className="brand-small" style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
                  {idx + 1}
                </span>
                <span className="brand-caption" style={{ flex: 1, color: 'var(--text-secondary)' }}>
                  {clue.content}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 当前候选 */}
      {candidates.length > 0 && (
        <div className="brand-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <h3 className="brand-h3">当前候选</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {candidates.map((c, idx) => (
              <div
                key={c.id || idx}
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
                    minWidth: '24px',
                    textAlign: 'center',
                  }}
                >
                  {idx + 1}
                </span>
                <span className="brand-caption" style={{ flex: 1, color: 'var(--text-secondary)' }}>
                  {c.meaning}
                </span>
                <span className="brand-small" style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
                  {c.confidence >= 0.7 ? '较高' : c.confidence >= 0.4 ? '中等' : '较低'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 已问过的问题和反馈 */}
      {feedbackLog.length > 0 && (
        <div className="brand-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h3 className="brand-h3">已问过的问题和反馈</h3>
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
                <span className="brand-small" style={{ color: 'var(--text-tertiary)', flexShrink: 0, minWidth: '44px' }}>
                  第{idx + 1}轮
                </span>
                <span className="brand-caption" style={{ flex: 1, color: 'var(--text-secondary)' }}>
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
        </div>
      )}

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

      {/* 边界说明 */}
      <div
        className="brand-card"
        style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <p className="brand-small" style={{ color: 'var(--text-tertiary)' }}>
          本记录基于观察与反馈推理，仅供参考，不构成医疗、法律或遗嘱效力
        </p>
      </div>

      {/* 按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <button className="brand-btn-primary" onClick={() => navigate('home')} style={{ width: '100%' }}>
          返回首页
        </button>
        <button className="brand-btn-outline" onClick={() => navigate('history')} style={{ width: '100%' }}>
          查看历史记录
        </button>
      </div>
    </div>
  );
}

export default PauseGuess;
