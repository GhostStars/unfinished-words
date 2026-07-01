const STORAGE_KEY = 'unfinished_words_state';

function getRawState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveRawState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function migrateOldData(raw) {
  if (!raw) return null;
  if (raw._version === 2) return raw;

  // 旧格式迁移：直接是 session 数据
  const sessionId = 'session_' + Date.now();
  const title = raw.inputClue?.description?.slice(0, 20) || '历史猜测';
  return {
    _version: 2,
    currentSessionId: sessionId,
    sessions: [
      {
        id: sessionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title,
        status: raw.expressionResult ? 'completed' : 'in_progress',
        data: { ...raw },
      },
    ],
  };
}

function findCurrentSession(state) {
  if (!state?.sessions) return null;
  return state.sessions.find((s) => s.id === state.currentSessionId) || null;
}

// ========== 兼容原有 API ==========

export function getState() {
  const raw = getRawState();
  if (!raw) return null;
  const state = migrateOldData(raw);
  const session = findCurrentSession(state);
  return session ? session.data : null;
}

export function setState(data) {
  let state = getRawState();
  state = state ? migrateOldData(state) : null;

  if (!state) {
    const sessionId = 'session_' + Date.now();
    state = {
      _version: 2,
      currentSessionId: sessionId,
      sessions: [
        {
          id: sessionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          title: data?.inputClue?.description?.slice(0, 20) || '未命名猜测',
          status: 'in_progress',
          data: { ...data },
        },
      ],
    };
  } else {
    const sessionIndex = state.sessions.findIndex((s) => s.id === state.currentSessionId);
    if (sessionIndex >= 0) {
      state.sessions[sessionIndex].data = { ...state.sessions[sessionIndex].data, ...data };
      state.sessions[sessionIndex].updatedAt = new Date().toISOString();
      if (data?.inputClue?.description) {
        state.sessions[sessionIndex].title = data.inputClue.description.slice(0, 20);
      }
    } else {
      // currentSessionId 不存在，创建新 session
      const sessionId = 'session_' + Date.now();
      state.currentSessionId = sessionId;
      state.sessions.push({
        id: sessionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: data?.inputClue?.description?.slice(0, 20) || '未命名猜测',
        status: 'in_progress',
        data: { ...data },
      });
    }
  }

  saveRawState(state);
}

export function clearState() {
  const raw = getRawState();
  if (!raw) return;
  const state = migrateOldData(raw);
  const sessionIndex = state.sessions.findIndex((s) => s.id === state.currentSessionId);
  if (sessionIndex >= 0) {
    state.sessions[sessionIndex].data = {};
    state.sessions[sessionIndex].status = 'in_progress';
    saveRawState(state);
  }
}

// ========== 新增 session API ==========

export function getSessions() {
  const raw = getRawState();
  if (!raw) return [];
  const state = migrateOldData(raw);
  return (state.sessions || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getCurrentSessionId() {
  const raw = getRawState();
  if (!raw) return null;
  const state = migrateOldData(raw);
  return state.currentSessionId;
}

export function setCurrentSessionId(id) {
  const raw = getRawState();
  if (!raw) return;
  const state = migrateOldData(raw);
  state.currentSessionId = id;
  saveRawState(state);
}

export function createSession() {
  let state = getRawState();
  state = state ? migrateOldData(state) : null;

  const sessionId = 'session_' + Date.now();

  if (!state) {
    state = {
      _version: 2,
      currentSessionId: sessionId,
      sessions: [],
    };
  }

  state.currentSessionId = sessionId;
  state.sessions.push({
    id: sessionId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: '新猜测',
    status: 'in_progress',
    data: {},
  });

  saveRawState(state);
  return sessionId;
}

export function archiveCurrentSession(status = 'completed', title) {
  const raw = getRawState();
  if (!raw) return;
  const state = migrateOldData(raw);
  const sessionIndex = state.sessions.findIndex((s) => s.id === state.currentSessionId);
  if (sessionIndex >= 0) {
    state.sessions[sessionIndex].status = status;
    if (title) {
      state.sessions[sessionIndex].title = title;
    }
    state.sessions[sessionIndex].updatedAt = new Date().toISOString();
    saveRawState(state);
  }
}

export function getSessionById(id) {
  const raw = getRawState();
  if (!raw) return null;
  const state = migrateOldData(raw);
  return state.sessions.find((s) => s.id === id) || null;
}

export function deleteSession(id) {
  const raw = getRawState();
  if (!raw) return;
  const state = migrateOldData(raw);
  state.sessions = state.sessions.filter((s) => s.id !== id);
  if (state.currentSessionId === id) {
    state.currentSessionId = state.sessions.length > 0 ? state.sessions[0].id : null;
  }
  saveRawState(state);
}
