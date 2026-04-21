import React from 'react';
import { X, MapPin, Camera, MessageSquare, Target, ShieldCheck, ShieldOff, Clock, ParkingCircle } from 'lucide-react';

export default function StationPanel({ station, onClose }) {
  if (!station) {
    return <div className="floating-panel glass hidden"></div>;
  }

  // 한전 부가정보에서 운영시간과 주차비를 description에서 파싱하여 분리
  // description 예: "운영시간: 24시간 / 주차: 충전시 무료"
  let openTime = null;
  let parkingFee = null;
  if (station.description && station.description.startsWith('[한전 공식데이터]')) {
    const match = station.description.match(/운영:\s*([^/]+)\/\s*추가정보:\s*(.+)/);
    if (match) { openTime = match[1].trim(); parkingFee = match[2].trim(); }
  } else if (station.description && station.description.startsWith('운영시간:')) {
    const match = station.description.match(/운영시간:\s*([^/]+)\/\s*주차:\s*(.+)/);
    if (match) { openTime = match[1].trim(); parkingFee = match[2].trim(); }
  }

  // floor 필드: 한전 detailLocation (예: "지하 2층 Y02번 기둥 앞") 또는 수제작 DB의 층수
  const UNVERIFIED_VALUES = ['정보 미제공', '불명(공공데이터)', undefined, null, ''];
  const hasLocation = !UNVERIFIED_VALUES.includes(station.floor);

  // pillar 필드: 수제작 DB는 기둥번호, 한전 연동 시에는 parkingFee가 들어올 수 있음
  // → 한전 운영 충전소는 description에서 파싱한 parkingFee를 우선 사용
  const displayPillar = (!UNVERIFIED_VALUES.includes(station.pillar) && !parkingFee) ? station.pillar : null;
  const displayParking = parkingFee || (!UNVERIFIED_VALUES.includes(station.pillar) ? station.pillar : null);

  // 검증 여부: verifiedAt이 있거나, 층수 정보가 실제로 있으면 검증됨으로 판단
  const isVerified = station.verifiedAt || hasLocation;

  const handleNavi = (type) => {
    const { lat, lng, name } = station;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) { alert("모바일 기기에서만 직접 내비게이션 연결이 가능합니다."); return; }
    if (type === 'kakao') window.location.href = `kakaonavi://navigate?ep=${lat},${lng}&name=${encodeURIComponent(name)}`;
    else if (type === 'tmap') window.location.href = `tmap://route?goalx=${lng}&goaly=${lat}&goalname=${encodeURIComponent(name)}`;
    else if (type === 'naver') window.location.href = `nmap://navigation?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(name)}&appname=com.example.app`;
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
          <button className="navi-btn btn-kakao" onClick={() => handleNavi('kakao')}>카카오내비</button>
          <button className="navi-btn btn-tmap" onClick={() => handleNavi('tmap')}>티맵</button>
          <button className="navi-btn btn-naver" onClick={() => handleNavi('naver')}>네이버 지도</button>
        </div>
      </div>

      <div className="panel-content">
        {/* ── 위치 상세 정보 카드 ── */}
        {isVerified ? (
          <div className="micro-location-card verified">
            <div className="ml-header">
              <Target size={14} /> 정확한 위치
              <span className="verification-badge verified">
                <ShieldCheck size={12} />
                {station.verifiedAt ? `현장 검증 ${station.verifiedAt}` : '한전 공식 데이터'}
              </span>
            </div>
            <div className="ml-data">
              {/* 상세 위치 (층수/기둥번호 등) */}
              {hasLocation && (
                <div className="ml-badge">
                  <span>📍 위치</span> {station.floor}
                </div>
              )}
              {/* 기둥번호 (수제작 DB 전용) */}
              {displayPillar && (
                <div className="ml-badge">
                  <span>🔵 기둥</span> {displayPillar}
                </div>
              )}
              {/* 주차비 */}
              {displayParking && displayParking !== '주차료 미상' && (
                <div className="ml-badge">
                  <span><ParkingCircle size={12}/> 주차비</span> {displayParking}
                </div>
              )}
              {/* 운영시간 */}
              {openTime && (
                <div className="ml-badge">
                  <span><Clock size={12}/> 운영</span> {openTime}
                </div>
              )}
            </div>
            {/* 수제작 DB의 상세 설명 (한전 데이터가 아닌 경우) */}
            {station.description && !station.description.startsWith('[한전') && !station.description.startsWith('운영시간:') && !station.description.startsWith('주소:') && (
              <div className="ml-desc">{station.description}</div>
            )}
          </div>
        ) : (
          <div className="micro-location-card unverified">
            <div className="ml-header unverified">
              <ShieldOff size={14} /> 정확한 위치
              <span className="verification-badge unverified">
                <ShieldOff size={12} /> 위치 정보 미확보
              </span>
            </div>
            <div className="ml-unverified-body">
              <p>아직 정확한 층수·주차구역이 확인되지 않은 충전소입니다.<br/>아래 기본 정보는 환경부 공공 API에서 제공됩니다.</p>
              <div className="ml-badge unverified-badge">
                <span>이용시간</span> {station.description || '미상'}
              </div>
            </div>
            <button className="report-location-btn">📍 정확한 위치 정보 제보하기</button>
          </div>
        )}

        {/* ── 기본 상태 정보 ── */}
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

        {/* ── 현장 사진 ── */}
        <div className="tips-section">
          <h3><Camera size={16} /> 현장 사진 (유저 제보)</h3>
          <div className="photo-gallery">
            {station.images && station.images.map((img, idx) => (
              <img key={idx} src={img} alt={`station-${idx}`} />
            ))}
            <div className="photo-placeholder">
              <Camera size={24} style={{marginBottom: '8px'}} />
              <span style={{fontSize: '13px'}}>사진 제보하기</span>
            </div>
          </div>
        </div>

        {/* ── 운전자 꿀팁 ── */}
        <div className="tips-section">
          <h3><MessageSquare size={16} /> 운전자 꿀팁</h3>
          {station.tips && station.tips.length > 0 ? (
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
