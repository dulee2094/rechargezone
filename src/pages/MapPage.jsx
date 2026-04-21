import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapContainer from '../components/MapContainer';
import StationPanel from '../components/StationPanel';
import { MOCK_STATIONS, enrichWithMicroLocation } from '../data/mockData';
import kepcoLatLng from '../data/kepcoLatLng.json';
import kepcoAdditional from '../data/kepcoAdditional.json';
import { Zap, ShieldCheck, Loader } from 'lucide-react';

// 두 좌표 사이의 직선 거리를 미터(m) 단위로 계산하는 함수 (Haversine 공식)
function getDistanceInMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function MapPage() {
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [stations, setStations] = useState(MOCK_STATIONS); // 초기값은 가짜 데이터
  const [loading, setLoading] = useState(true);

  // 선택된 충전소 정보 추출 (API 데이터 또는 Mock 데이터)
  const selectedStation = stations.find((s) => s.id === selectedStationId);

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        // 개발 단계: 서초구(11650), 강남구(11680), 송파구(11710) 3개 구만 대상
        const TARGET_DISTRICTS = [
          { name: '서초구', zscode: '11650' },
          { name: '강남구', zscode: '11680' },
          { name: '송파구', zscode: '11710' },
        ];

        // 3개 구 병렬 호출 (구당 최대 999개)
        const districtPromises = TARGET_DISTRICTS.map(({ name, zscode }) =>
          fetch(`/.netlify/functions/ev-stations?zcode=11&zscode=${zscode}&numOfRows=999&pageNo=1`)
            .then(r => r.json())
            .then(d => {
              const items = d?.items?.item || [];
              console.log(`[API] ${name} 충전기 ${items.length}개 / 전체 ${d?.totalCount || 0}개`);
              return items;
            })
        );

        const districtResults = await Promise.all(districtPromises);
        const rawItems = districtResults.flat();

        console.log(`[API 성공] 3개 구 합계 ${rawItems.length}개 충전기 데이터 수신`);

        if (!rawItems || rawItems.length === 0) {
          console.warn("[API 파싱 실패] 3개 구 데이터가 비어있습니다.");
          return;
        }

        // 같은 충전소(statId)끼리 기기 개수를 묶어주기 위한 로직
        const grouped = {};
        rawItems.forEach((st) => {
          if (!grouped[st.statId]) {
            grouped[st.statId] = {
              id: st.statId,
              name: st.statNm,
              address: st.addr,
              lat: parseFloat(st.lat),
              lng: parseFloat(st.lng),
              floor: '정보 미제공',
              pillar: '정보 미제공',
              description: `이용가능시간: ${st.useTime || '미상'}`,
              totalChargers: 0,
              availableChargers: 0,
              type: (st.chgerType === '02' || st.chgerType === '04') ? '완속' : '급속',
              operator: st.busiNm,
              images: [],
              tips: []
            };
          }
          grouped[st.statId].totalChargers += 1;
          // stat === '2': 충전 대기(사용 가능)
          if (st.stat === '2') {
            grouped[st.statId].availableChargers += 1;
          }
        });

        const apiStations = Object.values(grouped)
          .filter((s) => !isNaN(s.lat) && !isNaN(s.lng) && s.lat !== 0 && s.lng !== 0)
          .map(enrichWithMicroLocation);

        console.log(`[환경부 API] 유효 충전소 ${apiStations.length}개`);

        // ── 한전 위경도 데이터와 통합 (중복 제거 포함) ──────────────────
        // 환경부 API에 이미 있는 충전소(반경 50m 이내 + 이름 포함)는 제외
        const MERGE_RADIUS_M = 50;
        const kepcoOnlyStations = kepcoLatLng
          .filter(k => !isNaN(k.lat) && !isNaN(k.lng) && k.lat !== 0 && k.lng !== 0)
          .filter(k => {
            // apiStations 중에 이미 같은 충전소가 있으면 제외
            return !apiStations.some(a =>
              getDistanceInMeters(a.lat, a.lng, k.lat, k.lng) < MERGE_RADIUS_M
            );
          })
          .map(k => {
            // 한전 부가정보(상세위치, 주차비)와 매칭
            const rawName = k.name.replace(/\s/g, '');
            const extra = kepcoAdditional.find(ex => {
              const exName = ex.name.replace(/\s/g, '');
              return exName === rawName || exName.includes(rawName) || rawName.includes(exName);
            });
            return {
              id: k.id,
              name: k.name,
              address: k.address,
              lat: k.lat,
              lng: k.lng,
              floor: extra?.detailLocation || '정보 미제공',
              pillar: extra?.parkingFee || '정보 미제공',
              description: extra
                ? `운영시간: ${extra.openTime} / 주차: ${extra.parkingFee}`
                : `주소: ${k.address}`,
              totalChargers: 1,
              availableChargers: 1, // 한전 정적 데이터는 실시간 상태 미제공
              type: '완속',
              operator: '한국전력공사',
              images: [],
              tips: []
            };
          });

        console.log(`[한전 추가] 환경부 미포함 충전소 ${kepcoOnlyStations.length}개 추가`);

        const merged = [...apiStations, ...kepcoOnlyStations];
        console.log(`[최종 통합] 전체 충전소 ${merged.length}개`);

        if (merged.length > 0) {
          setStations(merged);
        }
      } catch (err) {
        console.warn("API 연동 실패. 한전 정적 데이터만 표시합니다.", err);
        // 환경부 API 실패 시 한전 데이터만이라도 지도에 표시
        const fallbackStations = kepcoLatLng
          .filter(k => !isNaN(k.lat) && !isNaN(k.lng))
          .map(k => ({
            id: k.id, name: k.name, address: k.address,
            lat: k.lat, lng: k.lng,
            floor: '정보 미제공', pillar: '정보 미제공',
            description: `주소: ${k.address}`,
            totalChargers: 1, availableChargers: 1,
            type: '완속', operator: '한국전력공사',
            images: [], tips: []
          }));
        if (fallbackStations.length > 0) setStations(fallbackStations);
      } finally {
        setLoading(false);
      }
    };

    fetchApiData();
  }, []);

  return (
    <div className="app-container">
      {/* Floating Header */}
      <div className="floating-header glass" style={{ justifyContent: 'space-between', width: 'calc(100% - 40px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="header-logo">
            <Zap size={20} />
          </div>
          <div className="header-title">LastMile EV Charge</div>
          {loading && <Loader size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />}
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
          stations={stations} 
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
