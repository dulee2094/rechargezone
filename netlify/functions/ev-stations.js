// netlify/functions/ev-stations.js
// 이 파일은 Netlify 서버에서 실행되어 CORS 없이 환경부 API를 호출합니다.
exports.handler = async function (event) {
  const API_KEY = "45269cf51194d9dcd2a2d1cd8d47e6c082090cf8e9777c0710ed61feb32b871e";

  // 클라이언트에서 요청한 지역코드(zcode) 파라미터 받기 (기본값: 11 = 서울)
  const zcode = event.queryStringParameters?.zcode || "11";
  const pageNo = event.queryStringParameters?.pageNo || "1";
  const numOfRows = event.queryStringParameters?.numOfRows || "500";

  const apiUrl = `https://apis.data.go.kr/B552584/EvCharger/getChargerInfo?serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&zcode=${zcode}&dataType=JSON`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        // 프론트엔드에서 이 함수를 자유롭게 호출할 수 있도록 CORS 허용
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("환경부 API 호출 오류:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API 호출 실패", message: error.message }),
    };
  }
};
