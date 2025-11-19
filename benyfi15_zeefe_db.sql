-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 19/11/2025 às 07:06
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

DELIMITER $$
--
-- Procedimentos
--
$$

$$

$$

DELIMITER ;

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

--
-- Despejando dados para a tabela `admins`
--

INSERT INTO `admins` (`id`, `username`, `email`, `password`, `created_at`) VALUES
(1, '123', 'admin@zeefe.com.br', '321', '2025-10-30 22:36:01');

-- --------------------------------------------------------

--
-- Estrutura para tabela `advertisers`
--

CREATE TABLE `advertisers` (
  `id` bigint(20) NOT NULL,
  `owner_type` enum('client','company') COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_id` bigint(20) NOT NULL,
  `bank_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `login_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `login_cpf` varchar(14) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `verification_token` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_token_expires` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `status` enum('ativo','inativo','suspenso') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ativo',
  `fee_pct` decimal(5,2) DEFAULT NULL,
  `bank_name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_type` enum('corrente','poupanca','pix') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agency_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_number` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pix_key` varchar(140) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `advertisers`
--

INSERT INTO `advertisers` (`id`, `owner_type`, `owner_id`, `bank_code`, `display_name`, `full_name`, `login_email`, `login_cpf`, `contact_phone`, `password_hash`, `email_verified_at`, `verification_token`, `verification_token_expires`, `last_login`, `status`, `fee_pct`, `bank_name`, `account_type`, `agency_number`, `account_number`, `pix_key`, `created_at`, `updated_at`) VALUES
(1, 'client', 0, NULL, 'MZF', 'Mira Zlotnik', 'benyfinkelstein@gmail.com', '41836484836', NULL, '$2y$10$coY86ax3NyQXEr1DAE4Q4uX6JMCV6LAI.gAHpLTdZ2Q7MdCTO.nW6', '2025-11-16 22:46:54', NULL, NULL, '2025-11-19 07:01:04', 'ativo', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-16 22:46:39', '2025-11-16 22:46:54');

-- --------------------------------------------------------

--
-- Estrutura para tabela `advertiser_remember_tokens`
--

CREATE TABLE `advertiser_remember_tokens` (
  `id` int(11) NOT NULL,
  `advertiser_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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

--
-- Despejando dados para a tabela `amenities`
--

INSERT INTO `amenities` (`id`, `name`, `description`, `status`) VALUES
(1, 'Café', 'Café e bebidas', 'ativo'),
(2, 'Projetor', 'Projetor multimídia', 'ativo'),
(3, 'Quadro Branco', 'Quadro para anotações', 'ativo'),
(4, 'WiFI', '', 'ativo');

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

--
-- Despejando dados para a tabela `associates`
--

INSERT INTO `associates` (`client_id`, `visitor_id`, `label`, `created_at`) VALUES
(1, 1, 'Equipe Projeto', '2025-10-23 21:58:21'),
(2, 2, 'Fornecedora', '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `clients`
--

CREATE TABLE `clients` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `company_role` enum('admin','gestor','membro','leitor') COLLATE utf8mb4_unicode_ci DEFAULT 'membro',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `verification_token` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_token_expires` datetime DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `login` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cpf` varchar(14) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rg` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `profession` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ativo',
  `created_at` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `clients`
--

INSERT INTO `clients` (`id`, `company_id`, `company_role`, `name`, `email`, `email_verified_at`, `verification_token`, `verification_token_expires`, `password`, `login`, `password_hash`, `cpf`, `rg`, `phone`, `whatsapp`, `type`, `birth_date`, `profession`, `status`, `created_at`, `last_login`, `updated_at`) VALUES
(1, NULL, NULL, 'João Portal', 'benyfink2@gmail.com', NULL, NULL, NULL, NULL, 't1', '$2y$10$6HhXWEyNJPmbfCF8UO9QgeJZ9R6GNbz1qANimgFln/vcZVGl6cXAu', '12345678910', 'MG1234567', '11995676554', '11995676554', 'PF', '1990-03-11', 'Engenheiro', 'ativo', NULL, '2025-10-23 21:58:21', '2025-11-16 22:53:43'),
(2, 3, 'membro', 'Maria Silva', 'benyfink1@gmail.com', NULL, NULL, NULL, 'p1FzrF1jIPt', 'teste123', 'teste123', '32165498700', 'SP8888123', '11987654321', '11987654321', 'PF', '1991-09-21', 'Gerente', 'ativo', NULL, '2025-10-23 21:58:21', NULL),
(11, 1, 'membro', 'Beny', 'benyfink@gmail.com', '2025-11-08 16:25:10', NULL, NULL, 'Gafin123!', 'benyfink@gmail.com', '$2y$10$eDSwPkBIKEz3UsCl/f1gauFwlsiuQVbIxFHVqvKwXROVGeC/4RE8q', '37333590895', '', '', '', 'PF', NULL, NULL, 'ativo', NULL, NULL, '2025-11-10 14:45:02'),
(14, NULL, 'membro', 'Mira Finkelstien', 'benyfinkelstein@gmail.com', '2025-11-16 23:12:37', NULL, NULL, NULL, 'benyfinkelstein@gmail.com', '$2y$10$PyXHQGc5J64t06pWB.pg9OdwTyXWtUfnXlud2/D1XxEW46I9fwwD.', '41836484836', NULL, NULL, NULL, 'PF', NULL, NULL, 'ativo', '2025-11-16 23:12:27', NULL, '2025-11-16 23:12:37');

-- --------------------------------------------------------

--
-- Estrutura para tabela `client_remember_tokens`
--

CREATE TABLE `client_remember_tokens` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `client_remember_tokens`
--

INSERT INTO `client_remember_tokens` (`id`, `client_id`, `token_hash`, `user_agent`, `created_at`, `expires_at`) VALUES
(1, 11, '29f773e870b08e3dc33f10a91f795ad1a70722b49296b174224d0973273fa5c7', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-19 07:00:51', '2025-11-20 07:00:51');

-- --------------------------------------------------------

--
-- Estrutura para tabela `companies`
--

CREATE TABLE `companies` (
  `id` bigint(20) NOT NULL,
  `razao_social` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_fantasia` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cnpj` varchar(18) COLLATE utf8mb4_unicode_ci NOT NULL,
  `inscricao_estadual` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `street` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `number` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `complement` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip_code` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` char(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `master_client_id` bigint(20) DEFAULT NULL,
  `status` enum('ativo','inativo','suspenso') COLLATE utf8mb4_unicode_ci DEFAULT 'ativo',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `companies`
--

INSERT INTO `companies` (`id`, `razao_social`, `nome_fantasia`, `cnpj`, `inscricao_estadual`, `street`, `number`, `complement`, `zip_code`, `city`, `state`, `email`, `phone`, `whatsapp`, `master_client_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Empresa Exemplo LTDA', 'Exemplo', '12.345.678/0001-99', '123456', 'Rua Alfa', '100', 'Sala 501', '01234-567', 'São Paulo', 'SP', 'contato@exemplo.com', '1133224455', '', 11, 'ativo', '2025-10-23 21:58:21', '2025-11-10 14:45:02'),
(3, 'Bla bla farma', 'bka bka', '12.311.111/1111-11', '', '', '111', '', '', '123', 'AC', '321@123.com', '(12) 31111-1111', '(12) 31111-1111', NULL, 'ativo', NULL, '0000-00-00 00:00:00');

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

--
-- Despejando dados para a tabela `company_employees`
--

INSERT INTO `company_employees` (`id`, `company_id`, `full_name`, `rg`, `email`, `whatsapp`, `status`, `import_batch_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'Fernanda Souza', 'SP009988', 'fernanda@empresa.com', '11933332222', 'ativo', NULL, '2025-10-23 21:58:21', '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `company_invitations`
--

CREATE TABLE `company_invitations` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) NOT NULL,
  `client_id` bigint(20) DEFAULT NULL,
  `cpf` varchar(14) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','gestor','membro','leitor') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'membro',
  `token` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pendente','aceito','cancelado','expirado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendente',
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `accepted_at` datetime DEFAULT NULL,
  `invite_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invite_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `events`
--

CREATE TABLE `events` (
  `id` bigint(20) NOT NULL,
  `anonymous_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client_id` bigint(20) DEFAULT NULL,
  `room_id` bigint(20) DEFAULT NULL,
  `event` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ts` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `utm_source` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utm_medium` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utm_campaign` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` char(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

--
-- Despejando dados para a tabela `feedback_nps`
--

INSERT INTO `feedback_nps` (`reservation_id`, `score`, `comment`, `would_recommend`, `collected_at`) VALUES
(1, 9, 'Ótima sala, café excelente.', 1, '2025-10-23 21:58:21');

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

--
-- Despejando dados para a tabela `import_batches`
--

INSERT INTO `import_batches` (`id`, `company_id`, `file_name`, `total_rows`, `processed_rows`, `status`, `created_at`, `finished_at`) VALUES
(1, 1, 'import1.xlsx', 4, 4, 'concluido', '2025-10-23 21:58:21', '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `ledger_entries`
--

CREATE TABLE `ledger_entries` (
  `id` bigint(20) NOT NULL,
  `advertiser_id` bigint(20) NOT NULL,
  `reservation_id` bigint(20) DEFAULT NULL,
  `type` enum('credito','debito','ajuste') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pendente','disponivel','bloqueado','pago','estornado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendente',
  `available_at` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `txid` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `ledger_entries`
--

INSERT INTO `ledger_entries` (`id`, `advertiser_id`, `reservation_id`, `type`, `description`, `amount`, `status`, `available_at`, `paid_at`, `txid`, `created_at`) VALUES
(1, 1, 21, 'credito', 'Crédito de reserva #21', 1275.00, 'pendente', '2025-12-16 23:14:00', NULL, NULL, '2025-11-16 23:14:00');

-- --------------------------------------------------------

--
-- Estrutura para tabela `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) NOT NULL,
  `thread_id` bigint(20) NOT NULL,
  `sender_type` enum('client','advertiser','system') COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `attachment_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `read_by_client_at` datetime DEFAULT NULL,
  `read_by_advertiser_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `messages`
--

INSERT INTO `messages` (`id`, `thread_id`, `sender_type`, `body`, `attachment_url`, `created_at`, `read_by_client_at`, `read_by_advertiser_at`) VALUES
(1, 1, 'client', 'Oi, tudo bem?', NULL, '2025-11-16 22:56:00', '2025-11-16 22:56:01', '2025-11-16 22:57:38'),
(2, 1, 'advertiser', 'td 4 vc', NULL, '2025-11-16 22:57:54', '2025-11-16 22:58:21', '2025-11-16 22:57:54'),
(3, 1, 'client', 'Oi!', NULL, '2025-11-16 22:58:28', '2025-11-16 22:58:28', '2025-11-16 22:58:29'),
(4, 1, 'advertiser', 'HUHUHUHUHUHU', NULL, '2025-11-16 22:58:35', '2025-11-16 22:58:42', '2025-11-16 22:58:35'),
(5, 2, 'client', 'Teste123', NULL, '2025-11-16 23:14:18', '2025-11-16 23:14:18', '2025-11-16 23:14:31'),
(6, 2, 'client', 'meu telefone é [contato oculto]', NULL, '2025-11-16 23:15:37', '2025-11-16 23:15:37', '2025-11-17 08:30:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `message_threads`
--

CREATE TABLE `message_threads` (
  `id` bigint(20) NOT NULL,
  `room_id` bigint(20) DEFAULT NULL,
  `reservation_id` bigint(20) DEFAULT NULL,
  `client_id` bigint(20) DEFAULT NULL,
  `advertiser_id` bigint(20) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_message_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `message_threads`
--

INSERT INTO `message_threads` (`id`, `room_id`, `reservation_id`, `client_id`, `advertiser_id`, `created_at`, `last_message_at`) VALUES
(1, 1, 19, 11, 1, '2025-11-16 22:55:51', '2025-11-16 22:58:35'),
(2, 1, 21, 14, 1, '2025-11-16 23:14:13', '2025-11-16 23:15:37');

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

--
-- Despejando dados para a tabela `notification_logs`
--

INSERT INTO `notification_logs` (`id`, `reservation_id`, `rule_id`, `recipient_type`, `recipient`, `channel`, `status`, `payload_json`, `sent_at`, `created_at`) VALUES
(1, 1, 1, 'concierge', 'portaria@exemplo.com', 'email', 'sent', '{\"msg\": \"Bom dia\"}', '2025-10-23 21:58:21', '2025-10-23 21:58:21');

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

--
-- Despejando dados para a tabela `notification_rules`
--

INSERT INTO `notification_rules` (`id`, `type`, `active`, `schedule_cron`, `channel`, `template_id`, `created_at`, `updated_at`) VALUES
(1, 'concierge_daily', 1, '05:00 America/Sao_Paulo', 'email', 'TEMPLATE01', '2025-10-23 21:58:21', '2025-10-23 21:58:21'),
(2, 'visitors_reminder', 1, NULL, 'email,whatsapp', 'TEMPLATE02', '2025-10-23 21:58:21', '2025-10-23 21:58:21');

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

--
-- Despejando dados para a tabela `panel_users`
--

INSERT INTO `panel_users` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Admin Master', 'admin@zeefe.com', 'senhamaster', 'admin', 'ativo', '2025-10-23 21:58:21', '2025-10-23 21:58:21');

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

--
-- Despejando dados para a tabela `payments`
--

INSERT INTO `payments` (`id`, `reservation_id`, `method`, `amount`, `status`, `transaction_code`, `paid_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'pix', 500.00, 'pago', 'TRXPAY9172', '2025-10-23 21:58:21', '2025-10-23 21:58:21', '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `payouts`
--

CREATE TABLE `payouts` (
  `id` bigint(20) NOT NULL,
  `advertiser_id` bigint(20) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `method` enum('pix','ted') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `status` enum('agendado','processando','pago','falhou','cancelado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'agendado',
  `receipt_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

--
-- Despejando dados para a tabela `pre_reservations`
--

INSERT INTO `pre_reservations` (`id`, `room_id`, `client_id`, `company_id`, `contact_name`, `contact_email`, `contact_phone`, `date`, `notes`, `status`, `converted_reservation_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'Fernando', 'fernando@pre.com', '11988776655', '2025-10-28', 'Pré para semana seguinte', 'em_analise', NULL, '2025-10-23 21:58:21', '2025-10-23 21:58:21'),
(2, NULL, NULL, 1, 'Anônimo', 'contato@anonimo.com', '11988888888', '2025-11-01', 'Sem sala', 'aberta', NULL, '2025-10-23 21:58:21', '2025-10-23 21:58:21');

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
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `date` date NOT NULL,
  `time_start` time DEFAULT NULL,
  `time_end` time DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT '0.00',
  `amount_gross` decimal(10,2) DEFAULT NULL,
  `voucher_code` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `voucher_amount` decimal(10,2) DEFAULT NULL,
  `fee_pct_at_time` decimal(5,2) DEFAULT NULL,
  `fee_amount` decimal(10,2) DEFAULT NULL,
  `amount_net` decimal(10,2) DEFAULT NULL,
  `attendees_count` int(11) DEFAULT '0',
  `requirements` mediumtext COLLATE utf8mb4_unicode_ci,
  `observations` mediumtext COLLATE utf8mb4_unicode_ci,
  `status` enum('pendente','confirmada','cancelada','concluida') COLLATE utf8mb4_unicode_ci DEFAULT 'pendente',
  `payment_status` enum('pendente','confirmado','expirado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendente',
  `hold_expires_at` datetime DEFAULT NULL,
  `notes` mediumtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `reservations`
--

INSERT INTO `reservations` (`id`, `room_id`, `client_id`, `participants`, `price`, `company_id`, `title`, `description`, `date`, `time_start`, `time_end`, `total_price`, `amount_gross`, `voucher_code`, `voucher_amount`, `fee_pct_at_time`, `fee_amount`, `amount_net`, `attendees_count`, `requirements`, `observations`, `status`, `payment_status`, `hold_expires_at`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 1, 0.00, 1, 'Reunião Diretoria', 'Pauta estratégica', '2025-10-30', '00:00:00', '00:00:00', 500.00, NULL, NULL, NULL, NULL, NULL, NULL, 5, 'Café, Projetor', '', 'cancelada', 'pendente', NULL, '', '2025-10-23 21:58:21', '2025-11-01 23:33:54'),
(18, 1, 11, 1, 0.00, NULL, 'teste', '123', '2025-11-12', '08:00:00', '20:00:00', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'cancelada', 'confirmado', '2025-11-10 10:58:48', NULL, NULL, '2025-11-09 16:17:01'),
(19, 1, 11, 1, 0.00, NULL, 'teste', '', '2025-11-11', '08:00:00', '20:00:00', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'confirmada', 'confirmado', '2025-11-10 20:54:36', NULL, NULL, '2025-11-09 21:08:32'),
(20, 1, 11, 1, 0.00, 1, 'Sabc', '', '2025-11-25', '08:00:00', '20:00:00', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'confirmada', 'confirmado', '2025-11-11 21:42:01', NULL, NULL, '2025-11-10 21:42:30'),
(21, 1, 14, 1, 0.00, NULL, '123', '321', '2025-11-26', '08:00:00', '20:00:00', 0.00, 1500.00, NULL, NULL, 15.00, 225.00, 1275.00, 0, NULL, NULL, 'confirmada', 'confirmado', '2025-11-17 23:13:38', NULL, NULL, '2025-11-16 23:14:00'),
(22, 1, 11, 1, 0.00, NULL, '123', '', '2025-11-27', '08:00:00', '20:00:00', 0.00, NULL, 'ZEF-4T5DUVYCSH', 1500.00, NULL, NULL, NULL, 0, NULL, NULL, 'pendente', 'pendente', NULL, NULL, NULL, '2025-11-17 21:11:46'),
(23, 1, 11, 1, 0.00, NULL, '123', '', '2025-11-27', '08:00:00', '20:00:00', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'pendente', 'pendente', NULL, NULL, NULL, NULL),
(24, 1, 11, 1, 0.00, NULL, '132', '', '2025-11-19', '08:00:00', '20:00:00', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'pendente', 'pendente', NULL, NULL, NULL, NULL),
(25, 4, 11, 1, 0.00, NULL, '321', '', '2025-11-18', '08:00:00', '20:00:00', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'pendente', 'pendente', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `reservation_visitors`
--

CREATE TABLE `reservation_visitors` (
  `reservation_id` bigint(20) NOT NULL,
  `visitor_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `reservation_visitors`
--

INSERT INTO `reservation_visitors` (`reservation_id`, `visitor_id`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) NOT NULL,
  `reservation_id` bigint(20) NOT NULL,
  `room_id` bigint(20) NOT NULL,
  `client_id` bigint(20) NOT NULL,
  `rating_price` tinyint(4) NOT NULL,
  `rating_benefits` tinyint(4) NOT NULL,
  `rating_ease` tinyint(4) NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `recommend` tinyint(1) DEFAULT NULL,
  `status` enum('pendente','aprovado','oculto') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendente',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `rooms`
--

CREATE TABLE `rooms` (
  `id` bigint(20) NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int(11) NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `street` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `complement` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cep` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsavel_nome` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsavel_telefone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsavel_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `portaria_telefone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `portaria_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `portaria_inteligente` enum('Sim','Não') COLLATE utf8mb4_unicode_ci DEFAULT 'Não',
  `dailyrate` decimal(10,2) DEFAULT NULL,
  `daily_rate` decimal(10,2) NOT NULL DEFAULT '0.00',
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lat` decimal(10,7) DEFAULT NULL,
  `lon` decimal(10,7) DEFAULT NULL,
  `status` enum('ativo','inativo','manutencao','desativada') COLLATE utf8mb4_unicode_ci DEFAULT 'ativo',
  `maintenance_start` date DEFAULT NULL,
  `maintenance_end` date DEFAULT NULL,
  `deactivated_from` date DEFAULT NULL,
  `photo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facilitated_access` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `advertiser_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `rooms`
--

INSERT INTO `rooms` (`id`, `name`, `capacity`, `description`, `street`, `complement`, `cep`, `city`, `state`, `responsavel_nome`, `responsavel_telefone`, `responsavel_email`, `portaria_telefone`, `portaria_email`, `portaria_inteligente`, `dailyrate`, `daily_rate`, `location`, `lat`, `lon`, `status`, `maintenance_start`, `maintenance_end`, `deactivated_from`, `photo_path`, `facilitated_access`, `created_at`, `updated_at`, `advertiser_id`) VALUES
(1, 'Rouxinol', 10, 'Sala ampla para reuniões', 'Avenida Rouxinol, 84', '', '04516000', 'São Paulo', 'SP', 'Beny', '', '', '', '', 'Sim', 0.00, 1500.00, 'Cj 78', -23.6012764, -46.6734966, 'ativo', NULL, NULL, NULL, 'img/rooms/1/room_1_69094e2f497e46.00067241.jpg,img/rooms/1/room_1_69094e2f4991f7.94708361.jpg,img/rooms/1/room_1_69094e2f499f78.19329601.jpg,img/rooms/1/room_1_69094e2f49ab71.36026958.jpg,img/rooms/1/room_1_69094e2f49b846.75551922.jpg', 0, '2025-10-23 21:58:21', '2025-11-17 22:07:17', NULL),
(4, 'Teste', 0, '', 'Avenida Eucaliptos, 165', '', '04517-050', '', '', '', '', '', '', '', 'Sim', NULL, 0.00, '123', -23.6059551, -46.6736896, 'ativo', NULL, NULL, NULL, NULL, 1, NULL, '2025-11-17 22:05:36', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `room_amenities`
--

CREATE TABLE `room_amenities` (
  `room_id` bigint(20) NOT NULL,
  `amenity_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `room_amenities`
--

INSERT INTO `room_amenities` (`room_id`, `amenity_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4);

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
-- Estrutura para tabela `room_ratings`
--

CREATE TABLE `room_ratings` (
  `room_id` bigint(20) NOT NULL,
  `avg_overall` decimal(3,2) NOT NULL DEFAULT '0.00',
  `avg_price` decimal(3,2) NOT NULL DEFAULT '0.00',
  `avg_benefits` decimal(3,2) NOT NULL DEFAULT '0.00',
  `avg_ease` decimal(3,2) NOT NULL DEFAULT '0.00',
  `reviews_count` int(11) NOT NULL DEFAULT '0',
  `last_calculated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `visitors`
--

CREATE TABLE `visitors` (
  `id` bigint(20) NOT NULL,
  `client_id` bigint(20) DEFAULT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rg` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cpf` varchar(14) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invite_token` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invite_status` enum('pendente','completo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendente',
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ativo','inativo') COLLATE utf8mb4_unicode_ci DEFAULT 'ativo',
  `observations` mediumtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `visitors`
--

INSERT INTO `visitors` (`id`, `client_id`, `company_id`, `name`, `rg`, `cpf`, `email`, `invite_token`, `invite_status`, `phone`, `whatsapp`, `status`, `observations`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Felipe Visitante', 'SP123456', '', 'benyfinkelstein@gmail.com', NULL, 'pendente', '11911112222', '', 'ativo', '', '2025-10-23 21:58:21', '2025-10-23 21:58:21'),
(2, 1, 1, 'Luciana Visita', '', '', 'luciana@visitante.com', NULL, 'pendente', '11912345678', '', 'inativo', 'Trazer CPF', '2025-10-23 21:58:21', '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `vouchers`
--

CREATE TABLE `vouchers` (
  `id` int(11) NOT NULL,
  `code` varchar(64) NOT NULL,
  `type` enum('percent','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `valid_from` datetime DEFAULT NULL,
  `valid_to` datetime DEFAULT NULL,
  `max_redemptions` int(11) DEFAULT NULL,
  `used_count` int(11) NOT NULL DEFAULT '0',
  `min_amount` decimal(10,2) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `vouchers`
--

INSERT INTO `vouchers` (`id`, `code`, `type`, `value`, `valid_from`, `valid_to`, `max_redemptions`, `used_count`, `min_amount`, `room_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'ZEF-4T5DUVYCSH', 'percent', 100.00, NULL, NULL, NULL, 0, NULL, 0, 'ativo', '2025-11-17 21:10:28', '2025-11-17 21:10:49');

-- --------------------------------------------------------

--
-- Estrutura para tabela `voucher_redemptions`
--

CREATE TABLE `voucher_redemptions` (
  `id` int(11) NOT NULL,
  `voucher_id` int(11) NOT NULL,
  `reservation_id` int(11) DEFAULT NULL,
  `client_id` int(11) DEFAULT NULL,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
-- Índices de tabela `advertisers`
--
ALTER TABLE `advertisers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_adv_owner` (`owner_type`,`owner_id`),
  ADD UNIQUE KEY `uk_advertisers_login_email` (`login_email`),
  ADD KEY `idx_adv_fee` (`fee_pct`);

--
-- Índices de tabela `advertiser_remember_tokens`
--
ALTER TABLE `advertiser_remember_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_adv_token_hash` (`token_hash`),
  ADD KEY `idx_adv_expires` (`advertiser_id`,`expires_at`);

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
  ADD KEY `idx_clients_verification_token` (`verification_token`),
  ADD KEY `idx_clients_company_id` (`company_id`),
  ADD KEY `idx_cli_email` (`email`),
  ADD KEY `idx_cli_cpf` (`cpf`);

--
-- Índices de tabela `client_remember_tokens`
--
ALTER TABLE `client_remember_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_token_hash` (`token_hash`),
  ADD KEY `idx_client_expires` (`client_id`,`expires_at`);

--
-- Índices de tabela `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cnpj` (`cnpj`),
  ADD KEY `idx_companies_master_client` (`master_client_id`),
  ADD KEY `idx_comp_master` (`master_client_id`);

--
-- Índices de tabela `company_employees`
--
ALTER TABLE `company_employees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`);

--
-- Índices de tabela `company_invitations`
--
ALTER TABLE `company_invitations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inv_company_status` (`company_id`,`status`,`created_at`),
  ADD KEY `idx_inv_email` (`invite_email`(120),`status`,`company_id`);

--
-- Índices de tabela `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ev_event` (`event`,`ts`),
  ADD KEY `idx_ev_room` (`room_id`,`ts`),
  ADD KEY `idx_ev_client` (`client_id`,`ts`);

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
-- Índices de tabela `ledger_entries`
--
ALTER TABLE `ledger_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ledger_adv` (`advertiser_id`,`status`,`available_at`),
  ADD KEY `idx_ledger_res` (`reservation_id`);

--
-- Índices de tabela `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_msg_thread` (`thread_id`,`created_at`);

--
-- Índices de tabela `message_threads`
--
ALTER TABLE `message_threads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_msg_room` (`room_id`),
  ADD KEY `idx_msg_res` (`reservation_id`),
  ADD KEY `idx_msg_part` (`client_id`,`advertiser_id`),
  ADD KEY `fk_msg_adv` (`advertiser_id`),
  ADD KEY `idx_threads_lastmsg` (`last_message_at`);

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
-- Índices de tabela `payouts`
--
ALTER TABLE `payouts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payouts_adv` (`advertiser_id`,`status`,`scheduled_at`);

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
  ADD KEY `idx_reservations_payment_status` (`payment_status`),
  ADD KEY `idx_reservations_hold_expires` (`hold_expires_at`),
  ADD KEY `idx_reservations_date` (`date`),
  ADD KEY `idx_reservations_room` (`room_id`),
  ADD KEY `idx_reservations_client` (`client_id`),
  ADD KEY `idx_res_company` (`company_id`,`status`,`date`),
  ADD KEY `idx_res_payment` (`payment_status`,`hold_expires_at`);

--
-- Índices de tabela `reservation_visitors`
--
ALTER TABLE `reservation_visitors`
  ADD PRIMARY KEY (`reservation_id`,`visitor_id`),
  ADD KEY `visitor_id` (`visitor_id`);

--
-- Índices de tabela `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_review_once` (`reservation_id`),
  ADD KEY `idx_review_room` (`room_id`,`status`),
  ADD KEY `idx_review_client` (`client_id`);

--
-- Índices de tabela `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rooms_location` (`location`),
  ADD KEY `idx_rooms_capacity` (`capacity`),
  ADD KEY `idx_rooms_advertiser` (`advertiser_id`),
  ADD KEY `idx_rooms_geo` (`lat`,`lon`);

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
-- Índices de tabela `room_ratings`
--
ALTER TABLE `room_ratings`
  ADD PRIMARY KEY (`room_id`);

--
-- Índices de tabela `visitors`
--
ALTER TABLE `visitors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `idx_visitors_invite_token` (`invite_token`);

--
-- Índices de tabela `vouchers`
--
ALTER TABLE `vouchers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_vouchers_code` (`code`),
  ADD KEY `idx_vouchers_status` (`status`),
  ADD KEY `idx_vouchers_room` (`room_id`);

--
-- Índices de tabela `voucher_redemptions`
--
ALTER TABLE `voucher_redemptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_redemptions_voucher` (`voucher_id`),
  ADD KEY `idx_redemptions_reservation` (`reservation_id`),
  ADD KEY `idx_redemptions_client` (`client_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `advertisers`
--
ALTER TABLE `advertisers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `advertiser_remember_tokens`
--
ALTER TABLE `advertiser_remember_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `amenities`
--
ALTER TABLE `amenities`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `clients`
--
ALTER TABLE `clients`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `client_remember_tokens`
--
ALTER TABLE `client_remember_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `company_employees`
--
ALTER TABLE `company_employees`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `company_invitations`
--
ALTER TABLE `company_invitations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `import_batches`
--
ALTER TABLE `import_batches`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `ledger_entries`
--
ALTER TABLE `ledger_entries`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `message_threads`
--
ALTER TABLE `message_threads`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `notification_logs`
--
ALTER TABLE `notification_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `notification_rules`
--
ALTER TABLE `notification_rules`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `panel_users`
--
ALTER TABLE `panel_users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `payouts`
--
ALTER TABLE `payouts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pre_reservations`
--
ALTER TABLE `pre_reservations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de tabela `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `room_photos`
--
ALTER TABLE `room_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `visitors`
--
ALTER TABLE `visitors`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `voucher_redemptions`
--
ALTER TABLE `voucher_redemptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
-- Restrições para tabelas `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `fk_companies_master_client` FOREIGN KEY (`master_client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `company_employees`
--
ALTER TABLE `company_employees`
  ADD CONSTRAINT `company_employees_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Restrições para tabelas `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `fk_ev_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_ev_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

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
-- Restrições para tabelas `ledger_entries`
--
ALTER TABLE `ledger_entries`
  ADD CONSTRAINT `fk_ledger_adv` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`),
  ADD CONSTRAINT `fk_ledger_res` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`);

--
-- Restrições para tabelas `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `fk_messages_thread` FOREIGN KEY (`thread_id`) REFERENCES `message_threads` (`id`);

--
-- Restrições para tabelas `message_threads`
--
ALTER TABLE `message_threads`
  ADD CONSTRAINT `fk_msg_adv` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`),
  ADD CONSTRAINT `fk_msg_cli` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_msg_res` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`),
  ADD CONSTRAINT `fk_msg_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

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
-- Restrições para tabelas `payouts`
--
ALTER TABLE `payouts`
  ADD CONSTRAINT `fk_payouts_adv` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`);

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
-- Restrições para tabelas `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_rev_cli` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_rev_res` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`),
  ADD CONSTRAINT `fk_rev_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

--
-- Restrições para tabelas `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `fk_rooms_advertiser` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`);

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
-- Restrições para tabelas `room_ratings`
--
ALTER TABLE `room_ratings`
  ADD CONSTRAINT `fk_rr_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

--
-- Restrições para tabelas `visitors`
--
ALTER TABLE `visitors`
  ADD CONSTRAINT `visitors_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `visitors_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Restrições para tabelas `voucher_redemptions`
--
ALTER TABLE `voucher_redemptions`
  ADD CONSTRAINT `fk_voucher_redemptions_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
