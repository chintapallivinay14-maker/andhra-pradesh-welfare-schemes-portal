import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, ArrowRight, ShieldCheck, Zap, Award, CheckCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', paddingBottom: '80px' }}>
      
      {/* Hero Section with Rich Gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 50%, #0284c7 100%)', 
        color: '#ffffff', 
        padding: '70px 20px 90px 20px', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Badge */}
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '8px', 
          background: 'rgba(255, 255, 255, 0.155)', backdropFilter: 'blur(8px)', 
          padding: '6px 16px', borderRadius: '30px', fontSize: '0.85rem', 
          fontWeight: '600', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.2)' 
        }}>
          <Sparkles size={16} color="#38bdf8" /> AI-Powered Welfare Navigator • Andhra Pradesh & Central
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 16px 0', letterSpacing: '-0.5px' }}>
          Andhra Pradesh Welfare Schemes Portal
        </h1>
        <p style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: '650px', margin: '0 auto 30px auto', lineHeight: '1.6' }}>
          Discover, search, and instantly check your eligibility for verified Central and Andhra Pradesh state welfare schemes using advanced AI.
        </p>
      </div>

      {/* Main Action Cards Grid */}
      <div style={{ maxWidth: '1000px', margin: '-50px auto 0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Check Eligibility Card */}
        <div 
          onClick={() => navigate('/eligibility')}
          style={{ 
            background: '#ffffff', borderRadius: '20px', padding: '40px 32px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', 
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(30,58,138,0.12)'; e.currentTarget.style.borderColor = '#93c5fd'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <div>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1', marginBottom: '24px' }}>
              <Zap size={30} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>
              Check Eligibility
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.6', margin: '0 0 30px 0' }}>
              Enter your profile details into our intelligent 3-step evaluation wizard to instantly find precise schemes you qualify for in Andhra Pradesh.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3a8a', fontWeight: '700', fontSize: '1rem' }}>
            Start Assessment <ArrowRight size={18} />
          </div>
        </div>

        {/* Browse Schemes Card */}
        <div 
          onClick={() => navigate('/browse')}
          style={{ 
            background: '#ffffff', borderRadius: '20px', padding: '40px 32px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', 
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(3,105,161,0.12)'; e.currentTarget.style.borderColor = '#7dd3fc'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <div>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a', marginBottom: '24px' }}>
              <Search size={30} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>
              Browse Schemes
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.6', margin: '0 0 30px 0' }}>
              Explore the complete directory of verified government welfare schemes across agriculture, education, healthcare, and business sectors.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: '700', fontSize: '1rem' }}>
            Browse Directory <ArrowRight size={18} />
          </div>
        </div>

      </div>

      {/* Trust & Features Footer Banner */}
      <div style={{ maxWidth: '1000px', margin: '60px auto 0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <ShieldCheck size={32} color="#16a34a" />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#0f172a' }}>100% Verified Portals</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Direct links to official AP & Central websites</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <Award size={32} color="#0369a1" />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#0f172a' }}>AP State Priority</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Tailored specifically for Andhra Pradesh residents</p>
          </div>
        </div>
      </div>

    </div>
  );
}