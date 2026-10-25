import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSchemeById } from '../services/api';
import { ExternalLink, ArrowLeft, CheckSquare, FileText, Gift } from 'lucide-react';

export default function SchemeDetails() {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchemeById(id)
      .then(data => setScheme(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container"><p>Loading scheme details...</p></div>;
  if (!scheme) return <div className="container"><p>Scheme not found.</p></div>;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <Link to="/browse" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#475569', textDecoration: 'none', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Schemes
      </Link>

      <div className="card" style={{ padding: '30px' }}>
        <div>
          <span className="badge badge-state">{scheme.applicable_state}</span>
          <span className="badge badge-category">{scheme.category}</span>
          <h1 style={{ marginTop: '12px', fontSize: '1.8rem', color: '#1e3a8a' }}>{scheme.name}</h1>
          <p style={{ color: '#475569', marginTop: '8px', fontSize: '1.05rem' }}>{scheme.description}</p>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', color: '#1e3a8a' }}>
              <Gift size={18} /> Scheme Benefits
            </h3>
            <p style={{ marginTop: '6px', fontSize: '0.95rem' }}>{scheme.benefits}</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', color: '#1e3a8a' }}>
              <FileText size={18} /> Required Documents
            </h3>
            <p style={{ marginTop: '6px', fontSize: '0.95rem' }}>{scheme.required_documents}</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', color: '#1e3a8a' }}>
              <CheckSquare size={18} /> How to Apply
            </h3>
            <p style={{ marginTop: '6px', fontSize: '0.95rem' }}>{scheme.application_process}</p>
          </div>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
          <a href={scheme.official_url} target="_blank" rel="noreferrer" className="btn">
            Apply via Official Portal <ExternalLink size={16} />
          </a>
          <a href={scheme.source_url} target="_blank" rel="noreferrer" className="btn" style={{ backgroundColor: '#475569' }}>
            View Verified Source Rules <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}