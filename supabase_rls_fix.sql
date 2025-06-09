-- RLS (Row Level Security) 비활성화 (개발/테스트용)
-- 주의: 프로덕션에서는 적절한 RLS 정책을 설정해야 합니다

-- 1. RLS 비활성화 (간단한 해결책)
ALTER TABLE user_calculations DISABLE ROW LEVEL SECURITY;

-- 또는

-- 2. 모든 사용자가 읽기/쓰기 가능한 정책 생성 (개발용)
-- ALTER TABLE user_calculations ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all access" ON user_calculations
--   FOR ALL
--   TO public
--   USING (true)
--   WITH CHECK (true);

-- 3. 테이블 권한 확인 및 설정
GRANT ALL ON user_calculations TO anon;
GRANT ALL ON user_calculations TO authenticated;

-- 4. 시퀀스 권한 설정 (ID 자동 증가용)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated; 