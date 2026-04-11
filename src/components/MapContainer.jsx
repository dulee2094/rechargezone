import React, { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Zap } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';
import 'leaflet/dist/leaflet.css';

// 지도 중심 이동을 위한 컴포넌트
function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function MapContainer({ stations, selectedId, onSelect }) {
  const center = { lat: 37.5132, lng: 127.0588 }; // 기본 중심: 코엑스
  
  // 선택된 충전소 찾기 (중심 이동용)
  const selectedStation = stations.find(s => s.id === selectedId);
  const mapCenterLat = selectedStation ? selectedStation.lat : center.lat;
  const mapCenterLng = selectedStation ? selectedStation.lng : center.lng;

  const createCustomIcon = (station, isSelected) => {
    const isFull = station.availableChargers === 0;
    const isRapid = station.type && station.type.includes("급속");
    
    // UI 표시 로직 (급속, 완속, 만차 상태 구분)
    let typeClass = '';
    if (isFull) {
      typeClass = 'full'; // 회색
    } else if (isRapid) {
      typeClass = 'rapid'; // 빨간/주황색
    } else {
      typeClass = 'slow'; // 파란/초록색
    }

    // 리액트 컴포넌트를 HTML 문자열로 변환하여 Leaflet 마커로 활용
    const html = ReactDOMServer.renderToString(
      <div 
        className={`custom-marker ${isSelected ? 'selected' : ''}`}
        style={{
          transform: isSelected ? 'scale(1.15) translateY(-5px)' : 'scale(1)'
        }}
      >
        <div className={`marker-badge ${typeClass}`}>
          {station.floor}
        </div>
        <div className={`marker-icon ${typeClass}`}>
          <Zap size={20} fill="currentColor" />
        </div>
      </div>
    );

    return L.divIcon({
      html: html,
      className: '', // leaflet 기본 백그라운드 제거용
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  // 클러스터 아이콘 커스텀 (옵션)
  const createClusterCustomIcon = function (cluster) {
    return L.divIcon({
      html: `<div class="custom-cluster-icon"><span>${cluster.getChildCount()}</span></div>`,
      className: '',
      iconSize: L.point(40, 40, true),
    });
  };

  return (
    <LeafletMap
      center={[mapCenterLat, mapCenterLat]}
      zoom={12}
      style={{ width: "100%", height: "100%", zIndex: 0 }}
      zoomControl={false} // 확대/축소 버튼의 위치를 조절하거나 숨길 때
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapRecenter lat={mapCenterLat} lng={mapCenterLng} />

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
        maxClusterRadius={60}
      >
        {stations.map((station) => {
          const isSelected = selectedId === station.id;

          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={createCustomIcon(station, isSelected)}
              eventHandlers={{
                click: () => onSelect(station.id),
              }}
            />
          );
        })}
      </MarkerClusterGroup>
    </LeafletMap>
  );
}
