-- Políticas de pagamento/cancelamento por sala
CREATE TABLE IF NOT EXISTS room_policies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT NOT NULL,
  option_key VARCHAR(40) NOT NULL,
  label VARCHAR(120) NOT NULL,
  cancel_days INT NULL,
  cancel_fee_pct DECIMAL(5,2) NULL,
  charge_timing ENUM('confirm','cancel_window','day_before') NOT NULL DEFAULT 'confirm',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_room_policies_room (room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS room_policy_prices (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  policy_id BIGINT NOT NULL,
  date DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_policy_date (policy_id, date),
  INDEX idx_policy_prices_policy (policy_id),
  CONSTRAINT fk_policy_prices_policy FOREIGN KEY (policy_id) REFERENCES room_policies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tracking de visualizações de salas
CREATE TABLE IF NOT EXISTS room_views (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT NOT NULL,
  session_id VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  ip VARCHAR(45) NULL,
  viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_room_views_room (room_id),
  INDEX idx_room_views_date (viewed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Campos na reserva para política escolhida
ALTER TABLE reservations ADD COLUMN policy_id BIGINT NULL;
ALTER TABLE reservations ADD COLUMN policy_key VARCHAR(40) NULL;
ALTER TABLE reservations ADD COLUMN policy_label VARCHAR(120) NULL;
ALTER TABLE reservations ADD COLUMN policy_cancel_days INT NULL;
ALTER TABLE reservations ADD COLUMN policy_cancel_fee_pct DECIMAL(5,2) NULL;
ALTER TABLE reservations ADD COLUMN policy_charge_timing VARCHAR(20) NULL;
ALTER TABLE reservations ADD COLUMN policy_charge_at DATETIME NULL;
ALTER TABLE reservations ADD COLUMN stripe_payment_method_id VARCHAR(80) NULL;
