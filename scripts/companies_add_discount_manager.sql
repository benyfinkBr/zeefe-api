-- Add discount percent and account manager columns to companies
ALTER TABLE companies
  ADD COLUMN discount_pct DECIMAL(5,2) NULL DEFAULT NULL AFTER inscricao_estadual,
  ADD COLUMN account_manager_id BIGINT NULL DEFAULT NULL AFTER discount_pct;
