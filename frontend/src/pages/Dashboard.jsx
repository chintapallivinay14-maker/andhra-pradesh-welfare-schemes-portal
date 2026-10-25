
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldCheck,
  Database,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const API_URL = 'http://localhost:8000/api/v1/analytics';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(API_URL)
      .then(({ data }) => {
        if (data?.error) {
          throw new Error(data.error);
        }
        setStats(data);
      })
      .catch((err) => {
        console.error('Error fetching analytics:', err);
        setError('Unable to load dashboard statistics.');
      })
      .finally(() => setLoading(false));
  }, []);

  const number = (value) =>
    Number(value ?? 0).toLocaleString('en-IN');

  const cardStyle = (color) => ({
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    borderTop: `4px solid ${color}`,
    minWidth: 0
  });

  const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const valueStyle = {
    fontSize: '2.4rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '12px 0 4px'
  };

  const metric = (value) =>
    loading ? '...' : error ? '—' : number(value);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      paddingBottom: '60px',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)',
        color: '#ffffff',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255,255,255,0.15)',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '12px'
        }}>
          <ShieldCheck size={16} />
          Live Database Insights • Andhra Pradesh Portal
        </div>

        <h1 style={{
          fontSize: 'clamp(1.7rem, 4vw, 2.5rem)',
          fontWeight: '800',
          margin: '0 0 10px'
        }}>
          Welfare Schemes Analytics Dashboard
        </h1>

        <p style={{
          fontSize: '1.05rem',
          opacity: 0.9,
          maxWidth: '650px',
          margin: '0 auto'
        }}>
          Live database statistics for Andhra Pradesh and central scheme records.
        </p>
      </div>

      {error && (
        <div role="alert" style={{
          maxWidth: '1100px',
          margin: '20px auto',
          padding: '12px 20px',
          color: '#b91c1c',
          background: '#fef2f2',
          borderRadius: '10px'
        }}>
          <AlertCircle size={17} style={{
            verticalAlign: 'middle',
            marginRight: '8px'
          }} />
          {error} Check that the backend is running.
        </div>
      )}

      <div style={{
        maxWidth: '1100px',
        margin: '-24px auto 0',
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '20px',
        position: 'relative'
      }}>
        <div style={cardStyle('#1e3a8a')}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={labelStyle}>Total Scheme Records</span>
            <Database size={22} color="#1e3a8a" />
          </div>
          <div style={valueStyle}>
            {metric(stats?.total_schemes)}
          </div>
          <p style={{
            fontSize: '0.85rem',
            color: '#64748b',
            margin: 0
          }}>
            {loading || error ? '—' :
              `${number(stats?.active_schemes)} active · ${number(stats?.inactive_schemes)} inactive`}
          </p>
        </div>

        <div style={cardStyle('#0369a1')}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={labelStyle}>Active Covered Sectors</span>
            <Layers size={22} color="#0369a1" />
          </div>
          <div style={valueStyle}>
            {metric(stats?.covered_sectors)}
          </div>
          <p style={{
            fontSize: '0.85rem',
            color: '#64748b',
            margin: 0
          }}>
            Distinct categories among active records
          </p>
        </div>

        <div style={cardStyle('#10b981')}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={labelStyle}>Active Scheme Coverage</span>
            <MapPin size={22} color="#10b981" />
          </div>
          <div style={{
            ...valueStyle,
            fontSize: '1.5rem',
            lineHeight: 1.5
          }}>
            Andhra Pradesh & Central
          </div>
          <p style={{
            fontSize: '0.85rem',
            color: '#64748b',
            margin: 0
          }}>
            {loading || error ? '—' :
              `${number(stats?.ap_schemes)} AP · ${number(stats?.central_schemes)} Central`}
          </p>
        </div>

        <div style={cardStyle('#8b5cf6')}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={labelStyle}>Verified Records</span>
            <CheckCircle2 size={22} color="#8b5cf6" />
          </div>
          <div style={valueStyle}>
            {metric(stats?.verified_schemes)}
          </div>
          <p style={{
            fontSize: '0.85rem',
            color: '#64748b',
            margin: 0
          }}>
            {loading || error ? '—' :
              `${number(stats?.needs_verification)} need verification`}
          </p>
        </div>
      </div>

      {stats && !loading && !error && (
        <div style={{
          maxWidth: '1100px',
          margin: '24px auto 0',
          padding: '0 20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#0f172a' }}>
                Records marked as verified
              </strong>
              <strong style={{ color: '#64748b' }}>
                {Number(stats.verification_percentage ?? 0).toFixed(2)}%
              </strong>
            </div>

            <div style={{
              height: '10px',
              background: '#e2e8f0',
              borderRadius: '99px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0,
                  Number(stats.verification_percentage ?? 0)
                ))}%`,
                background: '#8b5cf6',
                borderRadius: '99px',
                transition: 'width 0.3s ease'
              }} />
            </div>

            <p style={{
              fontSize: '0.85rem',
              color: '#64748b',
              margin: '12px 0 0'
            }}>
              This percentage reflects database status labels, not an
              independent audit of each scheme's current official details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
