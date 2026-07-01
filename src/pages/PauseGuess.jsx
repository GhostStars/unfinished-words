import { useEffect, useState } from 'react';
import { getState, archiveCurrentSession } from '../utils/storage.js';
import PageHeader from '../components/PageHeader.jsx';

const DEFAULT_FEEDBACK_MAP = {
  yes: '眨眼一次',
  no: '眨眼两次',
  unknown: '无明显反应',
};

function PauseGuess({ navigate, goBack }) {
  const [hasRecord, setHasRecord] = useState(false);
  const [pauseReason, setPauseReason] = useState(null);
  const [feedbackMethodMap, setFeedbackMethodMap] = useState(null);
  const [feedbackLog, setFeedbackLog] = useState([]);

  useEffect(() => {
    const state = getState();
    const progress = state?.questionChainProgress;
    const hasLog = progress?.feedbackLog && progress.feedbackLog.length > 0;
    setHasRecord(!!hasLog);
    setPauseReason(progress?.pauseReason || null);
    setFeedbackLog(progress?.feedbackLog || []);

    const cal = state?.calibration;
    if (cal?.feedbackMethodMap) {
      setFeedbackMethodMap(cal.feedbackMethodMap);
    }
  }, []);

  const getFeedbackLabel = (key) => {
    const map = feedbackMethodMap || DEFAULT_FEEDBACK_MAP;
    return map[key] || DEFAULT_FEEDBACK_MAP[key];
  };

  const getPauseMessage = () => {
    const unknownLabel = getFeedbackLabel('unknown');
    switch (pauseReason) {
      case 'consecutive_unknown':
        return `连续多次记录为"我不知道"（${unknownLabel}），当前不适合继续确认。`;
      case 'contradiction':
        return '本轮反馈前后不一致，继续追问可能造成误解。';
      case 'max_rounds':
        return '已进行多轮尝试，建议暂停整理后再继续。';
      case 'user_pause':
        return '你选择了暂停。已尝试的线索和反馈都会被保留。';
      default:
        return '当前还无法形成可靠判断。与其继续猜下去，不如先停一停，保留已经尝试过的线索。';
    }
  };

  // 统计本轮反馈
  const yesCount = feedbackLog.filter((l) => l.answer === 'yes').length;
  const noCount = feedbackLog.filter((l) => l.answer === 'no').length;
  const unknownCount = feedbackLog.filter((l) => l.answer === 'unknown').length;

  const handleSaveRecord = () => {
    navigate('guessRecord');
  };

  const handleContinueLater = () => {
    navigate('home');
  };

  const handleRecalibrate = () => {
    navigate('calibration');
  };

  const handleEndAttempt = () => {
    archiveCurrentSession('paused');
    navigate('home');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <PageHeader title="暂停猜测" onBack={goBack} />

      <div>
        <h2 className="brand-h2">先停一停</h2>
        <p
          className="brand-body"
          style={{
            marginTop: 'var(--space-md)',
            lineHeight: 'var(--line-height-relaxed)',
            color: 'var(--text-secondary)',
          }}
        >
          {getPauseMessage()}
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

      {/* 本轮反馈统计 */}
      {feedbackLog.length > 0 && (
        <div className="brand-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <h3 className="brand-h3">本轮反馈统计</h3>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <span className="brand-caption" style={{ color: 'var(--success)' }}>
              是 {yesCount} 次
            </span>
            <span className="brand-caption" style={{ color: 'var(--error)' }}>
              不是 {noCount} 次
            </span>
            <span className="brand-caption" style={{ color: 'var(--warning)' }}>
              不知道 {unknownCount} 次
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {hasRecord && (
          <button className="brand-btn-primary" onClick={handleSaveRecord} style={{ width: '100%' }}>
            保存当前猜测记录
          </button>
        )}

        <button
          className={hasRecord ? 'brand-btn-outline' : 'brand-btn-primary'}
          onClick={handleContinueLater}
          style={{ width: '100%' }}
        >
          稍后继续
        </button>

        <button className="brand-btn-outline" onClick={handleRecalibrate} style={{ width: '100%' }}>
          重新校准反馈
        </button>

        <button className="brand-btn-danger" onClick={handleEndAttempt} style={{ width: '100%' }}>
          结束本次尝试
        </button>
      </div>
    </div>
  );
}

export default PauseGuess;
