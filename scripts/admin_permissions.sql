-- Perfis administrativos + permissões + remember token
CREATE TABLE IF NOT EXISTS admin_profiles (
  id INT(11) NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  permissions_json TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ativo',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_admin_profiles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE admins
  ADD COLUMN name VARCHAR(120) NULL DEFAULT NULL AFTER email,
  ADD COLUMN password_hash VARCHAR(255) NULL DEFAULT NULL AFTER password,
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ativo' AFTER password_hash,
  ADD COLUMN profile_id INT(11) NULL DEFAULT NULL AFTER status,
  ADD COLUMN is_master TINYINT(1) NOT NULL DEFAULT 0 AFTER profile_id,
  ADD COLUMN updated_at DATETIME NULL DEFAULT NULL AFTER created_at;

CREATE INDEX idx_admins_profile_id ON admins (profile_id);

-- Defina o admin master existente
UPDATE admins SET is_master = 1 WHERE id = 1;

CREATE TABLE IF NOT EXISTS admin_remember_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id INT(11) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  user_agent VARCHAR(255) NULL DEFAULT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_admin_remember_token (token_hash),
  KEY idx_admin_remember_admin (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
