import { useState, useEffect, useCallback } from 'react';
import { getState, setState } from '../utils/storage.js';

const MAX_ROUNDS = 8;
const MAX_CONSECUTIVE_UNKNOWN = 3;
const WEAK_RESPONSE_HINT_THRESHOLD = 5; // 第 5 题起显示提示

function QuestionChain({ navigate }) {
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [questionMap, setQuestionMap] = useState({});
  const [questionOrder, setQuestionOrder] = useState([]);
  const [roundCount, setRoundCount] = useState(0);
  const [consecutiveUnknown, setConsecutiveUnknown] = useState(0);
  const [feedbackLog, setFeedbackLog] = useState([]);
  const [fadeIn, setFadeIn] = useState(true);

  // 初始化：从 storage 读取问题链数据
  useEffect(() => {
    const state = getState();
    const questions = state?.questionChain || [];

    if (questions.length === 0) {
      navigate('calibration');
      return;
    }

    // 建立问题 ID → 问题对象 的映射
    const map = {};
    const order = [];
    questions.forEach((q) => {
      map[q.id] = q;
      order.push(q.id);
    });
    setQuestionMap(map);
    setQuestionOrder(order);

    // 恢复之前的状态（如有）
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

  // 保存进度到 storage
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

  // 处理按钮点击
  const handleFeedback = (answer) => {
    if (!currentQuestionId) return;

    const question = questionMap[currentQuestionId];
    if (!question) return;

    const newRound = roundCount + 1;
    const newLog = [
      ...feedbackLog,
      { questionId: currentQuestionId, questionText: question.text, answer, type: question.type },
    ];

    // 点击"暂停猜测"
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

    // 特殊跳转目标
    if (nextId === 'expressionRecord') {
      const state = getState() || {};
      const candidates = state?.candidates || [];
      const relatedCandidateId = question.relatedCandidate;
      const candidate = candidates.find((c) => c.id === relatedCandidateId);

      // 计算置信等级
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

    // 如果 nextId 为 null 或找不到对应问题，跳暂停
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

    // 切换问题，加动画
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
      {/* 进度指示 */}
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

      {/* 提示：患者反应变弱 */}
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
            如果患者反应变弱，可以先暂停
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

      {/* 底部 4 个按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {/* "是" 按钮 */}
        <button
          className="brand-btn-primary"
          onClick={() => handleFeedback('yes')}
          style={{
            width: '100%',
            minHeight: '52px',
            fontSize: 'var(--font-size-md)',
          }}
        >
          是
        </button>

        {/* "不是" 按钮 */}
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

        {/* "我不知道" 按钮 */}
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

        {/* "暂停猜测" 按钮 */}
        <button
          className="brand-btn-outline"
          onClick={() => handleFeedback('pause')}
          style={{
            width: '100%',
            minHeight: '44px',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          暂停猜测
        </button>
      </div>

      {/* 已回答历史记录（折叠展示） */}
      {feedbackLog.length > 0 && (
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <details>
            <summary
              className="brand-small"
              style={{
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
                textAlign: 'center',
                userSelect: 'none',
              }}
            >
              已回答 {feedbackLog.length} 题（点击展开）
            </summary>
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
          </details>
        </div>
      )}
    </div>
  );
}

export default QuestionChain;
