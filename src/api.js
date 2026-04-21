import kepcoAdditional from './data/kepcoAdditional.json';

// 공공데이터포털(한국환경공단) 전기차 충전소 실시간 API 연동 예시
export const fetchLiveStations = async () => {
  const API_KEY = import.meta.env.VITE_PUBLIC_EV_API_KEY;
  // 참고: 실제 호출 시 CORS 에러 방지를 위해 프록시(Proxy) 서버 설정이 필요할 수 있습니다.
  const url = `http://apis.data.go.kr/B552584/EvCharger/getChargerInfo?serviceKey=${API_KEY}&pageNo=1&numOfRows=100&zcode=11&dataType=JSON`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const liveStations = data.items[0].item; // API 응답 구조에 따라 조율

    // 🌟 핵심 기술: 실시간 공공 API 데이터 + 한전 지하주차장 부가정보 합치기
    const enrichedStations = liveStations.map(apiStation => {
      // 1. 가져온 실시간 충전소 이름과 변환된 한전 데이터(4,700개) 내부 이름 비교
      const microLocation = kepcoAdditional.find(k => 
        k.name.replace(/\s/g, '').includes(apiStation.statNm.replace(/\s/g, ''))
      );

      // 2. 일치하는 정보가 있다면 기존 API 정보에 '상세 위치', '주차비'를 병합
      return {
        id: apiStation.statId,
        name: apiStation.statNm,
        lat: Number(apiStation.lat),
        lng: Number(apiStation.lng),
        status: apiStation.stat === '2' ? '충전가능' : '사용중/고장', // 2: 통신이상없음 대기중
        
        // 🚀 한전 데이터가 덮어씌워지는 부분
        floor: microLocation ? microLocation.detailLocation : '위치 정보 없음',
        parkingFee: microLocation ? microLocation.parkingFee : '주차비 정보 없음',
        openTime: microLocation ? microLocation.openTime : apiStation.useTime,
      };
    });

    return enrichedStations;

  } catch (error) {
    console.error('API 데이터를 불러오는데 실패했습니다.', error);
    return [];
  }
};
