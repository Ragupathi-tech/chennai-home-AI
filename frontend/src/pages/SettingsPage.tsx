import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Globe, Check, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../i18n/i18n';

export const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, updateUserLanguage, loginAsDemo } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLanguageSelect = async (code: string) => {
    await updateUserLanguage(code);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="app-container" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-gold">
            <User size={12} />
            Preferences
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '0.5rem' }}>
          {t('settings.title')}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Account Info Card */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.5rem',
              background: 'var(--grad-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
            }}
          >
            <Shield size={18} />
          </div>
          <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>{t('settings.profileInfo')}</h3>
        </div>

        {isAuthenticated && user ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('settings.name')}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{user.name}</div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('settings.email')}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{user.email}</div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Account Status</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>Active Verified</div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '1rem 0' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              You are currently browsing as a guest. Log in to save predictions to your permanent profile.
            </p>
            <button onClick={loginAsDemo} className="btn btn-primary">
              <Sparkles size={16} />
              <span>Login with Demo Profile</span>
            </button>
          </div>
        )}
      </div>

      {/* Language Preferences Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.5rem',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Globe size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>{t('settings.languagePreferences')}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('settings.languageHelp')}</p>
            </div>
          </div>

          {savedSuccess && (
            <span className="badge badge-emerald">
              <Check size={14} />
              <span>{t('settings.savedSuccess')}</span>
            </span>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            marginTop: '1.5rem',
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageSelect(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  background: isSelected ? 'var(--gold-glow)' : 'var(--bg-surface-elevated)',
                  border: isSelected ? '1px solid var(--gold)' : '1px solid var(--border-subtle)',
                  color: isSelected ? 'var(--gold)' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{lang.nativeName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang.name}</div>
                </div>
                {isSelected && <Check size={18} color="var(--gold)" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
