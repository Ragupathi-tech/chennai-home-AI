import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  RotateCcw,
  Home,
  Sliders,
  ShieldAlert,
  Building,
  Info,
} from 'lucide-react';
import { predictionApi } from '../services/api';
import type {
  PropertyPredictionRequest,
  PropertyPredictionResponse,
} from '../services/types';
import { PredictionResultModal } from '../components/PredictionResultModal';

const PRESETS = [
  {
    name: '3 BHK Villa in Anna Nagar',
    data: {
      area: 'Anna Nagar',
      int_sqft: 1950,
      dist_mainroad: 35,
      n_bedroom: 3,
      n_bathroom: 2,
      n_room: 5,
      buildtype: 'House',
      sale_cond: 'Normal Sale',
      park_facil: 'Yes',
      utility_avail: 'AllPub',
      street: 'Paved',
      mzzone: 'RH',
      building_age: 6,
      qs_rooms: 4.2,
      qs_bathroom: 4.0,
      qs_bedroom: 4.1,
    },
  },
  {
    name: '2 BHK Apartment in Velachery',
    data: {
      area: 'Velachery',
      int_sqft: 1200,
      dist_mainroad: 80,
      n_bedroom: 2,
      n_bathroom: 2,
      n_room: 4,
      buildtype: 'Others',
      sale_cond: 'Normal Sale',
      park_facil: 'Yes',
      utility_avail: 'AllPub',
      street: 'Paved',
      mzzone: 'RM',
      building_age: 4,
      qs_rooms: 4.0,
      qs_bathroom: 3.8,
      qs_bedroom: 3.9,
    },
  },
  {
    name: 'Prime Retail Space in T. Nagar',
    data: {
      area: 'T Nagar',
      int_sqft: 1750,
      dist_mainroad: 15,
      n_bedroom: 1,
      n_bathroom: 2,
      n_room: 4,
      buildtype: 'Commercial',
      sale_cond: 'Normal Sale',
      park_facil: 'Yes',
      utility_avail: 'AllPub',
      street: 'Paved',
      mzzone: 'C',
      building_age: 10,
      qs_rooms: 4.5,
      qs_bathroom: 4.2,
      qs_bedroom: 4.0,
    },
  },
  {
    name: 'Budget 2 BHK in Chrompet',
    data: {
      area: 'Chrompet',
      int_sqft: 980,
      dist_mainroad: 110,
      n_bedroom: 2,
      n_bathroom: 1,
      n_room: 3,
      buildtype: 'Others',
      sale_cond: 'Family',
      park_facil: 'No',
      utility_avail: 'NoSewr',
      street: 'Gravel',
      mzzone: 'RL',
      building_age: 12,
      qs_rooms: 3.5,
      qs_bathroom: 3.2,
      qs_bedroom: 3.6,
    },
  },
];

const DEFAULT_FORM: PropertyPredictionRequest = {
  area: 'Anna Nagar',
  int_sqft: 1450,
  dist_mainroad: 50,
  n_bedroom: 2,
  n_bathroom: 2,
  n_room: 4,
  buildtype: 'House',
  sale_cond: 'Normal Sale',
  park_facil: 'Yes',
  utility_avail: 'AllPub',
  street: 'Paved',
  mzzone: 'RM',
  building_age: 5,
  qs_rooms: 4.0,
  qs_bathroom: 4.0,
  qs_bedroom: 4.0,
};

