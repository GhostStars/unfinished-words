import { useState, useEffect } from 'react';
import { getSessions, deleteSession, setCurrentSessionId, getState, setState } from '../utils/storage.js';
import PageHeader from '../components/PageHeader.jsx';

const statusConfig = {
  completed: { label: '已完成', color: 'var(--success)', bg: 'var(--success-bg)' },
  paused: { label: '暂停中', color: 'var(--warning)', bg: 'var(--warning-bg)' },
};

const PAUSE_REASON_MAP = {
  user_pause: '家属主动暂停',
  consecutive_unknown: '连续多次选择不确定',
  contradiction: '反馈前后不一致',
  max_rounds: '问题到达上限仍未形成稳定理解',
  calibration_unclear: '校准阶段反馈不够清楚',
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `今天 ${timeStr}`;
  return `${d.getMonth() + 1}月${d.getDate()}日 ${timeStr}`;
}

function buildRecordText(session) {
  const data = session.data || {};
  const record = data.expressionResult;
  if (!record) return '';
  const lines = [];
  lines.push('【可能表达记录】');
  lines.push(`患者可能想表达：${record.expression}`);
  lines.push('');
  if (data.inputClue?.description) {
    lines.push('【原始线索】');
    lines.push(data.inputClue.description);
    if (data.inputClue.context) {
      lines.push(`情境：${data.inputClue.context}`);
    }
    lines.push('');
  }
  if (data.lifeClues?.length > 0) {
    lines.push('【生命线索】');
    data.lifeClues.forEach((lc) => lines.push(`- ${lc.content}`));
    lines.push('');
  }
  lines.push('【理解路径】');
  record.feedbackLog.forEach((log, idx) => {
    const answerLabel = log.answer === 'yes' ? '是' : log.answer === 'no' ? '不是' : '不确定';
    lines.push(`${idx + 1}. ${log.questionText} → ${answerLabel}`);
  });
  lines.push('');
  lines.push(`【置信等级】${record.confidenceLevel}`);
  lines.push('');
  lines.push('【边界说明】本记录基于观察与反馈推理，仅供参考，不构成医疗、法律或遗嘱效力。');
  return lines.join('\n');
}

function History({ navigate, goBack }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const handleViewRecord = (session) => {
    setCurrentSessionId(session.id);
    navigate('expressionRecord');
  };

  const handleCopyRecord = async (session) => {
    setCurrentSessionId(session.id);
    const text = buildRecordText(session);
    if (!text) {
      alert('暂无可复制内容');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('已复制到剪贴板');
    }
  };

  const handleResume = (session) => {
    setCurrentSessionId(session.id);
    const state = getState() || {};
    setState({
      ...state,
      calibration: {},
      questionChainProgress: {},
      questionChain: [],
      expressionResult: undefined,
    });
    navigate('calibration');
  };

  const handleViewDetail = (session) => {
    setCurrentSessionId(session.id);
    navigate('guessRecord');
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!window.confirm('确定要删除这条记录吗？')) return;
    deleteSession(id);
    setSessions(getSessions());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <PageHeader title="历史记录" onBack={goBack} />

      <div>
        <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
          每一次尝试，都是靠近TA心意的一步
        </p>
      </div>

      {sessions.length === 0 ? (
        <div
          className="brand-card"
          style={{ textAlign: 'center', padding: 'var(--space-xl) var(--space-md)' }}
        >
          <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
            暂无历史记录
          </p>
          <p className="brand-small" style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-sm)' }}>
            点击首页的"开始一次表达尝试"开始你的第一次猜测
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {sessions.map((session) => {
            const isCompleted = session.status === 'completed';
            const displayStatus = isCompleted ? 'completed' : 'paused';
            const status = statusConfig[displayStatus];
            const data = session.data || {};
            const inputClue = data.inputClue;
            const progress = data.questionChainProgress;
            const pauseReasonKey = progress?.pauseReason;
            const pauseReasonText = PAUSE_REASON_MAP[pauseReasonKey] || '';
            const title = data.expressionResult?.expression || inputClue?.description?.slice(0, 20) || '未命名尝试';

            return (
              <div
                key={session.id}
                className="brand-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-sm)',
                }}
              >
                {/* 头部：标题 + 状态 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                  <span
                    className="brand-body"
                    style={{
                      fontWeight: 'var(--font-weight-medium)',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {title}
                  </span>
                  <span
                    className="brand-small"
                    style={{
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: status.color,
                      background: status.bg,
                      flexShrink: 0,
                    }}
                  >
                    {status.label}
                  </span>
                </div>

                {/* 图片缩略图 */}
                {inputClue?.image && (
                  <img
                    src={inputClue.image}
                    alt="线索缩略图"
                    style={{
                      width: '100%',
                      maxHeight: '120px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                )}

                {/* 线索摘要 */}
                {inputClue?.description && !inputClue?.image && (
                  <p className="brand-caption" style={{ color: 'var(--text-secondary)' }}>
                    {inputClue.description.slice(0, 40)}{inputClue.description.length > 40 ? '…' : ''}
                  </p>
                )}

                {/* 暂停原因（仅 paused） */}
                {!isCompleted && pauseReasonText && (
                  <p className="brand-caption" style={{ color: 'var(--warning)' }}>
                    暂停原因：{pauseReasonText}
                  </p>
                )}

                {/* 更新时间 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                  <span className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
                    {formatDate(session.updatedAt)}
                  </span>
                </div>

                {/* 操作按钮 */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
                  {isCompleted ? (
                    <>
                      <button
                        className="brand-btn-outline"
                        onClick={() => handleViewRecord(session)}
                        style={{ flex: 1, minHeight: '40px', fontSize: 'var(--font-size-sm)' }}
                      >
                        查看记录
                      </button>
                      <button
                        className="brand-btn-primary"
                        onClick={() => handleCopyRecord(session)}
                        style={{ flex: 1, minHeight: '40px', fontSize: 'var(--font-size-sm)' }}
                      >
                        复制记录
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="brand-btn-primary"
                        onClick={() => handleResume(session)}
                        style={{ flex: 1, minHeight: '40px', fontSize: 'var(--font-size-sm)' }}
                      >
                        继续尝试
                      </button>
                      <button
                        className="brand-btn-outline"
                        onClick={() => handleViewDetail(session)}
                        style={{ flex: 1, minHeight: '40px', fontSize: 'var(--font-size-sm)' }}
                      >
                        查看详情
                      </button>
                    </>
                  )}
                </div>

                {/* 删除 */}
                <button
                  onClick={(e) => handleDelete(session.id, e)}
                  className="brand-small"
                  style={{
                    alignSelf: 'flex-end',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: '2px 6px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                >
                  删除
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
        <button className="brand-btn-primary" onClick={() => navigate('home')} style={{ width: '100%' }}>
          返回首页
        </button>
      </div>
    </div>
  );
}

export default History;
