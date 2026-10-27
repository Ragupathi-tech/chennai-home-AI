import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  X,
  Sparkles,
  Printer,
  MapPin,
  TrendingDown,
  TrendingUp,
  Minus,
  ShieldAlert,
} from 'lucide-react';
import type { PropertyPredictionResponse } from '../services/types';

interface PredictionResultModalProps {
  prediction: PropertyPredictionResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onResetForm?: () => void;
}

export const PredictionResultModal = ({
  prediction,
  isOpen,
  onClose,
  onResetForm,
}: PredictionResultModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!isOpen || !prediction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleViewMap = () => {
    onClose();
    navigate(`/map?area=${encodeURIComponent(prediction.area)}`);
  };

  const handleNewValuation = () => {
    onClose();
    if (onResetForm) onResetForm();
  };

  const isBelow = prediction.diff_from_avg_pct < -5;
  const isAbove = prediction.diff_from_avg_pct > 5;

  return (
    <div className="modal-overlay print-target" onClick={onClose}>
      <div
        className="glass-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#111827',
          padding: '2rem',
          position: 'relative',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="no-print"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: '0.75rem',
              background: 'var(--grad-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: 800,
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>{t('result.title')}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {prediction.area}, Chennai • {prediction.int_sqft} Sq. Ft. {prediction.buildtype}
            </p>
          </div>
        </div>

        {/* Big Valuation Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(30, 41, 59, 0.8) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '1rem',
            padding: '1.75rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--gold)',
              marginBottom: '0.25rem',
            }}
          >
            {t('result.estimatedPrice')}
          </div>
          <div
            style={{
              fontSize: '2.75rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: '#fff',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: '0.5rem',
            }}
          >
            {prediction.price_formatted}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <span className="badge badge-gold" style={{ fontSize: '0.85rem' }}>
              ₹{prediction.price_lakhs} {t('result.inLakhs')} / ₹{prediction.price_crores} {t('result.inCrores')}
            </span>
            <span className="badge badge-indigo" style={{ fontSize: '0.85rem' }}>
              ₹{prediction.price_per_sqft.toLocaleString()} / Sq. Ft.
            </span>
          </div>
        </div>

        {/* 2-Column Metrics: Confidence Band & Locality Benchmark */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Confidence Band Card */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '0.75rem',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {t('result.confidenceRange')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Low: {prediction.confidence_low_formatted}</span>
              <span style={{ color: 'var(--text-muted)' }}>High: {prediction.confidence_high_formatted}</span>
            </div>
            {/* Visual Bar Gauge */}
            <div
              style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '10%',
                  right: '10%',
                  height: '100%',
                  background: 'var(--grad-gold)',
                  borderRadius: '4px',
                }}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Based on historical prediction residual variance (±5% band)
            </div>
          </div>

          {/* Locality Benchmark Card */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '0.75rem',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {t('result.localityComparison')} ({prediction.area})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {t('result.localityAvgPrice')}:
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                {prediction.locality_avg_formatted}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isBelow ? (
                <span className="badge badge-emerald">
                  <TrendingDown size={14} />
                  {Math.abs(prediction.diff_from_avg_pct)}% below area average
                </span>
              ) : isAbove ? (
                <span className="badge badge-rose">
                  <TrendingUp size={14} />
                  +{prediction.diff_from_avg_pct}% above area average
                </span>
              ) : (
                <span className="badge badge-indigo">
                  <Minus size={14} />
                  Near average ({prediction.diff_from_avg_pct}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Property Specifications Table */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
            {t('result.propertySpecs')}
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Built-up Area</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{prediction.int_sqft} sq.ft</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bedrooms / Bathrooms</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{prediction.n_bedroom} BHK / {prediction.n_bathroom} Bath</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Property Type</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{prediction.buildtype}</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Building Age</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{prediction.building_age} Years</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Road Access / Dist</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{prediction.street} ({prediction.dist_mainroad}m)</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Zoning / Parking</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Zone {prediction.mzzone} • Parking: {prediction.park_facil}</div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <ShieldAlert size={16} color="var(--gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{prediction.disclaimer}</span>
        </div>

        {/* Actions Toolbar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={handlePrint} className="btn btn-secondary">
              <Printer size={16} />
              <span>{t('result.printReport')}</span>
            </button>
            <button type="button" onClick={handleViewMap} className="btn btn-secondary">
              <MapPin size={16} />
              <span>{t('result.viewMap')}</span>
            </button>
          </div>
          <button type="button" onClick={handleNewValuation} className="btn btn-primary">
            <Sparkles size={16} />
            <span>{t('result.startAnother')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
