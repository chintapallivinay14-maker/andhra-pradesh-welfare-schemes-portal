
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Globe, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BrowseSchemes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchemes();
  }, [selectedState, selectedCategory]);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (selectedState) params.state = selectedState;
      if (selectedCategory) params.category = selectedCategory;

      const response = await axios.get(
        'http://localhost:8000/api/v1/schemes',
        { params }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.schemes || [];

      // Display active records only; verification is shown separately.
      setSchemes(data.filter(scheme => scheme.is_active === true));
    } catch (err) {
      console.error('Error fetching schemes:', err);
      setError('Unable to load schemes. Check that the backend is running.');
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const query = searchQuery.trim().toLowerCase();

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch =
      !query ||
      [scheme.name, scheme.description, scheme.benefits, scheme.category]
        .some(value => String(value || '').toLowerCase().includes(query));

    const matchesState =
      !selectedState ||
      scheme.applicable_state === selectedState;

    const matchesCategory =
      !selectedCategory ||
      scheme.category === selectedCategory;

    return matchesSearch && matchesState && matchesCategory;
  });

  const categories = [...new Set(
    schemes.map(s => s.category).filter(Boolean)
  )].sort();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      paddingBottom: 60,
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a, #0369a1)',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255,255,255,0.15)',
          padding: '6px 14px',
          borderRadius: 20,
          fontSize: '0.85rem',
          marginBottom: 12
        }}>
          <Globe size={16} /> Active Scheme Directory
        </div>

        <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px' }}>
          Schemes Directory
        </h1>
        <p style={{ maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
          Explore active welfare schemes for Andhra Pradesh residents
          and central initiatives. Check each scheme's verification status
          before relying on its details.
        </p>
      </div>

      <div style={{
        maxWidth: 1100,
        margin: '-24px auto 0',
        padding: '0 20px',
        position: 'relative'
      }}>
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <div style={{
            flex: 1,
            minWidth: 240,
            display: 'flex',
            alignItems: 'center',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            padding: '0 14px'
          }}>
            <Search size={18} color="#64748b" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search schemes, benefits or categories..."
              style={{
                width: '100%',
                padding: 12,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              background: '#f8fafc'
            }}
          >
            <option value="">All applicable schemes</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="All India">Central / All India</option>
          </select>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              minWidth: 170
            }}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{
        maxWidth: 1100,
        margin: '40px auto 0',
        padding: '0 20px'
      }}>
        <p style={{ color: '#64748b', fontWeight: 600 }}>
          Showing {filteredSchemes.length} active scheme(s)
        </p>

        {loading ? (
          <p style={{ textAlign: 'center', padding: 50 }}>
            Loading schemes...
          </p>
        ) : error ? (
          <p style={{
            padding: 24,
            background: 'white',
            borderRadius: 12,
            color: '#b91c1c'
          }}>
            {error}
          </p>
        ) : filteredSchemes.length === 0 ? (
          <p style={{
            padding: 40,
            background: 'white',
            borderRadius: 12,
            color: '#64748b'
          }}>
            No active schemes match your search.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 24
          }}>
            {filteredSchemes.map(scheme => (
              <div key={scheme.id} style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 18
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginBottom: 12
                  }}>
                    <span style={{
                      background: '#e0f2fe',
                      color: '#0369a1',
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: '0.75rem'
                    }}>
                      {scheme.applicable_state || 'Jurisdiction unknown'}
                    </span>
                    <span style={{
                      color: '#64748b',
                      fontSize: '0.75rem'
                    }}>
                      {scheme.category || 'Uncategorized'}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: '1.2rem',
                    color: '#0f172a',
                    margin: '0 0 10px'
                  }}>
                    {scheme.name}
                  </h3>

                  <p style={{
                    color: '#475569',
                    lineHeight: 1.5,
                    overflowWrap: 'anywhere'
                  }}>
                    {scheme.description || 'Description not available.'}
                  </p>

                  <p style={{
                    color: scheme.verification_status === 'Verified'
                      ? '#166534' : '#92400e',
                    background: scheme.verification_status === 'Verified'
                      ? '#dcfce7' : '#fef3c7',
                    display: 'inline-block',
                    padding: '5px 8px',
                    borderRadius: 8,
                    fontSize: '0.8rem'
                  }}>
                    {scheme.verification_status || 'Verification status unknown'}
                  </p>
                </div>

                <div style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <button
                    onClick={() => navigate(`/scheme/${scheme.id}`)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#1e3a8a',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Read Full Details <ArrowRight size={16} />
                  </button>

                  {scheme.official_url && (
                    <a
                      href={scheme.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        padding: '7px 10px',
                        borderRadius: 8,
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Portal <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
