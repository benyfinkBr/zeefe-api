ALTER TABLE survey_questions
  ADD COLUMN IF NOT EXISTS default_next_question_id INT NULL AFTER order_index,
  ADD COLUMN IF NOT EXISTS end_if_no_branch TINYINT(1) DEFAULT 0 AFTER default_next_question_id,
  ADD COLUMN IF NOT EXISTS flow_x INT NULL AFTER number_max,
  ADD COLUMN IF NOT EXISTS flow_y INT NULL AFTER flow_x;

ALTER TABLE survey_branch_rules
  MODIFY COLUMN target_question_id INT NULL,
  ADD COLUMN IF NOT EXISTS end_survey TINYINT(1) DEFAULT 0 AFTER target_question_id;
