import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경변수 디버깅
console.log('🔍 환경변수 확인:');
console.log('- VITE_SUPABASE_URL:', supabaseUrl ? '설정됨' : '❌ 없음');
console.log('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '❌ 없음');
console.log('- URL 실제값:', supabaseUrl);
console.log('- Key 시작부분:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'undefined');

// Supabase 환경변수가 없을 때 임시 더미 클라이언트 생성
let supabase;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase 실제 클라이언트 연결됨');
} else {
  // 더미 클라이언트 (메서드 체이닝 지원)
  const createMockQuery = () => ({
    select: () => createMockQuery(),
    single: () => Promise.resolve({ data: { id: Date.now() }, error: null }),
    eq: () => createMockQuery(),
    update: () => createMockQuery(),
    insert: (data) => ({
      select: () => ({
        single: () => Promise.resolve({ 
          data: { id: Date.now(), ...data[0] }, 
          error: null 
        })
      })
    })
  });

  supabase = {
    from: () => createMockQuery()
  };
  console.warn('⚠️ Supabase 환경변수가 설정되지 않았습니다. 더미 클라이언트 사용 중입니다.');
}

export { supabase }; 