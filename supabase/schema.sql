-- ============================================================
-- LAUNDRY QUEST — Supabase Database Schema
-- Run this in Supabase SQL Editor to set up the database
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS / PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  games_played INT DEFAULT 0,
  best_grade TEXT DEFAULT 'F',
  -- Cosmetics (freemium)
  coins INT DEFAULT 0,
  equipped_machine_skin TEXT DEFAULT 'default',
  equipped_detergent_skin TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEASONS (Battle Pass system) — MUST come before clothes
-- ============================================================
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  theme TEXT, -- e.g., 'summer', 'halloween', 'streetwear'
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLOTHES LIBRARY
-- This is the central catalog, editable from Supabase dashboard
-- Supports multi-category items with graded scoring
-- ============================================================
CREATE TABLE IF NOT EXISTS clothes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emoji TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('blanc', 'couleur', 'sombre', 'delicat')),
  -- Multi-category support: JSONB array of accepted secondary categories
  -- Format: [{"id": "couleur", "score": 0.5, "reason": "Acceptable mais..."}]
  accepted_cats JSONB DEFAULT '[]'::jsonb,
  fabric TEXT NOT NULL,
  max_temp INT DEFAULT 40,
  wash_instructions TEXT,
  tip TEXT, -- Pedagogical tip shown in-game
  image_url TEXT, -- Future: illustrated art from Supabase Storage
  difficulty INT DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  -- Season / collection system
  season_id UUID REFERENCES seasons(id),
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GAME SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INT NOT NULL DEFAULT 0,
  grade TEXT NOT NULL DEFAULT 'F',
  level INT NOT NULL DEFAULT 1,
  details JSONB, -- Full session data (sort/wash/dry/fold/iron stats)
  duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_sessions_score ON game_sessions(score DESC);
CREATE INDEX idx_sessions_created ON game_sessions(created_at DESC);

-- ============================================================
-- LEADERBOARD (materialized for fast reads)
-- ============================================================
CREATE TABLE IF NOT EXISTS leaderboard (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  weekly_score BIGINT DEFAULT 0,
  all_time_score BIGINT DEFAULT 0,
  best_grade TEXT DEFAULT 'F',
  games_played INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_weekly ON leaderboard(weekly_score DESC);
CREATE INDEX idx_leaderboard_alltime ON leaderboard(all_time_score DESC);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Emoji
  condition_type TEXT NOT NULL, -- 'score', 'games', 'combo', 'streak', etc.
  condition_value INT NOT NULL,
  xp_reward INT DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================================
-- DAILY CHALLENGE (Lessive du Jour)
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date_key TEXT NOT NULL, -- 'YYYY-MM-DD'
  score INT NOT NULL DEFAULT 0,
  grade TEXT NOT NULL DEFAULT 'F',
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_date ON daily_attempts(date_key);
CREATE INDEX idx_daily_user_date ON daily_attempts(user_id, date_key);
CREATE INDEX idx_daily_score ON daily_attempts(date_key, score DESC);

-- Limit: max 3 attempts per user per day (enforced via trigger)
CREATE OR REPLACE FUNCTION check_daily_attempts()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM daily_attempts WHERE user_id = NEW.user_id AND date_key = NEW.date_key) >= 3 THEN
    RAISE EXCEPTION 'Maximum 3 attempts per day reached';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER enforce_daily_limit
  BEFORE INSERT ON daily_attempts
  FOR EACH ROW
  EXECUTE FUNCTION check_daily_attempts();

