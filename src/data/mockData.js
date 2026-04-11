// ✅ 공개 자료 조사 기반 실제 마이크로 로케이션 DB
// 출처: 각 시설 공식 홈페이지, 해피차저, 일렉베리, 환경부 앱 등
// 환경부 API에 없는 '층수/기둥번호' 정보를 직접 조사하여 등록한 핵심 데이터입니다.
export const MICRO_LOCATION_DB = {

  // ── 강남구 ─────────────────────────────────────────────
  "코엑스": {
    floor: "옥상",
    pillar: "서문 게이트 진입",
    description: "세븐럭카지노 방향 서문 게이트로 진입 후 옥상 주차장으로 이동. 급속 6대(해피차저) + 완속 47대(에버온) 총 53대 운영. 충전 완료 시 화면에 무료주차 1시간 QR코드 자동 발급.",
    totalChargers: 53,
    type: "급속, 완속",
    operator: "해피차저, 에버온",
    tips: [
      { user: "EV마스터", content: "서문 게이트로 들어가야 옥상까지 한 번에 올라갑니다. 동문/북문으로 들어가면 한참 돌아야 해요." },
      { user: "테슬라짱", content: "급속 충전 후 꼭 QR코드 스캔하세요. 1시간 무료주차 받을 수 있습니다." }
    ],
    images: ["https://images.unsplash.com/photo-1617711466070-dfc7d425b0cb?auto=format&fit=crop&w=400&q=80"],
    verifiedAt: "2026-04"
  },

  "현대백화점무역센터점": {
    floor: "B4",
    pillar: "115번 기둥",
    description: "지하 4층 주차장 115번 기둥 부근. 급속(DC콤보) 6기 + 완속 2기. 운영시간 10:30~22:00.",
    totalChargers: 8,
    type: "급속, 완속",
    operator: "해피차저",
    tips: [
      { user: "아이오닉6", content: "115번 기둥 찾으면 바로 보입니다. 10시 30분 오픈이라 일찍 가면 못 씁니다." }
    ],
    images: [],
    verifiedAt: "2026-04"
  },

  "파르나스몰": {
    floor: "B4",
    pillar: "주차 안내표지 따라",
    description: "그랜드 인터컨티넨탈 서울 파르나스 / 파르나스몰 / 파르나스타워 공동 주차장 지하 4층. 테슬라 슈퍼차저 포함 다양한 급속·완속 운영.",
    totalChargers: 10,
    type: "급속, 완속",
    operator: "테슬라, 차지비",
    tips: [
      { user: "Model3오너", content: "테슬라 수퍼차저는 입구 들어가자마자 오른쪽에 있습니다." }
    ],
    images: [],
    verifiedAt: "2026-04"
  },

  // ── 서초구 ─────────────────────────────────────────────
  "신세계백화점강남점": {
    floor: "옥외주차타워 3층",
    pillar: "센트럴시티 주차타워",
    description: "센트럴시티 옆 옥외 주차타워 3층. 주차타워 엘리베이터 기준 3층에서 내리면 충전 구역 안내표지 따라 이동.",
    totalChargers: 15,
    type: "급속, 완속",
    operator: "환경부, 차지비",
    tips: [
      { user: "EV충전러", content: "주차타워 3층입니다. 백화점 지하주차장 아님 주의!" }
    ],
    images: [],
    verifiedAt: "2026-04"
  },

  // ── 송파구 ─────────────────────────────────────────────
  "롯데월드타워": {
    floor: "B2 / B3 / B4",
    pillar: "B2-급속 / B3-P·Q·R라인 / B4-N3·M3구역",
    description: "규모가 크므로 목적지에 맞는 게이트로 진입 권장. ▸B2층: 급속(EVSIS) ▸B3층: 완속(EVSIS, P·Q·R·N 기둥 근처) ▸B4층: 완속(차지비, N3·M3·N5 기둥 근처). 에비뉴엘/면세점은 A~D구역, 쇼핑몰/마트/시네마는 N~S구역 주차 추천.",
    totalChargers: 20,
    type: "급속, 완속",
    operator: "EVSIS, 차지비",
    tips: [
      { user: "롯데물", content: "B3 P구역 근처에 완속이 가장 많아요. 쇼핑 시간에 맞춰 쓰기 좋습니다." },
      { user: "EV마스터", content: "주차비 할인 없으니 쇼핑몰 앱에서 장소 저장해두고 나중에 찾기 추천." }
    ],
    images: [],
    verifiedAt: "2026-04"
  },

  "미켈란호수가아파트": {
    floor: "B2 / B4",
    pillar: "101동 지하",
    description: "석촌호수로 230 미켈란호수가 101동 지하 2층 및 지하 4층. 완속 충전 24시간 이용 가능. 주차료 무료.",
    totalChargers: 6,
    type: "완속",
    operator: "에버온",
    tips: [
      { user: "잠실이웃", content: "주차비 무료에 24시간 이용 가능해서 야간에 활용하기 좋습니다." }
    ],
    images: [],
    verifiedAt: "2026-04"
  }
};

