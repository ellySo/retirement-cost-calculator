-- 강화된 권한 및 RLS 설정

-- 1. RLS 완전 비활성화
ALTER TABLE user_calculations DISABLE ROW LEVEL SECURITY;

-- 2. 모든 기존 정책 삭제
DROP POLICY IF EXISTS "Allow all access" ON user_calculations;
DROP POLICY IF EXISTS "Enable insert for anon users" ON user_calculations;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_calculations;

-- 3. 테이블 권한 설정
GRANT ALL PRIVILEGES ON user_calculations TO anon;
GRANT ALL PRIVILEGES ON user_calculations TO authenticated;
GRANT ALL PRIVILEGES ON user_calculations TO public;

-- 4. 시퀀스 권한 설정
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO public;

-- 5. 스키마 권한 설정
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 6. 테이블 소유권 확인 및 변경
ALTER TABLE user_calculations OWNER TO postgres;

-- 7. 간단한 테스트 레코드 직접 삽입 (권한 테스트용)
INSERT INTO user_calculations (
    nickname, 
    gender, 
    age, 
    monthly_total, 
    yearly_total, 
    total_needed, 
    remaining_years
) VALUES (
    'test_user', 
    'male', 
    65, 
    2000000, 
    24000000, 
    480000000, 
    20
);

-- 8. 결과 확인
SELECT COUNT(*) as total_records FROM user_calculations;
SELECT * FROM user_calculations ORDER BY created_at DESC LIMIT 3; 