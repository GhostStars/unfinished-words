import { useState } from 'react';
import Home from './pages/Home.jsx';
import InputClue from './pages/InputClue.jsx';
import LifeClues from './pages/LifeClues.jsx';
import Candidates from './pages/Candidates.jsx';
import Calibration from './pages/Calibration.jsx';
import QuestionChain from './pages/QuestionChain.jsx';
import PauseGuess from './pages/PauseGuess.jsx';
import GuessRecord from './pages/GuessRecord.jsx';
import ExpressionRecord from './pages/ExpressionRecord.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const navigate = (page) => setCurrentPage(page);

  let pageComponent;
  switch (currentPage) {
    case 'home':
      pageComponent = <Home navigate={navigate} />;
      break;
    case 'inputClue':
      pageComponent = <InputClue navigate={navigate} />;
      break;
    case 'lifeClues':
      pageComponent = <LifeClues navigate={navigate} />;
      break;
    case 'candidates':
      pageComponent = <Candidates navigate={navigate} />;
      break;
    case 'calibration':
      pageComponent = <Calibration navigate={navigate} />;
      break;
    case 'questionChain':
      pageComponent = <QuestionChain navigate={navigate} />;
      break;
    case 'pauseGuess':
      pageComponent = <PauseGuess navigate={navigate} />;
      break;
    case 'guessRecord':
      pageComponent = <GuessRecord navigate={navigate} />;
      break;
    case 'expressionRecord':
      pageComponent = <ExpressionRecord navigate={navigate} />;
      break;
    default:
      pageComponent = <Home navigate={navigate} />;
  }

  return (
    <div className="app-container">
      {pageComponent}
    </div>
  );
}

export default App;
