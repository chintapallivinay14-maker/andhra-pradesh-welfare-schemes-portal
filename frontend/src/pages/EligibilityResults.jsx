import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, 
  ExternalLink, MapPin, Gift, FileText, CheckSquare, Sparkles 
} from 'lucide-react';

export default function EligibilityResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, profile } = location.state || {};

  if (!results) {
    return (
      <div className="container animate-fade-in-up" style={{ maxWidth: '800px', padding: '60px 20px', textAlign: 'center' }}>
        <h2>No Assessment Data Found</h2>
        <p style={{ color: '#64748b', margin: '16px 0' }}>
          Please complete the profile assessment to check scheme eligibility.
        </p>
        <Link to="/select-state" className="btn">
          ← Start Assessment
        </Link>
      </div>
    );
  }

  const eligibleSchemes = results.eligible_schemes || [];

  return (
    <div className="container animate-fade-in-up" style={{ maxWidth: '1000px', padding: '30px 20px' }}>
      
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            color: '#475569', 
            fontWeight: '700', 
            cursor: 'pointer' 
          }}
        >
          <ArrowLeft size={16} /> Back to Profile Questionnaire
        </button>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: '700' }}>
          <ShieldCheck size={16} /> Assessment Complete
        </div>
      </div>

      {/* Summary Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', 
        borderRadius: '20px', 
        padding: '26px 30px', 
        color: '#ffffff',
        marginBottom: '30px',
        boxShadow: '0 8px 24px -6px rgba(30, 58, 138, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.15)', color: '#bfdbfe', padding: '4px 12px', borderRadius: '14px', fontWeight: '700', textTransform: 'uppercase' }}>
              Evaluation Results
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '8px 0 4px 0', letterSpacing: '-0.5px' }}>
              Matched Government Schemes
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem' }}>
              Evaluated {results.total_evaluated || 0} schemes against your profile ({profile?.state || 'All'}, Age: {profile?.age || 'N/A'}, Occupation: {profile?.occupation || 'N/A'}).
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', padding: '14px 24px', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#86efac' }}>
              {results.eligible_count || 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: '700' }}>Eligible Scheme(s)</div>
          </div>
        </div>
      </div>

      {/* Eligible Schemes List */}
      {eligibleSchemes.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '50px 20px', textAlign: 'center' }}>
          <AlertCircle size={36} color="#dc2626" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: '800', marginBottom: '8px' }}>No Directly Matched Schemes</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            Try adjusting income or age details in the profile questionnaire, or browse the entire directory.
          </p>
          <Link to="/browse" className="btn">Browse All Schemes</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {eligibleSchemes.map((item, idx) => {
            const scheme = item.scheme;
            return (
              <div 
                key={scheme.id || idx}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #bbf7d0',
                  borderRadius: '18px',
                  padding: '24px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', background: '#166534', color: '#ffffff', padding: '3px 12px', borderRadius: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> {item.status || 'Likely Eligible'}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '3px 12px', borderRadius: '16px', fontWeight: '700' }}>
                      {scheme.applicable_state || 'All India'}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '3px 12px', borderRadius: '16px', fontWeight: '700' }}>
                      {scheme.category || 'General'}
                    </span>
                  </div>

                  <Link 
                    to={`/scheme/${scheme.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn"
                    style={{ fontSize: '0.82rem', padding: '8px 16px', borderRadius: '8px' }}
                  >
                    View Full Page <ExternalLink size={14} />
                  </Link>
                </div>

                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: '800', marginBottom: '8px' }}>
                  {scheme.name}
                </h3>

                <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: '1.6', marginBottom: '16px' }}>
                  {scheme.description}
                </p>

                {item.reason && (
                  <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#166534' }}>Matching Assessment: </span>
                    <span style={{ fontSize: '0.85rem', color: '#14532d' }}>{item.reason}</span>
                  </div>
                )}

                {scheme.benefits && (
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Gift size={14} /> Benefits
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>{scheme.benefits}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}