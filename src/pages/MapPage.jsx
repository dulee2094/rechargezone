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
      // 서울시 25개 구 전체 zscode 목록
      const SEOUL_DISTRICTS = [
        { name: '종로구', zscode: '11110' }, { name: '중구',   zscode: '11140' },
        { name: '용산구', zscode: '11170' }, { name: '성동구', zscode: '11200' },
        { name: '광진구', zscode: '11215' }, { name: '동대문구',zscode: '11230' },
        { name: '중랑구', zscode: '11260' }, { name: '성북구', zscode: '11290' },
        { name: '강북구', zscode: '11305' }, { name: '도봉구', zscode: '11320' },
        { name: '노원구', zscode: '11350' }, { name: '은평구', zscode: '11380' },
        { name: '서대문구',zscode: '11410' }, { name: '마포구', zscode: '11440' },
        { name: '양천구', zscode: '11470' }, { name: '강서구', zscode: '11500' },
        { name: '구로구', zscode: '11530' }, { name: '금천구', zscode: '11545' },
        { name: '영등포구',zscode: '11560' }, { name: '동작구', zscode: '11590' },
        { name: '관악구', zscode: '11620' }, { name: '서초구', zscode: '11650' },
        { name: '강남구', zscode: '11680' }, { name: '송파구', zscode: '11710' },
        { name: '강동구', zscode: '11740' },
      ];

      // 한전 정적 데이터를 먼저 표시 (사용자에게 빠른 초기 화면 제공)
      const kepcoFallback = kepcoLatLng
        .filter(k => !isNaN(k.lat) && !isNaN(k.lng) && k.lat !== 0 && k.lng !== 0)
        .map(k => {
          const rawName = k.name.replace(/\s/g, '');
          const extra = kepcoAdditional.find(ex => {
            const exName = ex.name.replace(/\s/g, '');
            return exName === rawName || exName.includes(rawName) || rawName.includes(exName);
          });
          return {
            id: k.id, name: k.name, address: k.address,
            lat: k.lat, lng: k.lng,
            floor: extra?.detailLocation || '정보 미제공',
            pillar: extra?.parkingFee || '정보 미제공',
            description: extra ? `운영시간: ${extra.openTime} / 주차: ${extra.parkingFee}` : `주소: ${k.address}`,
            totalChargers: 1, availableChargers: 1,
            type: '완속', operator: '한국전력공사',
            images: [], tips: []
          };
        });
      setStations(kepcoFallback); // 🚀 한전 데이터 즉시 표시
      setLoading(false); // 로딩 스피너는 일단 종료

      // 25개 구를 순차적으로 가져오며 지도를 점진적으로 업데이트
      try {
        const grouped = {};

        // 5개 구씩 묶어 병렬 처리 (한 번에 25개를 보내면 서버 부하 위험)
        const CHUNK_SIZE = 5;
        for (let i = 0; i < SEOUL_DISTRICTS.length; i += CHUNK_SIZE) {
          const chunk = SEOUL_DISTRICTS.slice(i, i + CHUNK_SIZE);
          const chunkResults = await Promise.all(
            chunk.map(({ name, zscode }) =>
              fetch(`/.netlify/functions/ev-stations?zcode=11&zscode=${zscode}&numOfRows=999&pageNo=1`)
                .then(r => r.json())
                .catch(() => ({ items: { item: [] } })) // 개별 구 실패 시 빈 배열로 대체
                .then(d => {
                  const items = Array.isArray(d?.items?.item)
                    ? d.items.item
                    : d?.items?.item ? [d.items.item] : [];
                  console.log(`[API] ${name} ${items.length}개 수신`);
                  return items;
                })
            )
          );

          // 수신된 데이터를 grouped에 누적
          chunkResults.flat().forEach((st) => {
            if (!grouped[st.statId]) {
              grouped[st.statId] = {
                id: st.statId, name: st.statNm, address: st.addr,
                lat: parseFloat(st.lat), lng: parseFloat(st.lng),
                floor: '정보 미제공', pillar: '정보 미제공',
                description: `이용가능시간: ${st.useTime || '미상'}`,
                totalChargers: 0, availableChargers: 0,
                type: (st.chgerType === '02' || st.chgerType === '04') ? '완속' : '급속',
                operator: st.busiNm, images: [], tips: []
              };
            }
            grouped[st.statId].totalChargers += 1;
            if (st.stat === '2') grouped[st.statId].availableChargers += 1;
          });

          // 5개 구 처리할 때마다 지도를 점진적으로 업데이트
          const apiStationsSoFar = Object.values(grouped)
            .filter(s => !isNaN(s.lat) && !isNaN(s.lng) && s.lat !== 0 && s.lng !== 0)
            .map(enrichWithMicroLocation);

          const MERGE_RADIUS_M = 50;
          const kepcoOnly = kepcoFallback.filter(k =>
            !apiStationsSoFar.some(a => getDistanceInMeters(a.lat, a.lng, k.lat, k.lng) < MERGE_RADIUS_M)
          );

          setStations([...apiStationsSoFar, ...kepcoOnly]);
          console.log(`[진행] ${i + CHUNK_SIZE}개 구 완료 → 현재 ${apiStationsSoFar.length + kepcoOnly.length}개 표시 중`);
        }

        console.log(`[완료] 서울 25개 구 전체 로딩 완료!`);
      } catch (err) {
        console.warn('환경부 API 일부 실패. 로드된 데이터까지만 표시합니다.', err);
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
