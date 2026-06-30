function Home({ navigate }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        gap: 'var(--space-lg)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', alignItems: 'center' }}>
        <h1 className="brand-h1" style={{ fontSize: 'var(--font-size-2xl)' }}>
          未尽之言
        </h1>
        <p
          className="brand-body"
          style={{
            color: 'var(--text-secondary)',
            maxWidth: '280px',
            lineHeight: 'var(--line-height-relaxed)',
          }}
        >
          让沉默里的心意，不被轻易错过
        </p>
      </div>

      <button
        className="brand-btn-primary"
        onClick={() => navigate('inputClue')}
        style={{ marginTop: 'var(--space-xl)', width: '100%', maxWidth: '280px' }}
      >
        开始一次表达尝试
      </button>

      <p
        className="brand-small"
        style={{
          marginTop: 'auto',
          paddingTop: 'var(--space-2xl)',
          maxWidth: '320px',
          textAlign: 'center',
        }}
      >
        本工具仅用于家属理解辅助，不构成医疗、法律或遗嘱效力
      </p>
    </div>
  );
}

export default Home;
