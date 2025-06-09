-- 노후 생활비 계산 결과를 저장할 테이블 생성
CREATE TABLE user_calculations (
  id BIGSERIAL PRIMARY KEY,
  nickname VARCHAR(50),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  age INTEGER,
  monthly_total BIGINT,
  yearly_total BIGINT,
  total_needed BIGINT,
  remaining_years INTEGER,
  cost_breakdown JSONB,
  real_name VARCHAR(100),
  phone_number VARCHAR(20),
  kakao_sent BOOLEAN DEFAULT FALSE,
  kakao_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 업데이트 시간 자동 갱신을 위한 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_user_calculations_updated_at 
    BEFORE UPDATE ON user_calculations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 설정 (선택사항)
-- ALTER TABLE user_calculations ENABLE ROW LEVEL SECURITY;

-- 인덱스 생성 (성능 향상용)
CREATE INDEX idx_user_calculations_created_at ON user_calculations(created_at DESC);
CREATE INDEX idx_user_calculations_age ON user_calculations(age);
CREATE INDEX idx_user_calculations_gender ON user_calculations(gender);

-- 샘플 데이터 확인을 위한 뷰 생성
CREATE VIEW calculation_summary AS
SELECT 
  id,
  nickname,
  gender,
  age,
  monthly_total,
  total_needed,
  remaining_years,
  created_at
FROM user_calculations
ORDER BY created_at DESC; 