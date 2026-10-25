import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SelectState from './pages/SelectState';
import SelectCategory from './pages/SelectCategory';
import BrowseSchemes from './pages/BrowseSchemes';
import SchemeDetails from './pages/SchemeDetails';
import AIAssistant from './pages/AIAssistant';
import Dashboard from './pages/Dashboard';
import EligibilityCheck from './pages/EligibilityCheck';
export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc', color: '#0f172a' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/select-state" element={<SelectState />} />
            <Route path="/select-category" element={<SelectCategory />} />
            <Route path="/browse" element={<BrowseSchemes />} />
            <Route path="/scheme/:id" element={<SchemeDetails />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/eligibility" element={<EligibilityCheck />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}