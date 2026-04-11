import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MapContainer from '../components/MapContainer';
import StationPanel from '../components/StationPanel';
import { MOCK_STATIONS } from '../data/mockData';
import { Zap, ShieldCheck } from 'lucide-react';

export default function MapPage() {
  const [selectedStationId, setSelectedStationId] = useState(null);

  const selectedStation = MOCK_STATIONS.find((s) => s.id === selectedStationId);

  return (
    <div className="app-container">
      {/* Floating Header */}
      <div className="floating-header glass" style={{ justifyContent: 'space-between', width: 'calc(100% - 40px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="header-logo">
            <Zap size={20} />
          </div>
          <div className="header-title">LastMile EV Charge</div>
        </div>
        
        {/* Link to Admin */}
        <Link to="/admin" style={{ 
          display: 'flex', alignItems: 'center', gap: '6px', 
          background: 'rgba(255,255,255,0.1)', padding: '8px 16px', 
          borderRadius: '20px', color: '#fff', textDecoration: 'none', 
          fontSize: '14px', fontWeight: 'bold' 
        }}>
          <ShieldCheck size={16} />
          <span>관리자 파트너 센터</span>
        </Link>
      </div>

      {/* Map Layer */}
      <div className="map-viewport">
        <MapContainer 
          stations={MOCK_STATIONS} 
          selectedId={selectedStationId}
          onSelect={setSelectedStationId} 
        />
      </div>

      {/* Floating Panel Layer */}
      <StationPanel 
        station={selectedStation} 
        onClose={() => setSelectedStationId(null)} 
      />
    </div>
  );
}
