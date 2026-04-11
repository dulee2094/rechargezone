export const MOCK_STATIONS = [
  {
    id: 1,
    name: "스타필드 하남 (지하주차장)",
    address: "경기도 하남시 미사대로 750",
    lat: 37.5458,
    lng: 127.2238,
    floor: "B2",
    pillar: "D-42",
    description: "지하 2층 주차장 진입 후 우회전, D섹션 42번 기둥 뒤편",
    totalChargers: 6,
    availableChargers: 2,
    type: "급속, 완속",
    operator: "테슬라 슈퍼차저, 환경부",
    images: [
      "https://images.unsplash.com/photo-1616422285623-14ffea6e0b7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80"
    ],
    tips: [
      { user: "EV마스터", content: "입구에서 가장 안쪽으로 들어가야 찾기 쉽습니다." },
      { user: "테슬라짱", content: "D구역 제일 안쪽 구석에 있으니 천천히 진입하세요." }
    ]
  },
  {
    id: 2,
    name: "코엑스 동문 주차장",
    address: "서울특별시 강남구 영동대로 513",
    lat: 37.5132,
    lng: 127.0588,
    floor: "B3",
    pillar: "F-12",
    description: "동문주차장 지하 3층 F구역 통로 진입 전 입구",
    totalChargers: 10,
    availableChargers: 0,
    type: "완속",
    operator: "한국전력",
    images: [
      "https://images.unsplash.com/photo-1617711466070-dfc7d425b0cb?auto=format&fit=crop&w=800&q=80"
    ],
    tips: [
      { user: "아이오닉오너", content: "항상 만차입니다. 밤 10시 이후에 가야 조금 여유가 있어요." }
    ]
  },
  {
    id: 3,
    name: "판교 알파돔 타워",
    address: "경기도 성남시 분당구 판교역로 152",
    lat: 37.3926,
    lng: 127.1121,
    floor: "지상 1층",
    pillar: "야외",
    description: "알파돔 타워 1층 야외 동쪽 주차구역",
    totalChargers: 3,
    availableChargers: 3,
    type: "급속",
    operator: "환경부",
    images: [],
    tips: []
  }
];
