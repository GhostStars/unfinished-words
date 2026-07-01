import heroImg from '../assets/hero-illustration.jpg';

function Home({ navigate }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        minHeight: '100dvh',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <h1
        className="brand-h1"
        style={{
          fontSize: 'var(--font-size-2xl)',
          marginTop: '80px',
          marginBottom: '12px',
          lineHeight: 1.18,
          letterSpacing: '-0.01em',
          textWrap: 'balance',
          wordBreak: 'keep-all',
          textAlign: 'center',
        }}
      >
        未尽之言
      </h1>

      <p
        className="brand-body"
        style={{
          color: 'var(--text-secondary)',
          textAlign: 'center',
          maxWidth: '320px',
          marginBottom: 'var(--space-xl)',
          lineHeight: 'var(--line-height-relaxed)',
        }}
      >
        让沉默里的心意，不被轻易错过。
      </p>

      <img
        src={heroImg}
        alt="一位家人在温暖的灯光下陪伴侧卧的亲人，安静而温暖"
        style={{
          width: '100%',
          borderRadius: 'var(--radius-card)',
          display: 'block',
        }}
      />

      <div
        className="brand-card"
        style={{
          width: '100%',
          marginTop: 'var(--space-xl)',
        }}
      >
        <p className="brand-body">
          这是一个帮助家属理解临终亲人最后想说的话的辅助工具。它不会替患者说话，但能帮助你更有序、更谨慎地靠近患者的意思。
        </p>
      </div>

      <div
        style={{
          width: '100%',
          marginTop: 'var(--space-lg)',
          padding: '16px 20px',
          background: 'transparent',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-card)',
        }}
      >
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {[
            '仅用于表达理解辅助',
            '不具备医疗、法律、遗嘱效力',
            '所有记录仅供参考',
            '最终理解仍需家属判断',
          ].map((item) => (
            <li
              key={item}
              className="brand-caption"
              style={{
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                lineHeight: 'var(--line-height-normal)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--text-tertiary)',
                  flexShrink: 0,
                  marginTop: '9px',
                }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          width: '100%',
          marginTop: 'var(--space-2xl)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-md)',
        }}
      >
        <button
          className="brand-btn-primary"
          onClick={() => navigate('inputClue')}
          style={{ width: '100%' }}
        >
          <span>开始一次表达尝试</span>
          <span
            style={{
              display: 'inline-block',
              transition: 'transform 0.25s ease',
            }}
            className="home-cta-arrow"
          >
            &rarr;
          </span>
        </button>
      </div>

      <div style={{ height: '48px', width: '100%' }} />
    </div>
  );
}

export default Home;
