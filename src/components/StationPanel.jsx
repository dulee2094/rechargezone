import React from 'react';
import { X, MapPin, BatteryCharging, Camera, MessageSquare, Target, Navigation } from 'lucide-react';

export default function StationPanel({ station, onClose }) {
  if (!station) {
    return <div className="floating-panel glass hidden"></div>;
  }

  const handleNavi = (type) => {
    const { lat, lng, name } = station;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (!isMobile) {
      alert("모바일 기기에서만 직접 내비게이션 연결이 가능합니다.");
      return;
    }

    if (type === 'kakao') {
      window.location.href = `kakaonavi://navigate?ep=${lat},${lng}&name=${encodeURIComponent(name)}`;
    } else if (type === 'tmap') {
      window.location.href = `tmap://route?goalx=${lng}&goaly=${lat}&goalname=${encodeURIComponent(name)}`;
    } else if (type === 'naver') {
      window.location.href = `nmap://navigation?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(name)}&appname=com.example.app`;
    }
  };

  return (
    <div className="floating-panel glass">
      <div className="panel-header">
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
        <div className="station-title">{station.name}</div>
        <div className="station-address text-muted">
          <MapPin size={14} />
          {station.address}
        </div>
        
        <div className="navi-actions">
          <button className="navi-btn btn-kakao" onClick={() => handleNavi('kakao')}>
            카카오내비
          </button>
          <button className="navi-btn btn-tmap" onClick={() => handleNavi('tmap')}>
            티맵
          </button>
          <button className="navi-btn btn-naver" onClick={() => handleNavi('naver')}>
            네이버 지도
          </button>
        </div>
      </div>

      <div className="panel-content">
        {/* Core Differentiation: Micro Location Data */}
        <div className="micro-location-card">
          <div className="ml-header">
            <Target size={14} /> 정확한 위치
          </div>
          <div className="ml-data">
            <div className="ml-badge">
              <span>층수</span> {station.floor}
            </div>
            <div className="ml-badge">
              <span>기둥</span> {station.pillar}
            </div>
          </div>
          <div className="ml-desc">
            {station.description}
          </div>
        </div>

        {/* Basic Status */}
        <div className="status-grid">
          <div className="status-item">
            <div className="label">사용 가능 / 전체</div>
            <div className="val">
              <span className={station.availableChargers > 0 ? "text-success" : "text-danger"}>
                {station.availableChargers}
              </span>
              <span className="text-muted"> / {station.totalChargers}대</span>
            </div>
          </div>
          <div className="status-item">
            <div className="label">충전기 타입</div>
            <div className="val" style={{fontSize: '16px', paddingTop: '4px'}}>{station.type}</div>
          </div>
        </div>

        {/* Photos section (USP: visual proof) */}
        <div className="tips-section">
          <h3><Camera size={16} /> 현장 사진 (유저 제보)</h3>
          <div className="photo-gallery">
            {station.images.map((img, idx) => (
              <img key={idx} src={img} alt={`station-${idx}`} />
            ))}
            <div className="photo-placeholder">
              <Camera size={24} style={{marginBottom: '8px'}} />
              <span style={{fontSize: '13px'}}>사진 제보하기</span>
            </div>
          </div>
        </div>

        {/* Tips section (Crowdsourcing) */}
        <div className="tips-section">
          <h3><MessageSquare size={16} /> 운전자 꿀팁</h3>
          {station.tips.length > 0 ? (
            station.tips.map((tip, idx) => (
              <div key={idx} className="tip-item">
                <div className="tip-user">{tip.user}</div>
                <div className="tip-content">{tip.content}</div>
              </div>
            ))
          ) : (
            <div className="text-muted" style={{fontSize: '14px', marginBottom: '16px'}}>아직 등록된 꿀팁이 없습니다. 첫 번째 꿀팁을 남겨주세요!</div>
          )}
          <button className="add-tip-btn">꿀팁 제보하기</button>
        </div>
      </div>
    </div>
  );
}
