import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  Info,
} from 'lucide-react';
import { insightsApi } from '../services/api';
import type { MarketSummary } from '../services/types';

const COLORS = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#0ea5e9'];

export const InsightsPage = () => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await insightsApi.getMarketSummary();
        setSummary(data);
      } catch (e) {
        console.error('Failed to load market insights:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
        Loading market intelligence charts...
      </div>
    );
  }

  if (!summary) return null;

  // Filter dataset localities for charts
  const localityChartData = summary.localities
    .filter((l) => l.has_dataset_records)
    .sort((a, b) => b.avg_price_lakhs - a.avg_price_lakhs);

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-gold">
            <BarChart3 size={12} />
            Chennai Housing Analytics
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '0.5rem' }}>
          {t('insights.title')}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          {t('insights.subtitle')}
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Total Transaction Records
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            {summary.total_properties.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', marginTop: '0.25rem' }}>
            Complete verified sales dataset
          </div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Chennai Overall Average Price
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold)' }}>
            ₹{summary.avg_price_lakhs} Lakhs
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            ₹{(summary.avg_price / 10000000).toFixed(2)} Crores
          </div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Citywide Avg Rate / Sq. Ft.
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
            ₹{summary.avg_price_per_sqft.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Based on {summary.avg_sqft} sq.ft mean area
          </div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Median Selling Price
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a5b4fc' }}>
            ₹{(summary.median_price / 100000).toFixed(1)} Lakhs
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Middle transaction mark
          </div>
        </div>
      </div>

      {/* 2-Column Charts: Price by Locality & Rate by Locality */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Chart 1: Avg Price by Locality */}
        <div className="glass-card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.25rem' }}>
              {t('insights.avgPriceByArea')}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Comparison of mean selling value across major Chennai zones
            </p>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={localityChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
                <XAxis dataKey="area" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                  formatter={(val: unknown) => [`₹${val} Lakhs`, 'Average Price']}
                />
                <Bar dataKey="avg_price_lakhs" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Rate per Sq. Ft. by Locality */}
        <div className="glass-card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.25rem' }}>
              {t('insights.sqftPriceByArea')}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Land & built-up efficiency rate per sq. ft.
            </p>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={localityChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
                <XAxis dataKey="area" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                  formatter={(val: unknown) => [`₹${Number(val).toLocaleString()}/sqft`, 'Rate / Sq.Ft.']}
                />
                <Bar dataKey="avg_sqft_price" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2-Column Charts: Property Type Breakdown & Price Ranges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Chart 3: Property Type Donut */}
        <div className="glass-card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.25rem' }}>
              {t('insights.buildTypeComp')}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Transaction share between Houses, Commercial, and Apartments
            </p>
          </div>

          <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.buildtype_distribution}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={5}
                >
                  {summary.buildtype_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                  formatter={(val: unknown, name: unknown) => [`${val} transactions`, `${name}`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
            {summary.buildtype_distribution.map((item, idx) => (
              <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                <span style={{ color: '#fff', fontWeight: 600 }}>{item.type}</span>
                <span style={{ color: 'var(--text-muted)' }}>({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Price Bracket Distribution */}
        <div className="glass-card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.25rem' }}>
              {t('insights.priceDistribution')}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Number of verified sales across price brackets
            </p>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.price_ranges} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                  formatter={(val: unknown) => [`${val} properties`, 'Count']}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Source Note Footer */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}
      >
        <Info size={18} color="var(--gold)" />
        <span>{summary.source_note}</span>
      </div>
    </div>
  );
};
