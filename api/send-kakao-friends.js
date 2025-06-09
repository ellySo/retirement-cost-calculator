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

    // 친구톡 메시지 전송 API
    const KAKAO_API_URL = 'https://kapi.kakao.com/v1/api/talk/friends/message/default/send';
    const ACCESS_TOKEN = process.env.KAKAO_ACCESS_TOKEN;

    if (!ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // 수신자 UUID 리스트 (실제로는 사용자의 UUID를 받아야 함)
    const receiverUuids = [to]; // to 파라미터에 사용자의 UUID가 들어와야 함

    const messageData = {
      receiver_uuids: receiverUuids,
      template_object: {
        object_type: 'text',
        text: `🏦 ${nickname}님의 노후 생활비 계산 결과

👤 ${age}세 ${gender}
📅 남은 예상 수명: ${remainingYears}년
💰 월 예상 생활비: ${monthlyTotal}
🎯 총 예상 필요 금액: ${totalNeeded}

📱 노후 생활비 계산기에서 생성된 결과입니다.`,
        link: {
          web_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.vercel.app',
          mobile_web_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.vercel.app'
        }
      }
    };

    const response = await fetch(KAKAO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        receiver_uuids: JSON.stringify(receiverUuids),
        template_object: JSON.stringify(messageData.template_object)
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.msg || '친구톡 전송 실패');
    }

    return res.status(200).json({ 
      success: true, 
      message: '친구톡 메시지가 성공적으로 전송되었습니다.',
      kakaoResponse: result 
    });

  } catch (error) {
    console.error('친구톡 전송 오류:', error);
    
    return res.status(500).json({ 
      error: '친구톡 메시지 전송 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
} 