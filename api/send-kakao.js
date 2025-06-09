export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, nickname, age, gender, monthlyTotal, totalNeeded, remainingYears, imageUrl } = req.body;

    // 카카오톡 나에게 보내기 API
    const KAKAO_API_URL = 'https://kapi.kakao.com/v2/api/talk/memo/default/send';
    const ACCESS_TOKEN = process.env.KAKAO_ACCESS_TOKEN; // 환경 변수에서 가져오기

    if (!ACCESS_TOKEN) {
      console.error('카카오 액세스 토큰이 설정되지 않았습니다.');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // 메시지 내용 생성
    const messageText = `
🏦 노후 생활비 계산 결과

👤 ${nickname}님 (${age}세 ${gender})
📅 남은 예상 수명: ${remainingYears}년
💰 월 예상 생활비: ${monthlyTotal}
🎯 총 예상 필요 금액: ${totalNeeded}

📱 노후 생활비 계산기에서 생성된 결과입니다.
계획적인 노후 준비에 도움이 되시길 바랍니다.

🔗 계산기 링크: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.vercel.app'}
    `.trim();

    // 카카오톡 메시지 전송 (나에게 보내기)
    const response = await fetch(KAKAO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        template_object: JSON.stringify({
          object_type: 'text',
          text: messageText,
          link: {
            web_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.vercel.app',
            mobile_web_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.vercel.app'
          }
        })
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.msg || '카카오톡 전송 실패');
    }

    // 성공 응답
    return res.status(200).json({ 
      success: true, 
      message: '카카오톡 메시지가 성공적으로 전송되었습니다.',
      kakaoResponse: result 
    });

  } catch (error) {
    console.error('카카오톡 전송 오류:', error);
    
    return res.status(500).json({ 
      error: '카카오톡 메시지 전송 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
} 