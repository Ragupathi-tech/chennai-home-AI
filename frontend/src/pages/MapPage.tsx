import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Sparkles, Building } from 'lucide-react';
import { insightsApi } from '../services/api';
import type { Locality } from '../services/types';

// Custom Map Marker Icon
const createCustomIcon = (isDatasetRecord: boolean) => {
  const color = isDatasetRecord ? '#f59e0b' : '#38bdf8';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #fff;
        box-shadow: 0 0 12px ${color};
      ">
        <div style="background: #000; width: 6px; height: 6px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Component to smoothly pan the map when a locality is selected
const MapController: React.FC<{ targetCoords: [number, number] | null }> = ({ targetCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 14, { duration: 1.5 });
    }
  }, [targetCoords, map]);
  return null;
};

export const MapPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [localities, setLocalities] = useState<Locality[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<Locality | null>(null);
  const [targetCoords, setTargetCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchLocalities = async () => {
      try {
        const data = await insightsApi.getLocalities();
        setLocalities(data);

        // Check if query param specifies an area
        const queryArea = searchParams.get('area');
        if (queryArea) {
          const match = data.find((l) => l.area.toLowerCase() === queryArea.toLowerCase());
          if (match) {
            setSelectedLocality(match);
            setTargetCoords([match.latitude, match.longitude]);
          }
        } else if (data.length > 0) {
          setSelectedLocality(data[0]);
        }
      } catch (e) {
        console.error('Failed to load localities for map:', e);
      }
    };
    fetchLocalities();
  }, [searchParams]);

  const handleSelectLocality = (loc: Locality) => {
    setSelectedLocality(loc);
    setTargetCoords([loc.latitude, loc.longitude]);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-gold">
            <MapPin size={12} />
            Geographic Intelligence
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '0.5rem' }}>
          {t('map.title')}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          {t('map.subtitle')}
        </p>
      </div>

      {/* Locality Quick-Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        {localities.map((loc) => {
          const isSelected = selectedLocality?.area === loc.area;
          return (
            <button
              key={loc.area}
              onClick={() => handleSelectLocality(loc)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '0.5rem',
                background: isSelected ? 'var(--grad-gold)' : 'var(--bg-surface-elevated)',
                color: isSelected ? '#000' : 'var(--text-primary)',
                border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              <MapPin size={14} color={isSelected ? '#000' : 'var(--gold)'} />
              <span>{loc.area}</span>
              <span style={{ opacity: isSelected ? 0.8 : 0.6, fontSize: '0.75rem' }}>
                ₹{loc.avg_price_lakhs}L
              </span>
            </button>
          );
        })}
      </div>

      {/* Map + Detail Sidebar Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: '1.5rem',
          height: '620px',
        }}
        className="map-layout-grid"
      >
        {/* Leaflet Map Card */}
        <div
          className="glass-card"
          style={{
            padding: '0.5rem',
            height: '100%',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <MapContainer
            center={[13.04, 80.21]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController targetCoords={targetCoords} />

            {localities.map((loc) => (
              <Marker
                key={loc.area}
                position={[loc.latitude, loc.longitude]}
                icon={createCustomIcon(loc.has_dataset_records)}
                eventHandlers={{
                  click: () => setSelectedLocality(loc),
                }}
              >
                <Popup>
                  <div style={{ padding: '0.5rem', minWidth: '180px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
                      {loc.area}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.4rem' }}>
                      Avg: ₹{loc.avg_price_lakhs} Lakhs
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                      Rate: ₹{loc.avg_sqft_price.toLocaleString()}/sqft
                    </div>
                    <button
                      onClick={() => navigate(`/predict?area=${encodeURIComponent(loc.area)}`)}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      <Sparkles size={12} />
                      <span>Valuate Here</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Selected Locality Details Card */}
        <div
          className="glass-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          {selectedLocality ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
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
                  <Building size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>{selectedLocality.area}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Chennai, Tamil Nadu
                  </div>
                </div>
              </div>

              {/* Price Metric */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  {t('map.popupAvg')}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gold)' }}>
                  ₹{selectedLocality.avg_price_lakhs} Lakhs
                </div>
              </div>

              {/* Key Specs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('map.popupSqft')}</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>
                    ₹{selectedLocality.avg_sqft_price.toLocaleString()}/sqft
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('map.popupCount')}</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>
                    {selectedLocality.count} properties
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Price Range</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>
                    ₹{Math.round(selectedLocality.min_price / 100000)}L - ₹{Math.round(selectedLocality.max_price / 100000)}L
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Coordinates</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {selectedLocality.latitude.toFixed(4)}, {selectedLocality.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              Select a locality from the map or chips above to view detailed pricing.
            </div>
          )}

          {/* Action Button */}
          {selectedLocality && (
            <button
              onClick={() => navigate(`/predict?area=${encodeURIComponent(selectedLocality.area)}`)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              <Sparkles size={16} />
              <span>Run Valuation in {selectedLocality.area}</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .map-layout-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          .map-layout-grid > div:first-child {
            height: 400px !important;
          }
        }
      `}</style>
    </div>
  );
};
