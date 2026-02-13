-- Compatível com MySQL/MariaDB sem "ADD COLUMN IF NOT EXISTS"
-- Execute este arquivo inteiro no phpMyAdmin.

SET @db := DATABASE();

-- survey_questions.default_next_question_id
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'survey_questions' AND COLUMN_NAME = 'default_next_question_id'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE survey_questions ADD COLUMN default_next_question_id INT NULL AFTER order_index',
  'SELECT "skip default_next_question_id"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- surveys.closing_page_type
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'surveys' AND COLUMN_NAME = 'closing_page_type'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE surveys ADD COLUMN closing_page_type VARCHAR(32) DEFAULT ''simple'' AFTER thank_you_message',
  'SELECT "skip closing_page_type"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- surveys.lead_origin
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'surveys' AND COLUMN_NAME = 'lead_origin'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE surveys ADD COLUMN lead_origin VARCHAR(255) NULL AFTER closing_page_type',
  'SELECT "skip lead_origin"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- tabela de leads de questionário
CREATE TABLE IF NOT EXISTS survey_leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_survey_lead (survey_id, email)
);

-- tabela auxiliar de ramificação estável por ordem da opção
CREATE TABLE IF NOT EXISTS survey_branch_paths (
  id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id INT NOT NULL,
  question_id INT NOT NULL,
  option_order INT NOT NULL,
  option_label VARCHAR(255) NULL,
  target_question_id INT NULL,
  end_survey TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_survey_branch_path (survey_id, question_id, option_order)
);

-- survey_questions.end_if_no_branch
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'survey_questions' AND COLUMN_NAME = 'end_if_no_branch'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE survey_questions ADD COLUMN end_if_no_branch TINYINT(1) DEFAULT 0 AFTER default_next_question_id',
  'SELECT "skip end_if_no_branch"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- survey_questions.flow_x
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'survey_questions' AND COLUMN_NAME = 'flow_x'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE survey_questions ADD COLUMN flow_x INT NULL AFTER number_max',
  'SELECT "skip flow_x"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- survey_questions.flow_y
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'survey_questions' AND COLUMN_NAME = 'flow_y'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE survey_questions ADD COLUMN flow_y INT NULL AFTER flow_x',
  'SELECT "skip flow_y"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- survey_branch_rules.target_question_id nullable
ALTER TABLE survey_branch_rules MODIFY COLUMN target_question_id INT NULL;

-- survey_branch_rules.option_order
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'survey_branch_rules' AND COLUMN_NAME = 'option_order'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE survey_branch_rules ADD COLUMN option_order INT NULL AFTER option_id',
  'SELECT "skip option_order"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- survey_branch_rules.option_label
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'survey_branch_rules' AND COLUMN_NAME = 'option_label'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE survey_branch_rules ADD COLUMN option_label VARCHAR(255) NULL AFTER option_order',
  'SELECT "skip option_label"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- survey_branch_rules.end_survey
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'survey_branch_rules' AND COLUMN_NAME = 'end_survey'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE survey_branch_rules ADD COLUMN end_survey TINYINT(1) DEFAULT 0 AFTER target_question_id',
  'SELECT "skip end_survey"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
