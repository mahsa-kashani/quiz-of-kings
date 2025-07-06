-- Drop safety
DROP TABLE IF EXISTS round_answers, rounds, games, messages, leaderboard, user_statistics, options, questions, categories, users,question_option CASCADE;

-- ======================
-- Main Tables
-- ======================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL CHECK (char_length(username) >= 3),
  email VARCHAR(100) UNIQUE NOT NULL CHECK (position('@' IN email) > 1),
  pass TEXT NOT NULL,
  user_role TEXT CHECK (user_role IN ('player', 'admin', 'reviewer', 'moderator')) DEFAULT 'player',
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS options (
  id SERIAL PRIMARY KEY,
  option_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  correct_option_id INT REFERENCES options(id),  
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  author_id INT REFERENCES users(id) ON DELETE CASCADE,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  rejection_reason TEXT 
);

CREATE TABLE IF NOT EXISTS question_option (
  question_id INT REFERENCES questions(id) ON DELETE CASCADE,
  option_id INT REFERENCES options(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  player1_id INT REFERENCES users(id) ON DELETE SET NULL,
  player2_id INT REFERENCES users(id) ON DELETE SET NULL,
  winner_id INT REFERENCES users(id) ON DELETE SET NULL,
  game_status TEXT CHECK (game_status IN ('active', 'completed','waiting')) DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rounds (
  id SERIAL PRIMARY KEY,
  game_id INT REFERENCES games(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  question_id INT REFERENCES questions(id),
  current_turn INT REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS round_answers (
  round_id INT REFERENCES rounds(id) ON DELETE CASCADE,
  player_id INT REFERENCES users(id) ON DELETE CASCADE,
  selected_option_id INT REFERENCES options(id),
  time_taken INTERVAL,
  PRIMARY KEY (round_id, player_id)
);

CREATE TABLE IF NOT EXISTS user_statistics (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  games_played INT DEFAULT 0,
  games_won INT DEFAULT 0,
  games_tied INT DEFAULT 0,
  average_accuracy NUMERIC(5,2) DEFAULT 0.0,
  xp INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  total_answers INT DEFAULT 0
);


CREATE TABLE IF NOT EXISTS leaderboard (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  score INT DEFAULT 0
);


-- Optional bonus table for chat system
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  game_id INT REFERENCES games(id) ON DELETE CASCADE,
  sender_id INT REFERENCES users(id) ON DELETE SET NULL,
  receiver_id INT REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  reply_to_id INT REFERENCES messages(id) ON DELETE SET NULL
);



-- ======================
-- Views
-- ======================

CREATE OR REPLACE VIEW leaderboard_weekly AS
WITH game_scores AS (
  SELECT 
    u.id AS user_id,
    SUM(
      CASE
        WHEN g.id IS NOT NULL AND g.winner_id = u.id THEN 100
        WHEN g.id IS NOT NULL THEN 20
        ELSE 0
      END
      ) AS game_score
  FROM users u
  LEFT JOIN games g ON (g.player1_id = u.id OR g.player2_id = u.id)
    AND g.game_status = 'completed'
    AND date_trunc('week', g.ended_at) = date_trunc('week', CURRENT_DATE)
  GROUP BY u.id
),
answer_scores AS (
  SELECT 
    u.id AS user_id,
    SUM(
      CASE
        WHEN g.id IS NULL THEN 0
        WHEN ra.selected_option_id IS NULL THEN 0
        WHEN ra.selected_option_id = q.correct_option_id THEN
          10 +  -- correct answer score
          CASE
            WHEN ra.time_taken <= INTERVAL '5 seconds' THEN 10
            WHEN ra.time_taken <= INTERVAL '15 seconds' THEN 5
            ELSE 0
          END
        ELSE -5  -- wrong answer score
      END
    ) AS answer_score
  FROM users u
  LEFT JOIN round_answers ra ON ra.player_id = u.id
  LEFT JOIN rounds r ON r.id = ra.round_id
  LEFT JOIN games g ON g.id = r.game_id
    AND g.game_status = 'completed'
    AND date_trunc('week', g.ended_at) = date_trunc('week', CURRENT_DATE)
  LEFT JOIN questions q ON q.id = r.question_id
  GROUP BY u.id
)

SELECT 
  u.id AS user_id, u.username AS username,
  COALESCE(gs.game_score, 0) + COALESCE(ascore.answer_score, 0) AS score
FROM users u
LEFT JOIN game_scores gs ON u.id = gs.user_id
LEFT JOIN answer_scores ascore ON u.id = ascore.user_id
WHERE u.user_role = 'player'
ORDER BY score DESC;


CREATE OR REPLACE VIEW leaderboard_monthly AS
WITH game_scores AS (
  SELECT 
    u.id AS user_id,
    SUM(
      CASE
        WHEN g.id IS NOT NULL AND g.winner_id = u.id THEN 100
        WHEN g.id IS NOT NULL THEN 20
        ELSE 0
      END
      ) AS game_score
  FROM users u
  LEFT JOIN games g ON (g.player1_id = u.id OR g.player2_id = u.id)
    AND g.game_status = 'completed'
    AND date_trunc('month', g.ended_at) = date_trunc('month', CURRENT_DATE)
  GROUP BY u.id
),
answer_scores AS (
  SELECT 
    u.id AS user_id,
    SUM(
      CASE
        WHEN g.id IS NULL THEN 0
        WHEN ra.selected_option_id IS NULL THEN 0
        WHEN ra.selected_option_id = q.correct_option_id THEN
          10 +  -- correct answer score
          CASE
            WHEN ra.time_taken <= INTERVAL '5 seconds' THEN 10
            WHEN ra.time_taken <= INTERVAL '15 seconds' THEN 5
            ELSE 0
          END
        ELSE -5  -- wrong answer score
      END
    ) AS answer_score
  FROM users u
  LEFT JOIN round_answers ra ON ra.player_id = u.id
  LEFT JOIN rounds r ON r.id = ra.round_id
  LEFT JOIN games g ON g.id = r.game_id
    AND g.game_status = 'completed'
    AND date_trunc('month', g.ended_at) = date_trunc('month', CURRENT_DATE)
  LEFT JOIN questions q ON q.id = r.question_id
  GROUP BY u.id
)

SELECT 
  u.id AS user_id, u.username AS username,
  COALESCE(gs.game_score) + COALESCE(ascore.answer_score, 0) AS score
FROM users u
LEFT JOIN game_scores gs ON u.id = gs.user_id
LEFT JOIN answer_scores ascore ON u.id = ascore.user_id
WHERE u.user_role = 'player'
ORDER BY score DESC;


CREATE OR REPLACE VIEW match_history AS
SELECT g.id AS game_id, g.created_at, g.ended_at,
       u1.username AS player1, u2.username AS player2,
       u3.username AS winner
FROM games g
JOIN users u1 ON g.player1_id = u1.id
JOIN users u2 ON g.player2_id = u2.id
LEFT JOIN users u3 ON g.winner_id = u3.id;


CREATE OR REPLACE VIEW top_10_by_win_rate AS
SELECT 
  u.id AS user_id,
  u.username,
  us.games_played,
  us.games_won,
  ROUND(
    CASE 
      WHEN us.games_played > 0 THEN (us.games_won::NUMERIC / us.games_played) * 100
      ELSE 0
    END, 
    2
  ) AS win_rate
FROM users u
JOIN user_statistics us ON u.id = us.user_id
ORDER BY win_rate DESC
LIMIT 10;


CREATE OR REPLACE VIEW most_played_categories AS
SELECT 
  c.id AS category_id,
  c.category_name,
  COUNT(*) AS times_played
FROM rounds r
JOIN questions q ON r.question_id = q.id
JOIN categories c ON q.category_id = c.id
GROUP BY c.id, c.category_name
ORDER BY times_played DESC;


CREATE OR REPLACE VIEW win_loss_ratio AS
SELECT 
  u.id AS user_id,
  u.username,
  us.games_played,
  us.games_won,
  us.games_tied,
  (us.games_played - us.games_won - us.games_tied) AS games_lost,
  ROUND(
    CASE 
      WHEN (us.games_played - us.games_won - us.games_tied) > 0 
        THEN (us.games_won::NUMERIC / (us.games_played - us.games_won - us.games_tied))
      ELSE us.games_won
    END, 
    2
  ) AS win_loss_ratio
FROM users u
JOIN user_statistics us ON u.id = us.user_id
ORDER BY win_loss_ratio DESC;


-- ======================
-- TRIGGERS
-- ======================

CREATE OR REPLACE FUNCTION update_scores_xp()
RETURNS TRIGGER AS $$
DECLARE
  r RECORD;
  correct_option INT;
  is_correct BOOLEAN;
  base_score INT;
  curr_correct INT;
  new_correct INT;
  new_total INT;
  new_accuracy NUMERIC(5,2);
BEGIN
  IF NEW.game_status = 'completed' THEN
    -- games played
    UPDATE user_statistics
    SET games_played = games_played + 1
    WHERE user_id IN (NEW.player1_id, NEW.player2_id);

    -- calculate scores per round answer
    FOR r IN
      SELECT ra.*, q.correct_option_id, r2.question_id
      FROM round_answers ra
      JOIN rounds r2 ON ra.round_id = r2.id
      JOIN questions q ON q.id = r2.question_id
      WHERE r2.game_id = NEW.id
    LOOP
      -- check correctness
      is_correct := (r.selected_option_id = r.correct_option_id);
      base_score := 0;

      -- get current values
      SELECT correct_answers, total_answers
      INTO curr_correct, new_total
      FROM user_statistics
      WHERE user_id = r.player_id;

      -- correctness scores
      new_total := new_total + 1;
      IF is_correct THEN
        base_score := base_score + 10;
        new_correct := curr_correct + 1;
      ELSE
        base_score := base_score - 5;
        new_correct := curr_correct;
      END IF;

      -- quickness scores
      IF is_correct THEN
        IF r.time_taken <= INTERVAL '5 seconds' THEN
          base_score := base_score + 10;
        ELSIF r.time_taken <= INTERVAL '15 seconds' THEN
          base_score := base_score + 5;
        END IF;
      END IF;

      new_accuracy := LEAST(ROUND((new_correct::NUMERIC / new_total) * 100.0, 2), 100);

      -- update statistics and leaderboard
      UPDATE user_statistics
      SET correct_answers = new_correct,
          total_answers = new_total,
          average_accuracy = new_accuracy
      WHERE user_id = r.player_id;

      UPDATE leaderboard
      SET score = score + base_score
      WHERE user_id = r.player_id;
    END LOOP;

    -- score for winner
    IF NEW.winner_id IS NOT NULL THEN
      UPDATE user_statistics
      SET games_won = games_won + 1, xp = xp + 50
      WHERE user_id = NEW.winner_id;

      UPDATE leaderboard
      SET score = score + 100
      WHERE user_id = NEW.winner_id;
    ELSE
      -- score for tie (winner_id is null)
      UPDATE user_statistics
      SET games_tied = games_tied + 1, xp = xp + 30
      WHERE user_id IN (NEW.player1_id, NEW.player2_id);

      UPDATE leaderboard
      SET score = score + 50
      WHERE user_id IN (NEW.player1_id, NEW.player2_id);
    END IF;

    -- loser XP bonus + leaderboard score update
    IF NEW.player1_id IS DISTINCT FROM NEW.winner_id AND NEW.winner_id IS NOT NULL THEN
      UPDATE user_statistics SET xp = xp + 10 WHERE user_id = NEW.player1_id;
      UPDATE leaderboard SET score = score + 20 WHERE user_id = NEW.player1_id;
    END IF;

    IF NEW.player2_id IS DISTINCT FROM NEW.winner_id AND NEW.winner_id IS NOT NULL THEN
      UPDATE user_statistics SET xp = xp + 10 WHERE user_id = NEW.player2_id;
      UPDATE leaderboard SET score = score + 20 WHERE user_id = NEW.player2_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trg_update_scores_xp ON games;

CREATE TRIGGER trg_update_scores_xp
AFTER UPDATE OF game_status ON games
FOR EACH ROW
EXECUTE FUNCTION update_scores_xp();



CREATE OR REPLACE FUNCTION insert_initial_leaderboard_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_role = 'player' THEN
    INSERT INTO leaderboard (user_id)
    VALUES (NEW.id);
    INSERT INTO user_statistics(user_id)
    VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_init_leaderboard_stats_on_user ON users;

CREATE TRIGGER trg_init_leaderboard_stats_on_user
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION insert_initial_leaderboard_stats();


-- ======================
-- Sample Data
-- ======================

INSERT INTO users (username, email, pass, user_role) VALUES
  ('ali123', 'ali@example.com', 'securepass1', 'player'),
  ('sara456', 'sara@example.com', 'securepass2', 'player'),
  ('admin1', 'admin@example.com', '$2a$10$IAaMMZIPdD.GGgNnXyVLFuiLAWgjRd7d.kAL6U6uMZ2R.ZB9vttmq', 'admin'),
  ('reviewer','rev@gmail.com','$2a$10$uFzVhmcNrF4TK8.rJjGXJ.XOiwgA68eiEk7ohdNksd9V8O5a1CrgO','reviewer'),
  ('moderator','mod@gmail.com','$2a$10$LGNixej9Q7w0PrCnln7O4.2zuCVazsASZM90Y.IUhskLiFbdH94G6','moderator'),
  ('mahsa', 'mahsa12.kashani@gmail.com', '$2b$10$cxJLILUav/1tvxOD8WnyhOPAydJ6Swx6PupxCYbKb2pOouQRrmu.e', 'player'),
  ('ali', 'ali123@gmail.com', '$2b$10$Fu0P0Gbk63jdKUgXbWHDi.mMFuCp4CzB3Si7DNv4DHSkId5ayX5Nq', 'player');

INSERT INTO categories (category_name) VALUES
  ('Science'),
  ('History'),
  ('Sports'),
  ('Technology'),
  ('Literature'),
  ('Geography'),
  ('Mathematics');

INSERT INTO options (option_text) VALUES
  ('Einstein'),
  ('Newton'),
  ('Tesla'),
  ('Edison'),
  ('1945'),
  ('1939'),
  ('1918'),
  ('1965'),
    ('Alan Turing'),       -- id = 9
  ('Bill Gates'),        -- id = 10
  ('Steve Jobs'),        -- id = 11
  ('Tim Berners-Lee'),   -- id = 12

  ('Shakespeare'),       -- id = 13
  ('Hemingway'),         -- id = 14
  ('Tolstoy'),           -- id = 15
  ('Dante'),             -- id = 16

  ('Mount Everest'),     -- id = 17
  ('K2'),                -- id = 18
  ('Kilimanjaro'),       -- id = 19
  ('Alps'),              -- id = 20

  ('Pi'),                -- id = 21
  ('Euler''s Number'),     -- id = 22
  ('Golden Ratio'),      -- id = 23
  ('Imaginary Unit');  

INSERT INTO questions (question_text, difficulty, correct_option_id, category_id, author_id, approval_status) VALUES
  ('Who developed the theory of relativity?', 'medium', 1, 1, 1,'approved'),
  ('When did World War II end?', 'medium', 5, 2, 2,'approved'),
  ('Who is considered the father of modern computing?', 'hard', 9, 4, 1, 'approved'),
  ('Who wrote the tragedy "Hamlet"?', 'easy', 13, 5, 2, 'approved'),
  ('What is the tallest mountain in the world?', 'easy', 17, 6, 1, 'approved'),
  ('Which constant is approximately 3.14159?', 'medium', 21, 7, 2, 'approved');

INSERT INTO question_option (question_id, option_id) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4),
  (2, 5), (2, 6), (2, 7), (2, 8),
  (3, 9), (3, 10), (3, 11), (3, 12),
  (4, 13), (4, 14), (4, 15), (4, 16),
  (5, 17), (5, 18), (5, 19), (5, 20),
  (6, 21), (6, 22), (6, 23), (6, 24);

INSERT INTO games (player1_id, player2_id, winner_id, game_status, ended_at) VALUES
  (1, 2, 1, 'active', CURRENT_DATE - INTERVAL '2 days'),
  (2, 1, null, 'active', CURRENT_DATE - INTERVAL '10 days');

INSERT INTO rounds (game_id, round_number, question_id) VALUES
  (1, 1, 1),
  (1, 2, 2),
  (2, 1, 1);

INSERT INTO round_answers (round_id, player_id, selected_option_id, time_taken) VALUES
  (1, 1, 1, INTERVAL '4 seconds'),
  (1, 2, 2, INTERVAL '7 seconds'),
  (2, 1, 5, INTERVAL '6 seconds'),
  (2, 2, 6, INTERVAL '12 seconds'),
  (3, 1, 2, INTERVAL '8 seconds');


INSERT INTO messages (sender_id, receiver_id, content) VALUES
  (1, 2, 'Hey, good game!'),
  (2, 1, 'Thanks! You too!');



-- ======================
-- Indexes
-- ======================

CREATE INDEX IF NOT EXISTS idx_games_status ON games(game_status);
CREATE INDEX IF NOT EXISTS idx_games_ended_at_week ON games(ended_at) WHERE game_status = 'completed';
CREATE INDEX IF NOT EXISTS idx_games_winner_id ON games(winner_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_rounds_game_id ON rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_rounds_question_id ON rounds(question_id);
CREATE INDEX IF NOT EXISTS idx_round_answers_time_taken ON round_answers(time_taken);
CREATE INDEX IF NOT EXISTS idx_round_answers_player_id ON round_answers(player_id);
CREATE INDEX IF NOT EXISTS idx_questions_correct_option ON questions(correct_option_id);