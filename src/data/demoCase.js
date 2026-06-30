export const demoCase = {
  inputClue: {
    description: '患者反复眨眼，右手微微抬起指向门口方向',
    context: '探访时间临近结束，患者看到家属准备离开',
  },
  lifeClues: [
    { id: 1, content: '每天下午三点会准时看向窗外' },
    { id: 2, content: '听到老歌《送别》时会眼眶湿润' },
    { id: 3, content: '提到孙女名字时会握紧拳头' },
  ],
  candidates: [
    { id: 1, meaning: '想再看看窗外的梧桐树', confidence: 0.7 },
    { id: 2, meaning: '希望家属不要离开', confidence: 0.85 },
    { id: 3, meaning: '想听那首老歌', confidence: 0.5 },
  ],
  calibration: {
    feedbackMethod: 'blink',
    answers: { 1: 'yes', 2: 'yes', 3: 'yes' },
    result: 'pass',
  },
  questionChain: [
    {
      id: 1,
      question: '患者是否看向特定方向？',
      options: [
        { label: '门口', nextId: 2 },
        { label: '窗外', nextId: 3 },
        { label: '不确定', nextId: 4 },
      ],
    },
    {
      id: 2,
      question: '门口方向是否有人即将离开？',
      options: [
        { label: '是', nextId: 5 },
        { label: '否', nextId: 4 },
      ],
    },
    {
      id: 3,
      question: '窗外是否有特别的景物？',
      options: [
        { label: '梧桐树', nextId: 6 },
        { label: '其他', nextId: 4 },
      ],
    },
    {
      id: 4,
      question: '是否需要记录为待确认信号？',
      options: [
        { label: '是', nextId: null },
        { label: '否', nextId: null },
      ],
    },
    {
      id: 5,
      question: '患者可能想表达"不要走"',
      options: [
        { label: '确认', nextId: null },
        { label: '继续追问', nextId: 4 },
      ],
    },
    {
      id: 6,
      question: '患者可能想再看一眼梧桐树',
      options: [
        { label: '确认', nextId: null },
        { label: '继续追问', nextId: 4 },
      ],
    },
  ],
};
