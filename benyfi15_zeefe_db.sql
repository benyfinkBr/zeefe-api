-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 26/11/2025 às 08:56
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
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `admins`
--

INSERT IGNORE INTO `admins` (`id`, `username`, `email`, `password`, `created_at`) VALUES
(1, '123', 'admin@zeefe.com.br', '321', '2025-10-30 22:36:01');

-- --------------------------------------------------------

--
-- Estrutura para tabela `advertisers`
--

CREATE TABLE IF NOT EXISTS `advertisers` (
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

INSERT IGNORE INTO `advertisers` (`id`, `owner_type`, `owner_id`, `bank_code`, `display_name`, `full_name`, `login_email`, `login_cpf`, `contact_phone`, `password_hash`, `email_verified_at`, `verification_token`, `verification_token_expires`, `last_login`, `status`, `fee_pct`, `bank_name`, `account_type`, `agency_number`, `account_number`, `pix_key`, `created_at`, `updated_at`) VALUES
(1, 'client', 0, NULL, 'MZF', 'Mira Zlotnik', 'benyfinkelstein@gmail.com', '41836484836', NULL, '$2y$10$coY86ax3NyQXEr1DAE4Q4uX6JMCV6LAI.gAHpLTdZ2Q7MdCTO.nW6', '2025-11-16 22:46:54', NULL, NULL, '2025-11-24 09:38:42', 'ativo', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-16 22:46:39', '2025-11-16 22:46:54');

-- --------------------------------------------------------

--
-- Estrutura para tabela `advertiser_remember_tokens`
--

CREATE TABLE IF NOT EXISTS `advertiser_remember_tokens` (
  `id` int(11) NOT NULL,
  `advertiser_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `advertiser_remember_tokens`
--

INSERT IGNORE INTO `advertiser_remember_tokens` (`id`, `advertiser_id`, `token_hash`, `user_agent`, `created_at`, `expires_at`) VALUES
(1, 1, '1a7e21637d97c739c6b3ad9bcdd18708e8400441963d0e1ea1802bbe4b7c338d', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-19 07:07:30', '2025-11-20 07:07:30'),
(2, 1, 'a1f8fb48845c5accd70843be168222017e3f81a5dfa3fe8b5080fbada014584d', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-19 08:21:01', '2025-11-20 08:21:01'),
(3, 1, '1a911af8850c4580a306445eaec2ebd986edbd9e4b0eec480e77a1f07fc4e7b1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-19 14:16:44', '2025-11-20 14:16:44'),
(4, 1, '1ca83f8af90850328b73cb4fcc34724dded93f1aee33dec924e3cdfacee9931c', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-22 22:12:57', '2025-11-23 22:12:57'),
(5, 1, 'eeb6b46a9c6058b43205d2653876b6f72fdfb66fd6737805158b3689c8ca1309', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-24 09:38:42', '2025-11-25 09:38:42');

-- --------------------------------------------------------

--
-- Estrutura para tabela `amenities`
--

CREATE TABLE IF NOT EXISTS `amenities` (
  `id` bigint(20) NOT NULL,
  `name` varchar(120) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `status` enum('ativo','inativo') COLLATE utf8_unicode_ci DEFAULT 'ativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `amenities`
--

INSERT IGNORE INTO `amenities` (`id`, `name`, `description`, `status`) VALUES
(1, 'Café', 'Café e bebidas', 'ativo'),
(2, 'Projetor', 'Projetor multimídia', 'ativo'),
(3, 'Quadro Branco', 'Quadro para anotações', 'ativo'),
(4, 'WiFI', '', 'ativo');

-- --------------------------------------------------------

--
-- Estrutura para tabela `associates`
--

CREATE TABLE IF NOT EXISTS `associates` (
  `client_id` bigint(20) NOT NULL,
  `visitor_id` bigint(20) NOT NULL,
  `label` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `associates`
--

INSERT IGNORE INTO `associates` (`client_id`, `visitor_id`, `label`, `created_at`) VALUES
(1, 1, 'Equipe Projeto', '2025-10-23 21:58:21'),
(2, 2, 'Fornecedora', '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `clients`
--

CREATE TABLE IF NOT EXISTS `clients` (
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

INSERT IGNORE INTO `clients` (`id`, `company_id`, `company_role`, `name`, `email`, `email_verified_at`, `verification_token`, `verification_token_expires`, `password`, `login`, `password_hash`, `cpf`, `rg`, `phone`, `whatsapp`, `type`, `birth_date`, `profession`, `status`, `created_at`, `last_login`, `updated_at`) VALUES
(1, NULL, NULL, 'João Portal', 'benyfink2@gmail.com', NULL, NULL, NULL, NULL, 't1', '$2y$10$6HhXWEyNJPmbfCF8UO9QgeJZ9R6GNbz1qANimgFln/vcZVGl6cXAu', '12345678910', 'MG1234567', '11995676554', '11995676554', 'PF', '1990-03-11', 'Engenheiro', 'ativo', NULL, '2025-10-23 21:58:21', '2025-11-16 22:53:43'),
(2, 3, 'membro', 'Maria Silva', 'benyfink1@gmail.com', NULL, NULL, NULL, 'p1FzrF1jIPt', 'teste123', 'teste123', '32165498700', 'SP8888123', '11987654321', '11987654321', 'PF', '1991-09-21', 'Gerente', 'ativo', NULL, '2025-10-23 21:58:21', NULL),
(11, 1, 'membro', 'Beny', 'benyfink@gmail.com', '2025-11-08 16:25:10', NULL, NULL, 'Gafin123!', 'benyfink@gmail.com', '$2y$10$eDSwPkBIKEz3UsCl/f1gauFwlsiuQVbIxFHVqvKwXROVGeC/4RE8q', '37333590895', '', '', '', 'PF', NULL, NULL, 'ativo', NULL, NULL, '2025-11-10 14:45:02'),
(14, NULL, 'membro', 'Mira Finkelstien', 'benyfinkelstein@gmail.com', '2025-11-16 23:12:37', NULL, NULL, NULL, 'benyfinkelstein@gmail.com', '$2y$10$PyXHQGc5J64t06pWB.pg9OdwTyXWtUfnXlud2/D1XxEW46I9fwwD.', '41836484836', NULL, NULL, NULL, 'PF', NULL, NULL, 'ativo', '2025-11-16 23:12:27', NULL, '2025-11-16 23:12:37');

-- --------------------------------------------------------

--
-- Estrutura para tabela `client_remember_tokens`
--

CREATE TABLE IF NOT EXISTS `client_remember_tokens` (
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

INSERT IGNORE INTO `client_remember_tokens` (`id`, `client_id`, `token_hash`, `user_agent`, `created_at`, `expires_at`) VALUES
(1, 11, '29f773e870b08e3dc33f10a91f795ad1a70722b49296b174224d0973273fa5c7', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-19 07:00:51', '2025-11-20 07:00:51'),
(2, 11, '5ad5b3e5806922571b4ab4f9e6d9780529d801abeeb9b6f99727ba6ed4297330', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-22 22:14:43', '2025-11-23 22:14:43'),
(3, 11, 'cd1864098168f20e4d9f54da77ca31e71a87135efde4eb2894931242cbd14219', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-24 09:12:03', '2025-11-25 09:12:03');

-- --------------------------------------------------------

--
-- Estrutura para tabela `companies`
--

CREATE TABLE IF NOT EXISTS `companies` (
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

INSERT IGNORE INTO `companies` (`id`, `razao_social`, `nome_fantasia`, `cnpj`, `inscricao_estadual`, `street`, `number`, `complement`, `zip_code`, `city`, `state`, `email`, `phone`, `whatsapp`, `master_client_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Empresa Exemplo LTDA', 'Exemplo', '12.345.678/0001-99', '123456', 'Rua Alfa', '100', 'Sala 501', '01234-567', 'São Paulo', 'SP', 'contato@exemplo.com', '1133224455', '', 11, 'ativo', '2025-10-23 21:58:21', '2025-11-10 14:45:02'),
(3, 'Bla bla farma', 'bka bka', '12.311.111/1111-11', '', '', '111', '', '', '123', 'AC', '321@123.com', '(12) 31111-1111', '(12) 31111-1111', NULL, 'ativo', NULL, '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Estrutura para tabela `company_employees`
--

CREATE TABLE IF NOT EXISTS `company_employees` (
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

INSERT IGNORE INTO `company_employees` (`id`, `company_id`, `full_name`, `rg`, `email`, `whatsapp`, `status`, `import_batch_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'Fernanda Souza', 'SP009988', 'fernanda@empresa.com', '11933332222', 'ativo', NULL, '2025-10-23 21:58:21', '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `company_invitations`
--

CREATE TABLE IF NOT EXISTS `company_invitations` (
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

CREATE TABLE IF NOT EXISTS `events` (
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

CREATE TABLE IF NOT EXISTS `feedback_nps` (
  `reservation_id` bigint(20) NOT NULL,
  `score` tinyint(4) NOT NULL,
  `comment` text COLLATE utf8_unicode_ci,
  `would_recommend` tinyint(1) DEFAULT NULL,
  `collected_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `feedback_nps`
--

INSERT IGNORE INTO `feedback_nps` (`reservation_id`, `score`, `comment`, `would_recommend`, `collected_at`) VALUES
(1, 9, 'Ótima sala, café excelente.', 1, '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `import_batches`
--

CREATE TABLE IF NOT EXISTS `import_batches` (
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

INSERT IGNORE INTO `import_batches` (`id`, `company_id`, `file_name`, `total_rows`, `processed_rows`, `status`, `created_at`, `finished_at`) VALUES
(1, 1, 'import1.xlsx', 4, 4, 'concluido', '2025-10-23 21:58:21', '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `ledger_entries`
--

CREATE TABLE IF NOT EXISTS `ledger_entries` (
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

INSERT IGNORE INTO `ledger_entries` (`id`, `advertiser_id`, `reservation_id`, `type`, `description`, `amount`, `status`, `available_at`, `paid_at`, `txid`, `created_at`) VALUES
(1, 1, 21, 'credito', 'Crédito de reserva #21', 1275.00, 'pendente', '2025-12-16 23:14:00', NULL, NULL, '2025-11-16 23:14:00');

-- --------------------------------------------------------

--
-- Estrutura para tabela `messages`
--

CREATE TABLE IF NOT EXISTS `messages` (
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

INSERT IGNORE INTO `messages` (`id`, `thread_id`, `sender_type`, `body`, `attachment_url`, `created_at`, `read_by_client_at`, `read_by_advertiser_at`) VALUES
(1, 1, 'client', 'Oi, tudo bem?', NULL, '2025-11-16 22:56:00', '2025-11-16 22:56:01', '2025-11-16 22:57:38'),
(2, 1, 'advertiser', 'td 4 vc', NULL, '2025-11-16 22:57:54', '2025-11-16 22:58:21', '2025-11-16 22:57:54'),
(3, 1, 'client', 'Oi!', NULL, '2025-11-16 22:58:28', '2025-11-16 22:58:28', '2025-11-16 22:58:29'),
(4, 1, 'advertiser', 'HUHUHUHUHUHU', NULL, '2025-11-16 22:58:35', '2025-11-16 22:58:42', '2025-11-16 22:58:35'),
(5, 2, 'client', 'Teste123', NULL, '2025-11-16 23:14:18', '2025-11-16 23:14:18', '2025-11-16 23:14:31'),
(6, 2, 'client', 'meu telefone é [contato oculto]', NULL, '2025-11-16 23:15:37', '2025-11-16 23:15:37', '2025-11-17 08:30:21'),
(7, 5, 'client', 'Oi', NULL, '2025-11-19 08:25:45', '2025-11-19 08:25:46', NULL),
(8, 5, '', 'teste', NULL, '2025-11-19 17:49:12', '2025-11-19 17:49:17', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `message_threads`
--

CREATE TABLE IF NOT EXISTS `message_threads` (
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

INSERT IGNORE INTO `message_threads` (`id`, `room_id`, `reservation_id`, `client_id`, `advertiser_id`, `created_at`, `last_message_at`) VALUES
(1, 1, 19, 11, 1, '2025-11-16 22:55:51', '2025-11-16 22:58:35'),
(2, 1, 21, 14, 1, '2025-11-16 23:14:13', '2025-11-16 23:15:37'),
(5, NULL, NULL, 11, NULL, '2025-11-19 07:57:24', '2025-11-19 17:49:12');

-- --------------------------------------------------------

--
-- Estrutura para tabela `notification_logs`
--

CREATE TABLE IF NOT EXISTS `notification_logs` (
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

INSERT IGNORE INTO `notification_logs` (`id`, `reservation_id`, `rule_id`, `recipient_type`, `recipient`, `channel`, `status`, `payload_json`, `sent_at`, `created_at`) VALUES
(1, 1, 1, 'concierge', 'portaria@exemplo.com', 'email', 'sent', '{\"msg\": \"Bom dia\"}', '2025-10-23 21:58:21', '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `notification_rules`
--

CREATE TABLE IF NOT EXISTS `notification_rules` (
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

INSERT IGNORE INTO `notification_rules` (`id`, `type`, `active`, `schedule_cron`, `channel`, `template_id`, `created_at`, `updated_at`) VALUES
(1, 'concierge_daily', 1, '05:00 America/Sao_Paulo', 'email', 'TEMPLATE01', '2025-10-23 21:58:21', '2025-10-23 21:58:21'),
(2, 'visitors_reminder', 1, NULL, 'email,whatsapp', 'TEMPLATE02', '2025-10-23 21:58:21', '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `panel_users`
--

CREATE TABLE IF NOT EXISTS `panel_users` (
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

INSERT IGNORE INTO `panel_users` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Admin Master', 'admin@zeefe.com', 'senhamaster', 'admin', 'ativo', '2025-10-23 21:58:21', '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `payments`
--

CREATE TABLE IF NOT EXISTS `payments` (
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
-- Estrutura para tabela `payment_intents`
--

CREATE TABLE IF NOT EXISTS `payment_intents` (
  `id` bigint(20) unsigned NOT NULL,
  `context` enum('reservation','workshop') COLLATE utf8_unicode_ci NOT NULL,
  `context_id` bigint(20) unsigned NOT NULL,
  `pagarme_order_id` varchar(80) COLLATE utf8_unicode_ci DEFAULT NULL,
  `pagarme_payment_id` varchar(80) COLLATE utf8_unicode_ci DEFAULT NULL,
  `checkout_url` text COLLATE utf8_unicode_ci,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('pending','paid','failed','canceled','expired') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'pending',
  `metadata` text COLLATE utf8_unicode_ci,
  `expires_at` datetime DEFAULT NULL,
  `last_payload` longtext COLLATE utf8_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pagarme_events`
--

CREATE TABLE IF NOT EXISTS `pagarme_events` (
  `id` bigint(20) unsigned NOT NULL,
  `hook_id` varchar(64) COLLATE utf8_unicode_ci DEFAULT NULL,
  `event_type` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  `status_code` int(11) DEFAULT NULL,
  `status_text` varchar(120) COLLATE utf8_unicode_ci DEFAULT NULL,
  `entity` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `context_id` bigint(20) DEFAULT NULL,
  `payload` longtext COLLATE utf8_unicode_ci NOT NULL,
  `received_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `customer_cards`
--

CREATE TABLE IF NOT EXISTS `customer_cards` (
  `id` bigint(20) unsigned NOT NULL,
  `client_id` bigint(20) NOT NULL,
  `pagarme_customer_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pagarme_card_id` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last4` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exp_month` int(11) DEFAULT NULL,
  `exp_year` int(11) DEFAULT NULL,
  `holder_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `payments`
--

INSERT IGNORE INTO `payments` (`id`, `reservation_id`, `method`, `amount`, `status`, `transaction_code`, `paid_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'pix', 500.00, 'pago', 'TRXPAY9172', '2025-10-23 21:58:21', '2025-10-23 21:58:21', '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `payouts`
--

CREATE TABLE IF NOT EXISTS `payouts` (
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
-- Estrutura para tabela `posts`
--

CREATE TABLE IF NOT EXISTS `posts` (
  `id` int(11) NOT NULL,
  `slug` varchar(160) NOT NULL,
  `title` varchar(200) NOT NULL,
  `summary` varchar(300) DEFAULT NULL,
  `content` mediumtext,
  `category` varchar(80) DEFAULT NULL,
  `status` enum('rascunho','publicado','arquivado') NOT NULL DEFAULT 'rascunho',
  `cover_path` varchar(255) DEFAULT NULL,
  `author_name` varchar(120) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pre_reservations`
--

CREATE TABLE IF NOT EXISTS `pre_reservations` (
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

INSERT IGNORE INTO `pre_reservations` (`id`, `room_id`, `client_id`, `company_id`, `contact_name`, `contact_email`, `contact_phone`, `date`, `notes`, `status`, `converted_reservation_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'Fernando', 'fernando@pre.com', '11988776655', '2025-10-28', 'Pré para semana seguinte', 'em_analise', NULL, '2025-10-23 21:58:21', '2025-10-23 21:58:21'),
(2, NULL, NULL, 1, 'Anônimo', 'contato@anonimo.com', '11988888888', '2025-11-01', 'Sem sala', 'aberta', NULL, '2025-10-23 21:58:21', '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `reservations`
--

CREATE TABLE IF NOT EXISTS `reservations` (
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
  `updated_at` datetime DEFAULT NULL,
  `public_code` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `reservations`
--

INSERT IGNORE INTO `reservations` (`id`, `room_id`, `client_id`, `participants`, `price`, `company_id`, `title`, `description`, `date`, `time_start`, `time_end`, `total_price`, `amount_gross`, `voucher_code`, `voucher_amount`, `fee_pct_at_time`, `fee_amount`, `amount_net`, `attendees_count`, `requirements`, `observations`, `status`, `payment_status`, `hold_expires_at`, `notes`, `created_at`, `updated_at`, `public_code`) VALUES
(1, 1, 2, 1, 0.00, 1, 'Reunião Diretoria', 'Pauta estratégica', '2025-10-30', '00:00:00', '00:00:00', 500.00, NULL, NULL, NULL, NULL, NULL, NULL, 5, 'Café, Projetor', '', 'cancelada', 'pendente', NULL, '', '2025-10-23 21:58:21', '2025-11-01 23:33:54', 'ZF-68TK-8U89MZ'),
(18, 1, 11, 1, 0.00, NULL, 'teste', '123', '2025-11-12', '08:00:00', '20:00:00', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'cancelada', 'confirmado', '2025-11-10 10:58:48', NULL, NULL, '2025-11-09 16:17:01', 'ZF-GDER-DWQWJW'),
(19, 1, 11, 1, 0.00, NULL, 'teste', '', '2025-11-11', '08:00:00', '20:00:00', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'confirmada', 'confirmado', '2025-11-10 20:54:36', NULL, NULL, '2025-11-09 21:08:32', 'ZF-55AV-MAECDD'),
(20, 1, 11, 1, 0.00, 1, 'Sabc', '', '2025-11-25', '08:00:00', '20:00:00', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'confirmada', 'confirmado', '2025-11-11 21:42:01', NULL, NULL, '2025-11-10 21:42:30', 'ZF-KZ26-VKLULM'),
(21, 1, 14, 1, 0.00, NULL, '123', '321', '2025-11-26', '08:00:00', '20:00:00', 0.00, 1500.00, NULL, NULL, 15.00, 225.00, 1275.00, 0, NULL, NULL, 'confirmada', 'confirmado', '2025-11-17 23:13:38', NULL, NULL, '2025-11-16 23:14:00', 'ZF-YD29-NNS5SN'),
(22, 1, 11, 1, 0.00, NULL, '123', '', '2025-11-27', '08:00:00', '20:00:00', 0.00, NULL, 'ZEF-4T5DUVYCSH', 1500.00, NULL, NULL, NULL, 0, NULL, NULL, 'cancelada', 'pendente', NULL, NULL, NULL, '2025-11-24 09:36:40', 'ZF-FPJH-68C7UR'),
(23, 1, 11, 1, 0.00, NULL, '123', '', '2025-11-27', '08:00:00', '20:00:00', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'cancelada', 'pendente', NULL, NULL, NULL, '2025-11-24 09:36:52', 'ZF-MKY9-QK3JKE'),
(24, 1, 11, 1, 0.00, NULL, '132', '', '2025-11-19', '08:00:00', '20:00:00', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'pendente', 'pendente', NULL, NULL, NULL, NULL, 'ZF-HK7V-XJ6JTC'),
(25, 4, 11, 1, 0.00, NULL, '321', '', '2025-11-18', '08:00:00', '20:00:00', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'pendente', 'pendente', NULL, NULL, NULL, NULL, 'ZF-KBCL-RD49N4');

-- --------------------------------------------------------

--
-- Estrutura para tabela `reservation_visitors`
--

CREATE TABLE IF NOT EXISTS `reservation_visitors` (
  `reservation_id` bigint(20) NOT NULL,
  `visitor_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `reservation_visitors`
--

INSERT IGNORE INTO `reservation_visitors` (`reservation_id`, `visitor_id`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `reviews`
--

CREATE TABLE IF NOT EXISTS `reviews` (
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

CREATE TABLE IF NOT EXISTS `rooms` (
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

INSERT IGNORE INTO `rooms` (`id`, `name`, `capacity`, `description`, `street`, `complement`, `cep`, `city`, `state`, `responsavel_nome`, `responsavel_telefone`, `responsavel_email`, `portaria_telefone`, `portaria_email`, `portaria_inteligente`, `dailyrate`, `daily_rate`, `location`, `lat`, `lon`, `status`, `maintenance_start`, `maintenance_end`, `deactivated_from`, `photo_path`, `facilitated_access`, `created_at`, `updated_at`, `advertiser_id`) VALUES
(1, 'Rouxinol', 10, 'Sala ampla para reuniões', 'Avenida Rouxinol, 84', '', '04516000', 'São Paulo', 'SP', 'Beny', '', '', '', '', 'Sim', 0.00, 1500.00, 'Cj 78', -23.6012764, -46.6734966, 'ativo', NULL, NULL, NULL, 'img/rooms/1/room_1_69094e2f497e46.00067241.jpg,img/rooms/1/room_1_69094e2f4991f7.94708361.jpg,img/rooms/1/room_1_69094e2f499f78.19329601.jpg,img/rooms/1/room_1_69094e2f49ab71.36026958.jpg,img/rooms/1/room_1_69094e2f49b846.75551922.jpg', 0, '2025-10-23 21:58:21', '2025-11-17 22:07:17', 1),
(4, 'Teste', 0, '', 'Avenida Eucaliptos, 165', '', '04517-050', '', '', '', '', '', '', '', 'Sim', NULL, 0.00, '123', -23.6059551, -46.6736896, 'ativo', NULL, NULL, NULL, NULL, 1, NULL, '2025-11-17 22:05:36', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `room_amenities`
--

CREATE TABLE IF NOT EXISTS `room_amenities` (
  `room_id` bigint(20) NOT NULL,
  `amenity_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `room_amenities`
--

INSERT IGNORE INTO `room_amenities` (`room_id`, `amenity_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4);

-- --------------------------------------------------------

--
-- Estrutura para tabela `room_photos`
--

CREATE TABLE IF NOT EXISTS `room_photos` (
  `id` int(11) NOT NULL,
  `room_id` bigint(20) NOT NULL,
  `file_path` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `room_ratings`
--

CREATE TABLE IF NOT EXISTS `room_ratings` (
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

CREATE TABLE IF NOT EXISTS `visitors` (
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

INSERT IGNORE INTO `visitors` (`id`, `client_id`, `company_id`, `name`, `rg`, `cpf`, `email`, `invite_token`, `invite_status`, `phone`, `whatsapp`, `status`, `observations`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Felipe Visitante', 'SP123456', '', 'benyfinkelstein@gmail.com', NULL, 'pendente', '11911112222', '', 'ativo', '', '2025-10-23 21:58:21', '2025-10-23 21:58:21'),
(2, 1, 1, 'Luciana Visita', '', '', 'luciana@visitante.com', NULL, 'pendente', '11912345678', '', 'inativo', 'Trazer CPF', '2025-10-23 21:58:21', '2025-10-23 21:58:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `vouchers`
--

CREATE TABLE IF NOT EXISTS `vouchers` (
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
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `discount_owner` enum('platform_only','advertiser_only','split_equal','platform_first','advertiser_first') NOT NULL DEFAULT 'split_equal'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `vouchers`
--

INSERT IGNORE INTO `vouchers` (`id`, `code`, `type`, `value`, `valid_from`, `valid_to`, `max_redemptions`, `used_count`, `min_amount`, `room_id`, `status`, `created_at`, `updated_at`, `discount_owner`) VALUES
(1, 'ZEF-4T5DUVYCSH', 'percent', 100.00, '2025-11-18 00:00:00', '2025-11-20 00:00:00', 0, 0, NULL, 0, 'ativo', '2025-11-17 21:10:28', '2025-11-19 21:03:54', ''),
(2, 'ZEF-GHGGCPCSHP', 'percent', 5.00, NULL, NULL, NULL, 0, NULL, 0, 'ativo', '2025-11-19 17:48:31', NULL, '');

-- --------------------------------------------------------

--
-- Estrutura para tabela `voucher_redemptions`
--

CREATE TABLE IF NOT EXISTS `voucher_redemptions` (
  `id` int(11) NOT NULL,
  `voucher_id` int(11) NOT NULL,
  `reservation_id` int(11) DEFAULT NULL,
  `client_id` int(11) DEFAULT NULL,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `workshops`
--

CREATE TABLE IF NOT EXISTS `workshops` (
  `id` int(11) NOT NULL,
  `public_code` varchar(64) DEFAULT NULL,
  `advertiser_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `title` varchar(160) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text,
  `category` varchar(80) DEFAULT NULL,
  `date` date NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL,
  `price_per_seat` decimal(10,2) NOT NULL DEFAULT '0.00',
  `max_seats` int(11) NOT NULL DEFAULT '0',
  `show_sold_bar` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('rascunho','publicado','cancelado','concluido') NOT NULL DEFAULT 'rascunho',
  `banner_path` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `workshops`
--

INSERT IGNORE INTO `workshops` (`id`, `public_code`, `advertiser_id`, `room_id`, `title`, `subtitle`, `description`, `category`, `date`, `time_start`, `time_end`, `price_per_seat`, `max_seats`, `show_sold_bar`, `status`, `banner_path`, `created_at`, `updated_at`) VALUES
(1, NULL, 1, 1, 'Teste', NULL, '<b>MEIA ENTRADA ESTUDANTES </b><div><br></div><div>\n\nEstudantes do território nacional de instituições públicas ou particulares do ensino infantil, fundamental, <b>médio, superior,</b> especialização, pós-graduação, mestrado, doutorado, supletivo e técnico profissionalizante, seja ensino presencial ou à distância, possuem o benefício da meia-entrada.  Fonte: Lei 12.933, Lei Federal 12.852, de 26 de dezembro de 2013 e Decreto Federal 8.537, de 05 de outubro de 2015.\n\nCaso não apresente na portaria o documento que comprove o beneficio, será cobrado o complemento de meia para igualar a categoria do ingresso de interia.\n\nJOVENS DE 15 A 29 ANOS PERTENCENTES A FAMÍLIAS DE BAIXA RENDA \n\nJovens 15 a 29 anos pertencentes a famílias de baixa renda possuem o benefício de meia-entrada, desde que estejam inscritos, obrigatoriamente, no Cadastro Único para Programas Sociais do Governo Federal (CADÚNICO), e cuja renda mensal seja de até 02 (dois) salários mínimos.  Como comprovar: apresentação obrigatória da Carteirinha de Identidade Jovem, emitida pela Secretaria Nacional de Juventude, e o Documento de Identidade oficial com foto, expedido por órgão público e válido em todo território nacional, original ou cópia autenticada. Fonte: Lei Federal 12. 933, de 26 de dezembro de 2013 e Decreto 8.537, de 5 de outubro de 2015\n\nPcD – PESSOA COM DEFICIÊNCIA  \n\nPessoas com deficiência (PcD) possuem o benefício da meia-entrada. Se o PcD necessita de auxílio para locomoção, a meia-entrada também se estende ao seu acompanhante, sendo permitido apenas um acompanhante pagando meia-entrada para cada PcD.  Como comprovar: apresentação obrigatória do cartão de Benefício de Prestação Continuada da Assistência Social da pessoa com deficiência ou de documento emitido pelo Instituto Nacional do Seguro Social - INSS que ateste a aposentadoria de acordo com os critérios estabelecidos na Lei Complementar nº 142, de 8 de maio de 2013; em ambos os casos estes documentos devem ser acompanhados de um Documento de Identidade oficial com foto, expedido por órgão público e válido em todo território nacional, original ou cópia autenticada. Fonte: Lei Federal 12.933, de 26 de dezembro de 2013 e Decreto 8.537, de 5 de outubro de 2015\n\nIDOSOS (ADULTOS COM IDADE IGUAL OU SUPERIOR A 60 ANOS) \n\nAdultos com idade igual ou superior a 60 anos possuem o benefício da meia-entrada.  Como comprovar:  apresentação obrigatória do Documento de Identidade original (RG) ou cópia autenticada. Fonte: Lei Federal 10.741 de 01 de outubro de 2003\n\nMENORES DE 21 ANOS DO MUNICÍPIO DE BELO HORIZONTE \n\nMenores de 21 anos do Município de Belo Horizonte possuem o benefício da meia-entrada.  Como comprovar: apresentação obrigatória do Documento de Identidade oficial com foto, expedido por órgão público e válido em todo território nacional, original ou cópia autenticada. Fonte: Lei Municipal 9.070, de 17 janeiro de 2005\n\nOUTRAS INFORMAÇÕES IMPORTANTES \n\nO benefício da meia-entrada não é cumulativa com outros descontos A carteira estudantil provisória / voucher emitido pelos sites UNE, Ubes e Anpg são aceitos para compra de meia-entrada, desde que apresentados impressos Crianças de até 12 meses não pagam ingresso e devem permanecer no colo. \n\nO ingresso é válido somente para data, horário local e assento para o qual foi emitido.\n\nÓrgãos Responsáveis Pela Fiscalização\n\nProcon Estadual Telefone: (31) 3250-5033 Site: www.mp.mg.gov.br/procon E-mail:  proconcr@mp.mg.gov.br \n\nProcon Municipal Telefone: (31) 156 Site: www.pbh.gov.br/procon E-mail:  procon@pbh.gov.br \n\nProcon Assembleia Telefone: (31) 2108-5500 Site: www.almg.gov.br/procon E-mail:  procon@almg.gov.br \n\nProcon Assembleia – Posto Psiu Telefone: (31) 3272-0108 Site: www.almg.gov.br/procon E-mail:  procon@almg.gov.br \n\nProcon Câmara Municipal Telefone: (31) 3555-1268 E-mail:  procon@cmbh.mg.gov.br</div>', 'Negócios e carreira', '2025-11-24', '00:44:00', '03:44:00', 100.00, 15, 0, 'publicado', 'img/workshops/1/ws_1_69245462a548b8.17740968.jpg', '2025-11-22 22:44:30', '2025-11-24 10:24:49');

-- --------------------------------------------------------

--
-- Estrutura para tabela `workshop_enrollments`
--

CREATE TABLE IF NOT EXISTS `workshop_enrollments` (
  `id` int(11) NOT NULL,
  `workshop_id` int(11) NOT NULL,
  `participant_id` int(11) NOT NULL,
  `public_code` varchar(64) NOT NULL,
  `payment_status` enum('pendente','pago','cancelado') NOT NULL DEFAULT 'pendente',
  `voucher_code` varchar(64) DEFAULT NULL,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `checkin_status` enum('nao_lido','lido','cancelado') NOT NULL DEFAULT 'nao_lido',
  `checked_in_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `workshop_enrollments`
--

INSERT IGNORE INTO `workshop_enrollments` (`id`, `workshop_id`, `participant_id`, `public_code`, `payment_status`, `voucher_code`, `discount_amount`, `checkin_status`, `checked_in_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'W60ccf38ae9', 'pendente', NULL, 0.00, 'nao_lido', NULL, '2025-11-22 22:45:15', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `workshop_media`
--

CREATE TABLE IF NOT EXISTS `workshop_media` (
  `id` int(11) NOT NULL,
  `workshop_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura para tabela `workshop_participants`
--

CREATE TABLE IF NOT EXISTS `workshop_participants` (
  `id` int(11) NOT NULL,
  `name` varchar(160) NOT NULL,
  `email` varchar(160) NOT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `workshop_participants`
--

INSERT IGNORE INTO `workshop_participants` (`id`, `name`, `email`, `cpf`, `phone`, `password_hash`, `status`, `created_at`, `updated_at`) VALUES
(1, 'tesste', 'benyfink@gmail.com', NULL, NULL, NULL, 'ativo', '2025-11-22 22:45:15', NULL);

--
-- Índices para tabelas despejadas
--

DROP PROCEDURE IF EXISTS sp_add_index_if_not_exists;
DELIMITER $$
CREATE PROCEDURE sp_add_index_if_not_exists(
  IN in_table VARCHAR(128),
  IN in_index_name VARCHAR(128),
  IN in_index_type ENUM('PRIMARY','UNIQUE','INDEX'),
  IN in_columns TEXT
)
BEGIN
  DECLARE idx_exists INT DEFAULT 0;
  DECLARE ddl TEXT;

  IF in_index_type = 'PRIMARY' THEN
    SELECT COUNT(*) INTO idx_exists
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = in_table
      AND constraint_name = 'PRIMARY';
    IF idx_exists = 0 THEN
      SET ddl = CONCAT('ALTER TABLE `', in_table, '` ADD PRIMARY KEY (', in_columns, ')');
      PREPARE stmt FROM ddl;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
    END IF;
  ELSEIF in_index_type = 'UNIQUE' THEN
    SELECT COUNT(*) INTO idx_exists
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = in_table
      AND constraint_name = in_index_name;
    IF idx_exists = 0 THEN
      SET ddl = CONCAT('ALTER TABLE `', in_table, '` ADD UNIQUE KEY `', in_index_name, '` (', in_columns, ')');
      PREPARE stmt FROM ddl;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
    END IF;
  ELSE
    SELECT COUNT(*) INTO idx_exists
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = in_table
      AND index_name = in_index_name;
    IF idx_exists = 0 THEN
      SET ddl = CONCAT('ALTER TABLE `', in_table, '` ADD KEY `', in_index_name, '` (', in_columns, ')');
      PREPARE stmt FROM ddl;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
    END IF;
  END IF;
END$$
DELIMITER ;

CALL sp_add_index_if_not_exists('admins','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('admins','username','UNIQUE','`username`');
CALL sp_add_index_if_not_exists('admins','email','UNIQUE','`email`');

CALL sp_add_index_if_not_exists('advertisers','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('advertisers','uk_adv_owner','UNIQUE','`owner_type`,`owner_id`');
CALL sp_add_index_if_not_exists('advertisers','uk_advertisers_login_email','UNIQUE','`login_email`');
CALL sp_add_index_if_not_exists('advertisers','idx_adv_fee','INDEX','`fee_pct`');

CALL sp_add_index_if_not_exists('advertiser_remember_tokens','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('advertiser_remember_tokens','uniq_adv_token_hash','UNIQUE','`token_hash`');
CALL sp_add_index_if_not_exists('advertiser_remember_tokens','idx_adv_expires','INDEX','`advertiser_id`,`expires_at`');

CALL sp_add_index_if_not_exists('amenities','PRIMARY','PRIMARY','`id`');

CALL sp_add_index_if_not_exists('associates','PRIMARY','PRIMARY','`client_id`,`visitor_id`');
CALL sp_add_index_if_not_exists('associates','visitor_id','INDEX','`visitor_id`');

CALL sp_add_index_if_not_exists('clients','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('clients','email','UNIQUE','`email`');
CALL sp_add_index_if_not_exists('clients','login','UNIQUE','`login`');
CALL sp_add_index_if_not_exists('clients','idx_clients_verification_token','INDEX','`verification_token`');
CALL sp_add_index_if_not_exists('clients','idx_clients_company_id','INDEX','`company_id`');
CALL sp_add_index_if_not_exists('clients','idx_cli_email','INDEX','`email`');
CALL sp_add_index_if_not_exists('clients','idx_cli_cpf','INDEX','`cpf`');

CALL sp_add_index_if_not_exists('client_remember_tokens','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('client_remember_tokens','uniq_token_hash','UNIQUE','`token_hash`');
CALL sp_add_index_if_not_exists('client_remember_tokens','idx_client_expires','INDEX','`client_id`,`expires_at`');

CALL sp_add_index_if_not_exists('companies','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('companies','cnpj','UNIQUE','`cnpj`');
CALL sp_add_index_if_not_exists('companies','idx_companies_master_client','INDEX','`master_client_id`');
CALL sp_add_index_if_not_exists('companies','idx_comp_master','INDEX','`master_client_id`');

CALL sp_add_index_if_not_exists('company_employees','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('company_employees','company_id','INDEX','`company_id`');

CALL sp_add_index_if_not_exists('company_invitations','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('company_invitations','idx_inv_company_status','INDEX','`company_id`,`status`,`created_at`');
CALL sp_add_index_if_not_exists('company_invitations','idx_inv_email','INDEX','`invite_email`(120),`status`,`company_id`');

CALL sp_add_index_if_not_exists('events','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('events','idx_ev_event','INDEX','`event`,`ts`');
CALL sp_add_index_if_not_exists('events','idx_ev_room','INDEX','`room_id`,`ts`');
CALL sp_add_index_if_not_exists('events','idx_ev_client','INDEX','`client_id`,`ts`');

CALL sp_add_index_if_not_exists('feedback_nps','PRIMARY','PRIMARY','`reservation_id`');

CALL sp_add_index_if_not_exists('import_batches','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('import_batches','company_id','INDEX','`company_id`');

CALL sp_add_index_if_not_exists('ledger_entries','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('ledger_entries','idx_ledger_adv','INDEX','`advertiser_id`,`status`,`available_at`');
CALL sp_add_index_if_not_exists('ledger_entries','idx_ledger_res','INDEX','`reservation_id`');

CALL sp_add_index_if_not_exists('messages','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('messages','idx_msg_thread','INDEX','`thread_id`,`created_at`');

CALL sp_add_index_if_not_exists('message_threads','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('message_threads','idx_msg_room','INDEX','`room_id`');
CALL sp_add_index_if_not_exists('message_threads','idx_msg_res','INDEX','`reservation_id`');
CALL sp_add_index_if_not_exists('message_threads','idx_msg_part','INDEX','`client_id`,`advertiser_id`');
CALL sp_add_index_if_not_exists('message_threads','fk_msg_adv','INDEX','`advertiser_id`');
CALL sp_add_index_if_not_exists('message_threads','idx_threads_lastmsg','INDEX','`last_message_at`');

CALL sp_add_index_if_not_exists('notification_logs','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('notification_logs','reservation_id','INDEX','`reservation_id`');
CALL sp_add_index_if_not_exists('notification_logs','rule_id','INDEX','`rule_id`');

CALL sp_add_index_if_not_exists('notification_rules','PRIMARY','PRIMARY','`id`');

CALL sp_add_index_if_not_exists('panel_users','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('panel_users','email','UNIQUE','`email`');

CALL sp_add_index_if_not_exists('payments','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('payments','reservation_id','INDEX','`reservation_id`');

CALL sp_add_index_if_not_exists('payouts','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('payouts','idx_payouts_adv','INDEX','`advertiser_id`,`status`,`scheduled_at`');

CALL sp_add_index_if_not_exists('posts','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('posts','slug','UNIQUE','`slug`');
CALL sp_add_index_if_not_exists('posts','idx_posts_status','INDEX','`status`');
CALL sp_add_index_if_not_exists('posts','idx_posts_category','INDEX','`category`');
CALL sp_add_index_if_not_exists('posts','idx_posts_published','INDEX','`published_at`');

CALL sp_add_index_if_not_exists('pre_reservations','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('pre_reservations','room_id','INDEX','`room_id`');
CALL sp_add_index_if_not_exists('pre_reservations','client_id','INDEX','`client_id`');
CALL sp_add_index_if_not_exists('pre_reservations','company_id','INDEX','`company_id`');
CALL sp_add_index_if_not_exists('pre_reservations','converted_reservation_id','INDEX','`converted_reservation_id`');

CALL sp_add_index_if_not_exists('reservations','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('reservations','public_code','UNIQUE','`public_code`');
CALL sp_add_index_if_not_exists('reservations','idx_reservations_payment_status','INDEX','`payment_status`');
CALL sp_add_index_if_not_exists('reservations','idx_reservations_hold_expires','INDEX','`hold_expires_at`');
CALL sp_add_index_if_not_exists('reservations','idx_reservations_date','INDEX','`date`');
CALL sp_add_index_if_not_exists('reservations','idx_reservations_room','INDEX','`room_id`');
CALL sp_add_index_if_not_exists('reservations','idx_reservations_client','INDEX','`client_id`');
CALL sp_add_index_if_not_exists('reservations','idx_res_company','INDEX','`company_id`,`status`,`date`');
CALL sp_add_index_if_not_exists('reservations','idx_res_payment','INDEX','`payment_status`,`hold_expires_at`');

CALL sp_add_index_if_not_exists('reservation_visitors','PRIMARY','PRIMARY','`reservation_id`,`visitor_id`');
CALL sp_add_index_if_not_exists('reservation_visitors','visitor_id','INDEX','`visitor_id`');

CALL sp_add_index_if_not_exists('reviews','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('reviews','uk_review_once','UNIQUE','`reservation_id`');
CALL sp_add_index_if_not_exists('reviews','idx_review_room','INDEX','`room_id`,`status`');
CALL sp_add_index_if_not_exists('reviews','idx_review_client','INDEX','`client_id`');

CALL sp_add_index_if_not_exists('rooms','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('rooms','idx_rooms_location','INDEX','`location`');
CALL sp_add_index_if_not_exists('rooms','idx_rooms_capacity','INDEX','`capacity`');
CALL sp_add_index_if_not_exists('rooms','idx_rooms_advertiser','INDEX','`advertiser_id`');
CALL sp_add_index_if_not_exists('rooms','idx_rooms_geo','INDEX','`lat`,`lon`');

CALL sp_add_index_if_not_exists('room_amenities','PRIMARY','PRIMARY','`room_id`,`amenity_id`');
CALL sp_add_index_if_not_exists('room_amenities','amenity_id','INDEX','`amenity_id`');

CALL sp_add_index_if_not_exists('room_photos','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('room_photos','room_id','INDEX','`room_id`');

CALL sp_add_index_if_not_exists('room_ratings','PRIMARY','PRIMARY','`room_id`');

CALL sp_add_index_if_not_exists('visitors','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('visitors','client_id','INDEX','`client_id`');
CALL sp_add_index_if_not_exists('visitors','company_id','INDEX','`company_id`');
CALL sp_add_index_if_not_exists('visitors','idx_visitors_invite_token','INDEX','`invite_token`');

CALL sp_add_index_if_not_exists('vouchers','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('vouchers','uq_vouchers_code','UNIQUE','`code`');
CALL sp_add_index_if_not_exists('vouchers','idx_vouchers_status','INDEX','`status`');
CALL sp_add_index_if_not_exists('vouchers','idx_vouchers_room','INDEX','`room_id`');

CALL sp_add_index_if_not_exists('voucher_redemptions','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('voucher_redemptions','idx_redemptions_voucher','INDEX','`voucher_id`');
CALL sp_add_index_if_not_exists('voucher_redemptions','idx_redemptions_reservation','INDEX','`reservation_id`');
CALL sp_add_index_if_not_exists('voucher_redemptions','idx_redemptions_client','INDEX','`client_id`');

CALL sp_add_index_if_not_exists('customer_cards','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('customer_cards','idx_customer_cards_client','INDEX','`client_id`');
CALL sp_add_index_if_not_exists('customer_cards','uk_customer_card','UNIQUE','`client_id`,`pagarme_card_id`');

CALL sp_add_index_if_not_exists('workshops','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('workshops','public_code','UNIQUE','`public_code`');
CALL sp_add_index_if_not_exists('workshops','idx_workshop_advertiser','INDEX','`advertiser_id`');
CALL sp_add_index_if_not_exists('workshops','idx_workshop_room','INDEX','`room_id`');
CALL sp_add_index_if_not_exists('workshops','idx_workshop_date','INDEX','`date`');

CALL sp_add_index_if_not_exists('workshop_enrollments','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('workshop_enrollments','uk_workshop_enrollment_code','UNIQUE','`public_code`');
CALL sp_add_index_if_not_exists('workshop_enrollments','idx_workshop_enrollment_workshop','INDEX','`workshop_id`');
CALL sp_add_index_if_not_exists('workshop_enrollments','idx_workshop_enrollment_participant','INDEX','`participant_id`');
CALL sp_add_index_if_not_exists('workshop_enrollments','idx_workshop_enrollment_payment','INDEX','`payment_status`');

CALL sp_add_index_if_not_exists('workshop_media','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('workshop_media','idx_workshop_media_workshop','INDEX','`workshop_id`');

CALL sp_add_index_if_not_exists('workshop_participants','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('workshop_participants','uk_workshop_participant_email','UNIQUE','`email`');
CALL sp_add_index_if_not_exists('workshop_participants','idx_workshop_participant_cpf','INDEX','`cpf`');

CALL sp_add_index_if_not_exists('payment_intents','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('payment_intents','uniq_payment_intent_order','UNIQUE','`context`,`context_id`,`pagarme_order_id`');
CALL sp_add_index_if_not_exists('payment_intents','idx_payment_intent_order','INDEX','`pagarme_order_id`');
CALL sp_add_index_if_not_exists('payment_intents','idx_payment_intent_payment','INDEX','`pagarme_payment_id`');

CALL sp_add_index_if_not_exists('pagarme_events','PRIMARY','PRIMARY','`id`');
CALL sp_add_index_if_not_exists('pagarme_events','idx_pagarme_event_hook','INDEX','`hook_id`');
CALL sp_add_index_if_not_exists('pagarme_events','idx_pagarme_event_type','INDEX','`event_type`');
CALL sp_add_index_if_not_exists('pagarme_events','idx_pagarme_entity_context','INDEX','`entity`,`context_id`');

DROP PROCEDURE IF EXISTS sp_add_index_if_not_exists;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `message_threads`
--
ALTER TABLE `message_threads`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
-- AUTO_INCREMENT de tabela `payment_intents`
--
ALTER TABLE `payment_intents`
  MODIFY `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `customer_cards`
--
ALTER TABLE `customer_cards`
  MODIFY `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT de tabela `pagarme_events`
--
ALTER TABLE `pagarme_events`
  MODIFY `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `voucher_redemptions`
--
ALTER TABLE `voucher_redemptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `workshops`
--
ALTER TABLE `workshops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `workshop_enrollments`
--
ALTER TABLE `workshop_enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `workshop_media`
--
ALTER TABLE `workshop_media`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `workshop_participants`
--
ALTER TABLE `workshop_participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
