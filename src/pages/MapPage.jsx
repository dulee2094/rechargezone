import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapContainer from '../components/MapContainer';
import StationPanel from '../components/StationPanel';
import { MOCK_STATIONS } from '../data/mockData';
import { Zap, ShieldCheck, Loader } from 'lucide-react';

export default function MapPage() {
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [stations, setStations] = useState(MOCK_STATIONS); // 초기값은 가짜 데이터
  const [loading, setLoading] = useState(true);

  // 선택된 충전소 정보 추출 (API 데이터 또는 Mock 데이터)
  const selectedStation = stations.find((s) => s.id === selectedStationId);

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        // Netlify 서버리스 함수를 통해 CORS 없이 환경부 API 호출 (서울 전체 = zcode 11)
        const URL = `/.netlify/functions/ev-stations?zcode=11&numOfRows=500`;

        const response = await fetch(URL);
        const data = await response.json();

        console.log("[API 응답 전체]", JSON.stringify(data).slice(0, 500));

        // 환경부 API 실제 JSON 응답 구조: data.items[0].item
        const rawItems = data?.items?.[0]?.item;

        if (!rawItems || rawItems.length === 0) {
          console.warn("[API 파싱 실패] 데이터 없음. 응답 구조:", Object.keys(data || {}));
          return;
        }

        console.log(`[API 성공] 총 ${rawItems.length}개 충전기 데이터 수신`);

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

        const apiStations = Object.values(grouped).filter(
          (s) => !isNaN(s.lat) && !isNaN(s.lng) && s.lat !== 0 && s.lng !== 0
        );

        console.log(`[클러스터링 준비] 유효 충전소 ${apiStations.length}개`);

        if (apiStations.length > 0) {
          setStations(apiStations);
        }
      } catch (err) {
        console.warn("API 연동 실패(CORS 혹인 키 오류). 더미 데이터를 대신 보여줍니다.", err);
        // 에러 발생 시 기존 MOCK_STATIONS 유지
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
