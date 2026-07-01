import { useState, useEffect, useCallback } from 'react';
import { getState, setState } from '../utils/storage.js';
import PageHeader from '../components/PageHeader.jsx';

const MAX_ROUNDS = 8;
const MAX_CONSECUTIVE_UNKNOWN = 3;
const WEAK_RESPONSE_HINT_THRESHOLD = 5;

function QuestionChain({ navigate, goBack }) {
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [questionMap, setQuestionMap] = useState({});
  const [questionOrder, setQuestionOrder] = useState([]);
  const [roundCount, setRoundCount] = useState(0);
  const [consecutiveUnknown, setConsecutiveUnknown] = useState(0);
  const [feedbackLog, setFeedbackLog] = useState([]);
  const [fadeIn, setFadeIn] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);

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

  const handleFeedback = (answer) => {
    if (!currentQuestionId) return;

    const question = questionMap[currentQuestionId];
    if (!question) return;

    const newRound = roundCount + 1;
    const newLog = [
      ...feedbackLog,
      { questionId: currentQuestionId, questionText: question.text, answer, type: question.type },
    ];

    if (answer === 'pause') {
      saveProgress({
        currentQuestionId,
        roundCount: newRound,
        consecutiveUnknown,
        feedbackLog: newLog,
      });
      navigate('pauseGuess');
      return;
    }

    let newConsecutiveUnknown = consecutiveUnknown;
    if (answer === 'unknown') {
      newConsecutiveUnknown = consecutiveUnknown + 1;
    } else {
      newConsecutiveUnknown = 0;
    }

    if (newConsecutiveUnknown >= MAX_CONSECUTIVE_UNKNOWN) {
      saveProgress({
        currentQuestionId,
        roundCount: newRound,
        consecutiveUnknown: newConsecutiveUnknown,
        feedbackLog: newLog,
      });
      navigate('pauseGuess');
      return;
    }

    if (newRound >= MAX_ROUNDS) {
      saveProgress({
        currentQuestionId,
        roundCount: newRound,
        consecutiveUnknown: newConsecutiveUnknown,
        feedbackLog: newLog,
      });
      navigate('pauseGuess');
      return;
    }

    let nextId = null;
    if (answer === 'yes') {
      nextId = question.onYes;
    } else if (answer === 'no') {
      nextId = question.onNo;
    } else {
      nextId = question.onUnknown;
    }

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

    if (nextId === 'pauseGuess') {
      saveProgress({
        currentQuestionId,
        roundCount: newRound,
        consecutiveUnknown: newConsecutiveUnknown,
        feedbackLog: newLog,
      });
      navigate('pauseGuess');
      return;
    }

    if (!nextId || !questionMap[nextId]) {
      saveProgress({
        currentQuestionId,
        roundCount: newRound,
        consecutiveUnknown: newConsecutiveUnknown,
        feedbackLog: newLog,
      });
      navigate('pauseGuess');
      return;
    }

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

  if (!currentQuestion) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', minHeight: '70vh' }}>
      <PageHeader title="问题链" onBack={goBack} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
          第 {roundCount + 1} / {MAX_ROUNDS} 题
        </p>
        <p className="brand-caption" style={{ color: 'var(--text-tertiary)' }}>
          {feedbackLog.length > 0 && feedbackLog.filter((f) => f.answer === 'unknown').length > 0
            ? `连续"不知道" ${consecutiveUnknown} 次`
            : ''}
        </p>
      </div>

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <button
          className="brand-btn-primary"
          onClick={() => handleFeedback('yes')}
          style={{ width: '100%', minHeight: '52px', fontSize: 'var(--font-size-md)' }}
        >
          是
        </button>

        <button
          className="brand-btn-outline"
          onClick={() => handleFeedback('no')}
          style={{
            width: '100%',
            minHeight: '48px',
            fontSize: 'var(--font-size-md)',
            borderColor: 'var(--error)',
            color: 'var(--error)',
          }}
        >
          不是
        </button>

        <button
          className="brand-btn-outline"
          onClick={() => handleFeedback('unknown')}
          style={{
            width: '100%',
            minHeight: '48px',
            fontSize: 'var(--font-size-base)',
            borderColor: 'var(--warning)',
            color: 'var(--warning)',
          }}
        >
          我不知道
        </button>

        <button
          className="brand-btn-outline"
          onClick={() => handleFeedback('pause')}
          style={{ width: '100%', minHeight: '48px', fontSize: 'var(--font-size-sm)' }}
        >
          暂停猜测
        </button>
      </div>

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
