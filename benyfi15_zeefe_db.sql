-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 28/12/2025 às 20:02
-- Versão do servidor: 5.7.23-23
-- Versão do PHP: 8.1.34

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
(1, '123', 'admin@zeefe.com.br', '123', '2025-10-30 22:36:01');

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
(1, 'client', 0, NULL, 'MZF', 'Mira Zlotnik', 'benyfinkelstein@gmail.com', '41836484836', NULL, '$2y$10$coY86ax3NyQXEr1DAE4Q4uX6JMCV6LAI.gAHpLTdZ2Q7MdCTO.nW6', '2025-11-16 22:46:54', NULL, NULL, '2025-12-28 09:55:37', 'ativo', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-16 22:46:39', '2025-11-16 22:46:54');

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

--
-- Despejando dados para a tabela `advertiser_remember_tokens`
--

INSERT INTO `advertiser_remember_tokens` (`id`, `advertiser_id`, `token_hash`, `user_agent`, `created_at`, `expires_at`) VALUES
(2, 1, 'a1f8fb48845c5accd70843be168222017e3f81a5dfa3fe8b5080fbada014584d', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-19 08:21:01', '2025-11-20 08:21:01'),
(3, 1, '1a911af8850c4580a306445eaec2ebd986edbd9e4b0eec480e77a1f07fc4e7b1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-19 14:16:44', '2025-11-20 14:16:44'),
(4, 1, '1ca83f8af90850328b73cb4fcc34724dded93f1aee33dec924e3cdfacee9931c', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-22 22:12:57', '2025-11-23 22:12:57'),
(15, 1, '5dcb45eb2fd13cf63fb04b176c05f0ea0aa0a032d3bcf8a74b37c20bfa41ba06', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-23 07:52:36', '2025-12-24 07:52:36'),
(16, 1, 'f925575fb1960dc07ddf154d770cf8c999bd3cf3c56166bd4c02ec0364fc590e', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '2025-12-23 15:36:47', '2025-12-24 15:36:47'),
(17, 1, '05ca0bdfed6a9f71ce8740c68720cfe29a9eb7b1b1ad1d72a12aba58f05eebfd', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-25 19:08:17', '2025-12-26 19:08:17'),
(18, 1, '8ea5c27db410f9a0001c7e3a0a595407107dc0384e7e7367a67dfb70227e8858', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '2025-12-25 19:46:42', '2025-12-26 19:46:42'),
(19, 1, 'd15621c841e5a242fadf6ad230bb119563abaa5360fec7b16220b92625915be5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-25 19:55:24', '2025-12-26 19:55:24'),
(20, 1, '00775907a00d8c1984b44739a05cf794fcde00b91a9b4757b4dc717325f227c7', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '2025-12-25 21:19:01', '2025-12-26 21:19:01'),
(21, 1, '7992c390ae1c66b8d907b462c8880a85adf71657a03e9071bc208c2572d91aa1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-25 21:57:02', '2025-12-26 21:57:02'),
(22, 1, '599d89688c4269af75ed4e854e6baf2582024f5f5e93a549aa4affdf3fb07224', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-26 11:25:36', '2025-12-27 11:25:36'),
(23, 1, '89164060f59f7e38fd33e333559c2dc28bbaf7d7ecd739da85307999eefc0a1d', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '2025-12-26 11:30:06', '2025-12-27 11:30:06'),
(24, 1, '5bb01ddc631effc41d04d819133498b5554d9f22780ff65fdee4419ceb5683ca', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '2025-12-26 11:58:54', '2025-12-27 11:58:54'),
(25, 1, '426addae09cffb90930444e3efb71616d8676703a168db03fa811886968bc4ab', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '2025-12-26 12:36:40', '2025-12-27 12:36:40'),
(26, 1, 'd450da4bd3a7603380ee0f9afd4e4a150d5950cccd6859cb29db21e4aedf4cfa', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '2025-12-26 13:26:28', '2025-12-27 13:26:28'),
(27, 1, 'c2540c5bd7ca7e7e43d27d0b2bde5a2008834b8a2a9bde3e47b35ac9558276b6', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-27 09:33:17', '2025-12-28 09:33:17'),
(28, 1, '6f58e26fbaf8ce204719fffa9ec5bf5cfafcaad6c363be28f222230352e42615', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-27 21:47:50', '2025-12-28 21:47:50'),
(29, 1, '5ba6c6617ee3e95533767963c285ce386bcc18ac3aa88f3e1ea2e7ce8464b088', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-28 09:52:55', '2025-12-29 09:52:55'),
(30, 1, '22006e3e0e4ac5a80ee6a3be56e1447492f159becc301ad057d8dc5096dea987', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-28 09:55:37', '2025-12-29 09:55:37');

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

-- --------------------------------------------------------

--
-- Estrutura para tabela `clients`
--

CREATE TABLE `clients` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `company_role` enum('admin','gestor','membro','leitor') COLLATE utf8mb4_unicode_ci DEFAULT 'membro',
  `stripe_customer_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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

INSERT INTO `clients` (`id`, `company_id`, `company_role`, `stripe_customer_id`, `name`, `email`, `email_verified_at`, `verification_token`, `verification_token_expires`, `password`, `login`, `password_hash`, `cpf`, `rg`, `phone`, `whatsapp`, `type`, `birth_date`, `profession`, `status`, `created_at`, `last_login`, `updated_at`) VALUES
(26, NULL, 'membro', 'cus_TfzrwBc3nbZUrt', 'Beny Finkelstein', 'benyfink@zeefe.com.br', '2025-12-26 13:27:55', NULL, NULL, NULL, 'benyfink@zeefe.com.br', '$2y$10$iefG5QemENqQt8oJU10JQuhxVINdcfBXCjxViTCwU5XjRbWjAzFeq', '37333590895', NULL, NULL, NULL, 'PF', NULL, NULL, 'ativo', '2025-12-26 13:27:47', NULL, '2025-12-28 11:31:55'),
(27, NULL, 'membro', 'cus_TgQBcUNKCm1KcV', 'Mira', 'benyfink@gmail.com', '2025-12-27 16:40:14', NULL, NULL, NULL, 'benyfink@gmail.com', '$2y$10$LxhXED.JMa2gRiXOwIdoDuJis44lm0Jzh6xuKbNfjZg10VNbfLSYW', '41836484836', NULL, NULL, NULL, 'PF', NULL, NULL, 'ativo', '2025-12-27 16:39:46', NULL, '2025-12-27 22:37:46');

-- --------------------------------------------------------

--
-- Estrutura para tabela `client_addresses`
--

CREATE TABLE `client_addresses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) NOT NULL,
  `street` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `number` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `complement` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT 'BR',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `client_addresses`
--

INSERT INTO `client_addresses` (`id`, `client_id`, `street`, `number`, `complement`, `zip_code`, `city`, `state`, `country`, `created_at`, `updated_at`) VALUES
(0, 27, 'Avenida dos Eucaliptos', '165', '', '04517050', 'São Paulo', 'SP', 'BR', '2025-12-27 22:37:46', '2025-12-27 22:37:46'),
(0, 26, 'Avenida dos Eucaliptos', '165', '84', '04517050', 'São Paulo', 'SP', 'BR', '2025-12-28 11:31:55', '2025-12-28 11:31:55');

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
(23, 26, 'a5b64ca7c8c20cdd8d1228a97c78e812840ab3e3773c144726cdb124178c894b', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '2025-12-26 13:30:03', '2025-12-27 13:30:03'),
(24, 26, 'f40ab2dddedb7377f035dedeef496c01ceed8b9a1da4fb37c93307d3ac6317c6', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-26 13:31:52', '2025-12-27 13:31:52'),
(25, 26, '523a9eae0693942a582ae5dc6c8cb1634a90d4b55f9bdf1b750eb42193d4bd32', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-26 14:33:47', '2025-12-27 14:33:47'),
(26, 26, 'd10aedc4b6e19eab65697c634dfba7624b4562b7ecd28ca7d9ea7576a91c8f0d', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-26 20:25:53', '2025-12-27 20:25:53'),
(27, 26, '50dcd40a9587904e38fbde836c42b9b41d50ffa8b206968e1d8c2979e5e3728e', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-26 20:26:17', '2025-12-27 20:26:17'),
(28, 26, 'f93a2f48b7a8e7c1028834c455cb8993d7cb37ac0d645fea3788151da7122d68', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-27 14:33:21', '2025-12-28 14:33:21'),
(29, 26, '0c752577cf6853f44a3e1747cc3f6f9b0d6c4b951e759c9f01a2d3d60977510b', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '2025-12-27 14:34:31', '2025-12-28 14:34:31'),
(30, 26, '76d6070a77544a3a24073344ac9e778b7bdacccd4b6f5af0702dbf3b6cf8b8bf', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-27 16:36:10', '2025-12-28 16:36:10'),
(31, 26, 'fb49c970aed4684ea25e1565d4008f98b7f11c6392446404e6e4f85416e81391', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '2025-12-27 16:36:55', '2025-12-28 16:36:55'),
(32, 27, '8e170d95003168c7baaf46bf01279bf08d3ad88eefc7bd51fd143deaa3139e7e', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-27 16:40:40', '2025-12-28 16:40:40'),
(33, 27, '6fde3e906026633c4b0cf009d8e4fce0534e83d06fea906d56b62a2133e3ffc2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-27 16:43:17', '2025-12-28 16:43:17'),
(34, 26, '72739d925677a58d437b19c6e5b99c7bec04ad1d9402b875a3ae461ead4e82ba', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-27 17:09:59', '2025-12-28 17:09:59'),
(35, 27, '4cfe66af4b2fd41cf80ebf4a6c9f2aa49826f4ccb8cb13345eda79ab09cf5889', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-27 21:47:01', '2025-12-28 21:47:01'),
(36, 26, '932b1c729cba59340344349b0abcdec53af6f2ebf40271c4ea221bb8ce5085ae', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '2025-12-27 21:48:43', '2025-12-28 21:48:43'),
(37, 27, '331ca6852c8f18a126be36a30f401212e3eef424112b54704af59ea9fc512b83', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-28 18:22:42', '2025-12-29 18:22:42');

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
  `updated_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `companies`
--

INSERT INTO `companies` (`id`, `razao_social`, `nome_fantasia`, `cnpj`, `inscricao_estadual`, `street`, `number`, `complement`, `zip_code`, `city`, `state`, `email`, `phone`, `whatsapp`, `master_client_id`, `status`, `created_at`, `updated_at`, `is_active`) VALUES
(1, 'Empresa Exemplo LTDA', 'Exemplo', '12.345.678/0001-99', '123456', 'Rua Alfa', '100', 'Sala 501', '01234-567', 'São Paulo', 'SP', 'contato@exemplo.com', '1133224455', '', NULL, 'ativo', '2025-10-23 21:58:21', '2025-11-10 14:45:02', 1);

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
-- Estrutura para tabela `customer_cards`
--

CREATE TABLE `customer_cards` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) NOT NULL,
  `stripe_customer_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_payment_method_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pagarme_card_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fingerprint` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_zip` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
-- Despejando dados para a tabela `customer_cards`
--

INSERT INTO `customer_cards` (`id`, `client_id`, `stripe_customer_id`, `stripe_payment_method_id`, `pagarme_card_id`, `fingerprint`, `billing_name`, `billing_email`, `billing_zip`, `brand`, `last4`, `exp_month`, `exp_year`, `holder_name`, `status`, `created_at`, `updated_at`) VALUES
(11, 27, 'cus_TgQBcUNKCm1KcV', 'pm_1SjKDSRGALXK8tGEOh0QmBPs', NULL, 'Bqvvh7Ouk3nQbeB2', NULL, NULL, NULL, 'mastercard', '5454', 5, 2041, 'Mira', 'active', '2025-12-28 10:41:03', '2025-12-28 10:41:03');

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
(7, NULL, NULL, 26, NULL, '2025-12-26 13:30:11', NULL),
(8, NULL, NULL, 27, NULL, '2025-12-27 22:38:13', NULL);

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
  `updated_at` datetime DEFAULT NULL,
  `provider` varchar(20) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'stripe',
  `currency` varchar(10) COLLATE utf8_unicode_ci DEFAULT 'BRL',
  `amount_cents` int(10) UNSIGNED DEFAULT NULL,
  `stripe_payment_intent_id` varchar(80) COLLATE utf8_unicode_ci DEFAULT NULL,
  `stripe_charge_id` varchar(80) COLLATE utf8_unicode_ci DEFAULT NULL,
  `stripe_customer_id` varchar(80) COLLATE utf8_unicode_ci DEFAULT NULL,
  `stripe_payment_method_id` varchar(80) COLLATE utf8_unicode_ci DEFAULT NULL,
  `failure_code` varchar(80) COLLATE utf8_unicode_ci DEFAULT NULL,
  `failure_message` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `payments`
--

INSERT INTO `payments` (`id`, `reservation_id`, `method`, `amount`, `status`, `transaction_code`, `paid_at`, `created_at`, `updated_at`, `provider`, `currency`, `amount_cents`, `stripe_payment_intent_id`, `stripe_charge_id`, `stripe_customer_id`, `stripe_payment_method_id`, `failure_code`, `failure_message`) VALUES
(6, 72, 'cartao', 1100.00, 'pago', 'pi_3SjKEtRGALXK8tGE1rHL86s1', '2025-12-28 10:42:31', '2025-12-28 10:42:31', '2025-12-28 10:42:31', 'stripe', 'BRL', 110000, 'pi_3SjKEtRGALXK8tGE1rHL86s1', NULL, 'cus_TgQBcUNKCm1KcV', 'pm_1SjKDSRGALXK8tGEOh0QmBPs', NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `payment_intents`
--

CREATE TABLE `payment_intents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `context` enum('reservation','workshop') COLLATE utf8mb4_unicode_ci NOT NULL,
  `context_id` bigint(20) UNSIGNED NOT NULL,
  `pagarme_order_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pagarme_payment_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `checkout_url` text COLLATE utf8mb4_unicode_ci,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('pending','paid','failed','canceled','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `metadata` text COLLATE utf8mb4_unicode_ci,
  `expires_at` datetime DEFAULT NULL,
  `last_payload` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `stripe_payment_intent_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_setup_intent_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_checkout_session_id` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_client_secret` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_status` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `payment_intents`
--

INSERT INTO `payment_intents` (`id`, `context`, `context_id`, `pagarme_order_id`, `pagarme_payment_id`, `checkout_url`, `amount`, `status`, `metadata`, `expires_at`, `last_payload`, `created_at`, `updated_at`, `stripe_payment_intent_id`, `stripe_setup_intent_id`, `stripe_checkout_session_id`, `stripe_client_secret`, `stripe_status`) VALUES
(1, 'workshop', 22, 'or_amK1NxKi8BTPROMY', NULL, 'https://api.pagar.me/checkout/v1/orders/chk_qKjW1jWfmZsWO0ab', 1.00, 'pending', '{\"entity\":\"workshop\",\"enrollment_id\":22,\"workshop_id\":3}', '2025-12-03 18:24:06', '{\"id\":\"or_amK1NxKi8BTPROMY\",\"code\":\"workshop_22_1764710645\",\"amount\":100,\"currency\":\"BRL\",\"closed\":false,\"items\":[{\"id\":\"oi_OZKjaYMsyxh6jwRd\",\"type\":\"product\",\"description\":\"Workshop Evento teste 2 - Ze.EFE\",\"amount\":100,\"quantity\":1,\"status\":\"active\",\"created_at\":\"2025-12-02T21:24:06Z\",\"updated_at\":\"2025-12-02T21:24:06Z\",\"code\":\"workshop_22_1764710645\"}],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T20:39:07Z\",\"phones\":[]},\"status\":\"pending\",\"created_at\":\"2025-12-02T21:24:06Z\",\"updated_at\":\"2025-12-02T21:24:06Z\",\"checkouts\":[{\"id\":\"chk_qKjW1jWfmZsWO0ab\",\"currency\":\"BRL\",\"amount\":100,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_qKjW1jWfmZsWO0ab\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-02T21:24:06Z\",\"updated_at\":\"2025-12-02T21:24:06Z\",\"expires_at\":\"2026-01-31T21:24:06Z\",\"accepted_payment_methods\":[\"credit_card\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T20:39:07Z\",\"phones\":[]},\"credit_card\":{\"capture\":true,\"authentication\":{\"type\":\"none\",\"threed_secure\":[]},\"installments\":[{\"number\":1,\"total\":100}]},\"billing_address\":[],\"metadata\":{\"entity\":\"workshop\",\"enrollment_id\":\"22\",\"workshop_id\":\"3\"}},{\"id\":\"chk_vakQBDsRxcG3LKRq\",\"currency\":\"BRL\",\"amount\":100,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_vakQBDsRxcG3LKRq\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-02T21:24:06Z\",\"updated_at\":\"2025-12-02T21:24:06Z\",\"expires_at\":\"2026-01-31T21:24:06Z\",\"accepted_payment_methods\":[\"pix\",\"boleto\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T20:39:07Z\",\"phones\":[]},\"boleto\":{\"due_at\":\"2025-12-05T21:24:05Z\",\"instructions\":\"V\\u00e1lido por 3 dias ap\\u00f3s emiss\\u00e3o.\"},\"pix\":{\"expires_at\":\"2025-12-02T22:24:06Z\",\"additional_information\":[]},\"billing_address\":[],\"metadata\":{\"entity\":\"workshop\",\"enrollment_id\":\"22\",\"workshop_id\":\"3\"}}],\"metadata\":{\"entity\":\"workshop\",\"enrollment_id\":\"22\",\"workshop_id\":\"3\"}}', '2025-12-02 18:24:06', '2025-12-02 18:24:06', NULL, NULL, NULL, NULL, NULL),
(2, 'workshop', 23, 'or_GmdnKADFOzFEMQwx', NULL, 'https://api.pagar.me/checkout/v1/orders/chk_gD396rOTYfNe7lWM', 1.00, 'pending', '{\"entity\":\"workshop\",\"enrollment_id\":23,\"workshop_id\":3}', '2025-12-03 18:29:17', '{\"id\":\"or_GmdnKADFOzFEMQwx\",\"code\":\"workshop_23_1764710956\",\"amount\":100,\"currency\":\"BRL\",\"closed\":false,\"items\":[{\"id\":\"oi_7RVpPnM8FKSZz5GB\",\"type\":\"product\",\"description\":\"Workshop Evento teste 2 - Ze.EFE\",\"amount\":100,\"quantity\":1,\"status\":\"active\",\"created_at\":\"2025-12-02T21:29:17Z\",\"updated_at\":\"2025-12-02T21:29:17Z\",\"code\":\"workshop_23_1764710956\"}],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"status\":\"pending\",\"created_at\":\"2025-12-02T21:29:17Z\",\"updated_at\":\"2025-12-02T21:29:17Z\",\"checkouts\":[{\"id\":\"chk_gD396rOTYfNe7lWM\",\"currency\":\"BRL\",\"amount\":100,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_gD396rOTYfNe7lWM\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-02T21:29:17Z\",\"updated_at\":\"2025-12-02T21:29:17Z\",\"expires_at\":\"2026-01-31T21:29:17Z\",\"accepted_payment_methods\":[\"credit_card\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"credit_card\":{\"capture\":true,\"authentication\":{\"type\":\"none\",\"threed_secure\":[]},\"installments\":[{\"number\":1,\"total\":100}]},\"billing_address\":[],\"metadata\":{\"entity\":\"workshop\",\"enrollment_id\":\"23\",\"workshop_id\":\"3\"}},{\"id\":\"chk_x8qVRNNc83fJNVQE\",\"currency\":\"BRL\",\"amount\":100,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_x8qVRNNc83fJNVQE\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-02T21:29:17Z\",\"updated_at\":\"2025-12-02T21:29:17Z\",\"expires_at\":\"2026-01-31T21:29:17Z\",\"accepted_payment_methods\":[\"pix\",\"boleto\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"boleto\":{\"due_at\":\"2025-12-05T21:29:16Z\",\"instructions\":\"V\\u00e1lido por 3 dias ap\\u00f3s emiss\\u00e3o.\"},\"pix\":{\"expires_at\":\"2025-12-02T22:29:17Z\",\"additional_information\":[]},\"billing_address\":[],\"metadata\":{\"entity\":\"workshop\",\"enrollment_id\":\"23\",\"workshop_id\":\"3\"}}],\"metadata\":{\"entity\":\"workshop\",\"enrollment_id\":\"23\",\"workshop_id\":\"3\"}}', '2025-12-02 18:29:17', '2025-12-02 18:29:17', NULL, NULL, NULL, NULL, NULL),
(3, 'reservation', 32, 'or_2zxyGLtRQIMNe0rA', NULL, 'https://api.pagar.me/checkout/v1/orders/chk_GOAVA65HNAtqL4pn', 1500.00, 'pending', '{\"entity\":\"reservation\",\"reservation_id\":32}', '2025-12-03 18:30:25', '{\"id\":\"or_2zxyGLtRQIMNe0rA\",\"code\":\"reserva_32_1764711024\",\"amount\":150000,\"currency\":\"BRL\",\"closed\":false,\"items\":[{\"id\":\"oi_Yyw9QwmtEHqa3nqd\",\"type\":\"product\",\"description\":\"Reserva Rouxinol 31\\/12\\/2025\",\"amount\":150000,\"quantity\":1,\"status\":\"active\",\"created_at\":\"2025-12-02T21:30:25Z\",\"updated_at\":\"2025-12-02T21:30:25Z\",\"code\":\"reserva_32_1764711024\"}],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"status\":\"pending\",\"created_at\":\"2025-12-02T21:30:25Z\",\"updated_at\":\"2025-12-02T21:30:25Z\",\"checkouts\":[{\"id\":\"chk_GOAVA65HNAtqL4pn\",\"currency\":\"BRL\",\"amount\":150000,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_GOAVA65HNAtqL4pn\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-02T21:30:25Z\",\"updated_at\":\"2025-12-02T21:30:25Z\",\"expires_at\":\"2026-01-31T21:30:25Z\",\"accepted_payment_methods\":[\"credit_card\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"credit_card\":{\"capture\":true,\"authentication\":{\"type\":\"none\",\"threed_secure\":[]},\"installments\":[{\"number\":1,\"total\":150000}]},\"billing_address\":[],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"32\"}},{\"id\":\"chk_g15rkEnt4zHLKXMl\",\"currency\":\"BRL\",\"amount\":150000,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_g15rkEnt4zHLKXMl\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-02T21:30:25Z\",\"updated_at\":\"2025-12-02T21:30:25Z\",\"expires_at\":\"2026-01-31T21:30:25Z\",\"accepted_payment_methods\":[\"pix\",\"boleto\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"boleto\":{\"due_at\":\"2025-12-05T21:30:24Z\",\"instructions\":\"V\\u00e1lido por 3 dias ap\\u00f3s emiss\\u00e3o.\"},\"pix\":{\"expires_at\":\"2025-12-02T22:30:25Z\",\"additional_information\":[]},\"billing_address\":[],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"32\"}}],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"32\"}}', '2025-12-02 18:30:25', '2025-12-02 18:30:25', NULL, NULL, NULL, NULL, NULL),
(4, 'reservation', 28, 'or_RnBQLwei3bCDqe9W', NULL, 'https://api.pagar.me/checkout/v1/orders/chk_Ye4nZLxSXtP3ZvJV', 1500.00, 'pending', '{\"entity\":\"reservation\",\"reservation_id\":28}', '2025-12-03 20:12:40', '{\"id\":\"or_RnBQLwei3bCDqe9W\",\"code\":\"reserva_28_1764717160\",\"amount\":150000,\"currency\":\"BRL\",\"closed\":false,\"items\":[{\"id\":\"oi_YgdKXYAiesVJorO1\",\"type\":\"product\",\"description\":\"Reserva Rouxinol 30\\/11\\/2025\",\"amount\":150000,\"quantity\":1,\"status\":\"active\",\"created_at\":\"2025-12-02T23:12:40Z\",\"updated_at\":\"2025-12-02T23:12:40Z\",\"code\":\"reserva_28_1764717160\"}],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"status\":\"pending\",\"created_at\":\"2025-12-02T23:12:40Z\",\"updated_at\":\"2025-12-02T23:12:40Z\",\"checkouts\":[{\"id\":\"chk_Ye4nZLxSXtP3ZvJV\",\"currency\":\"BRL\",\"amount\":150000,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_Ye4nZLxSXtP3ZvJV\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-02T23:12:40Z\",\"updated_at\":\"2025-12-02T23:12:40Z\",\"expires_at\":\"2026-01-31T23:12:40Z\",\"accepted_payment_methods\":[\"credit_card\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"credit_card\":{\"capture\":true,\"authentication\":{\"type\":\"none\",\"threed_secure\":[]},\"installments\":[{\"number\":1,\"total\":150000}]},\"billing_address\":[],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"28\"}},{\"id\":\"chk_g15JxM7HV2uoNzP7\",\"currency\":\"BRL\",\"amount\":150000,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_g15JxM7HV2uoNzP7\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-02T23:12:40Z\",\"updated_at\":\"2025-12-02T23:12:40Z\",\"expires_at\":\"2026-01-31T23:12:40Z\",\"accepted_payment_methods\":[\"pix\",\"boleto\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"boleto\":{\"due_at\":\"2025-12-05T23:12:40Z\",\"instructions\":\"V\\u00e1lido por 3 dias ap\\u00f3s emiss\\u00e3o.\"},\"pix\":{\"expires_at\":\"2025-12-03T00:12:40Z\",\"additional_information\":[]},\"billing_address\":[],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"28\"}}],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"28\"}}', '2025-12-02 20:12:40', '2025-12-02 20:12:40', NULL, NULL, NULL, NULL, NULL),
(5, 'reservation', 32, 'or_4Orx4VlFeUznY892', NULL, 'https://api.pagar.me/checkout/v1/orders/chk_GOd48443UksQ8x6B', 1500.00, 'pending', '{\"entity\":\"reservation\",\"reservation_id\":32}', '2025-12-04 05:37:45', '{\"id\":\"or_4Orx4VlFeUznY892\",\"code\":\"reserva_32_1764751065\",\"amount\":150000,\"currency\":\"BRL\",\"closed\":false,\"items\":[{\"id\":\"oi_X01WV9Gu2BSPzv5Q\",\"type\":\"product\",\"description\":\"Reserva Rouxinol 31\\/12\\/2025\",\"amount\":150000,\"quantity\":1,\"status\":\"active\",\"created_at\":\"2025-12-03T08:37:45Z\",\"updated_at\":\"2025-12-03T08:37:45Z\",\"code\":\"reserva_32_1764751065\"}],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"status\":\"pending\",\"created_at\":\"2025-12-03T08:37:45Z\",\"updated_at\":\"2025-12-03T08:37:45Z\",\"checkouts\":[{\"id\":\"chk_GOd48443UksQ8x6B\",\"currency\":\"BRL\",\"amount\":150000,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_GOd48443UksQ8x6B\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-03T08:37:45Z\",\"updated_at\":\"2025-12-03T08:37:45Z\",\"expires_at\":\"2026-02-01T08:37:45Z\",\"accepted_payment_methods\":[\"credit_card\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"credit_card\":{\"capture\":true,\"authentication\":{\"type\":\"none\",\"threed_secure\":[]},\"installments\":[{\"number\":1,\"total\":150000}]},\"billing_address\":[],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"32\"}},{\"id\":\"chk_m4ZJNDT92FZvP30A\",\"currency\":\"BRL\",\"amount\":150000,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_m4ZJNDT92FZvP30A\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-03T08:37:45Z\",\"updated_at\":\"2025-12-03T08:37:45Z\",\"expires_at\":\"2026-02-01T08:37:45Z\",\"accepted_payment_methods\":[\"pix\",\"boleto\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"boleto\":{\"due_at\":\"2025-12-06T08:37:45Z\",\"instructions\":\"V\\u00e1lido por 3 dias ap\\u00f3s emiss\\u00e3o.\"},\"pix\":{\"expires_at\":\"2025-12-03T09:37:45Z\",\"additional_information\":[]},\"billing_address\":[],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"32\"}}],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"32\"}}', '2025-12-03 05:37:45', '2025-12-03 05:37:45', NULL, NULL, NULL, NULL, NULL),
(6, 'reservation', 32, 'or_mzk5k4EFd9s01vW4', NULL, 'https://api.pagar.me/checkout/v1/orders/chk_a4VOnwWTMbhVdLvw', 1500.00, 'pending', '{\"entity\":\"reservation\",\"reservation_id\":32}', '2025-12-04 05:38:06', '{\"id\":\"or_mzk5k4EFd9s01vW4\",\"code\":\"reserva_32_1764751086\",\"amount\":150000,\"currency\":\"BRL\",\"closed\":false,\"items\":[{\"id\":\"oi_3Kqde1lF8Sykd1a7\",\"type\":\"product\",\"description\":\"Reserva Rouxinol 31\\/12\\/2025\",\"amount\":150000,\"quantity\":1,\"status\":\"active\",\"created_at\":\"2025-12-03T08:38:06Z\",\"updated_at\":\"2025-12-03T08:38:06Z\",\"code\":\"reserva_32_1764751086\"}],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"status\":\"pending\",\"created_at\":\"2025-12-03T08:38:06Z\",\"updated_at\":\"2025-12-03T08:38:06Z\",\"checkouts\":[{\"id\":\"chk_a4VOnwWTMbhVdLvw\",\"currency\":\"BRL\",\"amount\":150000,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_a4VOnwWTMbhVdLvw\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-03T08:38:06Z\",\"updated_at\":\"2025-12-03T08:38:06Z\",\"expires_at\":\"2026-02-01T08:38:06Z\",\"accepted_payment_methods\":[\"credit_card\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"credit_card\":{\"capture\":true,\"authentication\":{\"type\":\"none\",\"threed_secure\":[]},\"installments\":[{\"number\":1,\"total\":150000}]},\"billing_address\":[],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"32\"}},{\"id\":\"chk_yqRplgeszdf3Vnkg\",\"currency\":\"BRL\",\"amount\":150000,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_yqRplgeszdf3Vnkg\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-03T08:38:06Z\",\"updated_at\":\"2025-12-03T08:38:06Z\",\"expires_at\":\"2026-02-01T08:38:06Z\",\"accepted_payment_methods\":[\"pix\",\"boleto\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"boleto\":{\"due_at\":\"2025-12-06T08:38:06Z\",\"instructions\":\"V\\u00e1lido por 3 dias ap\\u00f3s emiss\\u00e3o.\"},\"pix\":{\"expires_at\":\"2025-12-03T09:38:06Z\",\"additional_information\":[]},\"billing_address\":[],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"32\"}}],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"32\"}}', '2025-12-03 05:38:06', '2025-12-03 05:38:06', NULL, NULL, NULL, NULL, NULL),
(7, 'workshop', 24, 'or_DLEwWJ8iwwIp1R9k', NULL, 'https://api.pagar.me/checkout/v1/orders/chk_xvRMdAGT6uJD17dV', 1.00, 'pending', '{\"entity\":\"workshop\",\"enrollment_id\":24,\"workshop_id\":3}', '2025-12-04 05:38:53', '{\"id\":\"or_DLEwWJ8iwwIp1R9k\",\"code\":\"workshop_24_1764751132\",\"amount\":100,\"currency\":\"BRL\",\"closed\":false,\"items\":[{\"id\":\"oi_E12MAWXuzCRq0yOZ\",\"type\":\"product\",\"description\":\"Workshop Evento teste 2 - Ze.EFE\",\"amount\":100,\"quantity\":1,\"status\":\"active\",\"created_at\":\"2025-12-03T08:38:52Z\",\"updated_at\":\"2025-12-03T08:38:52Z\",\"code\":\"workshop_24_1764751132\"}],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"status\":\"pending\",\"created_at\":\"2025-12-03T08:38:52Z\",\"updated_at\":\"2025-12-03T08:38:53Z\",\"checkouts\":[{\"id\":\"chk_xvRMdAGT6uJD17dV\",\"currency\":\"BRL\",\"amount\":100,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_xvRMdAGT6uJD17dV\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-03T08:38:53Z\",\"updated_at\":\"2025-12-03T08:38:53Z\",\"expires_at\":\"2026-02-01T08:38:53Z\",\"accepted_payment_methods\":[\"credit_card\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"credit_card\":{\"capture\":true,\"authentication\":{\"type\":\"none\",\"threed_secure\":[]},\"installments\":[{\"number\":1,\"total\":100}]},\"billing_address\":[],\"metadata\":{\"entity\":\"workshop\",\"enrollment_id\":\"24\",\"workshop_id\":\"3\"}},{\"id\":\"chk_Wa1Xkp6tjvS7lLPG\",\"currency\":\"BRL\",\"amount\":100,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_Wa1Xkp6tjvS7lLPG\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-03T08:38:53Z\",\"updated_at\":\"2025-12-03T08:38:53Z\",\"expires_at\":\"2026-02-01T08:38:53Z\",\"accepted_payment_methods\":[\"pix\",\"boleto\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"boleto\":{\"due_at\":\"2025-12-06T08:38:52Z\",\"instructions\":\"V\\u00e1lido por 3 dias ap\\u00f3s emiss\\u00e3o.\"},\"pix\":{\"expires_at\":\"2025-12-03T09:38:53Z\",\"additional_information\":[]},\"billing_address\":[],\"metadata\":{\"entity\":\"workshop\",\"enrollment_id\":\"24\",\"workshop_id\":\"3\"}}],\"metadata\":{\"entity\":\"workshop\",\"enrollment_id\":\"24\",\"workshop_id\":\"3\"}}', '2025-12-03 05:38:53', '2025-12-03 05:38:53', NULL, NULL, NULL, NULL, NULL),
(8, 'reservation', 32, 'or_y1MGm1XUlYsYGdLE', NULL, 'https://api.pagar.me/checkout/v1/orders/chk_m3ZjApph0Duyqdl6', 1500.00, 'pending', '{\"entity\":\"reservation\",\"reservation_id\":32}', '2025-12-04 07:33:59', '{\"id\":\"or_y1MGm1XUlYsYGdLE\",\"code\":\"reserva_32_1764758038\",\"amount\":150000,\"currency\":\"BRL\",\"closed\":false,\"items\":[{\"id\":\"oi_YK0yEWBtBH8eNkw1\",\"type\":\"product\",\"description\":\"Reserva Rouxinol 31\\/12\\/2025\",\"amount\":150000,\"quantity\":1,\"status\":\"active\",\"created_at\":\"2025-12-03T10:33:59Z\",\"updated_at\":\"2025-12-03T10:33:59Z\",\"code\":\"reserva_32_1764758038\"}],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"status\":\"pending\",\"created_at\":\"2025-12-03T10:33:59Z\",\"updated_at\":\"2025-12-03T10:33:59Z\",\"checkouts\":[{\"id\":\"chk_m3ZjApph0Duyqdl6\",\"currency\":\"BRL\",\"amount\":150000,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_m3ZjApph0Duyqdl6\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-03T10:33:59Z\",\"updated_at\":\"2025-12-03T10:33:59Z\",\"expires_at\":\"2026-02-01T10:33:59Z\",\"accepted_payment_methods\":[\"credit_card\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"credit_card\":{\"capture\":true,\"authentication\":{\"type\":\"none\",\"threed_secure\":[]},\"installments\":[{\"number\":1,\"total\":150000}]},\"billing_address\":[],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"32\"}},{\"id\":\"chk_peJKBvwFqUd1KmxX\",\"currency\":\"BRL\",\"amount\":150000,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_peJKBvwFqUd1KmxX\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-03T10:33:59Z\",\"updated_at\":\"2025-12-03T10:33:59Z\",\"expires_at\":\"2026-02-01T10:33:59Z\",\"accepted_payment_methods\":[\"pix\",\"boleto\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_b7Q4lGrs8h5pWZeN\",\"name\":\"Beny\",\"email\":\"benyfink@gmail.com\",\"document\":\"37333590895\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_xYLnzZ4SPuLMn3vA\",\"street\":\"Avenida dos Eucaliptos\",\"number\":\"165\",\"complement\":\"84\",\"zip_code\":\"04517050\",\"neighborhood\":\"Indian\\u00f3polis\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-02T21:26:38Z\",\"updated_at\":\"2025-12-02T21:26:38Z\"},\"created_at\":\"2025-12-02T20:39:07Z\",\"updated_at\":\"2025-12-02T21:26:38Z\",\"phones\":{\"home_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"},\"mobile_phone\":{\"country_code\":\"55\",\"number\":\"967147377\",\"area_code\":\"11\"}}},\"boleto\":{\"due_at\":\"2025-12-06T10:33:58Z\",\"instructions\":\"V\\u00e1lido por 3 dias ap\\u00f3s emiss\\u00e3o.\"},\"pix\":{\"expires_at\":\"2025-12-03T11:33:59Z\",\"additional_information\":[]},\"billing_address\":[],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"32\"}}],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"32\"}}', '2025-12-03 07:33:59', '2025-12-03 07:33:59', NULL, NULL, NULL, NULL, NULL),
(9, 'reservation', 33, 'or_mZdDVxOFWCKylRWB', NULL, 'https://api.pagar.me/checkout/v1/orders/chk_03Ey8mGCDskWLkRr', 1500.00, 'pending', '{\"entity\":\"reservation\",\"reservation_id\":33}', '2025-12-08 11:35:22', '{\"id\":\"or_mZdDVxOFWCKylRWB\",\"code\":\"reserva_33_1765118122\",\"amount\":150000,\"currency\":\"BRL\",\"closed\":false,\"items\":[{\"id\":\"oi_VM0WB3qtLPHMej6e\",\"type\":\"product\",\"description\":\"Reserva Rouxinol 31\\/12\\/2025\",\"amount\":150000,\"quantity\":1,\"status\":\"active\",\"created_at\":\"2025-12-07T14:35:22Z\",\"updated_at\":\"2025-12-07T14:35:22Z\",\"code\":\"reserva_33_1765118122\"}],\"customer\":{\"id\":\"cus_LGo9njQc5fJ2XJQp\",\"name\":\"Mira Zlotnik\",\"email\":\"benyfinkelstein@gmail.com\",\"document\":\"41836484836\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_VPgrj4JC6FD3AdaR\",\"line_1\":\"Rua Prates, 414\",\"line_2\":\"103\",\"zip_code\":\"01121000\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-07T13:20:11Z\",\"updated_at\":\"2025-12-07T13:20:11Z\"},\"created_at\":\"2025-12-07T13:15:22Z\",\"updated_at\":\"2025-12-07T13:20:11Z\",\"phones\":[]},\"status\":\"pending\",\"created_at\":\"2025-12-07T14:35:22Z\",\"updated_at\":\"2025-12-07T14:35:22Z\",\"checkouts\":[{\"id\":\"chk_03Ey8mGCDskWLkRr\",\"currency\":\"BRL\",\"amount\":150000,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_03Ey8mGCDskWLkRr\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-07T14:35:22Z\",\"updated_at\":\"2025-12-07T14:35:22Z\",\"expires_at\":\"2026-02-05T14:35:22Z\",\"accepted_payment_methods\":[\"credit_card\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_LGo9njQc5fJ2XJQp\",\"name\":\"Mira Zlotnik\",\"email\":\"benyfinkelstein@gmail.com\",\"document\":\"41836484836\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_VPgrj4JC6FD3AdaR\",\"line_1\":\"Rua Prates, 414\",\"line_2\":\"103\",\"zip_code\":\"01121000\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-07T13:20:11Z\",\"updated_at\":\"2025-12-07T13:20:11Z\"},\"created_at\":\"2025-12-07T13:15:22Z\",\"updated_at\":\"2025-12-07T13:20:11Z\",\"phones\":[]},\"credit_card\":{\"capture\":true,\"authentication\":{\"type\":\"none\",\"threed_secure\":[]},\"installments\":[{\"number\":1,\"total\":150000}]},\"billing_address\":[],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"33\"}},{\"id\":\"chk_0RqmYLPriNF4YLQl\",\"currency\":\"BRL\",\"amount\":150000,\"status\":\"open\",\"payment_url\":\"https:\\/\\/api.pagar.me\\/checkout\\/v1\\/orders\\/chk_0RqmYLPriNF4YLQl\",\"customer_editable\":true,\"required_fields\":[\"customer.email\",\"customer.document\",\"customer.mobile_phone\",\"customer.name\",\"billing.address\"],\"billing_address_editable\":true,\"skip_checkout_success_page\":false,\"shippable\":false,\"created_at\":\"2025-12-07T14:35:22Z\",\"updated_at\":\"2025-12-07T14:35:22Z\",\"expires_at\":\"2026-02-05T14:35:22Z\",\"accepted_payment_methods\":[\"pix\",\"boleto\"],\"accepted_brands\":[\"visa\",\"mastercard\",\"discover\",\"diners\",\"amex\",\"elo\",\"aura\",\"jcb\",\"cabal\",\"unionpay\"],\"accepted_multi_payment_methods\":[],\"customer\":{\"id\":\"cus_LGo9njQc5fJ2XJQp\",\"name\":\"Mira Zlotnik\",\"email\":\"benyfinkelstein@gmail.com\",\"document\":\"41836484836\",\"type\":\"individual\",\"delinquent\":false,\"address\":{\"id\":\"addr_VPgrj4JC6FD3AdaR\",\"line_1\":\"Rua Prates, 414\",\"line_2\":\"103\",\"zip_code\":\"01121000\",\"city\":\"S\\u00e3o Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"status\":\"active\",\"created_at\":\"2025-12-07T13:20:11Z\",\"updated_at\":\"2025-12-07T13:20:11Z\"},\"created_at\":\"2025-12-07T13:15:22Z\",\"updated_at\":\"2025-12-07T13:20:11Z\",\"phones\":[]},\"boleto\":{\"due_at\":\"2025-12-10T14:35:22Z\",\"instructions\":\"V\\u00e1lido por 3 dias ap\\u00f3s emiss\\u00e3o.\"},\"pix\":{\"expires_at\":\"2025-12-07T15:35:22Z\",\"additional_information\":[]},\"billing_address\":[],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"33\"}}],\"metadata\":{\"entity\":\"reservation\",\"reservation_id\":\"33\"}}', '2025-12-07 11:35:22', '2025-12-07 11:35:22', NULL, NULL, NULL, NULL, NULL);

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
-- Estrutura para tabela `posts`
--

CREATE TABLE `posts` (
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

--
-- Despejando dados para a tabela `posts`
--

INSERT INTO `posts` (`id`, `slug`, `title`, `summary`, `content`, `category`, `status`, `cover_path`, `author_name`, `published_at`, `created_at`, `updated_at`) VALUES
(16, '', 'A diminuição dos espaços de trabalho e a necessidade de reuniões presenciais', 'Com escritórios cada vez menores, cresce a necessidade de encontros presenciais em ambientes profissionais, equipados e prontos para decisões rápidas.', '<p data-start=\"140\" data-end=\"445\">A redução das áreas físicas nas empresas tornou-se uma tendência irreversível. Modelos híbridos, escritórios menores e equipes distribuídas levaram muitas organizações a repensar o papel do espaço corporativo. Mas, ao mesmo tempo em que as mesas diminuíram, a necessidade de encontros presenciais cresceu.</p>\n<p data-start=\"447\" data-end=\"779\">Reuniões presenciais seguem essenciais para decisões complexas, alinhamentos estratégicos, construção de confiança e resolução de conflitos. Elas aceleram ciclos de negociação e reduzem ruídos que, no digital, se acumulam. Com menos salas internas, porém, muitos times ficam sem infraestrutura adequada para esses momentos críticos.</p>\n<p data-start=\"781\" data-end=\"1101\">Esse cenário abre espaço para ambientes profissionais compartilhados, bem localizados e já preparados para receber equipes com tecnologia, conforto e privacidade. O escritório deixou de ser um local fixo: virou um recurso a ser acionado conforme a necessidade — especialmente quando o encontro cara a cara faz diferença.</p>', 'Espaços', 'publicado', 'img/posts/16/cover.webp', 'Beny Finkelstein', '2025-11-27 19:13:00', '2025-11-27 19:15:02', '2025-11-27 19:15:02'),
(21, '123', 'Workshops e Produtividade', 'Workshops presenciais impulsionam colaboração, alinhamento e aprendizado, aumentando produtividade e fortalecendo a retenção de talentos.', '<p data-start=\"1189\" data-end=\"1505\">Workshops presenciais se tornaram ferramentas de alto impacto para empresas que buscam produtividade e retenção de talentos. Diferentemente de treinamentos tradicionais, o formato de workshop combina conteúdo prático, troca entre equipes e resolução de problemas reais — tudo em um ambiente que estimula colaboração.</p>\n<p data-start=\"1507\" data-end=\"1853\">Ao trabalhar em grupo, os profissionais ganham clareza sobre processos, entendem expectativas, fortalecem relações e desenvolvem senso de pertencimento. Isso reduz retrabalho, melhora a comunicação interna e acelera entregas. Além disso, a experiência presencial cria memórias positivas, reforça cultura e dá visibilidade ao propósito da empresa.</p>\n<p data-start=\"1855\" data-end=\"2223\">Do ponto de vista de retenção, workshops funcionam como investimento direto no desenvolvimento do colaborador. Pessoas que sentem evolução, aprendizado contínuo e conexão humana tendem a permanecer mais tempo e produzir mais. Para organizações que já operam com times híbridos ou remotos, encontros estruturados tornam-se fundamentais para manter coesão e engajamento.</p>', 'Workshop', 'publicado', 'img/posts/21/cover.webp', 'Beny Finkelstein', '2025-11-28 01:19:00', '2025-11-27 19:19:17', '2025-12-19 15:53:55'),
(22, 'locais', 'Locais privativos para reuniões', 'Reuniões de negócios exigem foco e confidencialidade. Espaços privativos garantem profissionalismo, segurança e eficiência nas decisões.', '<p data-start=\"2307\" data-end=\"2594\">Reuniões de negócios exigem confidencialidade, foco e ambiente adequado. Mesmo com o avanço do trabalho remoto, muitos profissionais perceberam que cafés, escritórios improvisados ou salas compartilhadas não garantem a privacidade e a concentração necessárias para negociações sensíveis.</p>\n<p data-start=\"2596\" data-end=\"2871\">Ambientes privativos oferecem segurança para tratar temas estratégicos, números financeiros, contratos e decisões que não podem vazar. Além disso, geram percepção de profissionalismo — algo que impacta diretamente a credibilidade diante de clientes, parceiros e investidores.</p>\n<p data-start=\"2873\" data-end=\"3219\">Outro ponto crítico é a eficiência. Em salas planejadas para reuniões, a tecnologia funciona, a acústica ajuda, e o espaço convida à objetividade. Isso reduz atrasos, interrupções e improvisos. Ter um local reservado, confortável e bem equipado deixou de ser luxo: tornou-se elemento básico para quem conduz negócios de forma séria e competitiva.</p>', 'Locais', 'publicado', 'img/posts/22/cover.jpg', 'Beny Finkelstein', '2025-11-27 19:19:00', '2025-11-27 19:20:48', '2025-11-27 19:20:48'),
(24, 'o-dilema-da-gest-o-moderna-home-office-x-presencial-2', 'Dilema: Homeoffice ou Presencial?', 'Flexibilidade ou conexão real? A gestão moderna busca equilíbrio entre trabalho remoto e encontros presenciais estratégicos para decisões que realmente importam.', '<p data-start=\"194\" data-end=\"469\">A gestão moderna vive um paradoxo. De um lado, o home office trouxe flexibilidade, redução de custos e maior autonomia para profissionais. De outro, a ausência de encontros presenciais tem impactado colaboração, alinhamento estratégico e construção de cultura organizacional.</p>\n<p data-start=\"471\" data-end=\"805\">Reuniões virtuais funcionam bem para decisões operacionais e acompanhamentos rápidos. Porém, quando o objetivo é criar, negociar, alinhar expectativas ou tomar decisões críticas, o presencial ainda exerce um papel insubstituível. Linguagem corporal, foco compartilhado e troca espontânea são elementos difíceis de replicar no digital.</p>\n<p data-start=\"807\" data-end=\"1076\">O desafio atual não é escolher entre remoto ou presencial, mas <strong data-start=\"870\" data-end=\"916\">saber quando cada formato faz mais sentido</strong>. Empresas mais eficientes têm adotado modelos híbridos inteligentes, utilizando encontros presenciais pontuais e bem planejados para momentos de maior impacto.</p>\n<p data-start=\"1078\" data-end=\"1253\">Nesse contexto, espaços flexíveis e prontos para uso tornam-se aliados da gestão: permitem reunir pessoas quando realmente importa, sem a rigidez de manter um escritório fixo.</p>', 'espaços', 'publicado', 'img/posts/24/cover.png', 'Beny Finkelstein', '2025-12-19 14:19:00', '2025-12-19 08:20:12', '2025-12-22 12:39:47'),
(25, 'impressionar-um-cliente-come-a-pelo-local-da-reuni-o', 'Impressionar um cliente começa pelo local da reunião', 'O local da reunião comunica antes das palavras. Ambientes certos geram confiança, foco e impacto nas negociações com clientes.', '<p data-start=\"1320\" data-end=\"1519\">Antes mesmo da primeira palavra, o ambiente já comunica. O local escolhido para uma reunião influencia diretamente a percepção de profissionalismo, organização e cuidado com a experiência do cliente.</p>\n<p data-start=\"1521\" data-end=\"1798\">Salas improvisadas, ruído excessivo, falta de privacidade ou infraestrutura limitada podem comprometer negociações importantes — independentemente da qualidade da proposta apresentada. Por outro lado, um espaço bem projetado transmite confiança, preparo e atenção aos detalhes.</p>\n<p data-start=\"1800\" data-end=\"2019\">Iluminação adequada, conforto, tecnologia funcional e hospitalidade criam um cenário favorável para conversas estratégicas. O cliente se sente valorizado, o diálogo flui melhor e as decisões tendem a ser mais objetivas.</p>\n<p data-start=\"2021\" data-end=\"2219\">Impressionar não é exagerar. É oferecer o ambiente certo para que a reunião aconteça com foco, privacidade e fluidez. Escolher bem onde receber um cliente é parte essencial da estratégia de negócio.</p>', 'clientes', 'publicado', 'img/posts/25/cover.png', 'Beny Finkelstein', '2025-12-19 14:20:00', '2025-12-19 08:22:24', '2025-12-22 12:39:23'),
(26, 'alugar-sob-demanda-ou-possuir-um-espa-o-pr-s-e-contras', 'Alugar sob demanda ou possuir um espaço? Prós e contras', 'Espaço próprio ou sob demanda? Entenda os prós e contras de cada modelo e como escolher a opção mais eficiente para o seu negócio.', '<p data-start=\"2289\" data-end=\"2465\">A decisão entre possuir um espaço próprio ou alugar sob demanda envolve muito mais do que custo mensal. Trata-se de flexibilidade, eficiência e adequação ao momento da empresa.</p>\n<p data-start=\"2467\" data-end=\"2737\"><strong data-start=\"2467\" data-end=\"2496\">Possuir um espaço próprio</strong> oferece controle total, identidade fixa e disponibilidade constante. Em contrapartida, exige investimento inicial elevado, custos fixos recorrentes, manutenção, ociosidade em períodos de menor uso e menor capacidade de adaptação a mudanças.</p>\n<p data-start=\"2739\" data-end=\"3041\">Já <strong data-start=\"2742\" data-end=\"2772\">alugar espaços sob demanda</strong> reduz compromissos financeiros, elimina custos ocultos e permite escolher o local ideal para cada necessidade: reuniões, workshops, apresentações ou encontros estratégicos. A principal limitação está na dependência de disponibilidade e na ausência de um endereço fixo.</p>\n<p data-start=\"3043\" data-end=\"3299\">Para empresas enxutas, times híbridos ou profissionais que se reúnem presencialmente apenas em momentos-chave, o modelo sob demanda tende a ser mais racional. Ele converte estrutura fixa em variável e libera energia para o que realmente importa: o negócio.</p>\n<p data-start=\"3301\" data-end=\"3442\">Cada modelo tem seu papel. A escolha certa depende do estágio da empresa, da frequência de uso e da importância estratégica do espaço físico.</p>', 'Locais', 'publicado', 'img/posts/26/cover.png', 'Beny Finkelstein', '0000-00-00 00:00:00', '2025-12-19 08:25:31', '2025-12-19 08:27:49');

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
  `updated_at` datetime DEFAULT NULL,
  `public_code` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_payment_intent_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_charge_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_confirmed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `reservations`
--

INSERT INTO `reservations` (`id`, `room_id`, `client_id`, `participants`, `price`, `company_id`, `title`, `description`, `date`, `time_start`, `time_end`, `total_price`, `amount_gross`, `voucher_code`, `voucher_amount`, `fee_pct_at_time`, `fee_amount`, `amount_net`, `attendees_count`, `requirements`, `observations`, `status`, `payment_status`, `hold_expires_at`, `notes`, `created_at`, `updated_at`, `public_code`, `stripe_payment_intent_id`, `stripe_charge_id`, `payment_confirmed_at`) VALUES
(72, 6, 27, 1, 1100.00, NULL, '123', '', '2025-12-29', '08:00:00', '20:00:00', 1100.00, 1100.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'confirmada', 'confirmado', NULL, NULL, NULL, '2025-12-28 10:42:31', 'ZF-28UH-M599NN', 'pi_3SjKEtRGALXK8tGE1rHL86s1', NULL, '2025-12-28 10:42:31');

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
(6, 'Teste', 10, '', 'Avenida Rouxinol', 'até 579/580', '04516-000', 'São Paulo', 'SP', '', '', '', '', '', 'Não', NULL, 1100.00, '', NULL, NULL, 'ativo', NULL, NULL, NULL, 'img/rooms/6/room_6_694dc1027293c9.26107350.jpg,img/rooms/6/room_6_694dc13c11cc77.24461779.jpg,img/rooms/6/room_6_694dc13c11f490.33462644.jpg,img/rooms/6/room_6_694dc13c1217b3.98359564.jpg,img/rooms/6/room_6_694dc13c123a40.45387296.jpg,img/rooms/6/room_6_6', 0, '2025-12-25 22:00:09', NULL, 1);

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
(6, 3),
(6, 4);

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
-- Estrutura para tabela `stripe_events`
--

CREATE TABLE `stripe_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
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

--
-- Despejando dados para a tabela `stripe_events`
--

INSERT INTO `stripe_events` (`id`, `hook_id`, `event_type`, `status_code`, `status_text`, `entity`, `context_id`, `payload`, `received_at`, `processed_at`) VALUES
(1, 'hook_kdabPMSOGcA8JGZz', 'charge.paid', 200, 'paid', 'reservation', 61, '{\n  \"id\": \"hook_kdabPMSOGcA8JGZz\",\n  \"account\": {\n    \"id\": \"acc_W695O0gUESAg4EyZ\",\n    \"name\": \"ZE.EFE - MARCA LA - test\"\n  },\n  \"type\": \"charge.paid\",\n  \"created_at\": \"2025-12-15T00:49:08.7031787Z\",\n  \"data\": {\n    \"amount\": 150200,\n    \"code\": \"res_61_693f5af821110\",\n    \"created_at\": \"2025-12-15T00:48:56\",\n    \"currency\": \"BRL\",\n    \"customer\": {\n      \"address\": {\n        \"city\": \"São Paulo\",\n        \"country\": \"BR\",\n        \"created_at\": \"2025-12-07T01:08:27\",\n        \"id\": \"addr_xzJYZROfEWH4Ylgy\",\n        \"line_1\": \"Avenida Cotovia, 111\",\n        \"line_2\": \"12\",\n        \"state\": \"SP\",\n        \"status\": \"active\",\n        \"updated_at\": \"2025-12-07T01:08:27\",\n        \"zip_code\": \"04517000\"\n      },\n      \"created_at\": \"2025-12-02T20:39:07\",\n      \"delinquent\": false,\n      \"document\": \"37333590895\",\n      \"email\": \"benyfink@gmail.com\",\n      \"id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"name\": \"Beny\",\n      \"phones\": {\n        \"mobile_phone\": {\n          \"area_code\": \"11\",\n          \"country_code\": \"55\",\n          \"number\": \"967147377\"\n        }\n      },\n      \"type\": \"individual\",\n      \"updated_at\": \"2025-12-07T01:08:27\"\n    },\n    \"gateway_id\": \"2212367544\",\n    \"id\": \"ch_GvdaPECDdHpQ7r13\",\n    \"last_transaction\": {\n      \"acquirer_auth_code\": \"242132\",\n      \"acquirer_message\": \"Transação aprovada com sucesso\",\n      \"acquirer_name\": \"pagarme\",\n      \"acquirer_nsu\": \"2212367544\",\n      \"acquirer_return_code\": \"0000\",\n      \"acquirer_tid\": \"2212367544\",\n      \"amount\": 150200,\n      \"antifraud_response\": {\n        \"provider_name\": \"pagarme\",\n        \"score\": \"moderated\",\n        \"status\": \"approved\"\n      },\n      \"brand_id\": \"736101\",\n      \"card\": {\n        \"billing_address\": {\n          \"city\": \"São Paulo\",\n          \"country\": \"BR\",\n          \"line_1\": \"Avenida Cotovia 111\",\n          \"line_2\": \"12\",\n          \"state\": \"SP\",\n          \"zip_code\": \"04517000\"\n        },\n        \"brand\": \"Mastercard\",\n        \"created_at\": \"2025-12-08T10:01:44\",\n        \"exp_month\": 12,\n        \"exp_year\": 2032,\n        \"first_six_digits\": \"548083\",\n        \"holder_name\": \"Beny J Finkelstein\",\n        \"id\": \"card_eP4dJYmHrKuaxLWK\",\n        \"last_four_digits\": \"8405\",\n        \"status\": \"active\",\n        \"type\": \"credit\",\n        \"updated_at\": \"2025-12-08T10:01:44\"\n      },\n      \"created_at\": \"2025-12-15T00:48:56\",\n      \"funding_source\": \"credit\",\n      \"gateway_id\": \"2212367544\",\n      \"gateway_response\": {\n        \"code\": \"200\",\n        \"errors\": []\n      },\n      \"id\": \"tran_K8jW1dLHXfOb1xa2\",\n      \"installments\": 1,\n      \"metadata\": {},\n      \"operation_type\": \"auth_and_capture\",\n      \"status\": \"captured\",\n      \"success\": true,\n      \"transaction_type\": \"credit_card\",\n      \"updated_at\": \"2025-12-15T00:48:56\"\n    },\n    \"metadata\": {\n      \"client_id\": \"11\",\n      \"context\": \"reservation\",\n      \"entity\": \"reservation\",\n      \"reservation_id\": \"61\",\n      \"room_id\": \"1\"\n    },\n    \"order\": {\n      \"amount\": 150200,\n      \"closed\": true,\n      \"closed_at\": \"2025-12-15T00:48:56\",\n      \"code\": \"res_61_693f5af821110\",\n      \"created_at\": \"2025-12-15T00:48:56\",\n      \"currency\": \"BRL\",\n      \"customer_id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"id\": \"or_zJ3e7Mghk1U30BXP\",\n      \"metadata\": {\n        \"client_id\": \"11\",\n        \"context\": \"reservation\",\n        \"entity\": \"reservation\",\n        \"reservation_id\": \"61\",\n        \"room_id\": \"1\"\n      },\n      \"status\": \"paid\",\n      \"updated_at\": \"2025-12-15T00:48:57\"\n    },\n    \"paid_amount\": 150200,\n    \"paid_at\": \"2025-12-15T00:48:57\",\n    \"payment_method\": \"credit_card\",\n    \"status\": \"paid\",\n    \"updated_at\": \"2025-12-15T00:48:57\"\n  }\n}', '2025-12-14 22:30:14', NULL),
(2, 'hook_rGKNbyeTGuz6mv64', 'charge.paid', 200, 'paid', 'reservation', 60, '{\n  \"id\": \"hook_rGKNbyeTGuz6mv64\",\n  \"account\": {\n    \"id\": \"acc_W695O0gUESAg4EyZ\",\n    \"name\": \"ZE.EFE - MARCA LA - test\"\n  },\n  \"type\": \"charge.paid\",\n  \"created_at\": \"2025-12-15T00:21:27.1807301Z\",\n  \"data\": {\n    \"amount\": 150200,\n    \"code\": \"res_60_693f547b06e77\",\n    \"created_at\": \"2025-12-15T00:21:15\",\n    \"currency\": \"BRL\",\n    \"customer\": {\n      \"address\": {\n        \"city\": \"São Paulo\",\n        \"country\": \"BR\",\n        \"created_at\": \"2025-12-07T01:08:27\",\n        \"id\": \"addr_xzJYZROfEWH4Ylgy\",\n        \"line_1\": \"Avenida Cotovia, 111\",\n        \"line_2\": \"12\",\n        \"state\": \"SP\",\n        \"status\": \"active\",\n        \"updated_at\": \"2025-12-07T01:08:27\",\n        \"zip_code\": \"04517000\"\n      },\n      \"created_at\": \"2025-12-02T20:39:07\",\n      \"delinquent\": false,\n      \"document\": \"37333590895\",\n      \"email\": \"benyfink@gmail.com\",\n      \"id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"name\": \"Beny\",\n      \"phones\": {\n        \"mobile_phone\": {\n          \"area_code\": \"11\",\n          \"country_code\": \"55\",\n          \"number\": \"967147377\"\n        }\n      },\n      \"type\": \"individual\",\n      \"updated_at\": \"2025-12-07T01:08:27\"\n    },\n    \"gateway_id\": \"2212367531\",\n    \"id\": \"ch_23MkQpbuwZiwRGae\",\n    \"last_transaction\": {\n      \"acquirer_auth_code\": \"559931\",\n      \"acquirer_message\": \"Transação aprovada com sucesso\",\n      \"acquirer_name\": \"pagarme\",\n      \"acquirer_nsu\": \"2212367531\",\n      \"acquirer_return_code\": \"0000\",\n      \"acquirer_tid\": \"2212367531\",\n      \"amount\": 150200,\n      \"antifraud_response\": {\n        \"provider_name\": \"pagarme\",\n        \"score\": \"moderated\",\n        \"status\": \"approved\"\n      },\n      \"brand_id\": \"487724\",\n      \"card\": {\n        \"billing_address\": {\n          \"city\": \"São Paulo\",\n          \"country\": \"BR\",\n          \"line_1\": \"Avenida Cotovia 111\",\n          \"line_2\": \"12\",\n          \"state\": \"SP\",\n          \"zip_code\": \"04517000\"\n        },\n        \"brand\": \"Mastercard\",\n        \"created_at\": \"2025-12-08T10:01:44\",\n        \"exp_month\": 12,\n        \"exp_year\": 2032,\n        \"first_six_digits\": \"548083\",\n        \"holder_name\": \"Beny J Finkelstein\",\n        \"id\": \"card_eP4dJYmHrKuaxLWK\",\n        \"last_four_digits\": \"8405\",\n        \"status\": \"active\",\n        \"type\": \"credit\",\n        \"updated_at\": \"2025-12-08T10:01:44\"\n      },\n      \"created_at\": \"2025-12-15T00:21:15\",\n      \"funding_source\": \"credit\",\n      \"gateway_id\": \"2212367531\",\n      \"gateway_response\": {\n        \"code\": \"200\",\n        \"errors\": []\n      },\n      \"id\": \"tran_kMxpxWoc9XfYBld6\",\n      \"installments\": 1,\n      \"metadata\": {},\n      \"operation_type\": \"auth_and_capture\",\n      \"status\": \"captured\",\n      \"success\": true,\n      \"transaction_type\": \"credit_card\",\n      \"updated_at\": \"2025-12-15T00:21:15\"\n    },\n    \"metadata\": {\n      \"client_id\": \"11\",\n      \"context\": \"reservation\",\n      \"entity\": \"reservation\",\n      \"reservation_id\": \"60\",\n      \"room_id\": \"1\"\n    },\n    \"order\": {\n      \"amount\": 150200,\n      \"closed\": true,\n      \"closed_at\": \"2025-12-15T00:21:15\",\n      \"code\": \"res_60_693f547b06e77\",\n      \"created_at\": \"2025-12-15T00:21:15\",\n      \"currency\": \"BRL\",\n      \"customer_id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"id\": \"or_dkNr2gyIWWSOVKnZ\",\n      \"metadata\": {\n        \"client_id\": \"11\",\n        \"context\": \"reservation\",\n        \"entity\": \"reservation\",\n        \"reservation_id\": \"60\",\n        \"room_id\": \"1\"\n      },\n      \"status\": \"paid\",\n      \"updated_at\": \"2025-12-15T00:21:16\"\n    },\n    \"paid_amount\": 150200,\n    \"paid_at\": \"2025-12-15T00:21:16\",\n    \"payment_method\": \"credit_card\",\n    \"status\": \"paid\",\n    \"updated_at\": \"2025-12-15T00:21:16\"\n  }\n}', '2025-12-14 22:30:47', NULL),
(3, 'hook_Kwo1Mw3TwT2ZMBeG', 'charge.created', 200, 'paid', 'reservation', 62, '{\n  \"id\": \"hook_Kwo1Mw3TwT2ZMBeG\",\n  \"account\": {\n    \"id\": \"acc_W695O0gUESAg4EyZ\",\n    \"name\": \"ZE.EFE - MARCA LA - test\"\n  },\n  \"type\": \"charge.created\",\n  \"created_at\": \"2025-12-15T10:08:01.8114982Z\",\n  \"data\": {\n    \"amount\": 150200,\n    \"code\": \"res_62_693fddf7067c7\",\n    \"created_at\": \"2025-12-15T10:07:51\",\n    \"currency\": \"BRL\",\n    \"customer\": {\n      \"address\": {\n        \"city\": \"São Paulo\",\n        \"country\": \"BR\",\n        \"created_at\": \"2025-12-07T01:08:27\",\n        \"id\": \"addr_xzJYZROfEWH4Ylgy\",\n        \"line_1\": \"Avenida Cotovia, 111\",\n        \"line_2\": \"12\",\n        \"state\": \"SP\",\n        \"status\": \"active\",\n        \"updated_at\": \"2025-12-07T01:08:27\",\n        \"zip_code\": \"04517000\"\n      },\n      \"created_at\": \"2025-12-02T20:39:07\",\n      \"delinquent\": false,\n      \"document\": \"37333590895\",\n      \"email\": \"benyfink@gmail.com\",\n      \"id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"name\": \"Beny\",\n      \"phones\": {\n        \"mobile_phone\": {\n          \"area_code\": \"11\",\n          \"country_code\": \"55\",\n          \"number\": \"967147377\"\n        }\n      },\n      \"type\": \"individual\",\n      \"updated_at\": \"2025-12-07T01:08:27\"\n    },\n    \"gateway_id\": \"2212367904\",\n    \"id\": \"ch_y2A6xrrT3xuQmJ5P\",\n    \"last_transaction\": {\n      \"acquirer_auth_code\": \"984403\",\n      \"acquirer_message\": \"Transação aprovada com sucesso\",\n      \"acquirer_name\": \"pagarme\",\n      \"acquirer_nsu\": \"2212367904\",\n      \"acquirer_return_code\": \"0000\",\n      \"acquirer_tid\": \"2212367904\",\n      \"amount\": 150200,\n      \"antifraud_response\": {\n        \"provider_name\": \"pagarme\",\n        \"score\": \"moderated\",\n        \"status\": \"approved\"\n      },\n      \"brand_id\": \"571157\",\n      \"card\": {\n        \"billing_address\": {\n          \"city\": \"São Paulo\",\n          \"country\": \"BR\",\n          \"line_1\": \"Avenida Cotovia 111\",\n          \"line_2\": \"12\",\n          \"state\": \"SP\",\n          \"zip_code\": \"04517000\"\n        },\n        \"brand\": \"Mastercard\",\n        \"created_at\": \"2025-12-08T10:01:44\",\n        \"exp_month\": 12,\n        \"exp_year\": 2032,\n        \"first_six_digits\": \"548083\",\n        \"holder_name\": \"Beny J Finkelstein\",\n        \"id\": \"card_eP4dJYmHrKuaxLWK\",\n        \"last_four_digits\": \"8405\",\n        \"status\": \"active\",\n        \"type\": \"credit\",\n        \"updated_at\": \"2025-12-08T10:01:44\"\n      },\n      \"created_at\": \"2025-12-15T10:07:51\",\n      \"funding_source\": \"credit\",\n      \"gateway_id\": \"2212367904\",\n      \"gateway_response\": {\n        \"code\": \"200\",\n        \"errors\": []\n      },\n      \"id\": \"tran_rKB2pXOc5YuQW2wq\",\n      \"installments\": 1,\n      \"metadata\": {},\n      \"operation_type\": \"auth_and_capture\",\n      \"status\": \"captured\",\n      \"success\": true,\n      \"transaction_type\": \"credit_card\",\n      \"updated_at\": \"2025-12-15T10:07:51\"\n    },\n    \"metadata\": {\n      \"client_id\": \"11\",\n      \"context\": \"reservation\",\n      \"entity\": \"reservation\",\n      \"reservation_id\": \"62\",\n      \"room_id\": \"1\"\n    },\n    \"order\": {\n      \"amount\": 150200,\n      \"closed\": true,\n      \"closed_at\": \"2025-12-15T10:07:51\",\n      \"code\": \"res_62_693fddf7067c7\",\n      \"created_at\": \"2025-12-15T10:07:51\",\n      \"currency\": \"BRL\",\n      \"customer_id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"id\": \"or_rem8oq5foRCPPz24\",\n      \"metadata\": {\n        \"client_id\": \"11\",\n        \"context\": \"reservation\",\n        \"entity\": \"reservation\",\n        \"reservation_id\": \"62\",\n        \"room_id\": \"1\"\n      },\n      \"status\": \"paid\",\n      \"updated_at\": \"2025-12-15T10:07:52\"\n    },\n    \"paid_amount\": 150200,\n    \"paid_at\": \"2025-12-15T10:07:52\",\n    \"payment_method\": \"credit_card\",\n    \"status\": \"paid\",\n    \"updated_at\": \"2025-12-15T10:07:52\"\n  }\n}', '2025-12-15 07:08:02', NULL),
(4, 'hook_ANq17z6s2vtG728K', 'order_item.created', 200, 'active', 'reservation', 62, '{\n  \"id\": \"hook_ANq17z6s2vtG728K\",\n  \"account\": {\n    \"id\": \"acc_W695O0gUESAg4EyZ\",\n    \"name\": \"ZE.EFE - MARCA LA - test\"\n  },\n  \"type\": \"order_item.created\",\n  \"created_at\": \"2025-12-15T10:08:02.145822Z\",\n  \"data\": {\n    \"amount\": 150200,\n    \"code\": \"reservation\",\n    \"created_at\": \"2025-12-15T10:07:51\",\n    \"description\": \"reserva completa\",\n    \"id\": \"oi_ND7mYyTj9Svym8lx\",\n    \"order\": {\n      \"amount\": 150200,\n      \"closed\": true,\n      \"closed_at\": \"2025-12-15T10:07:51\",\n      \"code\": \"res_62_693fddf7067c7\",\n      \"created_at\": \"2025-12-15T10:07:51\",\n      \"currency\": \"BRL\",\n      \"id\": \"or_rem8oq5foRCPPz24\",\n      \"items\": [\n        {\n          \"amount\": 150200,\n          \"code\": \"reservation\",\n          \"description\": \"reserva completa\",\n          \"id\": \"oi_ND7mYyTj9Svym8lx\",\n          \"quantity\": 1,\n          \"status\": \"active\"\n        }\n      ],\n      \"metadata\": {\n        \"client_id\": \"11\",\n        \"context\": \"reservation\",\n        \"entity\": \"reservation\",\n        \"reservation_id\": \"62\",\n        \"room_id\": \"1\"\n      },\n      \"status\": \"paid\",\n      \"updated_at\": \"2025-12-15T10:07:52\"\n    },\n    \"quantity\": 1,\n    \"status\": \"active\",\n    \"type\": \"product\",\n    \"updated_at\": \"2025-12-15T10:07:51\"\n  }\n}', '2025-12-15 07:08:02', NULL),
(5, 'hook_rz2NVOPHVnHnWvx1', 'charge.antifraud_approved', 200, 'paid', 'reservation', 62, '{\n  \"id\": \"hook_rz2NVOPHVnHnWvx1\",\n  \"account\": {\n    \"id\": \"acc_W695O0gUESAg4EyZ\",\n    \"name\": \"ZE.EFE - MARCA LA - test\"\n  },\n  \"type\": \"charge.antifraud_approved\",\n  \"created_at\": \"2025-12-15T10:08:03.1454105Z\",\n  \"data\": {\n    \"amount\": 150200,\n    \"code\": \"res_62_693fddf7067c7\",\n    \"created_at\": \"2025-12-15T10:07:51\",\n    \"currency\": \"BRL\",\n    \"customer\": {\n      \"address\": {\n        \"city\": \"São Paulo\",\n        \"country\": \"BR\",\n        \"created_at\": \"2025-12-07T01:08:27\",\n        \"id\": \"addr_xzJYZROfEWH4Ylgy\",\n        \"line_1\": \"Avenida Cotovia, 111\",\n        \"line_2\": \"12\",\n        \"state\": \"SP\",\n        \"status\": \"active\",\n        \"updated_at\": \"2025-12-07T01:08:27\",\n        \"zip_code\": \"04517000\"\n      },\n      \"created_at\": \"2025-12-02T20:39:07\",\n      \"delinquent\": false,\n      \"document\": \"37333590895\",\n      \"email\": \"benyfink@gmail.com\",\n      \"id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"name\": \"Beny\",\n      \"phones\": {\n        \"mobile_phone\": {\n          \"area_code\": \"11\",\n          \"country_code\": \"55\",\n          \"number\": \"967147377\"\n        }\n      },\n      \"type\": \"individual\",\n      \"updated_at\": \"2025-12-07T01:08:27\"\n    },\n    \"gateway_id\": \"2212367904\",\n    \"id\": \"ch_y2A6xrrT3xuQmJ5P\",\n    \"last_transaction\": {\n      \"acquirer_auth_code\": \"984403\",\n      \"acquirer_message\": \"Transação aprovada com sucesso\",\n      \"acquirer_name\": \"pagarme\",\n      \"acquirer_nsu\": \"2212367904\",\n      \"acquirer_return_code\": \"0000\",\n      \"acquirer_tid\": \"2212367904\",\n      \"amount\": 150200,\n      \"antifraud_response\": {\n        \"provider_name\": \"pagarme\",\n        \"score\": \"moderated\",\n        \"status\": \"approved\"\n      },\n      \"brand_id\": \"571157\",\n      \"card\": {\n        \"billing_address\": {\n          \"city\": \"São Paulo\",\n          \"country\": \"BR\",\n          \"line_1\": \"Avenida Cotovia 111\",\n          \"line_2\": \"12\",\n          \"state\": \"SP\",\n          \"zip_code\": \"04517000\"\n        },\n        \"brand\": \"Mastercard\",\n        \"created_at\": \"2025-12-08T10:01:44\",\n        \"exp_month\": 12,\n        \"exp_year\": 2032,\n        \"first_six_digits\": \"548083\",\n        \"holder_name\": \"Beny J Finkelstein\",\n        \"id\": \"card_eP4dJYmHrKuaxLWK\",\n        \"last_four_digits\": \"8405\",\n        \"status\": \"active\",\n        \"type\": \"credit\",\n        \"updated_at\": \"2025-12-08T10:01:44\"\n      },\n      \"created_at\": \"2025-12-15T10:07:51\",\n      \"funding_source\": \"credit\",\n      \"gateway_id\": \"2212367904\",\n      \"gateway_response\": {\n        \"code\": \"200\",\n        \"errors\": []\n      },\n      \"id\": \"tran_rKB2pXOc5YuQW2wq\",\n      \"installments\": 1,\n      \"metadata\": {},\n      \"operation_type\": \"auth_and_capture\",\n      \"status\": \"captured\",\n      \"success\": true,\n      \"transaction_type\": \"credit_card\",\n      \"updated_at\": \"2025-12-15T10:07:51\"\n    },\n    \"metadata\": {\n      \"client_id\": \"11\",\n      \"context\": \"reservation\",\n      \"entity\": \"reservation\",\n      \"reservation_id\": \"62\",\n      \"room_id\": \"1\"\n    },\n    \"order\": {\n      \"amount\": 150200,\n      \"closed\": true,\n      \"closed_at\": \"2025-12-15T10:07:51\",\n      \"code\": \"res_62_693fddf7067c7\",\n      \"created_at\": \"2025-12-15T10:07:51\",\n      \"currency\": \"BRL\",\n      \"customer_id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"id\": \"or_rem8oq5foRCPPz24\",\n      \"metadata\": {\n        \"client_id\": \"11\",\n        \"context\": \"reservation\",\n        \"entity\": \"reservation\",\n        \"reservation_id\": \"62\",\n        \"room_id\": \"1\"\n      },\n      \"status\": \"paid\",\n      \"updated_at\": \"2025-12-15T10:07:52\"\n    },\n    \"paid_amount\": 150200,\n    \"paid_at\": \"2025-12-15T10:07:52\",\n    \"payment_method\": \"credit_card\",\n    \"status\": \"paid\",\n    \"updated_at\": \"2025-12-15T10:07:52\"\n  }\n}', '2025-12-15 07:08:03', NULL),
(6, 'hook_Qz0dpBvTKtKponx3', 'charge.paid', 200, 'paid', 'reservation', 62, '{\n  \"id\": \"hook_Qz0dpBvTKtKponx3\",\n  \"account\": {\n    \"id\": \"acc_W695O0gUESAg4EyZ\",\n    \"name\": \"ZE.EFE - MARCA LA - test\"\n  },\n  \"type\": \"charge.paid\",\n  \"created_at\": \"2025-12-15T10:08:03.4374143Z\",\n  \"data\": {\n    \"amount\": 150200,\n    \"code\": \"res_62_693fddf7067c7\",\n    \"created_at\": \"2025-12-15T10:07:51\",\n    \"currency\": \"BRL\",\n    \"customer\": {\n      \"address\": {\n        \"city\": \"São Paulo\",\n        \"country\": \"BR\",\n        \"created_at\": \"2025-12-07T01:08:27\",\n        \"id\": \"addr_xzJYZROfEWH4Ylgy\",\n        \"line_1\": \"Avenida Cotovia, 111\",\n        \"line_2\": \"12\",\n        \"state\": \"SP\",\n        \"status\": \"active\",\n        \"updated_at\": \"2025-12-07T01:08:27\",\n        \"zip_code\": \"04517000\"\n      },\n      \"created_at\": \"2025-12-02T20:39:07\",\n      \"delinquent\": false,\n      \"document\": \"37333590895\",\n      \"email\": \"benyfink@gmail.com\",\n      \"id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"name\": \"Beny\",\n      \"phones\": {\n        \"mobile_phone\": {\n          \"area_code\": \"11\",\n          \"country_code\": \"55\",\n          \"number\": \"967147377\"\n        }\n      },\n      \"type\": \"individual\",\n      \"updated_at\": \"2025-12-07T01:08:27\"\n    },\n    \"gateway_id\": \"2212367904\",\n    \"id\": \"ch_y2A6xrrT3xuQmJ5P\",\n    \"last_transaction\": {\n      \"acquirer_auth_code\": \"984403\",\n      \"acquirer_message\": \"Transação aprovada com sucesso\",\n      \"acquirer_name\": \"pagarme\",\n      \"acquirer_nsu\": \"2212367904\",\n      \"acquirer_return_code\": \"0000\",\n      \"acquirer_tid\": \"2212367904\",\n      \"amount\": 150200,\n      \"antifraud_response\": {\n        \"provider_name\": \"pagarme\",\n        \"score\": \"moderated\",\n        \"status\": \"approved\"\n      },\n      \"brand_id\": \"571157\",\n      \"card\": {\n        \"billing_address\": {\n          \"city\": \"São Paulo\",\n          \"country\": \"BR\",\n          \"line_1\": \"Avenida Cotovia 111\",\n          \"line_2\": \"12\",\n          \"state\": \"SP\",\n          \"zip_code\": \"04517000\"\n        },\n        \"brand\": \"Mastercard\",\n        \"created_at\": \"2025-12-08T10:01:44\",\n        \"exp_month\": 12,\n        \"exp_year\": 2032,\n        \"first_six_digits\": \"548083\",\n        \"holder_name\": \"Beny J Finkelstein\",\n        \"id\": \"card_eP4dJYmHrKuaxLWK\",\n        \"last_four_digits\": \"8405\",\n        \"status\": \"active\",\n        \"type\": \"credit\",\n        \"updated_at\": \"2025-12-08T10:01:44\"\n      },\n      \"created_at\": \"2025-12-15T10:07:51\",\n      \"funding_source\": \"credit\",\n      \"gateway_id\": \"2212367904\",\n      \"gateway_response\": {\n        \"code\": \"200\",\n        \"errors\": []\n      },\n      \"id\": \"tran_rKB2pXOc5YuQW2wq\",\n      \"installments\": 1,\n      \"metadata\": {},\n      \"operation_type\": \"auth_and_capture\",\n      \"status\": \"captured\",\n      \"success\": true,\n      \"transaction_type\": \"credit_card\",\n      \"updated_at\": \"2025-12-15T10:07:51\"\n    },\n    \"metadata\": {\n      \"client_id\": \"11\",\n      \"context\": \"reservation\",\n      \"entity\": \"reservation\",\n      \"reservation_id\": \"62\",\n      \"room_id\": \"1\"\n    },\n    \"order\": {\n      \"amount\": 150200,\n      \"closed\": true,\n      \"closed_at\": \"2025-12-15T10:07:51\",\n      \"code\": \"res_62_693fddf7067c7\",\n      \"created_at\": \"2025-12-15T10:07:51\",\n      \"currency\": \"BRL\",\n      \"customer_id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"id\": \"or_rem8oq5foRCPPz24\",\n      \"metadata\": {\n        \"client_id\": \"11\",\n        \"context\": \"reservation\",\n        \"entity\": \"reservation\",\n        \"reservation_id\": \"62\",\n        \"room_id\": \"1\"\n      },\n      \"status\": \"paid\",\n      \"updated_at\": \"2025-12-15T10:07:52\"\n    },\n    \"paid_amount\": 150200,\n    \"paid_at\": \"2025-12-15T10:07:52\",\n    \"payment_method\": \"credit_card\",\n    \"status\": \"paid\",\n    \"updated_at\": \"2025-12-15T10:07:52\"\n  }\n}', '2025-12-15 07:08:03', NULL),
(7, 'hook_pOLJeKyZuDcgwZNW', 'charge.created', 200, 'processed:paid', 'reservation', 63, '{\n  \"id\": \"hook_pOLJeKyZuDcgwZNW\",\n  \"account\": {\n    \"id\": \"acc_W695O0gUESAg4EyZ\",\n    \"name\": \"ZE.EFE - MARCA LA - test\"\n  },\n  \"type\": \"charge.created\",\n  \"created_at\": \"2025-12-15T10:18:38.4571604Z\",\n  \"data\": {\n    \"amount\": 150200,\n    \"code\": \"res_63_693fe07365eb6\",\n    \"created_at\": \"2025-12-15T10:18:27\",\n    \"currency\": \"BRL\",\n    \"customer\": {\n      \"address\": {\n        \"city\": \"São Paulo\",\n        \"country\": \"BR\",\n        \"created_at\": \"2025-12-07T01:08:27\",\n        \"id\": \"addr_xzJYZROfEWH4Ylgy\",\n        \"line_1\": \"Avenida Cotovia, 111\",\n        \"line_2\": \"12\",\n        \"state\": \"SP\",\n        \"status\": \"active\",\n        \"updated_at\": \"2025-12-07T01:08:27\",\n        \"zip_code\": \"04517000\"\n      },\n      \"created_at\": \"2025-12-02T20:39:07\",\n      \"delinquent\": false,\n      \"document\": \"37333590895\",\n      \"email\": \"benyfink@gmail.com\",\n      \"id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"name\": \"Beny\",\n      \"phones\": {\n        \"mobile_phone\": {\n          \"area_code\": \"11\",\n          \"country_code\": \"55\",\n          \"number\": \"967147377\"\n        }\n      },\n      \"type\": \"individual\",\n      \"updated_at\": \"2025-12-07T01:08:27\"\n    },\n    \"gateway_id\": \"2212367920\",\n    \"id\": \"ch_WrA8ExMfLi92n0p6\",\n    \"last_transaction\": {\n      \"acquirer_auth_code\": \"284397\",\n      \"acquirer_message\": \"Transação aprovada com sucesso\",\n      \"acquirer_name\": \"pagarme\",\n      \"acquirer_nsu\": \"2212367920\",\n      \"acquirer_return_code\": \"0000\",\n      \"acquirer_tid\": \"2212367920\",\n      \"amount\": 150200,\n      \"antifraud_response\": {\n        \"provider_name\": \"pagarme\",\n        \"score\": \"moderated\",\n        \"status\": \"approved\"\n      },\n      \"brand_id\": \"216901\",\n      \"card\": {\n        \"billing_address\": {\n          \"city\": \"São Paulo\",\n          \"country\": \"BR\",\n          \"line_1\": \"Avenida Cotovia 111\",\n          \"line_2\": \"12\",\n          \"state\": \"SP\",\n          \"zip_code\": \"04517000\"\n        },\n        \"brand\": \"Mastercard\",\n        \"created_at\": \"2025-12-08T10:01:44\",\n        \"exp_month\": 12,\n        \"exp_year\": 2032,\n        \"first_six_digits\": \"548083\",\n        \"holder_name\": \"Beny J Finkelstein\",\n        \"id\": \"card_eP4dJYmHrKuaxLWK\",\n        \"last_four_digits\": \"8405\",\n        \"status\": \"active\",\n        \"type\": \"credit\",\n        \"updated_at\": \"2025-12-08T10:01:44\"\n      },\n      \"created_at\": \"2025-12-15T10:18:27\",\n      \"funding_source\": \"credit\",\n      \"gateway_id\": \"2212367920\",\n      \"gateway_response\": {\n        \"code\": \"200\",\n        \"errors\": []\n      },\n      \"id\": \"tran_wWlDnRKFPiRD20bm\",\n      \"installments\": 1,\n      \"metadata\": {},\n      \"operation_type\": \"auth_and_capture\",\n      \"status\": \"captured\",\n      \"success\": true,\n      \"transaction_type\": \"credit_card\",\n      \"updated_at\": \"2025-12-15T10:18:27\"\n    },\n    \"metadata\": {\n      \"client_id\": \"11\",\n      \"context\": \"reservation\",\n      \"entity\": \"reservation\",\n      \"reservation_id\": \"63\",\n      \"room_id\": \"1\"\n    },\n    \"order\": {\n      \"amount\": 150200,\n      \"closed\": true,\n      \"closed_at\": \"2025-12-15T10:18:27\",\n      \"code\": \"res_63_693fe07365eb6\",\n      \"created_at\": \"2025-12-15T10:18:27\",\n      \"currency\": \"BRL\",\n      \"customer_id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"id\": \"or_zYEPGB3iJPI38RM9\",\n      \"metadata\": {\n        \"client_id\": \"11\",\n        \"context\": \"reservation\",\n        \"entity\": \"reservation\",\n        \"reservation_id\": \"63\",\n        \"room_id\": \"1\"\n      },\n      \"status\": \"paid\",\n      \"updated_at\": \"2025-12-15T10:18:28\"\n    },\n    \"paid_amount\": 150200,\n    \"paid_at\": \"2025-12-15T10:18:28\",\n    \"payment_method\": \"credit_card\",\n    \"status\": \"paid\",\n    \"updated_at\": \"2025-12-15T10:18:28\"\n  }\n}', '2025-12-15 07:18:38', '2025-12-15 07:18:39'),
(8, 'hook_GRa1z2jsatYzQ90m', 'order_item.created', 200, 'processed:pending', 'reservation', 63, '{\n  \"id\": \"hook_GRa1z2jsatYzQ90m\",\n  \"account\": {\n    \"id\": \"acc_W695O0gUESAg4EyZ\",\n    \"name\": \"ZE.EFE - MARCA LA - test\"\n  },\n  \"type\": \"order_item.created\",\n  \"created_at\": \"2025-12-15T10:18:39.0518424Z\",\n  \"data\": {\n    \"amount\": 150200,\n    \"code\": \"reservation\",\n    \"created_at\": \"2025-12-15T10:18:27\",\n    \"description\": \"reserva e-mail\",\n    \"id\": \"oi_82DWk5JcPsVNrqM9\",\n    \"order\": {\n      \"amount\": 150200,\n      \"closed\": true,\n      \"closed_at\": \"2025-12-15T10:18:27\",\n      \"code\": \"res_63_693fe07365eb6\",\n      \"created_at\": \"2025-12-15T10:18:27\",\n      \"currency\": \"BRL\",\n      \"id\": \"or_zYEPGB3iJPI38RM9\",\n      \"items\": [\n        {\n          \"amount\": 150200,\n          \"code\": \"reservation\",\n          \"description\": \"reserva e-mail\",\n          \"id\": \"oi_82DWk5JcPsVNrqM9\",\n          \"quantity\": 1,\n          \"status\": \"active\"\n        }\n      ],\n      \"metadata\": {\n        \"client_id\": \"11\",\n        \"context\": \"reservation\",\n        \"entity\": \"reservation\",\n        \"reservation_id\": \"63\",\n        \"room_id\": \"1\"\n      },\n      \"status\": \"paid\",\n      \"updated_at\": \"2025-12-15T10:18:28\"\n    },\n    \"quantity\": 1,\n    \"status\": \"active\",\n    \"type\": \"product\",\n    \"updated_at\": \"2025-12-15T10:18:27\"\n  }\n}', '2025-12-15 07:18:39', '2025-12-15 07:18:39'),
(9, 'hook_xZR713fzAFBdO3L4', 'charge.antifraud_approved', 200, 'processed:paid', 'reservation', 63, '{\n  \"id\": \"hook_xZR713fzAFBdO3L4\",\n  \"account\": {\n    \"id\": \"acc_W695O0gUESAg4EyZ\",\n    \"name\": \"ZE.EFE - MARCA LA - test\"\n  },\n  \"type\": \"charge.antifraud_approved\",\n  \"created_at\": \"2025-12-15T10:18:39.8185719Z\",\n  \"data\": {\n    \"amount\": 150200,\n    \"code\": \"res_63_693fe07365eb6\",\n    \"created_at\": \"2025-12-15T10:18:27\",\n    \"currency\": \"BRL\",\n    \"customer\": {\n      \"address\": {\n        \"city\": \"São Paulo\",\n        \"country\": \"BR\",\n        \"created_at\": \"2025-12-07T01:08:27\",\n        \"id\": \"addr_xzJYZROfEWH4Ylgy\",\n        \"line_1\": \"Avenida Cotovia, 111\",\n        \"line_2\": \"12\",\n        \"state\": \"SP\",\n        \"status\": \"active\",\n        \"updated_at\": \"2025-12-07T01:08:27\",\n        \"zip_code\": \"04517000\"\n      },\n      \"created_at\": \"2025-12-02T20:39:07\",\n      \"delinquent\": false,\n      \"document\": \"37333590895\",\n      \"email\": \"benyfink@gmail.com\",\n      \"id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"name\": \"Beny\",\n      \"phones\": {\n        \"mobile_phone\": {\n          \"area_code\": \"11\",\n          \"country_code\": \"55\",\n          \"number\": \"967147377\"\n        }\n      },\n      \"type\": \"individual\",\n      \"updated_at\": \"2025-12-07T01:08:27\"\n    },\n    \"gateway_id\": \"2212367920\",\n    \"id\": \"ch_WrA8ExMfLi92n0p6\",\n    \"last_transaction\": {\n      \"acquirer_auth_code\": \"284397\",\n      \"acquirer_message\": \"Transação aprovada com sucesso\",\n      \"acquirer_name\": \"pagarme\",\n      \"acquirer_nsu\": \"2212367920\",\n      \"acquirer_return_code\": \"0000\",\n      \"acquirer_tid\": \"2212367920\",\n      \"amount\": 150200,\n      \"antifraud_response\": {\n        \"provider_name\": \"pagarme\",\n        \"score\": \"moderated\",\n        \"status\": \"approved\"\n      },\n      \"brand_id\": \"216901\",\n      \"card\": {\n        \"billing_address\": {\n          \"city\": \"São Paulo\",\n          \"country\": \"BR\",\n          \"line_1\": \"Avenida Cotovia 111\",\n          \"line_2\": \"12\",\n          \"state\": \"SP\",\n          \"zip_code\": \"04517000\"\n        },\n        \"brand\": \"Mastercard\",\n        \"created_at\": \"2025-12-08T10:01:44\",\n        \"exp_month\": 12,\n        \"exp_year\": 2032,\n        \"first_six_digits\": \"548083\",\n        \"holder_name\": \"Beny J Finkelstein\",\n        \"id\": \"card_eP4dJYmHrKuaxLWK\",\n        \"last_four_digits\": \"8405\",\n        \"status\": \"active\",\n        \"type\": \"credit\",\n        \"updated_at\": \"2025-12-08T10:01:44\"\n      },\n      \"created_at\": \"2025-12-15T10:18:27\",\n      \"funding_source\": \"credit\",\n      \"gateway_id\": \"2212367920\",\n      \"gateway_response\": {\n        \"code\": \"200\",\n        \"errors\": []\n      },\n      \"id\": \"tran_wWlDnRKFPiRD20bm\",\n      \"installments\": 1,\n      \"metadata\": {},\n      \"operation_type\": \"auth_and_capture\",\n      \"status\": \"captured\",\n      \"success\": true,\n      \"transaction_type\": \"credit_card\",\n      \"updated_at\": \"2025-12-15T10:18:27\"\n    },\n    \"metadata\": {\n      \"client_id\": \"11\",\n      \"context\": \"reservation\",\n      \"entity\": \"reservation\",\n      \"reservation_id\": \"63\",\n      \"room_id\": \"1\"\n    },\n    \"order\": {\n      \"amount\": 150200,\n      \"closed\": true,\n      \"closed_at\": \"2025-12-15T10:18:27\",\n      \"code\": \"res_63_693fe07365eb6\",\n      \"created_at\": \"2025-12-15T10:18:27\",\n      \"currency\": \"BRL\",\n      \"customer_id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"id\": \"or_zYEPGB3iJPI38RM9\",\n      \"metadata\": {\n        \"client_id\": \"11\",\n        \"context\": \"reservation\",\n        \"entity\": \"reservation\",\n        \"reservation_id\": \"63\",\n        \"room_id\": \"1\"\n      },\n      \"status\": \"paid\",\n      \"updated_at\": \"2025-12-15T10:18:28\"\n    },\n    \"paid_amount\": 150200,\n    \"paid_at\": \"2025-12-15T10:18:28\",\n    \"payment_method\": \"credit_card\",\n    \"status\": \"paid\",\n    \"updated_at\": \"2025-12-15T10:18:28\"\n  }\n}', '2025-12-15 07:18:39', '2025-12-15 07:18:40'),
(10, 'hook_L469PZwUrH70VKJX', 'charge.paid', 200, 'processed:paid', 'reservation', 63, '{\n  \"id\": \"hook_L469PZwUrH70VKJX\",\n  \"account\": {\n    \"id\": \"acc_W695O0gUESAg4EyZ\",\n    \"name\": \"ZE.EFE - MARCA LA - test\"\n  },\n  \"type\": \"charge.paid\",\n  \"created_at\": \"2025-12-15T10:18:40.0553764Z\",\n  \"data\": {\n    \"amount\": 150200,\n    \"code\": \"res_63_693fe07365eb6\",\n    \"created_at\": \"2025-12-15T10:18:27\",\n    \"currency\": \"BRL\",\n    \"customer\": {\n      \"address\": {\n        \"city\": \"São Paulo\",\n        \"country\": \"BR\",\n        \"created_at\": \"2025-12-07T01:08:27\",\n        \"id\": \"addr_xzJYZROfEWH4Ylgy\",\n        \"line_1\": \"Avenida Cotovia, 111\",\n        \"line_2\": \"12\",\n        \"state\": \"SP\",\n        \"status\": \"active\",\n        \"updated_at\": \"2025-12-07T01:08:27\",\n        \"zip_code\": \"04517000\"\n      },\n      \"created_at\": \"2025-12-02T20:39:07\",\n      \"delinquent\": false,\n      \"document\": \"37333590895\",\n      \"email\": \"benyfink@gmail.com\",\n      \"id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"name\": \"Beny\",\n      \"phones\": {\n        \"mobile_phone\": {\n          \"area_code\": \"11\",\n          \"country_code\": \"55\",\n          \"number\": \"967147377\"\n        }\n      },\n      \"type\": \"individual\",\n      \"updated_at\": \"2025-12-07T01:08:27\"\n    },\n    \"gateway_id\": \"2212367920\",\n    \"id\": \"ch_WrA8ExMfLi92n0p6\",\n    \"last_transaction\": {\n      \"acquirer_auth_code\": \"284397\",\n      \"acquirer_message\": \"Transação aprovada com sucesso\",\n      \"acquirer_name\": \"pagarme\",\n      \"acquirer_nsu\": \"2212367920\",\n      \"acquirer_return_code\": \"0000\",\n      \"acquirer_tid\": \"2212367920\",\n      \"amount\": 150200,\n      \"antifraud_response\": {\n        \"provider_name\": \"pagarme\",\n        \"score\": \"moderated\",\n        \"status\": \"approved\"\n      },\n      \"brand_id\": \"216901\",\n      \"card\": {\n        \"billing_address\": {\n          \"city\": \"São Paulo\",\n          \"country\": \"BR\",\n          \"line_1\": \"Avenida Cotovia 111\",\n          \"line_2\": \"12\",\n          \"state\": \"SP\",\n          \"zip_code\": \"04517000\"\n        },\n        \"brand\": \"Mastercard\",\n        \"created_at\": \"2025-12-08T10:01:44\",\n        \"exp_month\": 12,\n        \"exp_year\": 2032,\n        \"first_six_digits\": \"548083\",\n        \"holder_name\": \"Beny J Finkelstein\",\n        \"id\": \"card_eP4dJYmHrKuaxLWK\",\n        \"last_four_digits\": \"8405\",\n        \"status\": \"active\",\n        \"type\": \"credit\",\n        \"updated_at\": \"2025-12-08T10:01:44\"\n      },\n      \"created_at\": \"2025-12-15T10:18:27\",\n      \"funding_source\": \"credit\",\n      \"gateway_id\": \"2212367920\",\n      \"gateway_response\": {\n        \"code\": \"200\",\n        \"errors\": []\n      },\n      \"id\": \"tran_wWlDnRKFPiRD20bm\",\n      \"installments\": 1,\n      \"metadata\": {},\n      \"operation_type\": \"auth_and_capture\",\n      \"status\": \"captured\",\n      \"success\": true,\n      \"transaction_type\": \"credit_card\",\n      \"updated_at\": \"2025-12-15T10:18:27\"\n    },\n    \"metadata\": {\n      \"client_id\": \"11\",\n      \"context\": \"reservation\",\n      \"entity\": \"reservation\",\n      \"reservation_id\": \"63\",\n      \"room_id\": \"1\"\n    },\n    \"order\": {\n      \"amount\": 150200,\n      \"closed\": true,\n      \"closed_at\": \"2025-12-15T10:18:27\",\n      \"code\": \"res_63_693fe07365eb6\",\n      \"created_at\": \"2025-12-15T10:18:27\",\n      \"currency\": \"BRL\",\n      \"customer_id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"id\": \"or_zYEPGB3iJPI38RM9\",\n      \"metadata\": {\n        \"client_id\": \"11\",\n        \"context\": \"reservation\",\n        \"entity\": \"reservation\",\n        \"reservation_id\": \"63\",\n        \"room_id\": \"1\"\n      },\n      \"status\": \"paid\",\n      \"updated_at\": \"2025-12-15T10:18:28\"\n    },\n    \"paid_amount\": 150200,\n    \"paid_at\": \"2025-12-15T10:18:28\",\n    \"payment_method\": \"credit_card\",\n    \"status\": \"paid\",\n    \"updated_at\": \"2025-12-15T10:18:28\"\n  }\n}', '2025-12-15 07:18:40', '2025-12-15 07:18:41'),
(11, 'hook_bJLj6JTlEfzDjvmV', 'order_item.created', 200, 'processed:pending', 'reservation', 64, '{\n  \"id\": \"hook_bJLj6JTlEfzDjvmV\",\n  \"account\": {\n    \"id\": \"acc_W695O0gUESAg4EyZ\",\n    \"name\": \"ZE.EFE - MARCA LA - test\"\n  },\n  \"type\": \"order_item.created\",\n  \"created_at\": \"2025-12-15T10:25:10.3083681Z\",\n  \"data\": {\n    \"amount\": 150200,\n    \"code\": \"reservation\",\n    \"created_at\": \"2025-12-15T10:24:59\",\n    \"description\": \"gese\",\n    \"id\": \"oi_DZWyo5rT34TnQkgV\",\n    \"order\": {\n      \"amount\": 150200,\n      \"closed\": true,\n      \"closed_at\": \"2025-12-15T10:24:59\",\n      \"code\": \"res_64_693fe1fb51398\",\n      \"created_at\": \"2025-12-15T10:24:59\",\n      \"currency\": \"BRL\",\n      \"id\": \"or_nrL1p6ksvfgaGy2b\",\n      \"items\": [\n        {\n          \"amount\": 150200,\n          \"code\": \"reservation\",\n          \"description\": \"gese\",\n          \"id\": \"oi_DZWyo5rT34TnQkgV\",\n          \"quantity\": 1,\n          \"status\": \"active\"\n        }\n      ],\n      \"metadata\": {\n        \"client_id\": \"11\",\n        \"context\": \"reservation\",\n        \"entity\": \"reservation\",\n        \"reservation_id\": \"64\",\n        \"room_id\": \"1\"\n      },\n      \"status\": \"paid\",\n      \"updated_at\": \"2025-12-15T10:25:00\"\n    },\n    \"quantity\": 1,\n    \"status\": \"active\",\n    \"type\": \"product\",\n    \"updated_at\": \"2025-12-15T10:24:59\"\n  }\n}', '2025-12-15 07:25:10', '2025-12-15 07:25:10'),
(12, 'hook_Bz37gEAHamIOnRwl', 'charge.created', 200, 'processed:paid', 'reservation', 64, '{\n  \"id\": \"hook_Bz37gEAHamIOnRwl\",\n  \"account\": {\n    \"id\": \"acc_W695O0gUESAg4EyZ\",\n    \"name\": \"ZE.EFE - MARCA LA - test\"\n  },\n  \"type\": \"charge.created\",\n  \"created_at\": \"2025-12-15T10:25:10.5420525Z\",\n  \"data\": {\n    \"amount\": 150200,\n    \"code\": \"res_64_693fe1fb51398\",\n    \"created_at\": \"2025-12-15T10:24:59\",\n    \"currency\": \"BRL\",\n    \"customer\": {\n      \"address\": {\n        \"city\": \"São Paulo\",\n        \"country\": \"BR\",\n        \"created_at\": \"2025-12-07T01:08:27\",\n        \"id\": \"addr_xzJYZROfEWH4Ylgy\",\n        \"line_1\": \"Avenida Cotovia, 111\",\n        \"line_2\": \"12\",\n        \"state\": \"SP\",\n        \"status\": \"active\",\n        \"updated_at\": \"2025-12-07T01:08:27\",\n        \"zip_code\": \"04517000\"\n      },\n      \"created_at\": \"2025-12-02T20:39:07\",\n      \"delinquent\": false,\n      \"document\": \"37333590895\",\n      \"email\": \"benyfink@gmail.com\",\n      \"id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"name\": \"Beny\",\n      \"phones\": {\n        \"mobile_phone\": {\n          \"area_code\": \"11\",\n          \"country_code\": \"55\",\n          \"number\": \"967147377\"\n        }\n      },\n      \"type\": \"individual\",\n      \"updated_at\": \"2025-12-07T01:08:27\"\n    },\n    \"gateway_id\": \"2212367923\",\n    \"id\": \"ch_znMaWESAXiPz3p98\",\n    \"last_transaction\": {\n      \"acquirer_auth_code\": \"145146\",\n      \"acquirer_message\": \"Transação aprovada com sucesso\",\n      \"acquirer_name\": \"pagarme\",\n      \"acquirer_nsu\": \"2212367923\",\n      \"acquirer_return_code\": \"0000\",\n      \"acquirer_tid\": \"2212367923\",\n      \"amount\": 150200,\n      \"antifraud_response\": {\n        \"provider_name\": \"pagarme\",\n        \"score\": \"moderated\",\n        \"status\": \"approved\"\n      },\n      \"brand_id\": \"30552\",\n      \"card\": {\n        \"billing_address\": {\n          \"city\": \"São Paulo\",\n          \"country\": \"BR\",\n          \"line_1\": \"Avenida Cotovia 111\",\n          \"line_2\": \"12\",\n          \"state\": \"SP\",\n          \"zip_code\": \"04517000\"\n        },\n        \"brand\": \"Mastercard\",\n        \"created_at\": \"2025-12-08T10:01:44\",\n        \"exp_month\": 12,\n        \"exp_year\": 2032,\n        \"first_six_digits\": \"548083\",\n        \"holder_name\": \"Beny J Finkelstein\",\n        \"id\": \"card_eP4dJYmHrKuaxLWK\",\n        \"last_four_digits\": \"8405\",\n        \"status\": \"active\",\n        \"type\": \"credit\",\n        \"updated_at\": \"2025-12-08T10:01:44\"\n      },\n      \"created_at\": \"2025-12-15T10:24:59\",\n      \"funding_source\": \"credit\",\n      \"gateway_id\": \"2212367923\",\n      \"gateway_response\": {\n        \"code\": \"200\",\n        \"errors\": []\n      },\n      \"id\": \"tran_Xo1RVrQhqbU0RZA3\",\n      \"installments\": 1,\n      \"metadata\": {},\n      \"operation_type\": \"auth_and_capture\",\n      \"status\": \"captured\",\n      \"success\": true,\n      \"transaction_type\": \"credit_card\",\n      \"updated_at\": \"2025-12-15T10:24:59\"\n    },\n    \"metadata\": {\n      \"client_id\": \"11\",\n      \"context\": \"reservation\",\n      \"entity\": \"reservation\",\n      \"reservation_id\": \"64\",\n      \"room_id\": \"1\"\n    },\n    \"order\": {\n      \"amount\": 150200,\n      \"closed\": true,\n      \"closed_at\": \"2025-12-15T10:24:59\",\n      \"code\": \"res_64_693fe1fb51398\",\n      \"created_at\": \"2025-12-15T10:24:59\",\n      \"currency\": \"BRL\",\n      \"customer_id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"id\": \"or_nrL1p6ksvfgaGy2b\",\n      \"metadata\": {\n        \"client_id\": \"11\",\n        \"context\": \"reservation\",\n        \"entity\": \"reservation\",\n        \"reservation_id\": \"64\",\n        \"room_id\": \"1\"\n      },\n      \"status\": \"paid\",\n      \"updated_at\": \"2025-12-15T10:25:00\"\n    },\n    \"paid_amount\": 150200,\n    \"paid_at\": \"2025-12-15T10:25:00\",\n    \"payment_method\": \"credit_card\",\n    \"status\": \"paid\",\n    \"updated_at\": \"2025-12-15T10:25:00\"\n  }\n}', '2025-12-15 07:25:10', '2025-12-15 07:25:10'),
(13, 'hook_M3GQlL3Hdouoq9k7', 'charge.paid', 200, 'processed:paid', 'reservation', 64, '{\n  \"id\": \"hook_M3GQlL3Hdouoq9k7\",\n  \"account\": {\n    \"id\": \"acc_W695O0gUESAg4EyZ\",\n    \"name\": \"ZE.EFE - MARCA LA - test\"\n  },\n  \"type\": \"charge.paid\",\n  \"created_at\": \"2025-12-15T10:25:11.3885398Z\",\n  \"data\": {\n    \"amount\": 150200,\n    \"code\": \"res_64_693fe1fb51398\",\n    \"created_at\": \"2025-12-15T10:24:59\",\n    \"currency\": \"BRL\",\n    \"customer\": {\n      \"address\": {\n        \"city\": \"São Paulo\",\n        \"country\": \"BR\",\n        \"created_at\": \"2025-12-07T01:08:27\",\n        \"id\": \"addr_xzJYZROfEWH4Ylgy\",\n        \"line_1\": \"Avenida Cotovia, 111\",\n        \"line_2\": \"12\",\n        \"state\": \"SP\",\n        \"status\": \"active\",\n        \"updated_at\": \"2025-12-07T01:08:27\",\n        \"zip_code\": \"04517000\"\n      },\n      \"created_at\": \"2025-12-02T20:39:07\",\n      \"delinquent\": false,\n      \"document\": \"37333590895\",\n      \"email\": \"benyfink@gmail.com\",\n      \"id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"name\": \"Beny\",\n      \"phones\": {\n        \"mobile_phone\": {\n          \"area_code\": \"11\",\n          \"country_code\": \"55\",\n          \"number\": \"967147377\"\n        }\n      },\n      \"type\": \"individual\",\n      \"updated_at\": \"2025-12-07T01:08:27\"\n    },\n    \"gateway_id\": \"2212367923\",\n    \"id\": \"ch_znMaWESAXiPz3p98\",\n    \"last_transaction\": {\n      \"acquirer_auth_code\": \"145146\",\n      \"acquirer_message\": \"Transação aprovada com sucesso\",\n      \"acquirer_name\": \"pagarme\",\n      \"acquirer_nsu\": \"2212367923\",\n      \"acquirer_return_code\": \"0000\",\n      \"acquirer_tid\": \"2212367923\",\n      \"amount\": 150200,\n      \"antifraud_response\": {\n        \"provider_name\": \"pagarme\",\n        \"score\": \"moderated\",\n        \"status\": \"approved\"\n      },\n      \"brand_id\": \"30552\",\n      \"card\": {\n        \"billing_address\": {\n          \"city\": \"São Paulo\",\n          \"country\": \"BR\",\n          \"line_1\": \"Avenida Cotovia 111\",\n          \"line_2\": \"12\",\n          \"state\": \"SP\",\n          \"zip_code\": \"04517000\"\n        },\n        \"brand\": \"Mastercard\",\n        \"created_at\": \"2025-12-08T10:01:44\",\n        \"exp_month\": 12,\n        \"exp_year\": 2032,\n        \"first_six_digits\": \"548083\",\n        \"holder_name\": \"Beny J Finkelstein\",\n        \"id\": \"card_eP4dJYmHrKuaxLWK\",\n        \"last_four_digits\": \"8405\",\n        \"status\": \"active\",\n        \"type\": \"credit\",\n        \"updated_at\": \"2025-12-08T10:01:44\"\n      },\n      \"created_at\": \"2025-12-15T10:24:59\",\n      \"funding_source\": \"credit\",\n      \"gateway_id\": \"2212367923\",\n      \"gateway_response\": {\n        \"code\": \"200\",\n        \"errors\": []\n      },\n      \"id\": \"tran_Xo1RVrQhqbU0RZA3\",\n      \"installments\": 1,\n      \"metadata\": {},\n      \"operation_type\": \"auth_and_capture\",\n      \"status\": \"captured\",\n      \"success\": true,\n      \"transaction_type\": \"credit_card\",\n      \"updated_at\": \"2025-12-15T10:24:59\"\n    },\n    \"metadata\": {\n      \"client_id\": \"11\",\n      \"context\": \"reservation\",\n      \"entity\": \"reservation\",\n      \"reservation_id\": \"64\",\n      \"room_id\": \"1\"\n    },\n    \"order\": {\n      \"amount\": 150200,\n      \"closed\": true,\n      \"closed_at\": \"2025-12-15T10:24:59\",\n      \"code\": \"res_64_693fe1fb51398\",\n      \"created_at\": \"2025-12-15T10:24:59\",\n      \"currency\": \"BRL\",\n      \"customer_id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"id\": \"or_nrL1p6ksvfgaGy2b\",\n      \"metadata\": {\n        \"client_id\": \"11\",\n        \"context\": \"reservation\",\n        \"entity\": \"reservation\",\n        \"reservation_id\": \"64\",\n        \"room_id\": \"1\"\n      },\n      \"status\": \"paid\",\n      \"updated_at\": \"2025-12-15T10:25:00\"\n    },\n    \"paid_amount\": 150200,\n    \"paid_at\": \"2025-12-15T10:25:00\",\n    \"payment_method\": \"credit_card\",\n    \"status\": \"paid\",\n    \"updated_at\": \"2025-12-15T10:25:00\"\n  }\n}', '2025-12-15 07:25:11', '2025-12-15 07:25:11');
INSERT INTO `stripe_events` (`id`, `hook_id`, `event_type`, `status_code`, `status_text`, `entity`, `context_id`, `payload`, `received_at`, `processed_at`) VALUES
(14, 'hook_mO616AqIJtQyp3KR', 'charge.antifraud_approved', 200, 'processed:paid', 'reservation', 64, '{\n  \"id\": \"hook_mO616AqIJtQyp3KR\",\n  \"account\": {\n    \"id\": \"acc_W695O0gUESAg4EyZ\",\n    \"name\": \"ZE.EFE - MARCA LA - test\"\n  },\n  \"type\": \"charge.antifraud_approved\",\n  \"created_at\": \"2025-12-15T10:25:11.5464772Z\",\n  \"data\": {\n    \"amount\": 150200,\n    \"code\": \"res_64_693fe1fb51398\",\n    \"created_at\": \"2025-12-15T10:24:59\",\n    \"currency\": \"BRL\",\n    \"customer\": {\n      \"address\": {\n        \"city\": \"São Paulo\",\n        \"country\": \"BR\",\n        \"created_at\": \"2025-12-07T01:08:27\",\n        \"id\": \"addr_xzJYZROfEWH4Ylgy\",\n        \"line_1\": \"Avenida Cotovia, 111\",\n        \"line_2\": \"12\",\n        \"state\": \"SP\",\n        \"status\": \"active\",\n        \"updated_at\": \"2025-12-07T01:08:27\",\n        \"zip_code\": \"04517000\"\n      },\n      \"created_at\": \"2025-12-02T20:39:07\",\n      \"delinquent\": false,\n      \"document\": \"37333590895\",\n      \"email\": \"benyfink@gmail.com\",\n      \"id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"name\": \"Beny\",\n      \"phones\": {\n        \"mobile_phone\": {\n          \"area_code\": \"11\",\n          \"country_code\": \"55\",\n          \"number\": \"967147377\"\n        }\n      },\n      \"type\": \"individual\",\n      \"updated_at\": \"2025-12-07T01:08:27\"\n    },\n    \"gateway_id\": \"2212367923\",\n    \"id\": \"ch_znMaWESAXiPz3p98\",\n    \"last_transaction\": {\n      \"acquirer_auth_code\": \"145146\",\n      \"acquirer_message\": \"Transação aprovada com sucesso\",\n      \"acquirer_name\": \"pagarme\",\n      \"acquirer_nsu\": \"2212367923\",\n      \"acquirer_return_code\": \"0000\",\n      \"acquirer_tid\": \"2212367923\",\n      \"amount\": 150200,\n      \"antifraud_response\": {\n        \"provider_name\": \"pagarme\",\n        \"score\": \"moderated\",\n        \"status\": \"approved\"\n      },\n      \"brand_id\": \"30552\",\n      \"card\": {\n        \"billing_address\": {\n          \"city\": \"São Paulo\",\n          \"country\": \"BR\",\n          \"line_1\": \"Avenida Cotovia 111\",\n          \"line_2\": \"12\",\n          \"state\": \"SP\",\n          \"zip_code\": \"04517000\"\n        },\n        \"brand\": \"Mastercard\",\n        \"created_at\": \"2025-12-08T10:01:44\",\n        \"exp_month\": 12,\n        \"exp_year\": 2032,\n        \"first_six_digits\": \"548083\",\n        \"holder_name\": \"Beny J Finkelstein\",\n        \"id\": \"card_eP4dJYmHrKuaxLWK\",\n        \"last_four_digits\": \"8405\",\n        \"status\": \"active\",\n        \"type\": \"credit\",\n        \"updated_at\": \"2025-12-08T10:01:44\"\n      },\n      \"created_at\": \"2025-12-15T10:24:59\",\n      \"funding_source\": \"credit\",\n      \"gateway_id\": \"2212367923\",\n      \"gateway_response\": {\n        \"code\": \"200\",\n        \"errors\": []\n      },\n      \"id\": \"tran_Xo1RVrQhqbU0RZA3\",\n      \"installments\": 1,\n      \"metadata\": {},\n      \"operation_type\": \"auth_and_capture\",\n      \"status\": \"captured\",\n      \"success\": true,\n      \"transaction_type\": \"credit_card\",\n      \"updated_at\": \"2025-12-15T10:24:59\"\n    },\n    \"metadata\": {\n      \"client_id\": \"11\",\n      \"context\": \"reservation\",\n      \"entity\": \"reservation\",\n      \"reservation_id\": \"64\",\n      \"room_id\": \"1\"\n    },\n    \"order\": {\n      \"amount\": 150200,\n      \"closed\": true,\n      \"closed_at\": \"2025-12-15T10:24:59\",\n      \"code\": \"res_64_693fe1fb51398\",\n      \"created_at\": \"2025-12-15T10:24:59\",\n      \"currency\": \"BRL\",\n      \"customer_id\": \"cus_b7Q4lGrs8h5pWZeN\",\n      \"id\": \"or_nrL1p6ksvfgaGy2b\",\n      \"metadata\": {\n        \"client_id\": \"11\",\n        \"context\": \"reservation\",\n        \"entity\": \"reservation\",\n        \"reservation_id\": \"64\",\n        \"room_id\": \"1\"\n      },\n      \"status\": \"paid\",\n      \"updated_at\": \"2025-12-15T10:25:00\"\n    },\n    \"paid_amount\": 150200,\n    \"paid_at\": \"2025-12-15T10:25:00\",\n    \"payment_method\": \"credit_card\",\n    \"status\": \"paid\",\n    \"updated_at\": \"2025-12-15T10:25:00\"\n  }\n}', '2025-12-15 07:25:11', '2025-12-15 07:25:11');

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
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `discount_owner` enum('platform_only','advertiser_only','split_equal','platform_first','advertiser_first') NOT NULL DEFAULT 'split_equal'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `vouchers`
--

INSERT INTO `vouchers` (`id`, `code`, `type`, `value`, `valid_from`, `valid_to`, `max_redemptions`, `used_count`, `min_amount`, `room_id`, `status`, `created_at`, `updated_at`, `discount_owner`) VALUES
(1, 'ZEF-4T5DUVYCSH', 'percent', 100.00, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 1, 0, NULL, 0, 'ativo', '2025-11-17 21:10:28', '2025-11-28 14:33:25', 'platform_only'),
(2, 'ZEF-GHGGCPCSHP', 'percent', 5.00, NULL, NULL, NULL, 0, NULL, 0, 'ativo', '2025-11-19 17:48:31', NULL, ''),
(3, 'ZEF-GWDMQA49VY', 'percent', 100.00, '2025-11-27 00:00:00', '2025-11-29 00:00:00', 1, 0, NULL, 0, 'ativo', '2025-11-28 14:33:45', '2025-11-28 14:34:48', 'platform_only');

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

-- --------------------------------------------------------

--
-- Estrutura para tabela `workshops`
--

CREATE TABLE `workshops` (
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

INSERT INTO `workshops` (`id`, `public_code`, `advertiser_id`, `room_id`, `title`, `subtitle`, `description`, `category`, `date`, `time_start`, `time_end`, `price_per_seat`, `max_seats`, `show_sold_bar`, `status`, `banner_path`, `created_at`, `updated_at`) VALUES
(1, NULL, 1, 1, 'Teste', NULL, '<b>MEIA ENTRADA ESTUDANTES </b><div><br></div><div>\n\nEstudantes do território nacional de instituições públicas ou particulares do ensino infantil, fundamental, <b>médio, superior,</b> especialização, pós-graduação, mestrado, doutorado, supletivo e técnico profissionalizante, seja ensino presencial ou à distância, possuem o benefício da meia-entrada.  Fonte: Lei 12.933, Lei Federal 12.852, de 26 de dezembro de 2013 e Decreto Federal 8.537, de 05 de outubro de 2015.\n\nCaso não apresente na portaria o documento que comprove o beneficio, será cobrado o complemento de meia para igualar a categoria do ingresso de interia.\n\nJOVENS DE 15 A 29 ANOS PERTENCENTES A FAMÍLIAS DE BAIXA RENDA \n\nJovens 15 a 29 anos pertencentes a famílias de baixa renda possuem o benefício de meia-entrada, desde que estejam inscritos, obrigatoriamente, no Cadastro Único para Programas Sociais do Governo Federal (CADÚNICO), e cuja renda mensal seja de até 02 (dois) salários mínimos.  Como comprovar: apresentação obrigatória da Carteirinha de Identidade Jovem, emitida pela Secretaria Nacional de Juventude, e o Documento de Identidade oficial com foto, expedido por órgão público e válido em todo território nacional, original ou cópia autenticada. Fonte: Lei Federal 12. 933, de 26 de dezembro de 2013 e Decreto 8.537, de 5 de outubro de 2015\n\nPcD – PESSOA COM DEFICIÊNCIA  \n\nPessoas com deficiência (PcD) possuem o benefício da meia-entrada. Se o PcD necessita de auxílio para locomoção, a meia-entrada também se estende ao seu acompanhante, sendo permitido apenas um acompanhante pagando meia-entrada para cada PcD.  Como comprovar: apresentação obrigatória do cartão de Benefício de Prestação Continuada da Assistência Social da pessoa com deficiência ou de documento emitido pelo Instituto Nacional do Seguro Social - INSS que ateste a aposentadoria de acordo com os critérios estabelecidos na Lei Complementar nº 142, de 8 de maio de 2013; em ambos os casos estes documentos devem ser acompanhados de um Documento de Identidade oficial com foto, expedido por órgão público e válido em todo território nacional, original ou cópia autenticada. Fonte: Lei Federal 12.933, de 26 de dezembro de 2013 e Decreto 8.537, de 5 de outubro de 2015\n\nIDOSOS (ADULTOS COM IDADE IGUAL OU SUPERIOR A 60 ANOS) \n\nAdultos com idade igual ou superior a 60 anos possuem o benefício da meia-entrada.  Como comprovar:  apresentação obrigatória do Documento de Identidade original (RG) ou cópia autenticada. Fonte: Lei Federal 10.741 de 01 de outubro de 2003\n\nMENORES DE 21 ANOS DO MUNICÍPIO DE BELO HORIZONTE \n\nMenores de 21 anos do Município de Belo Horizonte possuem o benefício da meia-entrada.  Como comprovar: apresentação obrigatória do Documento de Identidade oficial com foto, expedido por órgão público e válido em todo território nacional, original ou cópia autenticada. Fonte: Lei Municipal 9.070, de 17 janeiro de 2005\n\nOUTRAS INFORMAÇÕES IMPORTANTES \n\nO benefício da meia-entrada não é cumulativa com outros descontos A carteira estudantil provisória / voucher emitido pelos sites UNE, Ubes e Anpg são aceitos para compra de meia-entrada, desde que apresentados impressos Crianças de até 12 meses não pagam ingresso e devem permanecer no colo. \n\nO ingresso é válido somente para data, horário local e assento para o qual foi emitido.\n\nÓrgãos Responsáveis Pela Fiscalização\n\nProcon Estadual Telefone: (31) 3250-5033 Site: www.mp.mg.gov.br/procon E-mail:  proconcr@mp.mg.gov.br \n\nProcon Municipal Telefone: (31) 156 Site: www.pbh.gov.br/procon E-mail:  procon@pbh.gov.br \n\nProcon Assembleia Telefone: (31) 2108-5500 Site: www.almg.gov.br/procon E-mail:  procon@almg.gov.br \n\nProcon Assembleia – Posto Psiu Telefone: (31) 3272-0108 Site: www.almg.gov.br/procon E-mail:  procon@almg.gov.br \n\nProcon Câmara Municipal Telefone: (31) 3555-1268 E-mail:  procon@cmbh.mg.gov.br</div>', 'Psicologia / Terapia', '2025-12-30', '07:00:00', '10:15:00', 100.00, 15, 0, 'publicado', 'img/workshops/1/ws_1_69245462a548b8.17740968.jpg', '2025-11-22 22:44:30', '2025-12-01 08:01:59'),
(2, NULL, 1, 1, 'Evento teste', 'descobrindo o nada', 'teste', 'Arte e criatividade', '2025-12-30', '08:00:00', '17:00:00', 100.00, 10, 1, 'publicado', 'img/workshops/2/ws_2_692b4445781d59.46608580.jpg', '2025-11-29 16:03:38', '2025-12-01 08:01:48'),
(3, NULL, 1, 1, 'Evento teste 2', NULL, 'teste', 'Saúde e bem-estar', '2025-12-31', '06:00:00', '08:00:00', 1.00, 5, 1, 'publicado', 'img/workshops/3/ws_3_692b44a506d0c9.81676450.webp', '2025-11-29 16:07:34', '2025-12-01 08:01:39');

-- --------------------------------------------------------

--
-- Estrutura para tabela `workshop_enrollments`
--

CREATE TABLE `workshop_enrollments` (
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

-- --------------------------------------------------------

--
-- Estrutura para tabela `workshop_media`
--

CREATE TABLE `workshop_media` (
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

CREATE TABLE `workshop_participants` (
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

INSERT INTO `workshop_participants` (`id`, `name`, `email`, `cpf`, `phone`, `password_hash`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Beny', 'benyfink@gmail.com', '37333590895', NULL, NULL, 'ativo', '2025-11-22 22:45:15', '2025-11-29 22:40:03');

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
-- Índices de tabela `customer_cards`
--
ALTER TABLE `customer_cards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_customer_card` (`client_id`),
  ADD UNIQUE KEY `uniq_stripe_payment_method` (`stripe_payment_method_id`),
  ADD KEY `idx_customer_cards_client` (`client_id`);

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
-- Índices de tabela `payment_intents`
--
ALTER TABLE `payment_intents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_context_order` (`context`,`context_id`,`pagarme_order_id`),
  ADD UNIQUE KEY `uniq_payment_intent_order` (`context`,`context_id`,`pagarme_order_id`),
  ADD KEY `idx_order` (`pagarme_order_id`),
  ADD KEY `idx_payment` (`pagarme_payment_id`),
  ADD KEY `idx_payment_intent_order` (`pagarme_order_id`),
  ADD KEY `idx_payment_intent_payment` (`pagarme_payment_id`);

--
-- Índices de tabela `payouts`
--
ALTER TABLE `payouts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payouts_adv` (`advertiser_id`,`status`,`scheduled_at`);

--
-- Índices de tabela `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_posts_status` (`status`),
  ADD KEY `idx_posts_category` (`category`),
  ADD KEY `idx_posts_published` (`published_at`);

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
  ADD UNIQUE KEY `public_code` (`public_code`),
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
-- Índices de tabela `stripe_events`
--
ALTER TABLE `stripe_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pagarme_event_hook` (`hook_id`),
  ADD KEY `idx_pagarme_event_type` (`event_type`),
  ADD KEY `idx_pagarme_entity_context` (`entity`,`context_id`);

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
-- Índices de tabela `workshops`
--
ALTER TABLE `workshops`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `public_code` (`public_code`),
  ADD KEY `idx_workshop_advertiser` (`advertiser_id`),
  ADD KEY `idx_workshop_room` (`room_id`),
  ADD KEY `idx_workshop_date` (`date`);

--
-- Índices de tabela `workshop_enrollments`
--
ALTER TABLE `workshop_enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_workshop_enrollment_code` (`public_code`),
  ADD KEY `idx_workshop_enrollment_workshop` (`workshop_id`),
  ADD KEY `idx_workshop_enrollment_participant` (`participant_id`),
  ADD KEY `idx_workshop_enrollment_payment` (`payment_status`);

--
-- Índices de tabela `workshop_media`
--
ALTER TABLE `workshop_media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_workshop_media_workshop` (`workshop_id`);

--
-- Índices de tabela `workshop_participants`
--
ALTER TABLE `workshop_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_workshop_participant_email` (`email`),
  ADD KEY `idx_workshop_participant_cpf` (`cpf`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de tabela `amenities`
--
ALTER TABLE `amenities`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `clients`
--
ALTER TABLE `clients`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de tabela `client_remember_tokens`
--
ALTER TABLE `client_remember_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

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
-- AUTO_INCREMENT de tabela `customer_cards`
--
ALTER TABLE `customer_cards`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de tabela `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `message_threads`
--
ALTER TABLE `message_threads`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `payment_intents`
--
ALTER TABLE `payment_intents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `payouts`
--
ALTER TABLE `payouts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de tabela `pre_reservations`
--
ALTER TABLE `pre_reservations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT de tabela `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `room_photos`
--
ALTER TABLE `room_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `stripe_events`
--
ALTER TABLE `stripe_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `visitors`
--
ALTER TABLE `visitors`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `voucher_redemptions`
--
ALTER TABLE `voucher_redemptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `workshops`
--
ALTER TABLE `workshops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `workshop_enrollments`
--
ALTER TABLE `workshop_enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

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
