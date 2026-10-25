import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck } from 'lucide-react';

export default function SelectState() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const states = [
    { name: "All India", code: "IN", type: "Central Govt", color: "#1e3a8a", bg: "#f0fdf4" },
    { name: "Andhra Pradesh", code: "AP", type: "State", color: "#166534", bg: "#f0fdf4" },
    { name: "Telangana", code: "TS", type: "State", color: "#6b21a8", bg: "#faf5ff" },
    { name: "Karnataka", code: "KA", type: "State", color: "#b45309", bg: "#fffbeb" },
    { name: "Tamil Nadu", code: "TN", type: "State", color: "#047857", bg: "#ecfdf5" },
    { name: "Maharashtra", code: "MH", type: "State", color: "#be123c", bg: "#fff1f2" },
    { name: "Uttar Pradesh", code: "UP", type: "State", color: "#1d4ed8", bg: "#eff6ff" },
    { name: "West Bengal", code: "WB", type: "State", color: "#7e22ce", bg: "#f3e8ff" },
    { name: "Madhya Pradesh", code: "MP", type: "State", color: "#c2410c", bg: "#fff7ed" },
    { name: "Rajasthan", code: "RJ", type: "State", color: "#b91c1c", bg: "#fef2f2" },
    { name: "Kerala", code: "KL", type: "State", color: "#0f766e", bg: "#f0fdfa" },
    { name: "Gujarat", code: "GJ", type: "State", color: "#a16207", bg: "#fefce8" }
  ];

  const filteredStates = states.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (stateName) => {
    // FIXED: Route to select-category first instead of category-wizard
    navigate(`/select-category?state=${encodeURIComponent(stateName)}`);
  };

  return (
    <div className="container animate-fade-in-up" style={{ maxWidth: '1120px', padding: '30px 20px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '10px' }}>
          <ShieldCheck size={16} /> Step 1 of 3: Select Jurisdiction
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: '800', marginBottom: '8px' }}>
          Select State or Central Portal
        </h1>
        <p style={{ color: '#475569', fontSize: '0.98rem' }}>
          Choose your region to filter active welfare schemes loaded in the database.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: '500px', margin: '0 auto 32px auto', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input
          type="text"
          className="form-control"
          placeholder="Search state name (e.g. Andhra Pradesh, Telangana)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '46px', height: '48px', fontSize: '0.95rem', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
        />
      </div>

      {/* States Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {filteredStates.map((st) => (
          <div
            key={st.code}
            onClick={() => handleSelect(st.name)}
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              minHeight: '140px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = st.color;
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ 
                background: st.color, 
                color: '#ffffff', 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: '800', 
                fontSize: '0.85rem' 
              }}>
                {st.code}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: '12px' }}>
                {st.type}
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: '800', margin: 0 }}>
              {st.name}
            </h3>
          </div>
        ))}
      </div>

    </div>
  );
}