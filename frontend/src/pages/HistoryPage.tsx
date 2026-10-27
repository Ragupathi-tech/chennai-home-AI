import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  ExternalLink,
  Sparkles,
  Building,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { predictionApi } from '../services/api';
import type { PropertyPredictionResponse } from '../services/types';
import { PredictionResultModal } from '../components/PredictionResultModal';

export const HistoryPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [predictions, setPredictions] = useState<PropertyPredictionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [buildTypeFilter, setBuildTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [selectedPrediction, setSelectedPrediction] = useState<PropertyPredictionResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await predictionApi.getHistory({
        search: search || undefined,
        area: areaFilter !== 'all' ? areaFilter : undefined,
        buildtype: buildTypeFilter !== 'all' ? buildTypeFilter : undefined,
        sort_by: sortBy,
        page_size: 50,
      });
      setPredictions(data.items);
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, search, areaFilter, buildTypeFilter, sortBy]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t('history.deleteConfirmMsg'))) return;

    setDeletingId(id);
    try {
      await predictionApi.deleteById(id);
      setPredictions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete prediction:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenDetail = (pred: PropertyPredictionResponse) => {
    setSelectedPrediction(pred);
    setIsModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
        <div
          className="glass-card"
          style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 2rem' }}
        >
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '1rem',
              background: 'var(--grad-gold)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              marginBottom: '1rem',
            }}
          >
            <HistoryIcon size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>
            Valuation History
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
            Sign in or explore with a demo account to view and manage your saved property price predictions.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={loginAsDemo}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem' }}
            >
              <Sparkles size={16} />
              <span>Explore as Demo User</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-gold">
            <HistoryIcon size={12} />
            Saved Records
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '0.5rem' }}>
          {t('history.title')}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          {t('history.subtitle')}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '0.75rem' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder={t('history.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Locality Filter */}
        <div>
          <select
            className="form-select"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          >
            <option value="all">All Localities</option>
            <option value="Anna Nagar">Anna Nagar</option>
            <option value="Adyar">Adyar</option>
            <option value="Chrompet">Chrompet</option>
            <option value="KK Nagar">KK Nagar</option>
            <option value="Karapakkam">Karapakkam</option>
            <option value="T Nagar">T. Nagar</option>
            <option value="Velachery">Velachery</option>
          </select>
        </div>

        {/* Property Type Filter */}
        <div>
          <select
            className="form-select"
            value={buildTypeFilter}
            onChange={(e) => setBuildTypeFilter(e.target.value)}
          >
            <option value="all">All Property Types</option>
            <option value="House">Independent House</option>
            <option value="Commercial">Commercial</option>
            <option value="Others">Apartment / Others</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">{t('history.sortNewest')}</option>
            <option value="oldest">{t('history.sortOldest')}</option>
            <option value="highest_price">{t('history.sortHighPrice')}</option>
            <option value="lowest_price">{t('history.sortLowPrice')}</option>
          </select>
        </div>
      </div>

      {/* History Items Grid / List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading saved valuations...
        </div>
      ) : predictions.length === 0 ? (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
          }}
        >
          <Building size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
            {t('history.emptyTitle')}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {t('history.emptySubtitle')}
          </p>
          <button
            onClick={() => navigate('/predict')}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            <Sparkles size={16} />
            <span>{t('history.startPredicting')}</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {predictions.map((item) => (
            <div
              key={item.id}
              className="glass-card glass-card-hover"
              onClick={() => handleOpenDetail(item)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.2rem' }}>
                      {item.area}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={12} />
                      <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>
                  <span className="badge badge-indigo">{item.buildtype}</span>
                </div>

                <div
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--gold)',
                    marginBottom: '0.75rem',
                  }}
                >
                  {item.price_formatted}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    fontSize: '0.8rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Built-up: </span>
                    <strong style={{ color: '#fff' }}>{item.int_sqft} sq.ft</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Config: </span>
                    <strong style={{ color: '#fff' }}>{item.n_bedroom} BHK</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Rate: </span>
                    <strong style={{ color: 'var(--gold)' }}>₹{item.price_per_sqft}/sqft</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Age: </span>
                    <strong style={{ color: '#fff' }}>{item.building_age} Yrs</strong>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleOpenDetail(item)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--gold)',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span>{t('history.viewDetails')}</span>
                  <ExternalLink size={13} />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id!, e)}
                  disabled={deletingId === item.id}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                  title={t('history.deleteBtn')}
                >
                  <Trash2 size={16} color="#fb7185" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Prediction Modal */}
      <PredictionResultModal
        prediction={selectedPrediction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
