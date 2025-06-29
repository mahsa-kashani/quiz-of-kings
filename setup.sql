-- Drop safety
DROP TABLE IF EXISTS round_answers, rounds, games, messages, leaderboard, user_statistics, options, questions, categories, users,question_option CASCADE;

-- ======================
-- Main Tables
-- ======================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL CHECK (char_length(username) >= 3),
  email VARCHAR(100) UNIQUE NOT NULL CHECK (position('@' IN email) > 1),
  pass VARCHAR(100) NOT NULL CHECK (char_length(pass) >= 6),
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
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending'
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
  game_status TEXT CHECK (game_status IN ('active', 'completed')) NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rounds (
  id SERIAL PRIMARY KEY,
  game_id INT REFERENCES games(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  question_id INT REFERENCES questions(id) 
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
  all_time_score INT DEFAULT 0
);


-- Optional bonus table for chat system
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id) ON DELETE SET NULL,
  receiver_id INT REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
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
  u.id AS user_id,
  COALESCE(gs.game_score, 0) + COALESCE(ascore.answer_score, 0) AS weekly_score
FROM users u
LEFT JOIN game_scores gs ON u.id = gs.user_id
LEFT JOIN answer_scores ascore ON u.id = ascore.user_id
ORDER BY weekly_score DESC;


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
  u.id AS user_id,
  COALESCE(gs.game_score) + COALESCE(ascore.answer_score, 0) AS monthly_score
FROM users u
LEFT JOIN game_scores gs ON u.id = gs.user_id
LEFT JOIN answer_scores ascore ON u.id = ascore.user_id
ORDER BY monthly_score DESC;


CREATE OR REPLACE VIEW match_history AS
SELECT g.id AS game_id, g.started_at, g.ended_at,
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

CREATE OR REPLACE FUNCTION update_score_with_accuracy_and_time()
RETURNS TRIGGER AS $$
DECLARE
  correct_option INT;
  is_correct BOOLEAN;
  base_score INT := 0;
  curr_correct INT;
  new_correct INT;
  new_total INT;
  new_accuracy NUMERIC(5,2);
BEGIN
  -- checking correctenss of answer
  SELECT q.correct_option_id INTO correct_option
  FROM rounds r
  JOIN questions q ON r.question_id = q.id
  WHERE r.id = NEW.round_id;

  is_correct := (NEW.selected_option_id = correct_option);

  --get current values from table
  SELECT correct_answers, total_answers
  INTO curr_correct, new_total
  FROM user_statistics
  WHERE user_id = NEW.player_id;

  --update values
  new_total := new_total + 1;
  IF is_correct THEN
    base_score := base_score + 10;
    new_correct := curr_correct + 1;
  ELSE
    base_score := base_score - 5;
    new_correct := curr_correct;
  END IF;

   -- quickness score
  IF is_correct THEN
    IF NEW.time_taken <= INTERVAL '5 seconds' THEN
      base_score := base_score + 10;
    ELSIF NEW.time_taken <= INTERVAL '15 seconds' THEN
      base_score := base_score + 5;
    END IF;
  END IF;


  new_accuracy := LEAST(ROUND((new_correct::NUMERIC / new_total) * 100.0, 2), 100);


  -- updating all
  UPDATE user_statistics
  SET
    correct_answers = new_correct,
    total_answers = new_total,
    average_accuracy = new_accuracy
  WHERE user_id = NEW.player_id;

  -- incrementing total score
  UPDATE leaderboard
  SET all_time_score = all_time_score + base_score
  WHERE user_id = NEW.player_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_score_with_accuracy_and_time ON round_answers;

CREATE TRIGGER trg_update_score_with_accuracy_and_time
AFTER INSERT ON round_answers
FOR EACH ROW
EXECUTE FUNCTION update_score_with_accuracy_and_time();



CREATE OR REPLACE FUNCTION update_win_loss_scores()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.game_status = 'completed' THEN
    -- games played
    UPDATE user_statistics
    SET games_played = games_played + 1
    WHERE user_id IN (NEW.player1_id, NEW.player2_id);

    -- score for winner
    IF NEW.winner_id IS NOT NULL THEN
      UPDATE user_statistics
      SET games_won = games_won + 1, xp = xp + 50
      WHERE user_id = NEW.winner_id;

      UPDATE leaderboard
      SET all_time_score = all_time_score + 100
      WHERE user_id = NEW.winner_id;
    END IF;
    -- score for tie
    IF NEW.winner_id IS NULL THEN
      UPDATE user_statistics
      SET games_tied = games_tied + 1, xp = xp + 30
      WHERE user_id IN (NEW.player1_id, NEW.player2_id);

      UPDATE leaderboard
      SET all_time_score = all_time_score + 50
      WHERE user_id IN (NEW.player1_id, NEW.player2_id);
    END IF;

    -- score for loser
    IF NEW.player1_id IS NOT NULL AND NEW.winner_id IS DISTINCT FROM NEW.player1_id THEN
      UPDATE user_statistics SET xp = xp + 10 WHERE user_id = NEW.player1_id;
      UPDATE leaderboard SET all_time_score = all_time_score + 20 WHERE user_id = NEW.player1_id;
    END IF;

    IF NEW.player2_id IS NOT NULL AND NEW.winner_id IS DISTINCT FROM NEW.player2_id THEN
      UPDATE user_statistics SET xp = xp + 10 WHERE user_id = NEW.player2_id;
      UPDATE leaderboard SET all_time_score = all_time_score + 20 WHERE user_id = NEW.player2_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_win_loss_scores ON games;

CREATE TRIGGER trg_update_win_loss_scores
AFTER UPDATE OF game_status ON games
FOR EACH ROW
EXECUTE FUNCTION update_win_loss_scores();




CREATE OR REPLACE FUNCTION insert_initial_leaderboard_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO leaderboard (user_id)
  VALUES (NEW.id);
  INSERT INTO user_statistics(user_id)
  VALUES (NEW.id);
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
  ('admin1', 'admin@example.com', 'adminpass', 'admin');

INSERT INTO categories (category_name) VALUES
  ('Science'),
  ('History'),
  ('Sports');

INSERT INTO options (option_text) VALUES
  ('Einstein'),
  ('Newton'),
  ('Tesla'),
  ('Edison'),
  ('1945'),
  ('1939'),
  ('1918'),
  ('1965');

INSERT INTO questions (question_text, difficulty, correct_option_id, category_id, author_id) VALUES
  ('Who developed the theory of relativity?', 'medium', 1, 1, 1),
  ('When did World War II end?', 'medium', 5, 2, 2);

INSERT INTO question_option (question_id, option_id) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4),
  (2, 5), (2, 6), (2, 7), (2, 8);

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