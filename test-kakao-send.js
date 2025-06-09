async function testKakaoMessage() {
    const accessToken = process.env.KAKAO_ACCESS_TOKEN;
    
    if (!accessToken) {
        console.log('❌ KAKAO_ACCESS_TOKEN이 설정되지 않았습니다.');
        return;
    }
    
    console.log('🔑 Access Token:', accessToken.substring(0, 20) + '...');
    
    const messageData = {
        template_object: {
            object_type: "text",
            text: "🎉 노후 생활비 계산 결과\n\n테스트 메시지입니다!\n\n✅ 카카오톡 연동이 성공적으로 작동하고 있습니다.",
            link: {
                web_url: "http://localhost:3000",
                mobile_web_url: "http://localhost:3000"
            }
        }
    };
    
    try {
        console.log('📤 카카오톡 메시지 전송 중...');
        
        const response = await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `template_object=${encodeURIComponent(JSON.stringify(messageData.template_object))}`
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ 메시지 전송 성공!');
            console.log('📱 카카오톡을 확인해보세요.');
            console.log('결과:', result);
        } else {
            console.log('❌ 메시지 전송 실패:');
            console.log('상태 코드:', response.status);
            console.log('오류:', result);
        }
        
    } catch (error) {
        console.log('❌ 오류 발생:', error.message);
    }
}

testKakaoMessage(); 