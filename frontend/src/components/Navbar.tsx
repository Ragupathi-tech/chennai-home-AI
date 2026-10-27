import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Calculator,
  MapPin,
  History,
  BarChart3,
  Cpu,
  Globe,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../i18n/i18n';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar = ({ onOpenAuth }: NavbarProps) => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout, loginAsDemo, updateUserLanguage } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLanguageChange = (code: string) => {
    updateUserLanguage(code);
    setLangDropdownOpen(false);
  };

  const navLinks = [
    { to: '/', label: t('nav.dashboard'), icon: <Home size={18} /> },
    { to: '/predict', label: t('nav.predict'), icon: <Calculator size={18} /> },
    { to: '/map', label: t('nav.map'), icon: <MapPin size={18} /> },
    { to: '/history', label: t('nav.history'), icon: <History size={18} /> },
    { to: '/insights', label: t('nav.insights'), icon: <BarChart3 size={18} /> },
    { to: '/model', label: t('nav.model'), icon: <Cpu size={18} /> },
  ];

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="app-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.5rem',
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              background: 'var(--grad-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: 800,
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.03em',
                  color: '#fff',
                }}
              >
                ChennaiHome
              </span>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--gold)',
                }}
              >
                AI
              </span>
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Valuation Engine
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          className="desktop-links"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Right Section: Language Switcher & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Language Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '0.5rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
              title="Change Language"
            >
              <Globe size={16} color="var(--gold)" />
              <span>
                {SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language)?.nativeName || 'EN'}
              </span>
            </button>

            {langDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '12rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.75rem',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 200,
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    padding: '0.25rem 0.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Regional Languages
                </div>
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      background: i18n.language === l.code ? 'var(--gold-glow)' : 'transparent',
                      color: i18n.language === l.code ? 'var(--gold)' : 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{l.nativeName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Auth Buttons */}
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => navigate('/settings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '0.5rem',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <User size={16} color="var(--emerald)" />
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
              </button>

              <button
                onClick={logout}
                style={{
                  padding: '0.45rem 0.6rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  color: '#fb7185',
                  cursor: 'pointer',
                }}
                title={t('nav.logout')}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={loginAsDemo}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                title="Log in immediately as demo user"
              >
                <Sparkles size={14} color="var(--gold)" />
                <span>Demo</span>
              </button>
              <button
                onClick={onOpenAuth}
                className="btn btn-primary"
                style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
              >
                {t('nav.login')}
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: isActive ? 'var(--gold)' : 'var(--text-primary)',
                backgroundColor: isActive ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
              })}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: isActive ? 'var(--gold)' : 'var(--text-primary)',
            })}
          >
            <Settings size={18} />
            <span>{t('nav.settings')}</span>
          </NavLink>
        </div>
      )}

      {/* Desktop vs Mobile Media Query Helper */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-links {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
        @media (max-width: 899px) {
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};
