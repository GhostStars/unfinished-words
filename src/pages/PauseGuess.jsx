import { useEffect, useState } from 'react';
import { getState, clearState } from '../utils/storage.js';
import PageHeader from '../components/PageHeader.jsx';

function PauseGuess({ navigate, goBack }) {
  const [hasRecord, setHasRecord] = useState(false);

  useEffect(() => {
    const state = getState();
    const progress = state?.questionChainProgress;
    const hasLog = progress?.feedbackLog && progress.feedbackLog.length > 0;
    setHasRecord(!!hasLog);
  }, []);

  const handleSaveRecord = () => {
    navigate('guessRecord');
  };

  const handleContinueLater = () => {
    navigate('home');
  };

  const handleRecalibrate = () => {
    navigate('calibration');
  };

  const handleEndAttempt = () => {
    clearState();
    navigate('home');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <PageHeader title="暂停猜测" onBack={goBack} />

      <div>
        <h2 className="brand-h2">先停一停</h2>
        <p
          className="brand-body"
          style={{
            marginTop: 'var(--space-md)',
            lineHeight: 'var(--line-height-relaxed)',
            color: 'var(--text-secondary)',
          }}
        >
          当前还无法形成可靠判断。与其继续猜下去，不如先停一停，保留已经尝试过的线索。
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {hasRecord && (
          <button
            className="brand-btn-primary"
            onClick={handleSaveRecord}
            style={{ width: '100%' }}
          >
            保存当前猜测记录
          </button>
        )}

        <button
          className={hasRecord ? 'brand-btn-outline' : 'brand-btn-primary'}
          onClick={handleContinueLater}
          style={{ width: '100%' }}
        >
          稍后继续
        </button>

        <button
          className="brand-btn-outline"
          onClick={handleRecalibrate}
          style={{ width: '100%' }}
        >
          重新校准反馈
        </button>

        <button
          className="brand-btn-danger"
          onClick={handleEndAttempt}
          style={{ width: '100%' }}
        >
          结束本次尝试
        </button>
      </div>
    </div>
  );
}

export default PauseGuess;