-- ============================================================
-- COSMETIC SHOP (freemium)
-- ============================================================
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('machine_skin', 'detergent_skin', 'background', 'effect')),
  price_coins INT NOT NULL DEFAULT 100,
  image_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  season_id UUID REFERENCES seasons(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES shop_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

-- Public read for clothes, achievements, seasons, shop, leaderboard
CREATE POLICY "Public read clothes" ON clothes FOR SELECT USING (true);
CREATE POLICY "Public read achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Public read seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "Public read shop" ON shop_items FOR SELECT USING (true);
CREATE POLICY "Public read leaderboard" ON leaderboard FOR SELECT USING (true);

-- Users can read/update their own profile
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Users can insert/read their own sessions
CREATE POLICY "Users insert sessions" ON game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own sessions" ON game_sessions FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own achievements/purchases
CREATE POLICY "Users read own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own purchases" ON user_purchases FOR SELECT USING (auth.uid() = user_id);

-- Daily attempts: users can insert their own + public read (for leaderboard)
CREATE POLICY "Users insert daily" ON daily_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own daily" ON daily_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public read daily scores" ON daily_attempts FOR SELECT USING (true);

-- ============================================================
-- SEED DATA: Initial clothes (with multi-category support)
-- ============================================================
INSERT INTO clothes (emoji, name, category, fabric, max_temp, tip, accepted_cats, difficulty) VALUES
  ('👕', 'T-shirt blanc', 'blanc', 'coton', 60, 'Le coton blanc supporte les hautes températures !', '[]', 1),
  ('👔', 'Chemise blanche', 'blanc', 'coton', 40, 'Une chemise se lave à 40°C max.', '[]', 1),
  ('🧦', 'Chaussettes blanches', 'blanc', 'coton', 60, 'Lave-les à l''envers pour préserver l''élastique.', '[]', 1),
  ('👕', 'T-shirt rouge', 'couleur', 'coton', 40, 'Les vêtements rouges déteignent facilement !', '[]', 1),
  ('👗', 'Robe bleue', 'couleur', 'polyester', 40, 'Le polyester sèche vite et se froisse peu.', '[]', 1),
  ('🧣', 'Écharpe verte', 'couleur', 'acrylique', 30, 'L''acrylique se lave à froid.', '[]', 2),
  ('👖', 'Jean foncé', 'sombre', 'denim', 30, 'Le denim se lave à froid, à l''envers.', '[]', 1),
  ('🧥', 'Manteau noir', 'sombre', 'polyester', 30, 'Les manteaux se lavent rarement en machine.', '[]', 2),
  ('👕', 'T-shirt noir', 'sombre', 'coton', 40, 'Lave les noirs à l''envers.', '[]', 1),
  ('👙', 'Maillot de bain', 'delicat', 'élasthanne', 30, 'L''élasthanne se détériore à haute température.', '[]', 2),
  ('🧶', 'Pull en laine', 'delicat', 'laine', 30, 'La laine rétrécit à chaud !', '[]', 2),
  ('👗', 'Robe en soie', 'delicat', 'soie', 30, 'La soie est très fragile. Lavage à la main recommandé.', '[]', 3),
  -- Multi-category items
  ('👕', 'T-shirt gris clair', 'blanc', 'coton', 40, 'Le gris clair se lave avec les blancs.', '[{"id": "sombre", "score": 0.5, "reason": "Acceptable avec les sombres, mais idéalement avec les blancs !"}]', 3),
  ('🧶', 'Pull en laine coloré', 'delicat', 'laine', 30, 'Même coloré, la laine reste fragile.', '[{"id": "couleur", "score": 0.4, "reason": "C''est coloré oui, mais c''est de la LAINE ! Programme délicat obligatoire."}]', 4),
  ('⚽', 'Maillot de foot', 'couleur', 'polyester', 30, 'Les maillots sport se lavent à froid.', '[{"id": "delicat", "score": 0.6, "reason": "Le synthétique est sensible à la chaleur, donc délicat est un bon choix !"}]', 3),
  ('🤵', 'Veston de costume', 'sombre', 'laine mélangée', 30, 'Un costume ne se lave quasiment jamais en machine.', '[{"id": "delicat", "score": 0.7, "reason": "Excellent réflexe ! Les costumes sont des pièces délicates."}]', 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Achievements
-- ============================================================
INSERT INTO achievements (name, description, icon, condition_type, condition_value, xp_reward) VALUES
  ('Première Lessive', 'Termine ta première partie', '🎮', 'games', 1, 50),
  ('Trieur Pro', 'Trie 50 vêtements correctement', '🧦', 'sort_correct', 50, 100),
  ('Combo Master', 'Atteins un combo x8', '⚡', 'max_combo', 8, 150),
  ('Score S+', 'Obtiens la note S+', '🏆', 'grade_s', 1, 300),
  ('Marathon', 'Joue 10 parties', '🏃', 'games', 10, 100),
  ('Détacheur', 'Élimine 100 taches', '💥', 'stains', 100, 200),
  ('Souffleur', 'Souffle 200 fois', '💨', 'blows', 200, 100),
  ('Sans Faute', 'Termine une partie sans erreur de tri', '✨', 'perfect_sort', 1, 500),
  ('Nuanceur', 'Trie correctement 10 vêtements multi-catégories', '🎨', 'multi_cat_correct', 10, 200),
  ('Niveau 5', 'Atteins le niveau 5', '🏅', 'level', 5, 300)
ON CONFLICT DO NOTHING;
