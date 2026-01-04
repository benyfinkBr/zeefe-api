-- Categorias de postagens + vínculo com posts
CREATE TABLE IF NOT EXISTS post_categories (
  id INT(11) NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ativo',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_post_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE posts
  ADD COLUMN category_id INT(11) NULL DEFAULT NULL AFTER category;

INSERT INTO post_categories (name, status) VALUES
  ('Locais', 'ativo'),
  ('Clientes', 'ativo'),
  ('Espaços', 'ativo'),
  ('Workshops', 'ativo'),
  ('Produtividade', 'ativo'),
  ('Gestão', 'ativo'),
  ('Novidades', 'ativo'),
  ('Tendências', 'ativo'),
  ('Dicas', 'ativo')
ON DUPLICATE KEY UPDATE status = VALUES(status);
