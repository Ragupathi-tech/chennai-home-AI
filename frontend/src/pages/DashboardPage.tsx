import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Building,
  BarChart3,
  Cpu,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { insightsApi, predictionApi } from '../services/api';
import type { Locality, PropertyPredictionResponse } from '../services/types';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [localities, setLocalities] = useState<Locality[]>([]);
  const [recentPredictions, setRecentPredictions] = useState<PropertyPredictionResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const locs = await insightsApi.getLocalities();
        setLocalities(locs.filter((l) => l.has_dataset_records));

        if (isAuthenticated) {
          const hist = await predictionApi.getHistory({ page_size: 4, sort_by: 'newest' });
          setRecentPredictions(hist.items);
        }
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  return (
    <div className="app-container">
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '3.5rem 2rem',
          borderRadius: '1.5rem',
          background: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.8) 70%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          overflow: 'hidden',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ maxWidth: '720px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--gold)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={14} />
            <span>AI Real Estate Valuation Engine</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#fff',
              marginBottom: '1rem',
            }}
          >
            {user
              ? t('dashboard.welcomeUser', { name: user.name.split(' ')[0] })
              : 'Precise Property Valuation for Chennai'}
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            {t('dashboard.bannerText')}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/predict')}
              className="btn btn-primary"
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
            >
              <Sparkles size={18} />
              <span>{t('dashboard.newPrediction')}</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate('/map')}
              className="btn btn-secondary"
              style={{ padding: '0.85rem 1.5rem', fontSize: '1rem' }}
            >
              <MapPin size={18} color="var(--gold)" />
              <span>{t('nav.map')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Market Key Metrics Stats */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div className="glass-card glass-card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {t('dashboard.statMarketAvg')}
              </span>
              <div style={{ padding: '0.4rem', borderRadius: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--gold)' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              ₹1.03 Cr
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Median Chennai transaction benchmark
            </div>
          </div>

          <div className="glass-card glass-card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Avg Price / Sq. Ft.
              </span>
              <div style={{ padding: '0.4rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Building size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              ₹7,980
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Weighted across all prime zones
            </div>
          </div>

          <div className="glass-card glass-card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Model Precision (R²)
              </span>
              <div style={{ padding: '0.4rem', borderRadius: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc' }}>
                <Cpu size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              99.6%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              LightGBM 5-fold cross-validated
            </div>
          </div>

          <div className="glass-card glass-card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Verified Records
              </span>
              <div style={{ padding: '0.4rem', borderRadius: '0.5rem', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
                <Layers size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              7,109
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Zero target-leakage training set
            </div>
          </div>
        </div>
      </section>

      {/* Popular Chennai Localities Section */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#fff' }}>{t('dashboard.popularLocalities')}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('dashboard.popularLocalitiesDesc')}
            </p>
          </div>
          <button
            onClick={() => navigate('/map')}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
          >
            <span>Explore Map</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {localities.map((loc) => (
            <div
              key={loc.area}
              className="glass-card glass-card-hover"
              onClick={() => navigate(`/predict?area=${encodeURIComponent(loc.area)}`)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={18} color="var(--gold)" />
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{loc.area}</span>
                </div>
                <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                  {loc.count} sales
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Price</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                    ₹{loc.avg_price_lakhs} Lakhs
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Rate</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold)' }}>
                    ₹{loc.avg_sqft_price.toLocaleString()}/sqft
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Valuations / Empty State */}
      {isAuthenticated && recentPredictions.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#fff' }}>{t('dashboard.recentPredictionsTitle')}</h2>
            <button
              onClick={() => navigate('/history')}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
            >
              <span>{t('dashboard.actionHistory')}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {recentPredictions.map((item) => (
              <div
                key={item.id}
                className="glass-card glass-card-hover"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/history')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{item.area}</span>
                  <span className="badge badge-indigo">{item.buildtype}</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '0.5rem' }}>
                  {item.price_formatted}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.int_sqft} sq.ft • {item.n_bedroom} BHK</span>
                  <span>₹{item.price_per_sqft}/sqft</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Action Navigation Strip */}
      <section>
        <div
          className="glass-card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
          }}
        >
          <button
            onClick={() => navigate('/predict')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <Sparkles size={20} color="var(--gold)" />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{t('dashboard.actionPredict')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimate instantly</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <MapPin size={20} color="var(--emerald)" />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{t('dashboard.actionMap')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Geographic pins</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/insights')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <BarChart3 size={20} color="var(--sky)" />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{t('dashboard.actionInsights')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price distributions</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/model')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <Cpu size={20} color="var(--indigo)" />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{t('dashboard.actionModel')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>R² 99.6% benchmark</div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};
