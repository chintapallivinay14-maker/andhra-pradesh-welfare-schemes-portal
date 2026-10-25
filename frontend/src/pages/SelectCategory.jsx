import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SelectCategory() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const stateParam = searchParams.get('state') || 'All India';

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://127.0.0.1:8000/api/v1/schemes/stats/sector-counts?state=${encodeURIComponent(stateParam)}`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setCategories(data);
      })
      .catch(err => {
        console.error("Failed to load sector counts:", err);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, [stateParam]);

  const filteredCategories = categories.filter(cat => 
    (cat.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 20px', fontFamily: 'sans-serif' }}>
      <button 
        onClick={() => navigate('/')} 
        style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', marginBottom: '20px', fontWeight: '600', fontSize: '0.95rem' }}
      >
        ← Back to State Selection
      </button>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '12px' }}>
          Step 2 of 3: Select Welfare Sector
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: '800', marginBottom: '10px' }}>
          Select Category for {stateParam}
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem' }}>
          Choose from active sectors loaded in the database to filter schemes instantly.
        </p>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto 36px auto' }}>
        <input 
          type="text" 
          placeholder="Search sectors (e.g. Agriculture, Education, Energy)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Loading sectors for {stateParam}...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(`/category-wizard?state=${encodeURIComponent(stateParam)}&category=${encodeURIComponent(cat.category)}`)}
                style={{ 
                  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', 
                  cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: '700', margin: '0 0 14px 0' }}>{cat.category}</h3>
                </div>

                <div style={{ color: '#1e3a8a', fontWeight: '600', fontSize: '0.9rem', marginTop: '16px' }}>
                  Browse Category →
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#475569', fontSize: '1rem' }}>No matching sectors found for "{searchTerm}".</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}