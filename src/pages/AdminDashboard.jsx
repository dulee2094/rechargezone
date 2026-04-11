import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Map, Bell, ArrowLeft, Image as ImageIcon, CheckCircle, Plus } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('location');

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#0f1115', color: '#f0f2f5' }}>
      
      {/* Sidebar */}
      <div style={{ 
        width: '280px', borderRight: '1px solid rgba(255,255,255,0.05)', 
        background: '#1a1d24', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <ShieldCheck size={28} color="#00d2ff" />
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>파트너 센터</h2>
        </div>
        
        <div style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '0 12px', marginBottom: '8px', fontSize: '12px', color: '#9aa0a6' }}>관리 메뉴</div>
          
          <button 
            onClick={() => setActiveTab('location')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
              background: activeTab === 'location' ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
              color: activeTab === 'location' ? '#00d2ff' : '#aaa', border: 'none',
              borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: '600'
            }}
          >
            <Map size={18} />
            도면 및 정밀 위치 관리
          </button>

          <button 
            onClick={() => setActiveTab('notice')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
              background: activeTab === 'notice' ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
              color: activeTab === 'notice' ? '#00d2ff' : '#aaa', border: 'none',
              borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: '600'
            }}
          >
            <Bell size={18} />
            실시간 공지 모드
          </button>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Link to="/" style={{ color: '#9aa0a6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <ArrowLeft size={16} /> 서비스 맵으로 돌아가기
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {activeTab === 'location' && (
            <div className="fade-in">
              <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>도면 및 정밀 위치 관리</h1>
              <p style={{ color: '#9aa0a6', marginBottom: '32px' }}>우리 건물 공식 평면도를 등록하고 정확한 충전기 위치를 핀핑하세요. 이용객의 만족도가 크게 올라갑니다.</p>

              <div style={{ background: '#1a1d24', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '32px', marginBottom: '24px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                  <ImageIcon size={20} color="#00d2ff" /> 
                  1. 실내 도면 업로드 (주차장 평면도)
                </h3>
                <div style={{ 
                  border: '2px dashed #333', borderRadius: '12px', padding: '60px', 
                  textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.2)' 
                }}>
                  <Plus size={32} color="#9aa0a6" style={{ marginBottom: '16px' }} />
                  <div style={{ color: '#f0f2f5', fontWeight: 'bold' }}>클릭하여 도면 파일 첨부 (JPG, PNG)</div>
                  <div style={{ color: '#666', marginTop: '8px', fontSize: '13px' }}>권장 해상도 1920x1080 이상</div>
                </div>
              </div>

              <div style={{ background: '#1a1d24', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '32px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                  <Map size={20} color="#00d2ff" /> 
                  2. 상세 데이터 입력 (공식 인증 배지 발급)
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9aa0a6' }}>진입 추천 게이트 (위경도 혹은 게이트명)</label>
                    <input type="text" placeholder="예: 남측 3번 출입구" style={{ width: '100%', padding: '14px', background: '#0f1115', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9aa0a6' }}>충전기 층수 / 구역</label>
                    <input type="text" placeholder="예: B3층 F-12 기둥" style={{ width: '100%', padding: '14px', background: '#0f1115', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9aa0a6' }}>운전자 안내 코멘트 (선택)</label>
                  <textarea placeholder="예: 입구 통과 후 노란선만 따라오시면 됩니다." style={{ width: '100%', padding: '14px', background: '#0f1115', border: '1px solid #333', borderRadius: '8px', color: '#fff', minHeight: '100px', resize: 'vertical' }}></textarea>
                </div>

                <button style={{ marginTop: '24px', width: '100%', padding: '16px', background: '#00d2ff', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                  <CheckCircle size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  공식 정보 등록 및 지도 배포하기
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notice' && (
            <div className="fade-in">
              <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>실시간 공지 모드</h1>
              <p style={{ color: '#9aa0a6', marginBottom: '32px' }}>현장에 문제가 생겼을 때 운전자들에게 즉시 푸시/팝업으로 알립니다.</p>

              <div style={{ background: 'rgba(255, 75, 75, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 75, 75, 0.2)', padding: '32px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#ff4b4b', fontWeight: 'bold' }}>긴급 공지사항 작성</label>
                  <textarea placeholder="예: 현재 건물 정전으로 인해 B2층 충전기 3대의 전원이 일시 차단되었습니다." style={{ width: '100%', padding: '14px', background: '#0f1115', border: '1px solid #333', borderRadius: '8px', color: '#fff', minHeight: '120px', resize: 'vertical' }}></textarea>
                </div>

                <button style={{ width: '100%', padding: '16px', background: '#ff4b4b', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                  전체 사용자에게 경고 송출하기
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
