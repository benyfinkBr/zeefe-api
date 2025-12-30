-- Workshop enrollments: store client and Stripe payment details
ALTER TABLE workshop_enrollments
  ADD COLUMN client_id BIGINT NULL DEFAULT NULL AFTER participant_id,
  ADD COLUMN amount_due DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER discount_amount,
  ADD COLUMN stripe_customer_id VARCHAR(80) NULL DEFAULT NULL AFTER amount_due,
  ADD COLUMN stripe_payment_method_id VARCHAR(80) NULL DEFAULT NULL AFTER stripe_customer_id,
  ADD COLUMN stripe_payment_intent_id VARCHAR(80) NULL DEFAULT NULL AFTER stripe_payment_method_id,
  ADD COLUMN stripe_charge_id VARCHAR(80) NULL DEFAULT NULL AFTER stripe_payment_intent_id,
  ADD COLUMN paid_at DATETIME NULL AFTER stripe_charge_id,
  ADD COLUMN payment_failure_message VARCHAR(255) NULL AFTER paid_at;

CREATE INDEX idx_workshop_enrollment_client ON workshop_enrollments (client_id);

-- Feedback de workshops (evento + plataforma)
CREATE TABLE IF NOT EXISTS workshop_feedback (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  workshop_id INT(11) NOT NULL,
  participant_id INT(11) NOT NULL,
  participant_name VARCHAR(160) NOT NULL,
  rating_event TINYINT NOT NULL,
  rating_platform TINYINT NOT NULL,
  comments_event TEXT NULL,
  comments_platform TEXT NULL,
  is_public TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_feedback_workshop (workshop_id),
  KEY idx_feedback_participant (participant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