export const PredictorPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState<PropertyPredictionRequest>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PropertyPredictionResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check query param for preselected area
  useEffect(() => {
    const areaParam = searchParams.get('area');
    if (areaParam) {
      setFormData((prev) => ({ ...prev, area: areaParam }));
    }
  }, [searchParams]);

  const handleInputChange = (field: keyof PropertyPredictionRequest, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyPreset = (presetData: PropertyPredictionRequest) => {
    setFormData(presetData);
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await predictionApi.predict({
        ...formData,
        int_sqft: Number(formData.int_sqft),
        dist_mainroad: Number(formData.dist_mainroad),
        n_bedroom: Number(formData.n_bedroom),
        n_bathroom: Number(formData.n_bathroom),
        n_room: Number(formData.n_room),
        building_age: Number(formData.building_age),
      });
      setResult(res);
      setIsModalOpen(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Unable to calculate price prediction. Please check your backend connection.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-gold">
            <Sparkles size={12} />
            Instant ML Valuation
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '0.5rem' }}>
          {t('predictor.title')}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          {t('predictor.subtitle')}
        </p>
      </div>

      {/* 1-Click Preset Scenario Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
          Quick Scenario Presets:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset.data)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '0.5rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {/* Section 1: Locality & Built-up Area */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} color="var(--gold)" />
              1. Locality & Area Dimensions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">{t('predictor.area')}</label>
                <select
                  className="form-select"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  required
                >
                  <option value="Anna Nagar">Anna Nagar</option>
                  <option value="Adyar">Adyar</option>
                  <option value="Chrompet">Chrompet</option>
                  <option value="KK Nagar">KK Nagar</option>
                  <option value="Karapakkam">Karapakkam</option>
                  <option value="T Nagar">T. Nagar</option>
                  <option value="Velachery">Velachery</option>
                </select>
              </div>

              {/* Built-up Area with Slider + Input */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">{t('predictor.intSqft')}</label>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gold)' }}>
                    {formData.int_sqft} sq.ft
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={3500}
                  step={25}
                  value={formData.int_sqft}
                  onChange={(e) => handleInputChange('int_sqft', Number(e.target.value))}
                />
                <input
                  type="number"
                  min={400}
                  max={5000}
                  className="form-input"
                  value={formData.int_sqft}
                  onChange={(e) => handleInputChange('int_sqft', Number(e.target.value))}
                  style={{ marginTop: '0.25rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('predictor.distMainroad')}</label>
                <input
                  type="number"
                  min={0}
                  max={300}
                  className="form-input"
                  value={formData.dist_mainroad}
                  onChange={(e) => handleInputChange('dist_mainroad', Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Rooms & Layout */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Home size={18} color="var(--emerald)" />
              2. Rooms & Configuration
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">{t('predictor.nBedroom')}</label>
                <select
                  className="form-select"
                  value={formData.n_bedroom}
                  onChange={(e) => handleInputChange('n_bedroom', Number(e.target.value))}
                >
                  <option value={1}>1 BHK (Single Bedroom)</option>
                  <option value={2}>2 BHK (Two Bedrooms)</option>
                  <option value={3}>3 BHK (Three Bedrooms)</option>
                  <option value={4}>4 BHK (Four Bedrooms)</option>
                  <option value={5}>5+ BHK (Luxury Villa)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('predictor.nBathroom')}</label>
                <select
                  className="form-select"
                  value={formData.n_bathroom}
                  onChange={(e) => handleInputChange('n_bathroom', Number(e.target.value))}
                >
                  <option value={1}>1 Bathroom</option>
                  <option value={2}>2 Bathrooms</option>
                  <option value={3}>3 Bathrooms</option>
                  <option value={4}>4+ Bathrooms</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('predictor.nRoom')}</label>
                <input
                  type="number"
                  min={2}
                  max={8}
                  className="form-input"
                  value={formData.n_room}
                  onChange={(e) => handleInputChange('n_room', Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Total rooms including living, dining, and bedrooms
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Property Type & Construction */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={18} color="var(--sky)" />
              3. Type & Building Age
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">{t('predictor.buildtype')}</label>
                <select
                  className="form-select"
                  value={formData.buildtype}
                  onChange={(e) => handleInputChange('buildtype', e.target.value)}
                >
                  <option value="House">Independent House</option>
                  <option value="Commercial">Commercial Building / Office</option>
                  <option value="Others">Apartment / Others</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('predictor.saleCond')}</label>
                <select
                  className="form-select"
                  value={formData.sale_cond}
                  onChange={(e) => handleInputChange('sale_cond', e.target.value)}
                >
                  <option value="Normal Sale">Normal Sale</option>
                  <option value="Family">Family Sale</option>
                  <option value="Partial">Partial Sale</option>
                  <option value="AdjLand">Adjacent Land Purchase</option>
                  <option value="AbNormal">AbNormal / Distressed Sale</option>
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">{t('predictor.buildingAge')}</label>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gold)' }}>
                    {formData.building_age} Years
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={formData.building_age}
                  onChange={(e) => handleInputChange('building_age', Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Infrastructure & Access */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={18} color="var(--indigo)" />
              4. Zoning & Infrastructure
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">{t('predictor.parkFacil')}</label>
                <select
                  className="form-select"
                  value={formData.park_facil}
                  onChange={(e) => handleInputChange('park_facil', e.target.value)}
                >
                  <option value="Yes">Yes (Covered / Dedicated)</option>
                  <option value="No">No (Street Parking Only)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('predictor.street')}</label>
                <select
                  className="form-select"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                >
                  <option value="Paved">Paved (Tar / Concrete)</option>
                  <option value="Gravel">Gravel / WBM</option>
                  <option value="No Access">No Access Road</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('predictor.utilityAvail')}</label>
                <select
                  className="form-select"
                  value={formData.utility_avail}
                  onChange={(e) => handleInputChange('utility_avail', e.target.value)}
                >
                  <option value="AllPub">All Public Utilities (Water, Power, Sewage)</option>
                  <option value="NoSewr">Electricity & Water (No Sewerage)</option>
                  <option value="NoSeWa">Electricity Only</option>
                  <option value="ELO">Electricity Light Only</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('predictor.mzzone')}</label>
                <select
                  className="form-select"
                  value={formData.mzzone}
                  onChange={(e) => handleInputChange('mzzone', e.target.value)}
                >
                  <option value="RH">RH - High Density Residential</option>
                  <option value="RM">RM - Medium Density Residential</option>
                  <option value="RL">RL - Low Density Residential</option>
                  <option value="C">C - Commercial Zone</option>
                  <option value="I">I - Industrial Zone</option>
                  <option value="A">A - Agricultural / Mixed Zone</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit & Reset Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            padding: '1.5rem',
            borderRadius: '1rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary"
            disabled={submitting}
          >
            <RotateCcw size={16} />
            <span>{t('predictor.resetBtn')}</span>
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}
          >
            <Sparkles size={18} />
            <span>{submitting ? t('predictor.calculating') : t('predictor.predictBtn')}</span>
          </button>
        </div>
      </form>

      {/* Valuation Result Modal */}
      <PredictionResultModal
        prediction={result}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onResetForm={handleReset}
      />
    </div>
  );
};
