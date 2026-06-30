import { useState, useEffect } from 'react';
import { getState, clearState } from '../utils/storage.js';

function GuessRecord({ navigate }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    const s = getState();
    setState(s);
  }, []);

  const handleContinueLater = () => {
    navigate('home');
  };

  const handleEndAndSave = () => {
    clearState();
    navigate('home');
  };

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
      <div>
        <h2 className="brand-h2">当前猜测记录</h2>
      </div>

      {/* 当前状态标签 */}
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

      {/* 底部按钮 */}
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
