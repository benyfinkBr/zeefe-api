-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 01/11/2025 às 17:55
-- Versão do servidor: 5.7.23-23
-- Versão do PHP: 8.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `benyfi15_zeefe_db`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `amenities`
--

CREATE TABLE `amenities` (
  `id` bigint(20) NOT NULL,
  `name` varchar(120) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `status` enum('ativo','inativo') COLLATE utf8_unicode_ci DEFAULT 'ativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `associates`
--

CREATE TABLE `associates` (
  `client_id` bigint(20) NOT NULL,
  `visitor_id` bigint(20) NOT NULL,
  `label` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `clients`
--

CREATE TABLE `clients` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `login` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `cpf` varchar(14) COLLATE utf8_unicode_ci DEFAULT NULL,
  `rg` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `type` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `profession` varchar(120) COLLATE utf8_unicode_ci DEFAULT NULL,
  `status` enum('ativo','inativo','bloqueado') COLLATE utf8_unicode_ci DEFAULT 'ativo',
  `created_at` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `companies`
--

CREATE TABLE `companies` (
  `id` bigint(20) NOT NULL,
  `razao_social` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `nome_fantasia` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cnpj` varchar(18) COLLATE utf8_unicode_ci NOT NULL,
  `inscricao_estadual` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `street` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `number` varchar(12) COLLATE utf8_unicode_ci DEFAULT NULL,
  `complement` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `zip_code` varchar(12) COLLATE utf8_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `state` char(2) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `status` enum('ativo','inativo','suspenso') COLLATE utf8_unicode_ci DEFAULT 'ativo',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `company_employees`
--

CREATE TABLE `company_employees` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) NOT NULL,
  `full_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `rg` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `status` enum('ativo','inativo') COLLATE utf8_unicode_ci DEFAULT 'ativo',
  `import_batch_id` bigint(20) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `feedback_nps`
--

CREATE TABLE `feedback_nps` (
  `reservation_id` bigint(20) NOT NULL,
  `score` tinyint(4) NOT NULL,
  `comment` text COLLATE utf8_unicode_ci,
  `would_recommend` tinyint(1) DEFAULT NULL,
  `collected_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `import_batches`
--

CREATE TABLE `import_batches` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `total_rows` int(11) DEFAULT NULL,
  `processed_rows` int(11) DEFAULT NULL,
  `status` enum('processando','concluido','falhou') COLLATE utf8_unicode_ci DEFAULT 'processando',
  `created_at` datetime DEFAULT NULL,
  `finished_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `notification_logs`
--

CREATE TABLE `notification_logs` (
  `id` bigint(20) NOT NULL,
  `reservation_id` bigint(20) DEFAULT NULL,
  `rule_id` bigint(20) DEFAULT NULL,
  `recipient_type` enum('concierge','client','company','visitor','staff') COLLATE utf8_unicode_ci DEFAULT NULL,
  `recipient` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `channel` enum('email','whatsapp','sms') COLLATE utf8_unicode_ci NOT NULL,
  `status` enum('queued','sent','failed') COLLATE utf8_unicode_ci DEFAULT 'queued',
  `payload_json` json DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `notification_rules`
--

CREATE TABLE `notification_rules` (
  `id` bigint(20) NOT NULL,
  `type` enum('concierge_daily','visitors_reminder','generic') COLLATE utf8_unicode_ci NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `schedule_cron` varchar(64) COLLATE utf8_unicode_ci DEFAULT NULL,
  `channel` set('email','whatsapp','sms') COLLATE utf8_unicode_ci DEFAULT 'email',
  `template_id` varchar(64) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `panel_users`
--

CREATE TABLE `panel_users` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `role` enum('admin','gestor','atendimento') COLLATE utf8_unicode_ci DEFAULT 'admin',
  `status` enum('ativo','inativo') COLLATE utf8_unicode_ci DEFAULT 'ativo',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) NOT NULL,
  `reservation_id` bigint(20) NOT NULL,
  `method` enum('pix','boleto','cartao','transferencia','outro') COLLATE utf8_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pendente','pago','falhou','estornado','cancelado') COLLATE utf8_unicode_ci DEFAULT 'pendente',
  `transaction_code` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pre_reservations`
--

CREATE TABLE `pre_reservations` (
  `id` bigint(20) NOT NULL,
  `room_id` bigint(20) DEFAULT NULL,
  `client_id` bigint(20) DEFAULT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `contact_name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `contact_email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `date` date NOT NULL,
  `notes` text COLLATE utf8_unicode_ci,
  `status` enum('aberta','em_analise','aprovada','reprovada','convertida') COLLATE utf8_unicode_ci DEFAULT 'aberta',
  `converted_reservation_id` bigint(20) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `reservations`
--

CREATE TABLE `reservations` (
  `id` bigint(20) NOT NULL,
  `room_id` bigint(20) NOT NULL,
  `client_id` bigint(20) NOT NULL,
  `participants` int(11) DEFAULT '1',
  `price` decimal(10,2) DEFAULT '0.00',
  `company_id` bigint(20) DEFAULT NULL,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `date` date NOT NULL,
  `time_start` time DEFAULT NULL,
  `time_end` time DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT '0.00',
  `attendees_count` int(11) DEFAULT '0',
  `requirements` text COLLATE utf8_unicode_ci,
  `observations` text COLLATE utf8_unicode_ci,
  `status` enum('pendente','confirmada','cancelada','concluida') COLLATE utf8_unicode_ci DEFAULT 'pendente',
  `notes` text COLLATE utf8_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `reservation_visitors`
--

CREATE TABLE `reservation_visitors` (
  `reservation_id` bigint(20) NOT NULL,
  `visitor_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `rooms`
--

CREATE TABLE `rooms` (
  `id` bigint(20) NOT NULL,
  `name` varchar(120) COLLATE utf8_unicode_ci NOT NULL,
  `capacity` int(11) NOT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `street` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `complement` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cep` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `state` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `responsavel_nome` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `responsavel_telefone` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `responsavel_email` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL,
  `portaria_telefone` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `portaria_email` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL,
  `portaria_inteligente` enum('Sim','Não') COLLATE utf8_unicode_ci DEFAULT 'Não',
  `dailyrate` decimal(10,2) DEFAULT NULL,
  `daily_rate` decimal(10,2) NOT NULL DEFAULT '0.00',
  `location` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `status` enum('ativo','inativo','manutencao','desativada') COLLATE utf8_unicode_ci DEFAULT 'ativo',
  `maintenance_start` date DEFAULT NULL,
  `maintenance_end` date DEFAULT NULL,
  `deactivated_from` date DEFAULT NULL,
  `photo_path` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `facilitated_access` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `room_amenities`
--

CREATE TABLE `room_amenities` (
  `room_id` bigint(20) NOT NULL,
  `amenity_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `room_photos`
--

CREATE TABLE `room_photos` (
  `id` int(11) NOT NULL,
  `room_id` bigint(20) NOT NULL,
  `file_path` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `visitors`
--

CREATE TABLE `visitors` (
  `id` bigint(20) NOT NULL,
  `client_id` bigint(20) DEFAULT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `rg` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cpf` varchar(14) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `status` enum('ativo','inativo') COLLATE utf8_unicode_ci DEFAULT 'ativo',
  `observations` text COLLATE utf8_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Índices de tabela `amenities`
--
ALTER TABLE `amenities`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `associates`
--
ALTER TABLE `associates`
  ADD PRIMARY KEY (`client_id`,`visitor_id`),
  ADD KEY `visitor_id` (`visitor_id`);

--
-- Índices de tabela `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `login` (`login`),
  ADD KEY `company_id` (`company_id`);

--
-- Índices de tabela `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cnpj` (`cnpj`);

--
-- Índices de tabela `company_employees`
--
ALTER TABLE `company_employees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`);

--
-- Índices de tabela `feedback_nps`
--
ALTER TABLE `feedback_nps`
  ADD PRIMARY KEY (`reservation_id`);

--
-- Índices de tabela `import_batches`
--
ALTER TABLE `import_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`);

--
-- Índices de tabela `notification_logs`
--
ALTER TABLE `notification_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservation_id` (`reservation_id`),
  ADD KEY `rule_id` (`rule_id`);

--
-- Índices de tabela `notification_rules`
--
ALTER TABLE `notification_rules`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `panel_users`
--
ALTER TABLE `panel_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Índices de tabela `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservation_id` (`reservation_id`);

--
-- Índices de tabela `pre_reservations`
--
ALTER TABLE `pre_reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `converted_reservation_id` (`converted_reservation_id`);

--
-- Índices de tabela `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `company_id` (`company_id`);

--
-- Índices de tabela `reservation_visitors`
--
ALTER TABLE `reservation_visitors`
  ADD PRIMARY KEY (`reservation_id`,`visitor_id`),
  ADD KEY `visitor_id` (`visitor_id`);

--
-- Índices de tabela `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `room_amenities`
--
ALTER TABLE `room_amenities`
  ADD PRIMARY KEY (`room_id`,`amenity_id`),
  ADD KEY `amenity_id` (`amenity_id`);

--
-- Índices de tabela `room_photos`
--
ALTER TABLE `room_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`);

--
-- Índices de tabela `visitors`
--
ALTER TABLE `visitors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `company_id` (`company_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `amenities`
--
ALTER TABLE `amenities`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `clients`
--
ALTER TABLE `clients`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `company_employees`
--
ALTER TABLE `company_employees`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `import_batches`
--
ALTER TABLE `import_batches`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `notification_logs`
--
ALTER TABLE `notification_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `notification_rules`
--
ALTER TABLE `notification_rules`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `panel_users`
--
ALTER TABLE `panel_users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pre_reservations`
--
ALTER TABLE `pre_reservations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `room_photos`
--
ALTER TABLE `room_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `visitors`
--
ALTER TABLE `visitors`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `associates`
--
ALTER TABLE `associates`
  ADD CONSTRAINT `associates_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `associates_ibfk_2` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Restrições para tabelas `company_employees`
--
ALTER TABLE `company_employees`
  ADD CONSTRAINT `company_employees_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Restrições para tabelas `feedback_nps`
--
ALTER TABLE `feedback_nps`
  ADD CONSTRAINT `feedback_nps_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `import_batches`
--
ALTER TABLE `import_batches`
  ADD CONSTRAINT `import_batches_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Restrições para tabelas `notification_logs`
--
ALTER TABLE `notification_logs`
  ADD CONSTRAINT `notification_logs_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`),
  ADD CONSTRAINT `notification_logs_ibfk_2` FOREIGN KEY (`rule_id`) REFERENCES `notification_rules` (`id`);

--
-- Restrições para tabelas `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `pre_reservations`
--
ALTER TABLE `pre_reservations`
  ADD CONSTRAINT `pre_reservations_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  ADD CONSTRAINT `pre_reservations_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `pre_reservations_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `pre_reservations_ibfk_4` FOREIGN KEY (`converted_reservation_id`) REFERENCES `reservations` (`id`);

--
-- Restrições para tabelas `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Restrições para tabelas `reservation_visitors`
--
ALTER TABLE `reservation_visitors`
  ADD CONSTRAINT `reservation_visitors_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservation_visitors_ibfk_2` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `room_amenities`
--
ALTER TABLE `room_amenities`
  ADD CONSTRAINT `room_amenities_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `room_amenities_ibfk_2` FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `room_photos`
--
ALTER TABLE `room_photos`
  ADD CONSTRAINT `room_photos_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `visitors`
--
ALTER TABLE `visitors`
  ADD CONSTRAINT `visitors_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `visitors_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
