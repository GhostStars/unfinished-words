import { useState, useEffect } from 'react';
import { getState, archiveCurrentSession } from '../utils/storage.js';
import PageHeader from '../components/PageHeader.jsx';

const DEFAULT_FEEDBACK_MAP = {
  yes: '眨眼一次',
  no: '眨眼两次',
  unknown: '无明显反应',
};

function ExpressionRecord({ navigate, goBack, navigateData }) {
  const [record, setRecord] = useState(null);
  const [inputClue, setInputClue] = useState(null);
  const [lifeClues, setLifeClues] = useState([]);
  const [copied, setCopied] = useState(false);
  const [feedbackMethodMap, setFeedbackMethodMap] = useState(null);

  useEffect(() => {
    const state = getState() || {};
    setRecord(state?.expressionResult || null);
    setInputClue(state?.inputClue || null);
    setLifeClues(state?.lifeClues || []);
    const cal = state?.calibration;
    if (cal?.feedbackMethodMap) {
      setFeedbackMethodMap(cal.feedbackMethodMap);
    }
    // 完成后自动归档为 completed
    if (state?.expressionResult) {
      archiveCurrentSession('completed', state.expressionResult.expression);
    }
  }, []);

  const getConfidenceColor = (level) => {
    switch (level) {
      case '较高':
        return 'var(--success)';
      case '中等':
        return 'var(--info)';
      case '较低':
        return 'var(--warning)';
      case '不可靠':
        return 'var(--error)';
      default:
        return 'var(--text-tertiary)';
    }
  };

  const getConfidenceBg = (level) => {
    switch (level) {
      case '较高':
        return 'var(--success-bg)';
      case '中等':
        return 'var(--info-bg)';
      case '较低':
        return 'var(--warning-bg)';
      case '不可靠':
        return 'var(--error-bg)';
      default:
        return 'rgba(61, 61, 61, 0.06)';
    }
  };

  const getFeedbackLabel = (key) => {
    const map = feedbackMethodMap || DEFAULT_FEEDBACK_MAP;
    return map[key] || DEFAULT_FEEDBACK_MAP[key];
  };

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

  const buildRecordText = () => {
    if (!record) return '';
    const lines = [];
    lines.push('【可能表达记录】');
    lines.push(`患者可能想表达：${record.expression}`);
    lines.push('');
    if (inputClue?.description) {
      lines.push('【原始线索】');
      lines.push(inputClue.description);
      if (inputClue.context) {
        lines.push(`情境：${inputClue.context}`);
      }
      lines.push('');
    }
    if (lifeClues.length > 0) {
      lines.push('【生命线索】');
      lifeClues.forEach((lc) => lines.push(`- ${lc.content}`));
      lines.push('');
    }
    lines.push('【理解路径】');
    record.feedbackLog.forEach((log, idx) => {
      lines.push(`${idx + 1}. ${log.questionText} → ${getAnswerLabel(log.answer)}`);
    });
    lines.push('');
    lines.push(`【置信等级】${record.confidenceLevel}`);
    lines.push('');
    lines.push('【边界说明】本记录基于观察与反馈推理，仅供参考，不构成医疗、法律或遗嘱效力。');
    return lines.join('\n');
  };

  const handleCopy = async () => {
    const text = buildRecordText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoHome = () => {
    navigate('home');
  };

  const handleGoHistory = () => {
    navigate('history');
  };

  if (!record) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <PageHeader title="表达记录" onBack={navigateData?.from === 'history' ? goBack : () => navigate('home')} />
      <h2 className="brand-h2">可能表达记录</h2>
        <div
          className="brand-card"
          style={{ textAlign: 'center', padding: 'var(--space-xl) var(--space-md)' }}
        >
          <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
            暂无表达记录，请先完成问题链理解流程
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <button className="brand-btn-primary" onClick={handleGoHome} style={{ width: '100%' }}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <PageHeader title="表达记录" onBack={navigateData?.from === 'history' ? goBack : () => navigate('home')} />

      <div>
        <h2 className="brand-h2">本次尝试已完成</h2>
        <p className="brand-caption" style={{ marginTop: 'var(--space-xs)', color: 'var(--text-tertiary)' }}>
          根据你们的互动，这是TA可能想表达的
        </p>
      </div>

      <div
        className="brand-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          border: `1.5px solid ${getConfidenceColor(record.confidenceLevel)}`,
        }}
      >
        <p className="brand-caption" style={{ color: 'var(--text-tertiary)', fontWeight: 'var(--font-weight-medium)' }}>
          TA可能想表达：
        </p>
        <p
          className="brand-body"
          style={{
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-medium)',
            lineHeight: 'var(--line-height-relaxed)',
            color: 'var(--text-primary)',
          }}
        >
          {record.expression}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span
            className="brand-small"
            style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 'var(--font-weight-medium)',
              color: getConfidenceColor(record.confidenceLevel),
              background: getConfidenceBg(record.confidenceLevel),
            }}
          >
            置信：{record.confidenceLevel}
          </span>
        </div>
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
              不确定：{getFeedbackLabel('unknown')}
            </span>
          </div>
        </div>
      </div>

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
        {inputClue?.description ? (
          <p className="brand-body" style={{ color: 'var(--text-secondary)' }}>
            {inputClue.description}
          </p>
        ) : (
          <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
            暂无描述
          </p>
        )}
        {inputClue?.context && (
          <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
            情境：{inputClue.context}
          </p>
        )}
      </div>

      {lifeClues.length > 0 && (
        <div className="brand-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h3 className="brand-h3">生命线索</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {lifeClues.map((lc) => (
              <div
                key={lc.id}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <p className="brand-body" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  {lc.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="brand-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <h3 className="brand-h3">理解路径</h3>
        {record.feedbackLog.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {record.feedbackLog.map((log, idx) => (
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
                    style={{ color: 'var(--text-tertiary)', flexShrink: 0, minWidth: '44px' }}
                  >
                    第{idx + 1}题
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
                <div style={{ paddingLeft: '52px' }}>
                  <span className="brand-small" style={{ color: 'var(--text-tertiary)' }}>
                    观察到的反馈：{log.observedFeedback || getFeedbackLabel(log.answer)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
            暂无反馈记录
          </p>
        )}
      </div>

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <button className="brand-btn-primary" onClick={handleCopy} style={{ width: '100%' }}>
          {copied ? '已复制到剪贴板' : '复制记录'}
        </button>
        <button className="brand-btn-outline" onClick={handleGoHome} style={{ width: '100%' }}>
          返回首页
        </button>
        <button className="brand-btn-outline" onClick={handleGoHistory} style={{ width: '100%' }}>
          查看历史记录
        </button>
      </div>
    </div>
  );
}

export default ExpressionRecord;
