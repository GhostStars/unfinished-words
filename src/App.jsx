import { useState, useCallback, useEffect } from 'react';
import Home from './pages/Home.jsx';
import InputClue from './pages/InputClue.jsx';
import LifeClues from './pages/LifeClues.jsx';
import Candidates from './pages/Candidates.jsx';
import Calibration from './pages/Calibration.jsx';
import QuestionChain from './pages/QuestionChain.jsx';
import PauseGuess from './pages/PauseGuess.jsx';
import GuessRecord from './pages/GuessRecord.jsx';
import ExpressionRecord from './pages/ExpressionRecord.jsx';
import History from './pages/History.jsx';

const PAGE_TITLES = {
  inputClue: '输入线索',
  lifeClues: '生命线索',
  candidates: '候选含义',
  calibration: '信号校准',
  questionChain: '问题链',
  pauseGuess: '暂停猜测',
  guessRecord: '猜测记录',
  expressionRecord: '表达记录',
  history: '猜测历史',
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [history, setHistory] = useState([]);
  const [navigateData, setNavigateData] = useState({});

  // 禁用全局下拉刷新（iOS Safari 橡皮筋效果）
  useEffect(() => {
    let startY = 0;
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      // 只有在页面顶部且向下拖动时才阻止
      if (window.scrollY <= 0 && touch.clientY > startY) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const navigate = useCallback((page, data = {}) => {
    setNavigateData(data);
    setHistory((prev) => [...prev, currentPage]);
    setCurrentPage(page);
  }, [currentPage]);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) {
        setCurrentPage('home');
        return [];
      }
      const newHistory = [...prev];
      const previousPage = newHistory.pop();
      setCurrentPage(previousPage);
      return newHistory;
    });
  }, []);

  const pageProps = { navigate, goBack, pageTitle: PAGE_TITLES[currentPage], navigateData };

  let pageComponent;
  switch (currentPage) {
    case 'home':
      pageComponent = <Home navigate={navigate} />;
      break;
    case 'inputClue':
      pageComponent = <InputClue {...pageProps} />;
      break;
    case 'lifeClues':
      pageComponent = <LifeClues {...pageProps} />;
      break;
    case 'candidates':
      pageComponent = <Candidates {...pageProps} />;
      break;
    case 'calibration':
      pageComponent = <Calibration {...pageProps} />;
      break;
    case 'questionChain':
      pageComponent = <QuestionChain {...pageProps} />;
      break;
    case 'pauseGuess':
      pageComponent = <PauseGuess {...pageProps} />;
      break;
    case 'guessRecord':
      pageComponent = <GuessRecord {...pageProps} />;
      break;
    case 'expressionRecord':
      pageComponent = <ExpressionRecord {...pageProps} />;
      break;
    case 'history':
      pageComponent = <History {...pageProps} />;
      break;
    default:
      pageComponent = <Home navigate={navigate} />;
  }

  return (
    <div className="app-container page-enter" key={currentPage}>
      {pageComponent}
    </div>
  );
}

export default App;
