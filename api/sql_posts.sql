-- Conteúdos / Novidades para homepage e blog leve
CREATE TABLE IF NOT EXISTS posts (
  id            INT(11) NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(160) NOT NULL UNIQUE,
  title         VARCHAR(200) NOT NULL,
  summary       VARCHAR(300) DEFAULT NULL,
  views_count   INT(11) NOT NULL DEFAULT 0,
  content       MEDIUMTEXT,
  category      VARCHAR(80) DEFAULT NULL,
  category_id   INT(11) DEFAULT NULL,
  status        ENUM('rascunho','publicado','arquivado') NOT NULL DEFAULT 'rascunho',
  cover_path    VARCHAR(255) DEFAULT NULL,
  author_name   VARCHAR(120) DEFAULT NULL,
  published_at  DATETIME DEFAULT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_posts_status (status),
  KEY idx_posts_category (category),
  KEY idx_posts_category_id (category_id),
  KEY idx_posts_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
