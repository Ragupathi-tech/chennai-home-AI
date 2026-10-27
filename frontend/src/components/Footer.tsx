import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, ShieldCheck, MapPin, Database } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        padding: '3rem 0 2rem',
        marginTop: 'auto',
      }}
    >
      <div className="app-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '0.5rem',
                  background: 'var(--grad-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  fontWeight: 800,
                }}
              >
                <Sparkles size={16} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                ChennaiHome <span style={{ color: 'var(--gold)' }}>AI</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t('app.description')}
            </p>
            <div
              style={{
                marginTop: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '0.5rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#34d399',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <Database size={14} />
              <span>7,109 Verified Chennai Records</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
              Valuation Tools
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <Link to="/predict" style={{ color: 'var(--text-secondary)' }}>
                {t('nav.predict')}
              </Link>
              <Link to="/map" style={{ color: 'var(--text-secondary)' }}>
                {t('nav.map')}
              </Link>
              <Link to="/history" style={{ color: 'var(--text-secondary)' }}>
                {t('nav.history')}
              </Link>
              <Link to="/insights" style={{ color: 'var(--text-secondary)' }}>
                {t('nav.insights')}
              </Link>
              <Link to="/model" style={{ color: 'var(--text-secondary)' }}>
                {t('nav.model')}
              </Link>
            </div>
          </div>

          {/* Supported Localities */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
              Primary Localities
            </h4>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.4rem',
              }}
            >
              {['Anna Nagar', 'Adyar', 'T Nagar', 'Velachery', 'Chrompet', 'KK Nagar', 'Karapakkam'].map((loc) => (
                <span
                  key={loc}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '0.375rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <MapPin size={11} color="var(--gold)" />
                  {loc}
                </span>
              ))}
            </div>
          </div>

          {/* AI Accuracy & Trust */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
              Model Governance
            </h4>
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--emerald)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                  Target Leakage Free
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Trained exclusively on physical & structural property specs without registration fee contamination.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Disclaimer */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <p>{t('result.disclaimer')}</p>
          <p>{t('app.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};
