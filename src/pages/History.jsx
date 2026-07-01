import { useState, useEffect } from 'react';
import { getSessions, deleteSession, setCurrentSessionId } from '../utils/storage.js';
import PageHeader from '../components/PageHeader.jsx';

const statusConfig = {
  completed: { label: '已完成', color: 'var(--success)', bg: 'var(--success-bg)' },
  in_progress: { label: '进行中', color: 'var(--info)', bg: 'var(--info-bg)' },
  paused: { label: '已暂停', color: 'var(--warning)', bg: 'var(--warning-bg)' },
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

function History({ navigate, goBack }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const handleView = (session) => {
    setCurrentSessionId(session.id);
    navigate('expressionRecord');
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!window.confirm('确定要删除这条记录吗？')) return;
    deleteSession(id);
    setSessions(getSessions());
  };

  const handleStartNew = () => {
    navigate('home');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <PageHeader title="猜测历史" onBack={goBack} />

      <div>
        <h2 className="brand-h2">猜测历史</h2>
        <p className="brand-caption" style={{ marginTop: 'var(--space-xs)', color: 'var(--text-tertiary)' }}>
          每一次尝试，都是靠近TA心意的一步
        </p>
      </div>

      {sessions.length === 0 ? (
        <div
          className="brand-card"
          style={{ textAlign: 'center', padding: 'var(--space-xl) var(--space-md)' }}
        >
          <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
            暂无猜测记录
          </p>
          <p className="brand-small" style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-sm)' }}>
            点击首页的"开始一次表达尝试"开始你的第一次猜测
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {sessions.map((session) => {
            const status = statusConfig[session.status] || statusConfig.in_progress;
            const hasResult = session.data?.expressionResult;
            return (
              <div
                key={session.id}
                className="brand-card"
                onClick={() => handleView(session)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-sm)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(61,61,61,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
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
                    {session.title || '未命名猜测'}
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

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                  <span className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
                    {formatDate(session.updatedAt)}
                  </span>
                  {hasResult && (
                    <span
                      className="brand-small"
                      style={{
                        color: 'var(--text-secondary)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      {hasResult.expression?.slice(0, 12)}...
                    </span>
                  )}
                </div>

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
                    marginTop: '2px',
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
        <button className="brand-btn-primary" onClick={handleStartNew} style={{ width: '100%' }}>
          返回首页
        </button>
      </div>
    </div>
  );
}

export default History;