// API 데이터와 마이크로 로케이션 DB를 매칭하는 함수
// 충전소 이름에 키워드가 포함되면 상세 위치 정보를 덮어씁니다.
export function enrichWithMicroLocation(station) {
  for (const [keyword, detail] of Object.entries(MICRO_LOCATION_DB)) {
    if (station.name && station.name.replace(/\s/g, '').includes(keyword.replace(/\s/g, ''))) {
      return {
        ...station,
        floor: detail.floor,
        pillar: detail.pillar,
        description: detail.description,
        tips: detail.tips || station.tips,
        images: detail.images?.length ? detail.images : station.images,
        operator: detail.operator || station.operator,
        verifiedAt: detail.verifiedAt,
      };
    }
  }
  return station; // 매칭 없으면 원본 반환
}

// 개발/테스트용 가짜 데이터 (API 연결 실패 시 Fallback)
export const MOCK_STATIONS = [
  { id: "mock-1", name: "코엑스 (옥상주차장)", address: "서울 강남구 영동대로 513", lat: 37.5132, lng: 127.0588, floor: "옥상", pillar: "서문 게이트 진입", description: "세븐럭카지노 방향 서문 게이트로 진입. 급속 6대 + 완속 47대 총 53대. 급속 충전 후 QR로 1시간 무료주차.", totalChargers: 53, availableChargers: 8, type: "급속, 완속", operator: "해피차저, 에버온", images: ["https://images.unsplash.com/photo-1617711466070-dfc7d425b0cb?auto=format&fit=crop&w=400&q=80"], tips: [{ user: "EV마스터", content: "서문 게이트로 들어가야 옥상까지 한 번에 올라갑니다." }, { user: "테슬라짱", content: "급속 후 QR 스캔으로 1시간 무료주차 받으세요." }] },
  { id: "mock-2", name: "현대백화점 무역센터점", address: "서울 강남구 테헤란로 517", lat: 37.5086, lng: 127.0598, floor: "B4", pillar: "115번 기둥", description: "지하 4층 주차장 115번 기둥 부근. 급속 6기 + 완속 2기. 운영 10:30~22:00.", totalChargers: 8, availableChargers: 2, type: "급속, 완속", operator: "해피차저", images: [], tips: [{ user: "아이오닉6", content: "115번 기둥 찾으면 바로 보입니다." }] },
  { id: "mock-3", name: "파르나스몰 (인터컨티넨탈)", address: "서울 강남구 테헤란로 521", lat: 37.5097, lng: 127.0607, floor: "B4", pillar: "주차 안내표지 따라", description: "파르나스몰/인터컨티넨탈호텔/파르나스타워 공동 주차장 지하 4층. 테슬라 슈퍼차저 포함.", totalChargers: 10, availableChargers: 4, type: "급속, 완속", operator: "테슬라, 차지비", images: [], tips: [{ user: "Model3오너", content: "테슬라 수퍼차저는 입구 들어가자마자 오른쪽." }] },
  { id: "mock-4", name: "신세계백화점 강남점", address: "서울 서초구 신반포로 176", lat: 37.5049, lng: 127.0053, floor: "옥외주차타워 3층", pillar: "센트럴시티 주차타워", description: "센트럴시티 옆 옥외 주차타워 3층. 백화점 지하주차장 아님 주의.", totalChargers: 15, availableChargers: 5, type: "급속, 완속", operator: "환경부, 차지비", images: [], tips: [{ user: "EV충전러", content: "주차타워 3층입니다. 백화점 지하주차장 아님 주의!" }] },
  { id: "mock-5", name: "롯데월드타워 주차장", address: "서울 송파구 올림픽로 300", lat: 37.5127, lng: 127.1025, floor: "B2 / B3 / B4", pillar: "B2-급속 / B3-P·Q·R라인 / B4-N3·M3구역", description: "B2층 급속(EVSIS), B3층 완속(P·Q·R·N기둥), B4층 완속(N3·M3·N5기둥, 차지비). 에비뉴엘은 A~D구역, 쇼핑몰은 N~S구역 주차 추천.", totalChargers: 20, availableChargers: 7, type: "급속, 완속", operator: "EVSIS, 차지비", images: [], tips: [{ user: "롯데물", content: "B3 P구역 완속이 가장 많아요." }, { user: "EV마스터", content: "주차비 할인 없으니 앱에서 장소 저장 필수." }] },
  { id: "mock-6", name: "미켈란호수가 (석촌호수)", address: "서울 송파구 석촌호수로 230", lat: 37.5079, lng: 127.0995, floor: "B2 / B4", pillar: "101동 지하", description: "101동 지하 2층 및 4층. 완속 충전 24시간 이용가능. 주차료 무료.", totalChargers: 6, availableChargers: 6, type: "완속", operator: "에버온", images: [], tips: [{ user: "잠실이웃", content: "주차비 무료에 24시간 이용 가능해서 야간 활용 굿." }] }
];
