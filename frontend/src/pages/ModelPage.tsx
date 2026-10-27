import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { insightsApi } from '../services/api';
import type { ModelMetrics } from '../services/types';

export const ModelPage = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await insightsApi.getModelMetrics();
        setMetrics(data);
      } catch (e) {
        console.error('Failed to load model metrics:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
        Loading AI model benchmarks...
      </div>
    );
  }

  if (!metrics) return null;

  const featureImportanceData = Object.entries(metrics.feature_importance || {})
    .map(([feature, weight]) => ({
      feature,
      percentage: Number((weight * 100).toFixed(1)),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-gold">
            <Cpu size={12} />
            Machine Learning Transparency
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '0.5rem' }}>
          {t('model.title')}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          {t('model.subtitle')}
        </p>
      </div>

      {/* Production Model Highlight Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(30, 41, 59, 0.7) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '1.25rem',
          padding: '2rem',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              {t('model.selectedModel')}
            </div>
            <h2 style={{ fontSize: '1.8rem', color: '#fff' }}>{metrics.best_model}</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.85rem' }}>
              <Award size={14} />
              Production Active
            </span>
            <span className="badge badge-indigo" style={{ fontSize: '0.85rem' }}>
              5-Fold Cross Validated
            </span>
          </div>
        </div>

        {/* 4 Score Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('model.testR2')}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gold)' }}>
              {(metrics.test_metrics.r2 * 100).toFixed(2)}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#34d399' }}>Near-perfect fit on test set</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('model.testMape')}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>
              {metrics.test_metrics.mape.toFixed(2)}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mean percentage error</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('model.testMae')}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a5b4fc' }}>
              ₹{(metrics.test_metrics.mae / 100000).toFixed(2)}L
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mean absolute error</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('model.trainedRows')}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              {metrics.train_rows.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{metrics.test_rows} test rows</div>
          </div>
        </div>
      </div>

      {/* Feature Importance Horizontal Chart */}
      <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.25rem' }}>
            {t('model.featureImportanceTitle')}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Relative predictive weight assigned to each property characteristic by the gradient booster
          </p>
        </div>

        <div style={{ height: '280px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={featureImportanceData}
              margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" horizontal={false} />
              <XAxis type="number" unit="%" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
                formatter={(val: unknown) => [`${val}%`, 'Importance']}
              />
              <Bar dataKey="percentage" fill="#f59e0b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.25rem' }}>
            {t('model.benchmarkTitle')}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Evaluation metrics across candidate algorithms evaluated on 5-fold cross-validation
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>{t('model.modelName')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>CV R² Score</th>
                <th style={{ padding: '0.75rem 1rem' }}>CV MAE</th>
                <th style={{ padding: '0.75rem 1rem' }}>CV MAPE</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(metrics.benchmark_comparison || {}).map(([algo, scores]) => {
                const isSelected = algo === metrics.best_model;
                return (
                  <tr
                    key={algo}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '1rem', fontWeight: 700, color: isSelected ? 'var(--gold)' : '#fff' }}>
                      {algo}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#fff' }}>
                      {(scores.cv_r2 * 100).toFixed(2)}%
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      ₹{(scores.cv_mae / 100000).toFixed(2)} Lakhs
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {scores.cv_mape ? `${scores.cv_mape.toFixed(2)}%` : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {isSelected ? (
                        <span className="badge badge-emerald">Selected Best</span>
                      ) : (
                        <span className="badge badge-indigo">Benchmark</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preprocessing Architecture Card */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.25rem' }}>
          {t('model.pipelineTitle')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <CheckCircle2 size={18} color="var(--gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('model.pipelineStep1')}</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <ShieldCheck size={18} color="var(--emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('model.pipelineStep2')}</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <CheckCircle2 size={18} color="var(--sky)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('model.pipelineStep3')}</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <CheckCircle2 size={18} color="var(--indigo)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('model.pipelineStep4')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
