import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  // 기본 테스트를 위한 임시 코드
  console.log('App component is loading...');
  
  const [currentStep, setCurrentStep] = useState('home'); // home, survey, result, community
  const [surveyStep, setSurveyStep] = useState(1); // 1, 2, 3
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareForm, setShareForm] = useState({
    title: '',
    content: ''
  });
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPostForDetail, setSelectedPostForDetail] = useState(null);
  const [showAllComments, setShowAllComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [statsKey, setStatsKey] = useState(0); // 통계 업데이트를 위한 키
  
  // 결과 화면 캡처를 위한 ref
  const resultRef = useRef(null);

  const [surveyData, setSurveyData] = useState({
    // Step 1 data
    nickname: '',
    currentAge: '',
    gender: '',
    healthStatus: '',
    housingType: '',
    lifeExpectancy: 93,
    
    // Step 2 data
    costs: {
      housing: 1000000,      // 주거비
      living: 800000,        // 생활비
      medical: 250000,       // 의료비
      hobby: 150000,         // 여가/취미비
      social: 80000,         // 사회적 비용
      insurance: 80000,      // 보험료
      emergency: 80000       // 비상금
    }
  });

  // 로컬 스토리지에서 포스트 로드
  useEffect(() => {
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      // 기본 샘플 포스트들
      const defaultPosts = [
        {
          id: 1,
          title: '75세 남성의 생활비 계산 결과',
          content: '월 250만원으로 계산했더니 총 4억 5천만원이 나왔네요. 실버타운 고려 중인데 참고할 만한 정보 있으실까요?',
          author: '김철수',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
          likes: 24,
          comments: [
            { id: 1, author: '박영희', content: '저도 비슷한 결과가 나왔어요. 미리 준비하는 게 중요한 것 같습니다.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
            { id: 2, author: '이민호', content: '실버타운 정보 공유해드릴게요. 개인메시지 보내겠습니다.', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() }
          ],
          surveyResult: null
        },
        {
          id: 2,
          title: '요양원 입주 고려 중인 분 계산 결과',
          content: '월 300만원 기준으로 계산해봤어요. 의료비가 생각보다 많이 들어가네요. 건강관리가 정말 중요한 것 같습니다.',
          author: '홍길동',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5시간 전
          likes: 15,
          comments: [
            { id: 1, author: '강수진', content: '의료비는 정말 예측하기 어려운 부분이에요. 건강보험 잘 활용하시길!', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() }
          ],
          surveyResult: null
        }
      ];
      setPosts(defaultPosts);
      localStorage.setItem('communityPosts', JSON.stringify(defaultPosts));
    }
  }, []);

  // 포스트 저장
  const savePosts = (newPosts) => {
    setPosts(newPosts);
    localStorage.setItem('communityPosts', JSON.stringify(newPosts));
  };

  // 비용 입력 처리 (천 단위 쉼표 추가)
  const handleCostChange = (costId, value) => {
    // 쉼표 제거하고 숫자만 추출
    const numericValue = value.replace(/,/g, '');
    
    // 숫자가 아닌 문자가 있으면 무시
    if (!/^\d*$/.test(numericValue)) {
      return;
    }
    
    // 숫자로 변환
    const numberValue = parseInt(numericValue) || 0;
    
    // 상태 업데이트
    setSurveyData({
      ...surveyData,
      costs: {
        ...surveyData.costs,
        [costId]: numberValue
      }
    });
  };

  // 비용을 쉼표가 포함된 문자열로 변환
  const formatCostInput = (value) => {
    return formatNumber(value);
  };

  const costItems = [
    { id: 'housing', name: '주거비', default: 1000000, description: '임대료, 관리비 등' },
    { id: 'living', name: '생활비', default: 800000, description: '식비, 공공요금 등' },
    { id: 'medical', name: '의료비', default: 250000, description: '병원비, 약값 등' },
    { id: 'hobby', name: '여가/취미비', default: 150000, description: '문화생활, 취미활동' },
    { id: 'social', name: '사회적 비용', default: 80000, description: '경조사비, 모임비' },
    { id: 'insurance', name: '보험료', default: 80000, description: '각종 보험료' },
    { id: 'emergency', name: '비상금', default: 80000, description: '예비비, 월 적립' }
  ];

  // 계산 함수
  const calculateResults = () => {
    const monthlyTotal = Object.values(surveyData.costs).reduce((sum, cost) => sum + cost, 0);
    const yearlyTotal = monthlyTotal * 12;
    const remainingYears = surveyData.lifeExpectancy - surveyData.currentAge;
    const totalNeeded = yearlyTotal * remainingYears;
    
    return {
      monthlyTotal,
      yearlyTotal,
      totalNeeded,
      remainingYears
    };
  };

  // 숫자 포맷팅
  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatCurrency = (num) => {
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}억원`;
    } else if (num >= 10000) {
      return `${(num / 10000).toFixed(0)}만원`;
    }
    return `${formatNumber(num)}원`;
  };

  // 시간 포맷팅
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}일 전`;
    }
  };

  // 공유하기 기능
  const handleShare = () => {
    const results = calculateResults();
    const defaultTitle = `${surveyData.currentAge}세 ${surveyData.gender === 'male' ? '남성' : '여성'}의 생활비 계산 결과`;
    const defaultContent = `월 ${formatCurrency(results.monthlyTotal)} 기준으로 계산해봤는데, 총 ${formatCurrency(results.totalNeeded)}이 필요하다고 나왔네요. 어떻게 생각하시나요?`;
    
    setShareForm({
      title: defaultTitle,
      content: defaultContent
    });
    setShowShareModal(true);
  };

  // 포스트 등록
  const submitPost = () => {
    if (!shareForm.title.trim() || !shareForm.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const results = calculateResults();
    const newPost = {
      id: Date.now(),
      title: shareForm.title,
      content: shareForm.content,
      author: surveyData.nickname || `익명${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      surveyResult: {
        age: surveyData.currentAge,
        gender: surveyData.gender,
        monthlyTotal: results.monthlyTotal,
        totalNeeded: results.totalNeeded,
        remainingYears: results.remainingYears
      }
    };

    const newPosts = [newPost, ...posts];
    savePosts(newPosts);
    
    setShowShareModal(false);
    setShareForm({ title: '', content: '' });
    setCurrentStep('community');
    alert('커뮤니티에 성공적으로 공유되었습니다!');
  };

  // 좋아요 기능
  const handleLike = (postId) => {
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    );
    savePosts(updatedPosts);
  };

  // 댓글 추가
  const addComment = (postId) => {
    if (!commentText.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    if (!commentAuthor.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    const newComment = {
      id: Date.now(),
      author: commentAuthor.trim(),
      content: commentText,
      timestamp: new Date().toISOString()
    };

    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, newComment] }
        : post
    );
    
    savePosts(updatedPosts);
    setCommentText('');
    setCommentAuthor('');
  };

  // 공유된 결과로부터 차트 데이터 생성
  const generateChartDataFromResult = (surveyResult) => {
    // 기본 비용 비율로 추정 (실제 데이터가 없으므로)
    const estimatedCosts = {
      housing: Math.round(surveyResult.monthlyTotal * 0.42), // 42%
      living: Math.round(surveyResult.monthlyTotal * 0.34),  // 34%
      medical: Math.round(surveyResult.monthlyTotal * 0.10), // 10%
      hobby: Math.round(surveyResult.monthlyTotal * 0.06),   // 6%
      social: Math.round(surveyResult.monthlyTotal * 0.03),  // 3%
      insurance: Math.round(surveyResult.monthlyTotal * 0.03), // 3%
      emergency: Math.round(surveyResult.monthlyTotal * 0.02)  // 2%
    };

    const barData = costItems.map(item => ({
      name: item.name,
      amount: estimatedCosts[item.id]
    }));

    const pieData = costItems.map((item, index) => ({
      name: item.name,
      value: estimatedCosts[item.id],
      fill: ['#27ae60', '#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'][index]
    }));

    return { barData, pieData };
  };

  // 참여 통계 계산
  const calculateStats = () => {
    const savedSubmissions = localStorage.getItem('surveySubmissions');
    let submissions = [];
    
    if (savedSubmissions) {
      submissions = JSON.parse(savedSubmissions);
    } else {
      // 초기 더미 데이터 (실제 사용자가 없을 때)
      submissions = [
        { age: 75, gender: 'male', monthlyTotal: 2400000, totalNeeded: 432000000, housingType: 'owned' },
        { age: 68, gender: 'female', monthlyTotal: 1800000, totalNeeded: 450000000, housingType: 'rent' },
        { age: 72, gender: 'male', monthlyTotal: 2100000, totalNeeded: 441000000, housingType: 'jeonse' },
        { age: 79, gender: 'female', monthlyTotal: 2800000, totalNeeded: 392000000, housingType: 'senior' },
        { age: 65, gender: 'male', monthlyTotal: 2200000, totalNeeded: 616000000, housingType: 'owned' },
        { age: 71, gender: 'female', monthlyTotal: 1900000, totalNeeded: 418000000, housingType: 'owned' },
        { age: 77, gender: 'male', monthlyTotal: 2600000, totalNeeded: 416000000, housingType: 'senior' },
        { age: 69, gender: 'female', monthlyTotal: 2000000, totalNeeded: 480000000, housingType: 'rent' }
      ];
    }

    // 총 참여자 수
    const totalParticipants = submissions.length;

    // 연령대 분포
    const ageGroups = {
      '50대': submissions.filter(s => s.age >= 50 && s.age < 60).length,
      '60대': submissions.filter(s => s.age >= 60 && s.age < 70).length,
      '70대': submissions.filter(s => s.age >= 70 && s.age < 80).length,
      '80대': submissions.filter(s => s.age >= 80 && s.age < 90).length,
      '90대': submissions.filter(s => s.age >= 90).length
    };

    // 성별 분포
    const genderStats = {
      male: submissions.filter(s => s.gender === 'male').length,
      female: submissions.filter(s => s.gender === 'female').length
    };

    // 평균 통계
    const avgMonthly = submissions.reduce((sum, s) => sum + s.monthlyTotal, 0) / submissions.length;
    const avgTotal = submissions.reduce((sum, s) => sum + s.totalNeeded, 0) / submissions.length;
    const avgAge = submissions.reduce((sum, s) => sum + s.age, 0) / submissions.length;

    // 주거 형태 통계
    const housingStats = {
      owned: submissions.filter(s => s.housingType === 'owned').length,
      rent: submissions.filter(s => s.housingType === 'rent').length,
      jeonse: submissions.filter(s => s.housingType === 'jeonse').length,
      senior: submissions.filter(s => s.housingType === 'senior').length,
      care: submissions.filter(s => s.housingType === 'care').length
    };

    return {
      totalParticipants,
      ageGroups,
      genderStats,
      avgMonthly: Math.round(avgMonthly),
      avgTotal: Math.round(avgTotal),
      avgAge: Math.round(avgAge * 10) / 10,
      housingStats
    };
  };

  // 설문 완료 시 데이터 저장
  const saveSubmissionData = () => {
    const results = calculateResults();
    const submissionData = {
      age: surveyData.currentAge,
      gender: surveyData.gender,
      monthlyTotal: results.monthlyTotal,
      totalNeeded: results.totalNeeded,
      housingType: surveyData.housingType,
      timestamp: new Date().toISOString()
    };

    const savedSubmissions = localStorage.getItem('surveySubmissions');
    let submissions = savedSubmissions ? JSON.parse(savedSubmissions) : [];
    submissions.push(submissionData);
    localStorage.setItem('surveySubmissions', JSON.stringify(submissions));
    
    // 통계 업데이트를 위해 키 변경
    setStatsKey(prevKey => prevKey + 1);
  };

  // 이미지 저장 기능
  const saveAsImage = async () => {
    if (!resultRef.current) {
      alert('결과 화면을 찾을 수 없습니다.');
      return;
    }

    try {
      // 로딩 상태 표시
      const button = document.querySelector('.save-image-btn');
      const originalText = button.textContent;
      button.textContent = '이미지 생성 중...';
      button.disabled = true;

      // html2canvas 옵션 설정
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // 고해상도를 위해 2배 스케일
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: resultRef.current.scrollWidth,
        height: resultRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // 캔버스를 이미지로 변환
      const link = document.createElement('a');
      link.download = `노후생활비계산결과_${surveyData.nickname || '익명'}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // 다운로드 실행
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 버튼 상태 복원
      button.textContent = originalText;
      button.disabled = false;
      
      alert('이미지가 성공적으로 저장되었습니다!');
      
    } catch (error) {
      console.error('이미지 저장 중 오류:', error);
      alert('이미지 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      
      // 버튼 상태 복원
      const button = document.querySelector('.save-image-btn');
      if (button) {
        button.textContent = '이미지 저장';
        button.disabled = false;
      }
    }
  };

  const renderHome = () => {
    const stats = calculateStats();
    const mostPopularAgeGroup = Object.entries(stats.ageGroups).reduce((a, b) => stats.ageGroups[a[0]] > stats.ageGroups[b[0]] ? a : b);
    const mostPopularHousing = Object.entries(stats.housingStats).reduce((a, b) => stats.housingStats[a[0]] > stats.housingStats[b[0]] ? a : b);
    
    const housingTypeNames = {
      owned: '자가',
      rent: '월세',
      jeonse: '전세',
      senior: '실버타운',
      care: '요양원'
    };

    return (
      <main className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                남은 인생 총 얼마가
                <br />
                필요할까?
              </h1>
              <p className="hero-description">
                노후를 준비하는 어르신을 위한 생활비 계산 서비스입니다.
                <br />
                월간 생활비를 기준으로 남은 여생 동안 필요한 총 비용을 계산해보세요.
              </p>
              <div className="hero-buttons">
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setCurrentStep('survey');
                    setSurveyStep(1);
                  }}
                >
                  계산 시작하기
                  <span className="arrow">→</span>
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setCurrentStep('community')}
                >
                  커뮤니티 보기
                </button>
              </div>
              <div className="service-features">
                <div className="feature">
                  <span className="feature-icon">📊</span>
                  <span>월간 비용 계산</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">💰</span>
                  <span>총 필요 금액 예측</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📱</span>
                  <span>결과 공유</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 참여 통계 섹션 */}
          <div className="stats-section" key={statsKey}>
            <h2 className="stats-title">지금까지 참여현황</h2>
            <div className="stats-grid">
              <div className="stat-card highlight">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>총 참여자</h3>
                  <div className="stat-value">{stats.totalParticipants}명</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🎂</div>
                <div className="stat-content">
                  <h3>평균 연령</h3>
                  <div className="stat-value">{stats.avgAge}세</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>최다 연령대</h3>
                  <div className="stat-value">{mostPopularAgeGroup[0]}</div>
                  <div className="stat-detail">{mostPopularAgeGroup[1]}명 참여</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⚖️</div>
                <div className="stat-content">
                  <h3>성별 비율</h3>
                  <div className="stat-value">
                    남 {stats.genderStats.male}명 / 여 {stats.genderStats.female}명
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>평균 월 생활비</h3>
                  <div className="stat-value">{formatCurrency(stats.avgMonthly)}</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h3>평균 필요 금액</h3>
                  <div className="stat-value">{formatCurrency(stats.avgTotal)}</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🏠</div>
                <div className="stat-content">
                  <h3>주요 주거형태</h3>
                  <div className="stat-value">{housingTypeNames[mostPopularHousing[0]]}</div>
                  <div className="stat-detail">{mostPopularHousing[1]}명 선택</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3>실시간 업데이트</h3>
                  <div className="stat-value">매일 증가중</div>
                  <div className="stat-detail">새로운 참여자 대기</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Geometric Shapes */}
          <div className="geometric-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </div>
      </main>
    );
  };

  const renderSurveyStep1 = () => (
    <div className="survey-form">
      <h3>기본 정보 입력</h3>
      <div className="form-group">
        <label>닉네임</label>
        <input 
          type="text" 
          placeholder="예: 행복한할머니"
          value={surveyData.nickname}
          onChange={(e) => setSurveyData({...surveyData, nickname: e.target.value})}
        />
        <small>커뮤니티에서 사용할 닉네임을 입력해주세요</small>
      </div>
      
      <div className="form-group">
        <label>현재 나이</label>
        <input 
          type="number" 
          min="50" 
          max="100" 
          placeholder="예: 75세"
          value={surveyData.currentAge}
          onChange={(e) => setSurveyData({...surveyData, currentAge: parseInt(e.target.value) || ''})}
        />
        <small>50세 ~ 100세 범위로 입력해주세요</small>
      </div>
      
      <div className="form-group">
        <label>성별</label>
        <div className="radio-group">
          <label>
            <input 
              type="radio" 
              name="gender" 
              value="male"
              checked={surveyData.gender === 'male'}
              onChange={(e) => setSurveyData({...surveyData, gender: e.target.value})}
            /> 남성
          </label>
          <label>
            <input 
              type="radio" 
              name="gender" 
              value="female"
              checked={surveyData.gender === 'female'}
              onChange={(e) => setSurveyData({...surveyData, gender: e.target.value})}
            /> 여성
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>건강상태</label>
        <select 
          value={surveyData.healthStatus}
          onChange={(e) => setSurveyData({...surveyData, healthStatus: e.target.value})}
        >
          <option value="">선택해주세요</option>
          <option value="good">양호</option>
          <option value="chronic">만성질환 있음</option>
          <option value="limited">거동 불편</option>
        </select>
      </div>

      <div className="form-group">
        <label>현재 주거형태</label>
        <select 
          value={surveyData.housingType}
          onChange={(e) => setSurveyData({...surveyData, housingType: e.target.value})}
        >
          <option value="">선택해주세요</option>
          <option value="owned">자가</option>
          <option value="jeonse">전세</option>
          <option value="rent">월세</option>
          <option value="senior">실버타운</option>
          <option value="care">요양원</option>
        </select>
      </div>

      <div className="form-group">
        <label>몇 세까지 살게 될까?</label>
        <input 
          type="number" 
          min="85" 
          max="120" 
          value={surveyData.lifeExpectancy}
          onChange={(e) => setSurveyData({...surveyData, lifeExpectancy: parseInt(e.target.value) || 93})}
        />
        <small>기본값: 93세 (85~120세 범위에서 조정 가능)</small>
      </div>

      <div className="form-actions">
        <button 
          className="btn-secondary"
          onClick={() => setCurrentStep('home')}
        >
          이전
        </button>
        <button 
          className="btn-primary"
          onClick={() => setSurveyStep(2)}
          disabled={!surveyData.nickname || !surveyData.currentAge || !surveyData.gender || !surveyData.healthStatus || !surveyData.housingType}
        >
          다음 단계
          <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );

  const renderSurveyStep2 = () => {
    const monthlyTotal = Object.values(surveyData.costs).reduce((sum, cost) => sum + cost, 0);
    
    return (
      <div className="survey-form">
        <h3>월간 비용 항목 입력</h3>
        <p className="cost-description">
          각 항목별로 월간 예상 비용을 입력해주세요. 추천 금액이 기본으로 설정되어 있습니다.
        </p>
        
        <div className="cost-items">
          {costItems.map(item => (
            <div key={item.id} className="cost-item">
              <div className="cost-header">
                <label>{item.name}</label>
                <span className="cost-description-small">{item.description}</span>
              </div>
              <div className="cost-input-group">
                <input 
                  type="text"
                  value={formatCostInput(surveyData.costs[item.id])}
                  onChange={(e) => handleCostChange(item.id, e.target.value)}
                  placeholder="0"
                />
                <span className="cost-unit">원/월</span>
              </div>
            </div>
          ))}
        </div>

        <div className="monthly-total">
          <div className="total-card">
            <h4>월간 총 생활비</h4>
            <div className="total-amount">{formatCurrency(monthlyTotal)}</div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            className="btn-secondary"
            onClick={() => setSurveyStep(1)}
          >
            이전
          </button>
          <button 
            className="btn-primary"
            onClick={() => {
              setSurveyStep(3);
              setCurrentStep('result');
              saveSubmissionData();
            }}
          >
            결과 보기
            <span className="arrow">→</span>
          </button>
        </div>
      </div>
    );
  };

  const renderSurvey = () => (
    <main className="survey-section">
      <div className="survey-container">
        <div className="survey-header">
          <h2>생활비 계산</h2>
          <p>간단한 정보 입력으로 필요한 생활비를 계산해보세요</p>
        </div>
        
        <div className="survey-steps">
          <div className={`step ${surveyStep >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span>기본 정보</span>
          </div>
          <div className={`step ${surveyStep >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span>비용 항목</span>
          </div>
          <div className={`step ${surveyStep >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span>결과 확인</span>
          </div>
        </div>

        {surveyStep === 1 && renderSurveyStep1()}
        {surveyStep === 2 && renderSurveyStep2()}
      </div>
    </main>
  );

  const renderResult = () => {
    const results = calculateResults();
    
    // 차트 데이터
    const barData = costItems.map(item => ({
      name: item.name,
      amount: surveyData.costs[item.id]
    }));

    const pieData = costItems.map((item, index) => ({
      name: item.name,
      value: surveyData.costs[item.id],
      fill: ['#27ae60', '#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'][index]
    }));

    return (
      <main className="result-section">
        <div className="result-container">
          {/* 캡처할 영역 */}
          <div ref={resultRef} className="result-capture-area">
            <div className="result-header">
              <h2>노후 생활비 계산 결과</h2>
              <p>{surveyData.nickname ? `${surveyData.nickname}님의 ` : ''}{surveyData.currentAge}세 기준 노후 생활비 계산 결과입니다</p>
            </div>

            <div className="result-summary">
              <div className="summary-card">
                <div className="summary-icon">📅</div>
                <div className="summary-content">
                  <h4>남은 예상 수명</h4>
                  <div className="summary-value">{results.remainingYears}년</div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="summary-icon">🗓️</div>
                <div className="summary-content">
                  <h4>월 예상 생활비</h4>
                  <div className="summary-value">{formatCurrency(results.monthlyTotal)}</div>
                </div>
              </div>
              
              <div className="summary-card highlight">
                <div className="summary-icon">💰</div>
                <div className="summary-content">
                  <h4>총 예상 필요 금액</h4>
                  <div className="summary-value">{formatCurrency(results.totalNeeded)}</div>
                  <small>({results.remainingYears}년 기준)</small>
                </div>
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-container">
                <h4>월간 비용 항목별 분석</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), '월 비용']} />
                    <Bar dataKey="amount" fill="#27ae60" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h4>비용 비율</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(value), '월 비용']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 이미지에 포함될 워터마크 */}
            <div className="image-watermark">
              <p>🏢 노후 생활비 계산기 | 생성일: {new Date().toLocaleDateString('ko-KR')}</p>
            </div>
          </div>

          <div className="result-actions">
            <button 
              className="btn-secondary"
              onClick={() => {
                setCurrentStep('survey');
                setSurveyStep(2);
              }}
            >
              수정하기
            </button>
            <button 
              className="btn-primary"
              onClick={handleShare}
            >
              커뮤니티에 공유하기
              <span className="arrow">→</span>
            </button>
            <button 
              className="btn-primary save-image-btn"
              onClick={saveAsImage}
            >
              🖼️ 이미지 저장
            </button>
          </div>
        </div>
      </main>
    );
  };

  const renderCommunity = () => (
    <main className="community-section">
      <div className="community-container">
        <div className="community-header">
          <h2>커뮤니티</h2>
          <p>다른 분들의 계산 결과를 보고 의견을 나눠보세요</p>
          <button 
            className="btn-primary"
            onClick={() => {
              setCurrentStep('survey');
              setSurveyStep(1);
            }}
          >
            나도 계산해보기
          </button>
        </div>
        
        <div className="community-posts">
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <h4>{post.title}</h4>
                <span className="post-author">작성자: {post.author}</span>
              </div>
              <p className="post-content">{post.content}</p>
              
              {post.surveyResult && (
                <div className="post-result">
                  <h5>📊 계산 결과</h5>
                  <div className="result-summary-small">
                    <span>👤 {post.surveyResult.age}세 {post.surveyResult.gender === 'male' ? '남성' : '여성'}</span>
                    <span>💰 월 {formatCurrency(post.surveyResult.monthlyTotal)}</span>
                    <span>🎯 총 {formatCurrency(post.surveyResult.totalNeeded)}</span>
                  </div>
                  <button 
                    className="detail-view-btn"
                    onClick={() => setSelectedPostForDetail(post.id)}
                  >
                    📈 자세히보기
                  </button>
                </div>
              )}
              
              <div className="post-actions">
                <button 
                  className="action-btn like-btn"
                  onClick={() => handleLike(post.id)}
                >
                  👍 {post.likes}
                </button>
                <button 
                  className="action-btn comment-btn"
                  onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                >
                  댓글쓰기 ({post.comments.length})
                </button>
                <span className="post-time">{formatTimeAgo(post.timestamp)}</span>
              </div>
              
              {/* 댓글 미리보기 (항상 표시) */}
              {post.comments.length > 0 && (
                <div className="comments-preview">
                  <div className="comment-preview">
                    <div className="comment-header">
                      <strong>{post.comments[0].author}</strong>
                      <span className="comment-time">{formatTimeAgo(post.comments[0].timestamp)}</span>
                    </div>
                    <p className="comment-content">{post.comments[0].content}</p>
                  </div>
                  
                  {post.comments.length > 1 && (
                    <button 
                      className="show-all-comments-btn"
                      onClick={() => setShowAllComments({
                        ...showAllComments,
                        [post.id]: !showAllComments[post.id]
                      })}
                    >
                      {showAllComments[post.id] 
                        ? '댓글 접기' 
                        : `모든댓글보기 (${post.comments.length}개)`
                      }
                    </button>
                  )}
                </div>
              )}
              
              {/* 전체 댓글 섹션 (모든댓글보기 클릭 시) */}
              {(selectedPost === post.id || showAllComments[post.id]) && (
                <div className="comments-section">
                  {showAllComments[post.id] && (
                    <div className="comments-list">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="comment">
                          <div className="comment-header">
                            <strong>{comment.author}</strong>
                            <span className="comment-time">{formatTimeAgo(comment.timestamp)}</span>
                          </div>
                          <p className="comment-content">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedPost === post.id && (
                    <div className="comment-form">
                      <div className="comment-form-field">
                        <label htmlFor="commentAuthor">닉네임</label>
                        <input
                          id="commentAuthor"
                          type="text"
                          value={commentAuthor}
                          onChange={(e) => setCommentAuthor(e.target.value)}
                          placeholder="닉네임을 입력해주세요..."
                          maxLength="20"
                        />
                      </div>
                      <div className="comment-form-field">
                        <label htmlFor="commentText">댓글</label>
                        <textarea
                          id="commentText"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="댓글을 입력해주세요..."
                          rows="3"
                        />
                      </div>
                      <button 
                        className="btn-primary comment-submit"
                        onClick={() => addComment(post.id)}
                      >
                        댓글 등록
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );

  // 공유 모달 렌더링
  const renderShareModal = () => {
    if (!showShareModal) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>커뮤니티에 공유하기</h3>
            <button className="modal-close" onClick={() => setShowShareModal(false)}>×</button>
          </div>
          
          <div className="modal-body">
            <div className="form-group">
              <label>제목</label>
              <input
                type="text"
                value={shareForm.title}
                onChange={(e) => setShareForm({...shareForm, title: e.target.value})}
                placeholder="공유할 제목을 입력해주세요"
              />
            </div>
            
            <div className="form-group">
              <label>내용</label>
              <textarea
                value={shareForm.content}
                onChange={(e) => setShareForm({...shareForm, content: e.target.value})}
                placeholder="공유할 내용을 입력해주세요"
                rows="4"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setShowShareModal(false)}>
              취소
            </button>
            <button className="btn-primary" onClick={submitPost}>
              공유하기
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 상세보기 모달 렌더링
  const renderDetailModal = () => {
    if (!selectedPostForDetail) return null;

    const post = posts.find(p => p.id === selectedPostForDetail);
    if (!post || !post.surveyResult) return null;

    const { barData, pieData } = generateChartDataFromResult(post.surveyResult);

    return (
      <div className="modal-overlay" onClick={() => setSelectedPostForDetail(null)}>
        <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{post.author}님의 상세 계산 결과</h3>
            <button className="modal-close" onClick={() => setSelectedPostForDetail(null)}>×</button>
          </div>
          
          <div className="modal-body">
            <div className="detail-summary">
              <div className="detail-summary-item">
                <span className="detail-icon">👤</span>
                <div>
                  <h4>기본 정보</h4>
                  <p>{post.surveyResult.age}세 {post.surveyResult.gender === 'male' ? '남성' : '여성'}</p>
                </div>
              </div>
              
              <div className="detail-summary-item">
                <span className="detail-icon">📅</span>
                <div>
                  <h4>남은 예상 수명</h4>
                  <p>{post.surveyResult.remainingYears}년</p>
                </div>
              </div>
              
              <div className="detail-summary-item">
                <span className="detail-icon">🗓️</span>
                <div>
                  <h4>월 예상 생활비</h4>
                  <p>{formatCurrency(post.surveyResult.monthlyTotal)}</p>
                </div>
              </div>
              
              <div className="detail-summary-item highlight">
                <span className="detail-icon">💰</span>
                <div>
                  <h4>총 예상 필요 금액</h4>
                  <p>{formatCurrency(post.surveyResult.totalNeeded)}</p>
                </div>
              </div>
            </div>

            <div className="detail-charts">
              <div className="detail-chart-container">
                <h4>월간 비용 항목별 분석 (추정)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), '월 비용']} />
                    <Bar dataKey="amount" fill="#27ae60" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="detail-chart-container">
                <h4>비용 비율 (추정)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(value), '월 비용']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="detail-note">
              <p>📌 상세 비용 분석은 일반적인 비율을 기반으로 한 추정값입니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h2>💰 노후 생활비 계산기</h2>
          </div>
          <ul className="nav-menu">
            <li className="nav-item">
              <button 
                className={`nav-link ${currentStep === 'home' ? 'active' : ''}`}
                onClick={() => setCurrentStep('home')}
              >
                홈
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${currentStep === 'survey' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentStep('survey');
                  setSurveyStep(1);
                }}
              >
                계산하기
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${currentStep === 'result' ? 'active' : ''}`}
                onClick={() => currentStep === 'result' ? null : setCurrentStep('result')}
                disabled={!surveyData.currentAge}
              >
                결과보기
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${currentStep === 'community' ? 'active' : ''}`}
                onClick={() => setCurrentStep('community')}
              >
                커뮤니티
              </button>
            </li>
          </ul>
          <div className="nav-info">
            <span className="age-info">💰 노후 생활비 계산</span>
          </div>
        </div>
      </nav>

      {currentStep === 'home' && renderHome()}
      {currentStep === 'survey' && renderSurvey()}
      {currentStep === 'result' && renderResult()}
      {currentStep === 'community' && renderCommunity()}
      {renderShareModal()}
      {renderDetailModal()}
    </div>
  );
}

export default App; 