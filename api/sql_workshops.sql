-- Script de criação das tabelas de Workshops
-- Execute este conteúdo no seu banco MySQL (phpMyAdmin ou similar)

-- 1) Workshops (evento)
CREATE TABLE IF NOT EXISTS workshops (
  id              INT(11) NOT NULL AUTO_INCREMENT,
  public_code     VARCHAR(64) NULL UNIQUE,
  advertiser_id   INT(11) NOT NULL,
  room_id         INT(11) NOT NULL,
  title           VARCHAR(160) NOT NULL,
  subtitle        VARCHAR(255) DEFAULT NULL,
  description     TEXT,
  category        VARCHAR(80) DEFAULT NULL,
  date            DATE NOT NULL,
  time_start      TIME NOT NULL,
  time_end        TIME NOT NULL,
  price_per_seat  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  min_seats       INT(11) NOT NULL DEFAULT 0,
  max_seats       INT(11) NOT NULL DEFAULT 0,
  show_sold_bar   TINYINT(1) NOT NULL DEFAULT 0,
  status          ENUM('rascunho','publicado','cancelado','concluido') NOT NULL DEFAULT 'rascunho',
  banner_path     VARCHAR(255) DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_workshop_advertiser (advertiser_id),
  KEY idx_workshop_room (room_id),
  KEY idx_workshop_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 2) Participantes de workshop (cadastro independente)
CREATE TABLE IF NOT EXISTS workshop_participants (
  id             INT(11) NOT NULL AUTO_INCREMENT,
  name           VARCHAR(160) NOT NULL,
  email          VARCHAR(160) NOT NULL,
  cpf            VARCHAR(14) DEFAULT NULL,
  phone          VARCHAR(20) DEFAULT NULL,
  password_hash  VARCHAR(255) DEFAULT NULL,
  status         ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_workshop_participant_email (email),
  KEY idx_workshop_participant_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 3) Inscrições (cada ingresso)
CREATE TABLE IF NOT EXISTS workshop_enrollments (
  id              INT(11) NOT NULL AUTO_INCREMENT,
  workshop_id     INT(11) NOT NULL,
  participant_id  INT(11) NOT NULL,
  public_code     VARCHAR(64) NOT NULL,
  payment_status  ENUM('pendente','pago','cancelado') NOT NULL DEFAULT 'pendente',
  voucher_code    VARCHAR(64) DEFAULT NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  checkin_status  ENUM('nao_lido','lido','cancelado') NOT NULL DEFAULT 'nao_lido',
  checked_in_at   DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_workshop_enrollment_code (public_code),
  KEY idx_workshop_enrollment_workshop (workshop_id),
  KEY idx_workshop_enrollment_participant (participant_id),
  KEY idx_workshop_enrollment_payment (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 4) Mídia do workshop (galeria opcional)
CREATE TABLE IF NOT EXISTS workshop_media (
  id           INT(11) NOT NULL AUTO_INCREMENT,
  workshop_id  INT(11) NOT NULL,
  file_path    VARCHAR(255) NOT NULL,
  sort_order   INT(11) NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_workshop_media_workshop (workshop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
