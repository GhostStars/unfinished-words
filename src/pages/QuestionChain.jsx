import { useState, useEffect, useCallback } from 'react';
import { getState, setState } from '../utils/storage.js';
import PageHeader from '../components/PageHeader.jsx';

const MAX_ROUNDS = 8;
const MAX_CONSECUTIVE_UNKNOWN = 3;
const WEAK_RESPONSE_HINT_THRESHOLD = 5;

const DEFAULT_FEEDBACK_MAP = {
  yes: '眨眼一次',
  no: '眨眼两次',
  unknown: '无明显反应',
};

function QuestionChain({ navigate, goBack }) {
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [questionMap, setQuestionMap] = useState({});
  const [questionOrder, setQuestionOrder] = useState([]);
  const [roundCount, setRoundCount] = useState(0);
  const [consecutiveUnknown, setConsecutiveUnknown] = useState(0);
  const [feedbackLog, setFeedbackLog] = useState([]);
  const [fadeIn, setFadeIn] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [feedbackMethodMap, setFeedbackMethodMap] = useState(null);

  useEffect(() => {
    const state = getState();
    const questions = state?.questionChain || [];

    if (questions.length === 0) {
      navigate('calibration');
      return;
    }

    const map = {};
    const order = [];
    questions.forEach((q) => {
      map[q.id] = q;
      order.push(q.id);
    });
    setQuestionMap(map);
    setQuestionOrder(order);

    // 读取反馈方式约定
    const cal = state?.calibration;
    if (cal?.feedbackMethodMap) {
      setFeedbackMethodMap(cal.feedbackMethodMap);
    }

    const progress = state?.questionChainProgress;
    if (progress) {
      setCurrentQuestionId(progress.currentQuestionId);
      setRoundCount(progress.roundCount);
      setConsecutiveUnknown(progress.consecutiveUnknown);
      setFeedbackLog(progress.feedbackLog || []);
    } else {
      setCurrentQuestionId(order[0]);
    }
  }, []);

  const getFeedbackLabel = useCallback(
    (key) => {
      const map = feedbackMethodMap || DEFAULT_FEEDBACK_MAP;
      return map[key] || DEFAULT_FEEDBACK_MAP[key];
    },
    [feedbackMethodMap],
  );

  const saveProgress = useCallback(
    (updates) => {
      const state = getState() || {};
      const existing = state.questionChainProgress || {};
      setState({
        ...state,
        questionChainProgress: { ...existing, ...updates },
      });
    },
    [],
  );

  // 判断暂停原因
  const detectPauseReason = (log, nextId, isUserPause) => {
    if (isUserPause) return 'user_pause';
    const hasYes = log.some((l) => l.answer === 'yes');
    const hasNo = log.some((l) => l.answer === 'no');
    if (hasYes && hasNo) return 'contradiction';
    if (nextId === 'pauseGuess') return 'contradiction';
    return 'max_rounds';
  };

  const handleFeedback = (answer) => {
    if (!currentQuestionId) return;

    const question = questionMap[currentQuestionId];
    if (!question) return;

    const newRound = roundCount + 1;
    const newLog = [
      ...feedbackLog,
      {
        questionId: currentQuestionId,
        questionText: question.text,
        answer,
        type: question.type,
        observedFeedback: getFeedbackLabel(answer),
      },
    ];

    // 点击"暂停猜测"
    if (answer === 'pause') {
      const reason = detectPauseReason(newLog, null, true);
      saveProgress({
        currentQuestionId,
        roundCount: newRound,
        consecutiveUnknown,
        feedbackLog: newLog,
        pauseReason: reason,
      });
      navigate('pauseGuess');
      return;
    }

    // 处理"我不知道"计数
    let newConsecutiveUnknown = consecutiveUnknown;
    if (answer === 'unknown') {
      newConsecutiveUnknown = consecutiveUnknown + 1;
    } else {
      newConsecutiveUnknown = 0;
    }

    // 连续 3 次"我不知道" → 暂停
    if (newConsecutiveUnknown >= MAX_CONSECUTIVE_UNKNOWN) {
      saveProgress({
        currentQuestionId,
        roundCount: newRound,
        consecutiveUnknown: newConsecutiveUnknown,
        feedbackLog: newLog,
        pauseReason: 'consecutive_unknown',
      });
      navigate('pauseGuess');
      return;
    }

    // 超过 8 轮 → 暂停
    if (newRound >= MAX_ROUNDS) {
      saveProgress({
        currentQuestionId,
        roundCount: newRound,
        consecutiveUnknown: newConsecutiveUnknown,
        feedbackLog: newLog,
        pauseReason: 'max_rounds',
      });
      navigate('pauseGuess');
      return;
    }

    // 根据 onYes/onNo/onUnknown 跳转
    let nextId = null;
    if (answer === 'yes') {
      nextId = question.onYes;
    } else if (answer === 'no') {
      nextId = question.onNo;
    } else {
      nextId = question.onUnknown;
    }

    // 特殊跳转目标：表达记录
    if (nextId === 'expressionRecord') {
      const state = getState() || {};
      const candidates = state?.candidates || [];
      const relatedCandidateId = question.relatedCandidate;
      const candidate = candidates.find((c) => c.id === relatedCandidateId);

      const total = newLog.length;
      const yesCount = newLog.filter((f) => f.answer === 'yes').length;
      const unknownCount = newLog.filter((f) => f.answer === 'unknown').length;
      const confidence = candidate?.confidence || 0.5;

      let confidenceLevel = '中等';
      if (yesCount / total >= 0.7 && confidence >= 0.6) {
        confidenceLevel = '较高';
      } else if (yesCount / total >= 0.5 && confidence >= 0.4) {
        confidenceLevel = '中等';
      } else if (yesCount > unknownCount) {
        confidenceLevel = '较低';
      } else {
        confidenceLevel = '不可靠';
      }

      const expressionResult = {
        expression: candidate?.meaning || '无法确定具体表达',
        candidateId: relatedCandidateId,
        confidenceLevel,
        confidence,
        feedbackLog: newLog,
        reachedAt: new Date().toISOString(),
      };

      setState({
        ...state,
        questionChainProgress: {
          ...(state.questionChainProgress || {}),
          currentQuestionId,
          roundCount: newRound,
          consecutiveUnknown: newConsecutiveUnknown,
          feedbackLog: newLog,
        },
        expressionResult,
      });
      navigate('expressionRecord');
      return;
    }

    // 跳转到暂停页
    if (nextId === 'pauseGuess') {
      const reason = detectPauseReason(newLog, nextId, false);
      saveProgress({
        currentQuestionId,
        roundCount: newRound,
        consecutiveUnknown: newConsecutiveUnknown,
        feedbackLog: newLog,
        pauseReason: reason,
      });
      navigate('pauseGuess');
      return;
    }

    // nextId 为 null 或找不到 → 暂停
    if (!nextId || !questionMap[nextId]) {
      const reason = detectPauseReason(newLog, null, false);
      saveProgress({
        currentQuestionId,
        roundCount: newRound,
        consecutiveUnknown: newConsecutiveUnknown,
        feedbackLog: newLog,
        pauseReason: reason,
      });
      navigate('pauseGuess');
      return;
    }

    // 正常切换到下一题
    setFadeIn(false);
    setTimeout(() => {
      setCurrentQuestionId(nextId);
      setRoundCount(newRound);
      setConsecutiveUnknown(newConsecutiveUnknown);
      setFeedbackLog(newLog);
      saveProgress({
        currentQuestionId: nextId,
        roundCount: newRound,
        consecutiveUnknown: newConsecutiveUnknown,
        feedbackLog: newLog,
      });
      setFadeIn(true);
    }, 200);
  };

  const currentQuestion = currentQuestionId ? questionMap[currentQuestionId] : null;
  const showWeakHint = roundCount + 1 >= WEAK_RESPONSE_HINT_THRESHOLD;
  const hasCustomMap = !!feedbackMethodMap;

  if (!currentQuestion) {
    return null;
  }

  const agreementText = `约定反馈：${getFeedbackLabel('yes')} 表示"是"，${getFeedbackLabel('no')} 表示"不是"；${getFeedbackLabel('unknown')} 记录为"我不知道"。`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', minHeight: '70vh' }}>
      <PageHeader title="问题链" onBack={goBack} />

      {/* 进度指示 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
          第 {roundCount + 1} / {MAX_ROUNDS} 题
        </p>
        <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
          {consecutiveUnknown > 0 ? `连续"不知道" ${consecutiveUnknown} 次` : ''}
        </p>
      </div>

      {/* 进度条 */}
      <div
        style={{
          width: '100%',
          height: '4px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--border-light)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${((roundCount + 1) / MAX_ROUNDS) * 100}%`,
            height: '100%',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-btn)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* 反馈约定提示 */}
      <div
        className="brand-card"
        style={{
          padding: '10px 14px',
          background: 'var(--info-bg)',
          border: '1px solid rgba(122, 155, 184, 0.25)',
        }}
      >
        <p
          className="brand-caption"
          style={{
            color: 'var(--info)',
            fontSize: 'var(--font-size-xs)',
            lineHeight: 'var(--line-height-normal)',
            textAlign: 'center',
          }}
        >
          {agreementText}
        </p>
      </div>

      {/* 未选择反馈方式时的兜底提示 */}
      {!hasCustomMap && (
        <div
          className="brand-card"
          style={{
            padding: '10px 14px',
            background: 'var(--warning-bg)',
            border: '1px solid rgba(196, 169, 90, 0.25)',
          }}
        >
          <p
            className="brand-caption"
            style={{
              color: 'var(--warning)',
              fontSize: 'var(--font-size-xs)',
              lineHeight: 'var(--line-height-normal)',
              textAlign: 'center',
            }}
          >
            当前使用默认约定。你也可以返回重新校准反馈方式。
          </p>
        </div>
      )}

      {/* 反应变弱提示 */}
      {showWeakHint && (
        <div
          className="brand-card"
          style={{
            background: 'var(--warning-bg)',
            border: '1px solid rgba(196, 169, 90, 0.3)',
            padding: '12px 16px',
            textAlign: 'center',
          }}
        >
          <p className="brand-caption" style={{ color: 'var(--warning)' }}>
            如果反应变弱，可以先暂停
          </p>
        </div>
      )}

      {/* 问题展示区：大字号居中 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-xl) 0',
        }}
      >
        <div
          className="brand-card"
          style={{
            width: '100%',
            textAlign: 'center',
            padding: 'var(--space-xl) var(--space-lg)',
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            willChange: 'opacity, transform',
          }}
        >
          <p
            className="brand-h2"
            style={{
              fontSize: 'var(--font-size-xl)',
              lineHeight: 'var(--line-height-relaxed)',
              color: 'var(--text-primary)',
            }}
          >
            {currentQuestion.text}
          </p>
        </div>
      </div>

      {/* 底部 4 个按钮：双层文案 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {/* 是 */}
        <button
          className="brand-btn-primary"
          onClick={() => handleFeedback('yes')}
          style={{
            width: '100%',
            minHeight: '56px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
          }}
        >
          <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)' }}>
            是
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.75 }}>
            {getFeedbackLabel('yes')}
          </span>
        </button>

        {/* 不是 */}
        <button
          className="brand-btn-outline"
          onClick={() => handleFeedback('no')}
          style={{
            width: '100%',
            minHeight: '52px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            borderColor: 'var(--error)',
            color: 'var(--error)',
          }}
        >
          <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)' }}>
            不是
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.75 }}>
            {getFeedbackLabel('no')}
          </span>
        </button>

        {/* 我不知道 */}
        <button
          className="brand-btn-outline"
          onClick={() => handleFeedback('unknown')}
          style={{
            width: '100%',
            minHeight: '52px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            borderColor: 'var(--warning)',
            color: 'var(--warning)',
          }}
        >
          <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
            我不知道
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.75 }}>
            {getFeedbackLabel('unknown')}
          </span>
        </button>

        {/* 暂停猜测 */}
        <button
          className="brand-btn-outline"
          onClick={() => handleFeedback('pause')}
          style={{ width: '100%', minHeight: '48px', fontSize: 'var(--font-size-sm)' }}
        >
          暂停猜测
        </button>
      </div>

      {/* 已回答历史记录 */}
      {feedbackLog.length > 0 && (
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <button
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="brand-small"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              cursor: 'pointer',
              padding: 'var(--space-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <span>已回答 {feedbackLog.length} 题</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: historyExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {historyExpanded && (
            <div
              style={{
                marginTop: 'var(--space-sm)',
                maxHeight: '160px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-xs)',
              }}
            >
              {feedbackLog.map((log, idx) => (
                <div
                  key={idx}
                  className="brand-small"
                  style={{
                    padding: 'var(--space-xs) var(--space-sm)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--card-bg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', flex: 1, marginRight: 'var(--space-sm)' }}>
                    {log.questionText}
                  </span>
                  <span
                    style={{
                      flexShrink: 0,
                      fontWeight: 'var(--font-weight-medium)',
                      color:
                        log.answer === 'yes'
                          ? 'var(--success)'
                          : log.answer === 'no'
                            ? 'var(--error)'
                            : 'var(--warning)',
                    }}
                  >
                    {log.answer === 'yes'
                      ? '是'
                      : log.answer === 'no'
                        ? '不是'
                        : '不知道'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuestionChain;
