-- 防音室予約システム用データベーススキーマ
-- Supabaseのダッシュボードで以下のSQLを実行してください

-- 1. 店舗テーブル（防音室用）
CREATE TABLE IF NOT EXISTS stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT '防音室',
  description TEXT DEFAULT '練習用防音室',
  opening_hours JSONB NOT NULL DEFAULT '{"start": "09:00", "end": "21:00"}',
  max_capacity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 学生テーブル（顧客テーブルを学生用に変更）
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 予約テーブル（防音室用に簡略化）
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  reservation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_reservations_date_store ON reservations(reservation_date, store_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_student_id ON customers(student_id);

-- 5. RLS (Row Level Security) の設定
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 6. RLSポリシー（全ユーザーが読み取り・書き込み可能）
CREATE POLICY "Public stores access" ON stores FOR ALL USING (true);
CREATE POLICY "Public customers access" ON customers FOR ALL USING (true);
CREATE POLICY "Public reservations access" ON reservations FOR ALL USING (true);

-- 7. サンプルデータの挿入（防音室用）
INSERT INTO stores (id, name, description, opening_hours, max_capacity) VALUES
('00000000-0000-0000-0000-000000000001', '防音室 A', '楽器練習用防音室', '{"start": "09:00", "end": "21:00"}', 1)
ON CONFLICT (id) DO NOTHING;

-- 8. updated_at自動更新のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. updated_atトリガーの設定
DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
