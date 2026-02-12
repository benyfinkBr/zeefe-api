-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 13/01/2026 às 10:50
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
  `name` varchar(120) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'ativo',
  `profile_id` int(11) DEFAULT NULL,
  `is_master` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `admins`
--

INSERT INTO `admins` (`id`, `username`, `email`, `name`, `password`, `password_hash`, `status`, `profile_id`, `is_master`, `created_at`, `updated_at`) VALUES
(1, '123', 'admin@zeefe.com.br', NULL, '123', NULL, 'ativo', NULL, 1, '2025-10-30 22:36:01', NULL),
(3, 'benymidia', 'benyfink@gmail.com', 'Beny', '$2y$10$wzXoOYZlu.18lhMkW4/F5u14e7rSUwNRPPtWXmHqVQrUFfomf8JyS', '$2y$10$wzXoOYZlu.18lhMkW4/F5u14e7rSUwNRPPtWXmHqVQrUFfomf8JyS', 'ativo', 1, 0, '2026-01-04 15:57:39', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `admin_profiles`
--

CREATE TABLE `admin_profiles` (
  `id` int(11) NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permissions_json` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ativo',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `admin_profiles`
--

INSERT INTO `admin_profiles` (`id`, `name`, `permissions_json`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Midia Manager', '{\"companies\":{\"read\":false},\"reservations\":{\"read\":false},\"clients\":{\"read\":false,\"create\":false},\"visitors\":{\"read\":false,\"create\":false},\"posts\":{\"read\":true,\"create\":true,\"update\":true,\"delete\":true}}', 'ativo', '2026-01-04 12:57:00', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `admin_remember_tokens`
--

CREATE TABLE `admin_remember_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `admin_id` int(11) NOT NULL,
  `token_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `admin_remember_tokens`
--

INSERT INTO `admin_remember_tokens` (`id`, `admin_id`, `token_hash`, `user_agent`, `expires_at`, `created_at`) VALUES
(1, 1, '83406d41ff41150fe979dbcae5e081a3967f5e31a169ae6e5658c9aa34df2523', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-05 12:55:00', '2026-01-04 12:55:00'),
(2, 3, '64e46217f9fcf7b1a047df17f0a01e5564cfacab6acaf0abea21bd5dc4a76c01', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '2026-01-05 12:58:07', '2026-01-04 12:58:07'),
(3, 1, '991f06990b1670b1ea173c59e56fa0f3f0490df386d646f8e427b9a600ae7dc0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 13:59:51', '2026-01-05 13:59:51'),
(4, 1, '67836a97c0f827ddedc156e5d878963f10243cc8a25a870362c6be35a012f4d9', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 16:12:10', '2026-01-06 16:12:10');

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
  `fee_pct_room` decimal(5,2) DEFAULT NULL,
  `fee_pct_workshop` decimal(5,2) DEFAULT NULL,
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

INSERT INTO `advertisers` (`id`, `owner_type`, `owner_id`, `bank_code`, `display_name`, `full_name`, `login_email`, `login_cpf`, `contact_phone`, `password_hash`, `email_verified_at`, `verification_token`, `verification_token_expires`, `last_login`, `status`, `fee_pct`, `fee_pct_room`, `fee_pct_workshop`, `bank_name`, `account_type`, `agency_number`, `account_number`, `pix_key`, `created_at`, `updated_at`) VALUES
(1, 'client', 0, '0001', 'MZF', 'Mira Zlotnik', 'benyfinkelstein@gmail.com', '41836484836', NULL, '$2y$10$coY86ax3NyQXEr1DAE4Q4uX6JMCV6LAI.gAHpLTdZ2Q7MdCTO.nW6', '2025-11-16 22:46:54', NULL, NULL, '2026-01-10 15:16:57', 'ativo', NULL, NULL, NULL, '', 'corrente', '0001', '6506487-7', '37333590895', '2025-11-16 22:46:39', '2025-12-29 15:07:44');

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
(30, 1, '22006e3e0e4ac5a80ee6a3be56e1447492f159becc301ad057d8dc5096dea987', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-28 09:55:37', '2025-12-29 09:55:37'),
(31, 1, '03e7b21ba936ba018b40c4dddf518634fd5bcba443d019d64df635c7311a3221', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-28 21:15:18', '2025-12-29 21:15:18'),
(32, 1, '0c2520d4c89671bc45b441a58de55a6087fd2c273392ac185725f8491eeddd49', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-29 12:21:50', '2025-12-30 12:21:50'),
(33, 1, '004ee7feedc204021c305941059baf56b93f2a471dd5bfe989446b162d90fa4c', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-29 12:54:16', '2025-12-30 12:54:16'),
(34, 1, '21b711a0be6d8c480af4141dc6e6feeb46b083494026d9c6383752efacaf7bc6', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-30 12:03:53', '2025-12-31 12:03:53'),
(35, 1, 'd9409fbb0e7182b97c90892fdeeca9077c1172946b44e131d80a20d0a352351e', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-30 21:07:42', '2025-12-31 21:07:42'),
(36, 1, 'dedde8813d21a3ad1fccf64d3ac9becfedb672309be726e47fdd2031a1ab4a32', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/143.0.3650.112 Version/26.0 Mobile/15E148 Safari/604.1', '2025-12-30 21:33:28', '2025-12-31 21:33:28'),
(37, 1, '65d3bb509c74ae6efaf1a48a13924a890709382246237f71b82f680fcae5ef21', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '2025-12-30 21:36:39', '2025-12-31 21:36:39'),
(38, 1, 'd44d5f13fa92d44444df68fb12e199b6176b15771f0d00329d1bcd569448ef4b', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-01 12:21:59', '2026-01-02 12:21:59'),
(39, 1, '857eb7949349b4d0546200150526212bfb3e3cdc2daa60842ed1e046af68efcc', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 14:26:44', '2026-01-07 14:26:44'),
(40, 1, '2ce9f7e9e0b5b8f75c60c41df29a29b029178d342a896dd2066c40141ef27010', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 15:32:30', '2026-01-07 15:32:30'),
(41, 1, 'e84f8ece54b9c0ef82955c9409a4e4c53f102b79c9e3fd3970a5b26b3e9e25a9', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 14:51:09', '2026-01-08 14:51:09');

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
(27, 1, 'membro', 'cus_TgQBcUNKCm1KcV', 'Mira', 'benyfink@gmail.com', '2025-12-27 16:40:14', NULL, NULL, NULL, 'benyfink@gmail.com', '$2y$10$LxhXED.JMa2gRiXOwIdoDuJis44lm0Jzh6xuKbNfjZg10VNbfLSYW', '41836484836', '', '', '', 'PF', NULL, NULL, 'ativo', NULL, NULL, '2026-01-07 15:31:19'),
(28, NULL, 'membro', NULL, 'Adrian Zborowski', 'www.zeefe.com.br.zips019@passmail.net', '2026-01-11 19:49:44', NULL, NULL, NULL, 'www.zeefe.com.br.zips019@passmail.net', '$2y$10$R/E6.cjRis.8M7dylX1aqOjsFeJt54QvppyaM2.yaNMgbVCIxQsFi', '39182048800', NULL, NULL, NULL, 'PF', NULL, NULL, 'ativo', '2026-01-11 19:49:22', NULL, '2026-01-11 19:49:44');

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
(37, 27, '331ca6852c8f18a126be36a30f401212e3eef424112b54704af59ea9fc512b83', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-28 18:22:42', '2025-12-29 18:22:42'),
(38, 26, '5705d707e72a76b8a4323fb1860b57afc907363a249316c7ddcff7dbec0f2e42', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-30 06:47:34', '2025-12-31 06:47:34'),
(39, 27, 'b6d179ae46127a9410da922dcb79ff13f1eb4654bc45454ce8c64c51383cd40c', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 10:19:19', '2026-01-07 10:19:19'),
(40, 26, '1963a49471102c7c9814dd94de45aa207e10cb31078a88b0f748b61cacbfee99', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 11:14:32', '2026-01-07 11:14:32'),
(41, 26, 'ffe6b934b9e59478e01938372763c2d4eb283e221369451d4032580f0b945269', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 12:35:38', '2026-01-07 12:35:38'),
(42, 27, 'bf1e208565a87091bb1d501d2224588960809d5cae2d32c62ecd970b05328f39', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 12:40:29', '2026-01-07 12:40:29'),
(43, 27, 'ac7d8c6a24a6bcf31611fd133eae66d8e10bbdaa48f7d116c4af69cd50257c70', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 13:21:32', '2026-01-07 13:21:32'),
(44, 27, '2a56cd356b46156366215657d715d87d83e6e76536ea32dec5b2c72c623f6966', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 13:21:34', '2026-01-07 13:21:34'),
(45, 27, 'f6227b642b2686f4257b86be33a76e40f525b44598a891492e43b2dad2d89484', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 13:21:34', '2026-01-07 13:21:34'),
(46, 27, '9a4c517b6c1daff8152035c09884a66c1753c57f4958547974b5d27f91cc503a', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 13:21:34', '2026-01-07 13:21:34'),
(47, 27, '8a3755531948756d54c8834578e5f487110c8139147fdf894564b64774215339', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 13:21:34', '2026-01-07 13:21:34'),
(48, 27, '9fde8c01d74674c4c1f57eba3cb81663185ae974f4fc9eaffdd285a827af8596', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 13:21:36', '2026-01-07 13:21:36'),
(49, 27, '3b99ab5e63dc5c2e2ff9b52fc2a2028eb52f226d2785b1bdbdd3d39b3482838e', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 15:28:08', '2026-01-07 15:28:08'),
(50, 27, '7be2dff4e585fb5783bd8e9b68bceb76ec88a3da40b50160fd2d28955e9ba9b6', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-06 18:21:07', '2026-01-07 18:21:07'),
(51, 27, '7743d8129b341b71dcab77f6726895589c69394ba0dba1cda5655fa2dc3f2f0a', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-10 12:24:37', '2026-01-11 12:24:37'),
(52, 27, 'de6ef747c686d4ec63d981d53f26c180a3f92bdb075771052b2125b7d194f28f', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-10 12:48:48', '2026-01-11 12:48:48'),
(53, 27, '629df27c80104061583fee368b200d26d5c4a776d8e3e1397d558715c0f57a57', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15', '2026-01-10 12:49:09', '2026-01-11 12:49:09'),
(54, 28, '57f481b8210f5e9d0b5b9d0db5cfd55610cc7202197d61178aecda904e28ad2c', 'Mozilla/5.0 (Android 16; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0', '2026-01-11 19:50:05', '2026-01-12 19:50:05');

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
  `discount_pct` decimal(5,2) DEFAULT NULL,
  `account_manager_id` bigint(20) DEFAULT NULL,
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

INSERT INTO `companies` (`id`, `razao_social`, `nome_fantasia`, `cnpj`, `inscricao_estadual`, `discount_pct`, `account_manager_id`, `street`, `number`, `complement`, `zip_code`, `city`, `state`, `email`, `phone`, `whatsapp`, `master_client_id`, `status`, `created_at`, `updated_at`, `is_active`) VALUES
(1, 'Empresa Exemplo LTDA', 'Exemplo', '12.345.678/0001-99', '123456', NULL, NULL, 'Rua Alfa', '100', 'Sala 501', '01234-567', 'São Paulo', 'SP', 'contato@exemplo.com', '1133224455', '', 27, 'ativo', '2025-10-23 21:58:21', '2026-01-07 15:31:19', 1);

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
  `invite_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `inviter_id` bigint(20) DEFAULT NULL,
  `inviter_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `company_invitations`
--

INSERT INTO `company_invitations` (`id`, `company_id`, `client_id`, `cpf`, `role`, `token`, `status`, `expires_at`, `created_at`, `accepted_at`, `invite_email`, `invite_name`, `inviter_id`, `inviter_name`) VALUES
(6, 1, 26, '37333590895', 'membro', 'e6df0b3298dcd0dea28a3a54db927c608269122c8c708e10', 'pendente', '2026-01-09 15:36:12', '2026-01-07 15:36:12', NULL, 'benyfink@zeefe.com.br', 'Beny Finkelstein', NULL, NULL),
(7, 1, 26, '37333590895', 'membro', 'f61d77276485954ac3010ad0096c8999625b2dfe9bafe8db', 'pendente', '2026-01-09 17:12:09', '2026-01-07 17:12:09', NULL, 'benyfink@zeefe.com.br', 'Beny Finkelstein', 27, 'Mira'),
(8, 1, 26, '37333590895', 'membro', 'efa7680be0572e69ff11247f1b32f98435bde994124ee505', 'pendente', '2026-01-10 18:27:33', '2026-01-08 18:27:33', NULL, 'benyfink@zeefe.com.br', 'Beny Finkelstein', 27, 'Mira');

-- --------------------------------------------------------

--
-- Estrutura para tabela `customer_cards`
--

CREATE TABLE `customer_cards` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) NOT NULL,
  `stripe_customer_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_payment_method_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_nickname` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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

INSERT INTO `customer_cards` (`id`, `client_id`, `stripe_customer_id`, `stripe_payment_method_id`, `card_nickname`, `pagarme_card_id`, `fingerprint`, `billing_name`, `billing_email`, `billing_zip`, `brand`, `last4`, `exp_month`, `exp_year`, `holder_name`, `status`, `created_at`, `updated_at`) VALUES
(11, 27, 'cus_TgQBcUNKCm1KcV', 'pm_1SjKDSRGALXK8tGEOh0QmBPs', NULL, NULL, 'Bqvvh7Ouk3nQbeB2', NULL, NULL, NULL, 'mastercard', '5454', 5, 2041, 'Mira', 'active', '2025-12-28 10:41:03', '2025-12-28 10:41:03'),
(12, 26, 'cus_TfzrwBc3nbZUrt', 'pm_1SjzcqRGALXK8tGELGfbr1rz', NULL, NULL, 'kSlmrCoDGD10mLLy', NULL, NULL, NULL, 'visa', '4242', 12, 2033, 'Beny Finkelstein', 'active', '2025-12-30 06:54:02', '2025-12-30 06:54:02'),
(15, 27, 'cus_TgQBcUNKCm1KcV', 'pm_1Sk2SjRGALXK8tGEIsrafR74', 'Amex', NULL, '2tO4KRutbospcrcr', NULL, NULL, NULL, 'mastercard', '3222', 12, 2033, 'Mira', 'active', '2025-12-30 09:55:46', '2025-12-30 09:55:46');

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
-- Estrutura para tabela `inventory_items`
--

CREATE TABLE `inventory_items` (
  `id` int(11) NOT NULL,
  `id_patrimonio` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `codigo_patrimonio` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `categoria` varchar(120) COLLATE utf8_unicode_ci DEFAULT NULL,
  `marca` varchar(120) COLLATE utf8_unicode_ci DEFAULT NULL,
  `modelo` varchar(120) COLLATE utf8_unicode_ci DEFAULT NULL,
  `numero_serie` varchar(120) COLLATE utf8_unicode_ci DEFAULT NULL,
  `data_aquisicao` date DEFAULT NULL,
  `fornecedor` varchar(160) COLLATE utf8_unicode_ci DEFAULT NULL,
  `nota_fiscal` varchar(80) COLLATE utf8_unicode_ci DEFAULT NULL,
  `valor_aquisicao` decimal(12,2) DEFAULT NULL,
  `forma_aquisicao` varchar(80) COLLATE utf8_unicode_ci DEFAULT NULL,
  `unidade` varchar(120) COLLATE utf8_unicode_ci DEFAULT NULL,
  `setor` varchar(120) COLLATE utf8_unicode_ci DEFAULT NULL,
  `localizacao_endereco` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `localizacao_cep` varchar(12) COLLATE utf8_unicode_ci DEFAULT NULL,
  `localizacao_complemento` varchar(160) COLLATE utf8_unicode_ci DEFAULT NULL,
  `responsavel` varchar(160) COLLATE utf8_unicode_ci DEFAULT NULL,
  `status` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL,
  `condicao` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL,
  `data_ultimo_inventario` date DEFAULT NULL,
  `vida_util_anos` int(11) DEFAULT NULL,
  `taxa_depreciacao` decimal(6,2) DEFAULT NULL,
  `valor_contabil` decimal(12,2) DEFAULT NULL,
  `centro_custo` varchar(120) COLLATE utf8_unicode_ci DEFAULT NULL,
  `garantia_ate` date DEFAULT NULL,
  `historico_manutencao` text COLLATE utf8_unicode_ci,
  `custo_manutencao` decimal(12,2) DEFAULT NULL,
  `data_baixa` date DEFAULT NULL,
  `motivo_baixa` varchar(160) COLLATE utf8_unicode_ci DEFAULT NULL,
  `valor_baixa` decimal(12,2) DEFAULT NULL,
  `qr_token` varchar(64) COLLATE utf8_unicode_ci DEFAULT NULL,
  `link_qr` text COLLATE utf8_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
(33, 1, NULL, 'credito', 'Crédito workshop: Workshop Teste 2', 150.00, 'pendente', '2026-01-30 19:21:38', '2025-12-31 19:21:38', 'workshop_enrollment_27', '2025-12-31 19:21:38'),
(34, 1, 77, 'credito', 'Crédito de reserva #77', 1200.00, 'pendente', '2026-02-04 15:07:55', '2026-01-05 15:07:55', 'pi_3SmIC6RGALXK8tGE0l4lfHBO', '2026-01-05 15:07:55'),
(35, 1, 76, 'credito', 'Crédito de reserva #76', 1500.00, 'pendente', '2026-02-04 15:09:37', '2026-01-05 15:09:37', 'pi_3SmIDkRGALXK8tGE1ySEGEni', '2026-01-05 15:09:37');

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
(10, 7, 'client', 'teste', NULL, '2026-01-04 11:06:46', '2026-01-04 11:06:47', NULL),
(11, 7, '', 'teste', NULL, '2026-01-04 11:07:11', '2026-01-04 11:07:13', NULL),
(12, 7, '', 'teste2', NULL, '2026-01-04 11:07:19', '2026-01-04 11:07:28', NULL);

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
(7, NULL, NULL, 26, NULL, '2025-12-26 13:30:11', '2026-01-04 11:07:19'),
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
(6, 72, 'cartao', 1100.00, 'pago', 'pi_3SjKEtRGALXK8tGE1rHL86s1', '2025-12-28 10:42:31', '2025-12-28 10:42:31', '2025-12-28 10:42:31', 'stripe', 'BRL', 110000, 'pi_3SjKEtRGALXK8tGE1rHL86s1', NULL, 'cus_TgQBcUNKCm1KcV', 'pm_1SjKDSRGALXK8tGEOh0QmBPs', NULL, NULL),
(7, 73, 'cartao', 1100.00, 'pago', 'pi_3SjVLDRGALXK8tGE1KWTsipc', '2025-12-28 22:33:48', '2025-12-28 22:33:48', '2025-12-28 22:33:48', 'stripe', 'BRL', 110000, 'pi_3SjVLDRGALXK8tGE1KWTsipc', NULL, 'cus_TgQBcUNKCm1KcV', 'pm_1SjKDSRGALXK8tGEOh0QmBPs', NULL, NULL),
(8, 74, 'cartao', 1.00, 'pago', 'pi_3SjziuRGALXK8tGE15HJzFhg', '2025-12-30 07:00:16', '2025-12-30 07:00:16', '2025-12-30 07:00:16', 'stripe', 'BRL', 100, 'pi_3SjziuRGALXK8tGE15HJzFhg', NULL, 'cus_TfzrwBc3nbZUrt', 'pm_1SjzcqRGALXK8tGELGfbr1rz', NULL, NULL),
(9, 75, 'cartao', 150.00, 'pendente', 'pi_3SjzlcRGALXK8tGE097azVfj', NULL, '2025-12-30 07:03:05', '2025-12-30 07:03:05', 'stripe', 'BRL', 15000, 'pi_3SjzlcRGALXK8tGE097azVfj', 'ch_3SjzlcRGALXK8tGE0HWrW43B', 'cus_TgQBcUNKCm1KcV', 'pm_1SjKDSRGALXK8tGEOh0QmBPs', NULL, NULL),
(10, 74, 'cartao', 1.00, 'estornado', 're_3SjziuRGALXK8tGE1cE3MeWU', '2025-12-30 07:05:57', '2025-12-30 07:05:58', '2025-12-30 07:05:58', 'stripe', 'BRL', 100, 'pi_3SjziuRGALXK8tGE15HJzFhg', NULL, NULL, 'pm_1SjzcqRGALXK8tGELGfbr1rz', NULL, NULL),
(11, 77, 'cartao', 1200.00, 'pago', 'pi_3SmIC6RGALXK8tGE0l4lfHBO', '2026-01-05 15:07:55', '2026-01-05 15:07:55', '2026-01-05 15:07:55', 'stripe', 'BRL', 120000, 'pi_3SmIC6RGALXK8tGE0l4lfHBO', NULL, 'cus_TfzrwBc3nbZUrt', 'pm_1SjzcqRGALXK8tGELGfbr1rz', NULL, NULL),
(12, 76, 'cartao', 1500.00, 'pago', 'pi_3SmIDkRGALXK8tGE1ySEGEni', '2026-01-05 15:09:37', '2026-01-05 15:09:37', '2026-01-05 15:09:37', 'stripe', 'BRL', 150000, 'pi_3SmIDkRGALXK8tGE1ySEGEni', NULL, 'cus_TfzrwBc3nbZUrt', 'pm_1SjzcqRGALXK8tGELGfbr1rz', NULL, NULL);

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
  `category_id` int(11) DEFAULT NULL,
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

INSERT INTO `posts` (`id`, `slug`, `title`, `summary`, `content`, `category`, `category_id`, `status`, `cover_path`, `author_name`, `published_at`, `created_at`, `updated_at`) VALUES
(16, '', 'A diminuição dos espaços de trabalho e a necessidade de reuniões presenciais', 'Com escritórios cada vez menores, cresce a necessidade de encontros presenciais em ambientes profissionais, equipados e prontos para decisões rápidas.', '<p data-start=\"140\" data-end=\"445\">A redução das áreas físicas nas empresas tornou-se uma tendência irreversível. Modelos híbridos, escritórios menores e equipes distribuídas levaram muitas organizações a repensar o papel do espaço corporativo. Mas, ao mesmo tempo em que as mesas diminuíram, a necessidade de encontros presenciais cresceu.</p>\n<p data-start=\"447\" data-end=\"779\">Reuniões presenciais seguem essenciais para decisões complexas, alinhamentos estratégicos, construção de confiança e resolução de conflitos. Elas aceleram ciclos de negociação e reduzem ruídos que, no digital, se acumulam. Com menos salas internas, porém, muitos times ficam sem infraestrutura adequada para esses momentos críticos.</p>\n<p data-start=\"781\" data-end=\"1101\">Esse cenário abre espaço para ambientes profissionais compartilhados, bem localizados e já preparados para receber equipes com tecnologia, conforto e privacidade. O escritório deixou de ser um local fixo: virou um recurso a ser acionado conforme a necessidade — especialmente quando o encontro cara a cara faz diferença.</p>', 'Espaços', NULL, 'publicado', 'img/posts/16/cover.webp', 'Beny Finkelstein', '2025-11-27 19:13:00', '2025-11-27 19:15:02', '2025-11-27 19:15:02'),
(21, '123', 'Workshops e Produtividade', 'Workshops presenciais impulsionam colaboração, alinhamento e aprendizado, aumentando produtividade e fortalecendo a retenção de talentos.', '<p data-start=\"1189\" data-end=\"1505\">Workshops presenciais se tornaram ferramentas de alto impacto para empresas que buscam produtividade e retenção de talentos. Diferentemente de treinamentos tradicionais, o formato de workshop combina conteúdo prático, troca entre equipes e resolução de problemas reais — tudo em um ambiente que estimula colaboração.</p>\n<p data-start=\"1507\" data-end=\"1853\">Ao trabalhar em grupo, os profissionais ganham clareza sobre processos, entendem expectativas, fortalecem relações e desenvolvem senso de pertencimento. Isso reduz retrabalho, melhora a comunicação interna e acelera entregas. Além disso, a experiência presencial cria memórias positivas, reforça cultura e dá visibilidade ao propósito da empresa.</p>\n<p data-start=\"1855\" data-end=\"2223\">Do ponto de vista de retenção, workshops funcionam como investimento direto no desenvolvimento do colaborador. Pessoas que sentem evolução, aprendizado contínuo e conexão humana tendem a permanecer mais tempo e produzir mais. Para organizações que já operam com times híbridos ou remotos, encontros estruturados tornam-se fundamentais para manter coesão e engajamento.</p>', 'Workshop', NULL, 'publicado', 'img/posts/21/cover.webp', 'Beny Finkelstein', '2025-11-28 01:19:00', '2025-11-27 19:19:17', '2025-12-19 15:53:55'),
(22, 'locais', 'Locais privativos para reuniões', 'Reuniões de negócios exigem foco e confidencialidade. Espaços privativos garantem profissionalismo, segurança e eficiência nas decisões.', '<p data-start=\"2307\" data-end=\"2594\">Reuniões de negócios exigem confidencialidade, foco e ambiente adequado. Mesmo com o avanço do trabalho remoto, muitos profissionais perceberam que cafés, escritórios improvisados ou salas compartilhadas não garantem a privacidade e a concentração necessárias para negociações sensíveis.</p>\n<p data-start=\"2596\" data-end=\"2871\">Ambientes privativos oferecem segurança para tratar temas estratégicos, números financeiros, contratos e decisões que não podem vazar. Além disso, geram percepção de profissionalismo — algo que impacta diretamente a credibilidade diante de clientes, parceiros e investidores.</p>\n<p data-start=\"2873\" data-end=\"3219\">Outro ponto crítico é a eficiência. Em salas planejadas para reuniões, a tecnologia funciona, a acústica ajuda, e o espaço convida à objetividade. Isso reduz atrasos, interrupções e improvisos. Ter um local reservado, confortável e bem equipado deixou de ser luxo: tornou-se elemento básico para quem conduz negócios de forma séria e competitiva.</p>', 'Locais', NULL, 'publicado', 'img/posts/22/cover.jpg', 'Beny Finkelstein', '2025-11-27 19:19:00', '2025-11-27 19:20:48', '2025-11-27 19:20:48'),
(24, 'o-dilema-da-gest-o-moderna-home-office-x-presencial-2', 'Dilema: Homeoffice ou Presencial?', 'Flexibilidade ou conexão real? A gestão moderna busca equilíbrio entre trabalho remoto e encontros presenciais estratégicos para decisões que realmente importam.', '<p data-start=\"194\" data-end=\"469\">A gestão moderna vive um paradoxo. De um lado, o home office trouxe flexibilidade, redução de custos e maior autonomia para profissionais. De outro, a ausência de encontros presenciais tem impactado colaboração, alinhamento estratégico e construção de cultura organizacional.</p>\n<p data-start=\"471\" data-end=\"805\">Reuniões virtuais funcionam bem para decisões operacionais e acompanhamentos rápidos. Porém, quando o objetivo é criar, negociar, alinhar expectativas ou tomar decisões críticas, o presencial ainda exerce um papel insubstituível. Linguagem corporal, foco compartilhado e troca espontânea são elementos difíceis de replicar no digital.</p>\n<p data-start=\"807\" data-end=\"1076\">O desafio atual não é escolher entre remoto ou presencial, mas <strong data-start=\"870\" data-end=\"916\">saber quando cada formato faz mais sentido</strong>. Empresas mais eficientes têm adotado modelos híbridos inteligentes, utilizando encontros presenciais pontuais e bem planejados para momentos de maior impacto.</p>\n<p data-start=\"1078\" data-end=\"1253\">Nesse contexto, espaços flexíveis e prontos para uso tornam-se aliados da gestão: permitem reunir pessoas quando realmente importa, sem a rigidez de manter um escritório fixo.</p>', 'espaços', 9, 'publicado', 'img/posts/24/cover.png', 'Beny Finkelstein', '2025-12-20 05:19:00', '2025-12-19 08:20:12', '2026-01-06 16:14:40'),
(25, 'impressionar-um-cliente-come-a-pelo-local-da-reuni-o', 'Impressionar um cliente começa pelo local da reunião', 'O local da reunião comunica antes das palavras. Ambientes certos geram confiança, foco e impacto nas negociações com clientes.', '<p data-start=\"1320\" data-end=\"1519\">Antes mesmo da primeira palavra, o ambiente já comunica. O local escolhido para uma reunião influencia diretamente a percepção de profissionalismo, organização e cuidado com a experiência do cliente.</p>\n<p data-start=\"1521\" data-end=\"1798\">Salas improvisadas, ruído excessivo, falta de privacidade ou infraestrutura limitada podem comprometer negociações importantes — independentemente da qualidade da proposta apresentada. Por outro lado, um espaço bem projetado transmite confiança, preparo e atenção aos detalhes.</p>\n<p data-start=\"1800\" data-end=\"2019\">Iluminação adequada, conforto, tecnologia funcional e hospitalidade criam um cenário favorável para conversas estratégicas. O cliente se sente valorizado, o diálogo flui melhor e as decisões tendem a ser mais objetivas.</p>\n<p data-start=\"2021\" data-end=\"2219\">Impressionar não é exagerar. É oferecer o ambiente certo para que a reunião aconteça com foco, privacidade e fluidez. Escolher bem onde receber um cliente é parte essencial da estratégia de negócio.</p>', 'clientes', 9, 'publicado', 'img/posts/25/cover.png', 'Beny Finkelstein', '2025-12-20 08:20:00', '2025-12-19 08:22:24', '2026-01-06 16:13:51'),
(26, 'alugar-sob-demanda-ou-possuir-um-espa-o-pr-s-e-contras', 'Alugar sob demanda ou possuir um espaço? Prós e contras', 'Espaço próprio ou sob demanda? Entenda os prós e contras de cada modelo e como escolher a opção mais eficiente para o seu negócio.', '<p data-start=\"2289\" data-end=\"2465\">A decisão entre possuir um espaço próprio ou alugar sob demanda envolve muito mais do que custo mensal. Trata-se de flexibilidade, eficiência e adequação ao momento da empresa.</p>\n<p data-start=\"2467\" data-end=\"2737\"><strong data-start=\"2467\" data-end=\"2496\">Possuir um espaço próprio</strong> oferece controle total, identidade fixa e disponibilidade constante. Em contrapartida, exige investimento inicial elevado, custos fixos recorrentes, manutenção, ociosidade em períodos de menor uso e menor capacidade de adaptação a mudanças.</p>\n<p data-start=\"2739\" data-end=\"3041\">Já <strong data-start=\"2742\" data-end=\"2772\">alugar espaços sob demanda</strong> reduz compromissos financeiros, elimina custos ocultos e permite escolher o local ideal para cada necessidade: reuniões, workshops, apresentações ou encontros estratégicos. A principal limitação está na dependência de disponibilidade e na ausência de um endereço fixo.</p>\n<p data-start=\"3043\" data-end=\"3299\">Para empresas enxutas, times híbridos ou profissionais que se reúnem presencialmente apenas em momentos-chave, o modelo sob demanda tende a ser mais racional. Ele converte estrutura fixa em variável e libera energia para o que realmente importa: o negócio.</p>\n<p data-start=\"3301\" data-end=\"3442\">Cada modelo tem seu papel. A escolha certa depende do estágio da empresa, da frequência de uso e da importância estratégica do espaço físico.</p>', 'Locais', 9, 'publicado', 'img/posts/26/cover.jpg', 'Beny Finkelstein', '2026-01-03 17:56:00', '2025-12-19 08:25:31', '2026-01-05 11:47:02');

-- --------------------------------------------------------

--
-- Estrutura para tabela `post_categories`
--

CREATE TABLE `post_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ativo',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `post_categories`
--

INSERT INTO `post_categories` (`id`, `name`, `status`, `created_at`) VALUES
(1, 'Locais', 'ativo', '2026-01-04 08:54:24'),
(2, 'Clientes', 'ativo', '2026-01-04 08:54:24'),
(3, 'Espaços', 'ativo', '2026-01-04 08:54:24'),
(4, 'Workshops', 'ativo', '2026-01-04 08:54:24'),
(5, 'Produtividade', 'ativo', '2026-01-04 08:54:24'),
(6, 'Gestão', 'ativo', '2026-01-04 08:54:24'),
(7, 'Novidades', 'ativo', '2026-01-04 08:54:24'),
(8, 'Tendências', 'ativo', '2026-01-04 08:54:24'),
(9, 'Dicas', 'ativo', '2026-01-04 08:54:24');

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
  `payment_confirmed_at` datetime DEFAULT NULL,
  `policy_id` bigint(20) DEFAULT NULL,
  `policy_key` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `policy_label` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `policy_cancel_days` int(11) DEFAULT NULL,
  `policy_cancel_fee_pct` decimal(5,2) DEFAULT NULL,
  `policy_charge_timing` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `policy_charge_at` datetime DEFAULT NULL,
  `stripe_payment_method_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `reservations`
--

INSERT INTO `reservations` (`id`, `room_id`, `client_id`, `participants`, `price`, `company_id`, `title`, `description`, `date`, `time_start`, `time_end`, `total_price`, `amount_gross`, `voucher_code`, `voucher_amount`, `fee_pct_at_time`, `fee_amount`, `amount_net`, `attendees_count`, `requirements`, `observations`, `status`, `payment_status`, `hold_expires_at`, `notes`, `created_at`, `updated_at`, `public_code`, `stripe_payment_intent_id`, `stripe_charge_id`, `payment_confirmed_at`, `policy_id`, `policy_key`, `policy_label`, `policy_cancel_days`, `policy_cancel_fee_pct`, `policy_charge_timing`, `policy_charge_at`, `stripe_payment_method_id`) VALUES
(72, 6, 27, 1, 1100.00, NULL, '123', '', '2025-12-29', '08:00:00', '20:00:00', 1100.00, 1100.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'cancelada', 'confirmado', NULL, NULL, NULL, '2025-12-28 21:27:11', 'ZF-28UH-M599NN', 'pi_3SjKEtRGALXK8tGE1rHL86s1', NULL, '2025-12-28 10:42:31', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(73, 6, 27, 1, 1100.00, NULL, 'teste123', '', '2025-12-28', '08:00:00', '20:00:00', 1100.00, 1100.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'cancelada', 'confirmado', NULL, NULL, NULL, '2025-12-28 22:34:47', 'ZF-J4CN-ZEZN2H', 'pi_3SjVLDRGALXK8tGE1KWTsipc', NULL, '2025-12-28 22:33:48', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(74, 45, 26, 1, 1.00, NULL, '123', '', '2025-12-31', '08:00:00', '20:00:00', 1.00, 1.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'cancelada', 'confirmado', NULL, NULL, NULL, '2025-12-30 07:05:58', 'ZF-YSZZ-P9YLV7', 'pi_3SjziuRGALXK8tGE15HJzFhg', NULL, '2025-12-30 07:00:16', 7, 'immediate', 'Pagamento no momento da Reserva (Sem cancelamento)', 0, 0.00, 'confirm', '2025-12-30 06:57:58', 'pm_1SjzcqRGALXK8tGELGfbr1rz'),
(75, 50, 27, 1, 100.00, NULL, 'Reserva', '', '2025-12-31', '08:00:00', '20:00:00', 100.00, 100.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'confirmada', 'pendente', '2025-12-30 08:00:00', NULL, NULL, '2025-12-30 07:03:05', NULL, 'pi_3SjzlcRGALXK8tGE097azVfj', 'ch_3SjzlcRGALXK8tGE0HWrW43B', NULL, 8, 'immediate', 'Pagamento no momento da Reserva (Sem cancelamento)', 0, 0.00, 'confirm', '2025-12-30 12:28:12', 'pm_1SjKDSRGALXK8tGEOh0QmBPs'),
(76, 50, 26, 1, 1500.00, NULL, 'Reserva Teste', '', '2026-01-05', '08:00:00', '20:00:00', 1500.00, 1500.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'confirmada', 'confirmado', NULL, NULL, NULL, '2026-01-05 15:09:37', 'ZF-HSM5-ZHN28K', 'pi_3SmIDkRGALXK8tGE1ySEGEni', NULL, '2026-01-05 15:09:37', 25, 'immediate', 'Pagamento no momento da Reserva (Sem cancelamento)', 0, 0.00, 'confirm', '2026-01-05 14:35:22', 'pm_1SjzcqRGALXK8tGELGfbr1rz'),
(77, 6, 26, 1, 1200.00, NULL, 'TEste222', '', '2026-01-05', '08:00:00', '20:00:00', 1200.00, 1200.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'confirmada', 'confirmado', NULL, NULL, NULL, '2026-01-05 15:07:55', 'ZF-PCYV-ANLUJD', 'pi_3SmIC6RGALXK8tGE0l4lfHBO', NULL, '2026-01-05 15:07:55', 1, 'immediate', 'Pagamento no momento da Reserva (Sem cancelamento)', 0, 0.00, 'confirm', '2026-01-05 14:36:52', 'pm_1SjzcqRGALXK8tGELGfbr1rz'),
(78, 6, 26, 1, 1200.00, NULL, 'teste', 'teste', '2026-01-08', '08:00:00', '20:00:00', 1200.00, 1200.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'pendente', 'pendente', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 29, 'immediate', 'Pagamento no momento da Reserva (Sem cancelamento)', 0, 0.00, 'confirm', '2026-01-08 11:41:47', 'pm_1SjzcqRGALXK8tGELGfbr1rz'),
(79, 6, 26, 1, 1200.00, NULL, 'teste2', '', '2026-01-09', '08:00:00', '20:00:00', 1200.00, 1200.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'pendente', 'pendente', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 29, 'immediate', 'Pagamento no momento da Reserva (Sem cancelamento)', 0, 0.00, 'confirm', '2026-01-08 11:44:38', 'pm_1SjzcqRGALXK8tGELGfbr1rz');

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
(75, 5);

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
  `room_formats` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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

INSERT INTO `rooms` (`id`, `name`, `capacity`, `description`, `street`, `complement`, `cep`, `city`, `state`, `responsavel_nome`, `responsavel_telefone`, `responsavel_email`, `portaria_telefone`, `portaria_email`, `portaria_inteligente`, `dailyrate`, `daily_rate`, `location`, `room_formats`, `lat`, `lon`, `status`, `maintenance_start`, `maintenance_end`, `deactivated_from`, `photo_path`, `facilitated_access`, `created_at`, `updated_at`, `advertiser_id`) VALUES
(6, 'Teste', 10, '', 'Avenida Rouxinol', '84', '04516-000', 'São Paulo', 'SP', '', '', '', '', '', 'Não', NULL, 1200.00, '78', 'reuniao,workshop', -23.6012764, -46.6734966, 'ativo', NULL, NULL, NULL, 'img/rooms/6/room_6_695c02750c7fc7.42326814.jpg,img/rooms/6/room_6_695c02750cad50.42833662.jpg,img/rooms/6/room_6_695c02750ccd33.94139110.jpg,img/rooms/6/room_6_695c02750cea30.08892281.jpg,img/rooms/6/room_6_695c02750d0373.69640280.jpg,img/rooms/6/room_6_6', 0, '2025-12-25 22:00:09', '2025-12-29 12:27:58', 1),
(7, 'Incow Coworking', 12, 'Tipo: Coworking | Rating: 4.9 | Fonte: Website + Google Maps reviews | Website: www.incow.com.br', 'Av. dos Eucaliptos, 500', 'Moema', NULL, 'São Paulo', 'SP', 'Incow Coworking', '+55 11 4210-1055', 'contato@incow.com.br', '+55 11 4210-1055', 'contato@incow.com.br', 'Não', NULL, 70.00, 'Moema', NULL, -23.6079676, -46.6716347, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:07', 1),
(8, 'IN Moema – Consultórios e Escritórios', 10, 'Tipo: Coworking | Rating: 4.9 | Fonte: Google Maps + Website | Website: www.inmoema.com.br', 'Av. Moema, 622', 'Moema', NULL, 'São Paulo', 'SP', 'IN Moema – Consultórios e Escritórios', '+55 11 99991-3909', 'info@inmoema.com.br', '+55 11 99991-3909', 'info@inmoema.com.br', 'Não', NULL, 80.00, 'Moema', NULL, -23.6068971, -46.6556810, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:08', 1),
(9, 'Inspira Coworking', 12, 'Tipo: Coworking | Rating: 4.8 | Fonte: Google Maps | Website: www.inspiracoworking.com.br', 'Av. Agami, 40', 'Indianópolis', NULL, 'São Paulo', 'SP', 'Inspira Coworking', '+55 11 5052-4748', 'contato@inspiracoworking.com.br', '+55 11 5052-4748', 'contato@inspiracoworking.com.br', 'Não', NULL, 75.00, 'Indianópolis', NULL, -23.5986768, -46.6624575, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:09', 1),
(10, 'PROGEO Cowork', 10, 'Tipo: Coworking | Rating: 4.8 | Fonte: Google Maps | Website: progeocowork.etc.br', 'Av. Pavão, 955', 'Indianópolis', NULL, 'São Paulo', 'SP', 'PROGEO Cowork', '+55 11 97636-9957', 'contato@progeocowork.com.br', '+55 11 97636-9957', 'contato@progeocowork.com.br', 'Não', NULL, 70.00, 'Indianópolis', NULL, -23.6071971, -46.6669054, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:10', 1),
(11, 'Banco Santander Work Café Moema', 8, 'Tipo: Coworking Híbrido | Rating: 3.9 | Fonte: Google Maps | Website: www.santander.com.br', 'Av. Pavão, 505', 'Moema', NULL, 'São Paulo', 'SP', 'Banco Santander Work Café Moema', '+55 11 4004-3535', 'workcafe@santander.com.br', '+55 11 4004-3535', 'workcafe@santander.com.br', 'Não', NULL, 50.00, 'Moema', NULL, -23.6046052, -46.6703479, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:13', 1),
(12, 'Espaço APESP', 15, 'Tipo: Espaço Eventos | Rating: 4.6 | Fonte: Google Maps (espaço + avaliações) | Website: espacoapesp.org.br', 'Rua Tuim, 932', 'Moema', NULL, 'São Paulo', 'SP', 'Espaço APESP', '+55 11 5535-2157', 'eventos@espacoapesp.org.br', '+55 11 5535-2157', 'eventos@espacoapesp.org.br', 'Não', NULL, 0.00, 'Moema', NULL, -23.6038882, -46.6727185, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:14', 1),
(13, 'Casa Petra', 20, 'Tipo: Espaço Eventos | Rating: 4.6 | Fonte: Google Maps (eventos corporativos) | Website: casapetra.com.br', 'Av. Aratãs, 1010', 'Moema', NULL, 'São Paulo', 'SP', 'Casa Petra', '+55 11 5053-2231', 'contato@casapetra.com.br', '+55 11 5053-2231', 'contato@casapetra.com.br', 'Não', NULL, 0.00, 'Moema', NULL, -23.6134129, -46.6584645, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:15', 1),
(17, 'WeWork Berrini', 20, 'Tipo: Coworking Premium | Rating: 4.7 | Fonte: WeWork Brasil + Website oficial | Website: www.wework.com/pt-BR', 'Av. Nações Unidas, 12901', 'Brooklin', NULL, 'São Paulo', 'SP', 'WeWork Berrini', '+55 11 3195-6449', 'saopaulo@wework.com', '+55 11 3195-6449', 'saopaulo@wework.com', 'Não', NULL, 114.00, 'Brooklin', NULL, -23.6110936, -46.6966677, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:22', 1),
(18, 'Coworking Smart Berrini', 12, 'Tipo: Coworking | Rating: 4.9 | Fonte: Website + contato telefônico | Website: www.coworkingsmart.com.br', 'Av. Eng. Luís Carlos Berrini, 1681', 'Berrini', NULL, 'São Paulo', 'SP', 'Coworking Smart Berrini', '+55 11 92126-2191', 'contato@coworkingsmart.com.br', '+55 11 92126-2191', 'contato@coworkingsmart.com.br', 'Não', NULL, 90.00, 'Berrini', NULL, -23.6097057, -46.6948427, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:23', 1),
(19, 'NetCoworking Berrini', 10, 'Tipo: Coworking | Rating: 4.8 | Fonte: Google Maps | Website: www.netcoworking.com.br', 'Av. Eng. Luís Carlos Berrini, 1700', 'Berrini', NULL, 'São Paulo', 'SP', 'NetCoworking Berrini', '+55 11 5555-3212', 'contato@netcoworking.com.br', '+55 11 5555-3212', 'contato@netcoworking.com.br', 'Não', NULL, 80.00, 'Berrini', NULL, -23.6097057, -46.6948427, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:24', 1),
(20, 'My Place Office Berrini', 12, 'Tipo: Coworking | Rating: 4.9 | Fonte: Website + Google Maps | Website: www.myplaceoffice-berrini.com.br', 'Av. Eng. Luís Carlos Berrini, 1140', 'Berrini', NULL, 'São Paulo', 'SP', 'My Place Office Berrini', '+55 11 94038-2318', 'contato@myplaceoffice.com.br', '+55 11 94038-2318', 'contato@myplaceoffice.com.br', 'Não', NULL, 90.00, 'Berrini', NULL, -23.6097057, -46.6948427, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:26', 1),
(24, 'Coworking Offices Vila Olímpia', 14, 'Tipo: Coworking | Rating: 4.8 | Fonte: Website + Google Maps | Website: coworkingoffices.com.br', 'R. Tenerife, 31', 'Vila Olímpia', NULL, 'São Paulo', 'SP', 'Coworking Offices Vila Olímpia', '+55 11 3044-0710', 'contato@coworkingoffices.com.br', '+55 11 3044-0710', 'contato@coworkingoffices.com.br', 'Não', NULL, 90.00, 'Vila Olímpia', NULL, -23.5963637, -46.6877272, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:31', 1),
(26, 'Office House Coworking e Eventos Itaim', 14, 'Tipo: Coworking | Rating: 4.9 | Fonte: Website + Google Maps | Website: www.officehousecoworking.com.br', 'Rua Sader Macul, 107', 'Itaim Bibi', NULL, 'São Paulo', 'SP', 'Office House Coworking e Eventos Itaim', '+55 11 94309-1279', 'contato@officehouse.com.br', '+55 11 94309-1279', 'contato@officehouse.com.br', 'Não', NULL, 95.00, 'Itaim Bibi', NULL, -23.5887837, -46.6797772, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:36', 1),
(27, 'AKASAHUB Itaim', 12, 'Tipo: Coworking | Rating: 4.7 | Fonte: Website + Google Maps | Website: www.akasahub.com.br', 'Rua Sader Macul, 96', 'Itaim Bibi', NULL, 'São Paulo', 'SP', 'AKASAHUB Itaim', '+55 11 4890-2255', 'contato@akasahub.com.br', '+55 11 4890-2255', 'contato@akasahub.com.br', 'Não', NULL, 85.00, 'Itaim Bibi', NULL, -23.5887837, -46.6797772, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:37', 1),
(28, 'CENTRAL9 Coworking', 10, 'Tipo: Coworking | Rating: 4.7 | Fonte: Google Maps (reuniões periódicas) | Website: www.central9.com.br', 'Av. Nove de Julho, 5617', 'Itaim Bibi', NULL, 'São Paulo', 'SP', 'CENTRAL9 Coworking', '+55 11 3071-1947', 'contato@central9.com.br', '+55 11 3071-1947', 'contato@central9.com.br', 'Não', NULL, 80.00, 'Itaim Bibi', NULL, -23.5806945, -46.6794002, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:39', 1),
(31, 'Regus Faria Lima', 12, 'Tipo: Coworking Corporativo | Rating: 4.7 | Fonte: Regus Brasil + Website | Website: www.regus.com/pt-br/brazil/sao-paulo', 'Av. Brig. Faria Lima, 3729', 'Itaim Bibi', NULL, 'São Paulo', 'SP', 'Regus Faria Lima', '+55 11 3443-6200', 'saopaulo@regus.com', '+55 11 3443-6200', 'saopaulo@regus.com', 'Não', NULL, 120.00, 'Itaim Bibi', NULL, NULL, NULL, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:20:12', 1),
(32, 'Regus Ed. Seculum', 10, 'Tipo: Coworking Corporativo | Rating: 4.3 | Fonte: Regus Brasil | Website: www.regus.com/pt-br/brazil/sao-paulo', 'Av. Brig. Faria Lima, 3144', 'Itaim Bibi', NULL, 'São Paulo', 'SP', 'Regus Ed. Seculum', '+55 11 3568-2500', 'saopaulo@regus.com', '+55 11 3568-2500', 'saopaulo@regus.com', 'Não', NULL, 110.00, 'Itaim Bibi', NULL, NULL, NULL, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:20:12', 1),
(33, 'Regus JK 1455', 12, 'Tipo: Coworking Corporativo | Rating: 4.6 | Fonte: Regus Brasil + Website | Website: www.regus.com/pt-br/brazil/sao-paulo', 'Av. Pres. Juscelino Kubitschek, 1455', 'Vila Nova Conceição', NULL, 'São Paulo', 'SP', 'Regus JK 1455', '+55 11 2124-3400', 'saopaulo@regus.com', '+55 11 2124-3400', 'saopaulo@regus.com', 'Não', NULL, 120.00, 'Vila Nova Conceição', NULL, NULL, NULL, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:20:12', 1),
(34, 'Regus São Paulo eTower', 12, 'Tipo: Coworking Corporativo | Rating: 4.2 | Fonte: Regus Brasil + Website | Website: www.regus.com/pt-br/brazil/sao-paulo', 'Rua Funchal, 418', 'Vila Olímpia', NULL, 'São Paulo', 'SP', 'Regus São Paulo eTower', '+55 11 3521-7000', 'saopaulo@regus.com', '+55 11 3521-7000', 'saopaulo@regus.com', 'Não', NULL, 120.00, 'Vila Olímpia', NULL, -23.5936301, -46.6905142, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:47', 1),
(35, 'Regus JK Iguatemi', 14, 'Tipo: Coworking Corporativo | Rating: 4.5 | Fonte: Regus Brasil | Website: www.regus.com/pt-br/brazil/sao-paulo', 'Av. Pres. Juscelino Kubitschek, 2041', 'Vila Olímpia', NULL, 'São Paulo', 'SP', 'Regus JK Iguatemi', '+55 11 2844-8000', 'saopaulo@regus.com', '+55 11 2844-8000', 'saopaulo@regus.com', 'Não', NULL, 120.00, 'Vila Olímpia', NULL, NULL, NULL, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:20:12', 1),
(36, 'Regus Continental Square', 14, 'Tipo: Coworking Corporativo | Rating: 4.6 | Fonte: Regus Brasil + Google Maps reviews | Website: www.regus.com/pt-br/brazil/sao-paulo', 'R. Olimpíadas, 205', 'Vila Olímpia', NULL, 'São Paulo', 'SP', 'Regus Continental Square', '+55 11 3728-9200', 'saopaulo@regus.com', '+55 11 3728-9200', 'saopaulo@regus.com', 'Não', NULL, 120.00, 'Vila Olímpia', NULL, -23.5954762, -46.6848824, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:49', 1),
(37, 'Regus Santo Amaro', 12, 'Tipo: Coworking Corporativo | Rating: 4.3 | Fonte: Regus Brasil | Website: www.regus.com/pt-br/brazil/sao-paulo', 'Av. Guido Caloi, 1000 - Bloco 5', 'Santo Amaro', NULL, 'São Paulo', 'SP', 'Regus Santo Amaro', '+55 11 3202-2600', 'saopaulo@regus.com', '+55 11 3202-2600', 'saopaulo@regus.com', 'Não', NULL, 110.00, 'Santo Amaro', NULL, NULL, NULL, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:20:12', 1),
(38, 'Regus EZTower', 14, 'Tipo: Coworking Corporativo | Rating: 4.6 | Fonte: Regus Brasil + Google Maps | Website: www.regus.com/pt-br/brazil/sao-paulo', 'R. Arquiteto Olavo Redig de Campos, 105', 'Chácara Santo Antônio', NULL, 'São Paulo', 'SP', 'Regus EZTower', '+55 11 2657-7400', 'saopaulo@regus.com', '+55 11 2657-7400', 'saopaulo@regus.com', 'Não', NULL, 120.00, 'Chácara Santo Antônio', NULL, -23.6253205, -46.7020138, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:52', 1),
(39, 'Regus Torre Z', 14, 'Tipo: Coworking Corporativo | Rating: 4.6 | Fonte: Regus Brasil | Website: www.regus.com/pt-br/brazil/sao-paulo', 'Av. Dr. Chucri Zaidan, 296', 'Vila Cordeiro', NULL, 'São Paulo', 'SP', 'Regus Torre Z', '+55 11 3376-6000', 'saopaulo@regus.com', '+55 11 3376-6000', 'saopaulo@regus.com', 'Não', NULL, 120.00, 'Vila Cordeiro', NULL, NULL, NULL, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:20:12', 1),
(40, 'Regus E-Business', 14, 'Tipo: Coworking Corporativo | Rating: 4.6 | Fonte: Regus Brasil + Google Maps reviews | Website: www.regus.com/pt-br/brazil/sao-paulo', 'Rua Werner Von Siemens, 111', 'Lapa de Baixo', NULL, 'São Paulo', 'SP', 'Regus E-Business', '+55 800 707 3487', 'saopaulo@regus.com', '+55 800 707 3487', 'saopaulo@regus.com', 'Não', NULL, 120.00, 'Lapa de Baixo', NULL, NULL, NULL, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:20:12', 1),
(41, 'Premium Flats Berrini', 12, 'Tipo: Hotel (salas até 20p) | Rating: 4.3 | Fonte: Google Maps (infraestrutura estimada) | Website: premiumflats.com.br', 'R. Indiana, 1165', 'Brooklin', NULL, 'São Paulo', 'SP', 'Premium Flats Berrini', '+55 11 5105-0000', 'reservas@premiumflats.com.br', '+55 11 5105-0000', 'reservas@premiumflats.com.br', 'Não', NULL, 0.00, 'Brooklin', NULL, -23.6079861, -46.6880632, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:36:57', 1),
(42, 'Mercure São Paulo Berrini', 14, 'Tipo: Hotel (salas até 20p) | Rating: 4.5 | Fonte: Accor Hotels + Website oficial | Website: www.accorhotels.com/mercure', 'R. Sansão Alves dos Santos', 'Cidade Monções', NULL, 'São Paulo', 'SP', 'Mercure São Paulo Berrini', '+55 11 5501-6911', 'h2700@accor.com', '+55 11 5501-6911', 'h2700@accor.com', 'Não', NULL, 500.00, 'Cidade Monções', NULL, NULL, NULL, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:20:12', 1),
(43, 'Wyndham São Paulo Berrini', 16, 'Tipo: Hotel (salas até 20p) | Rating: 4.4 | Fonte: Wyndham Hotels + Website | Website: www.wyndhamhotels.com/pt-br', 'R. Heinrich Hertz, 14', 'Cidade Monções', NULL, 'São Paulo', 'SP', 'Wyndham São Paulo Berrini', '+55 11 4210-2203', 'saopaulo@wyndhamhotels.com', '+55 11 4210-2203', 'saopaulo@wyndhamhotels.com', 'Não', NULL, 600.00, 'Cidade Monções', NULL, NULL, NULL, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:20:12', 1),
(44, 'Estanplaza Berrini', 14, 'Tipo: Hotel (salas até 20p) | Rating: 4.4 | Fonte: Estanplaza Hotéis + Website | Website: estanplaza.com.br', 'Av. Eng. Luís Carlos Berrini, 853', 'Brooklin Novo', NULL, 'São Paulo', 'SP', 'Estanplaza Berrini', '+55 11 5509-8900', 'berrini@estanplaza.com.br', '+55 11 5509-8900', 'berrini@estanplaza.com.br', 'Não', NULL, 550.00, 'Brooklin Novo', NULL, -23.6117153, -46.6953355, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:37:00', 1),
(45, 'Bristol The Time Hotel', 16, 'Tipo: Hotel (salas até 20p) | Rating: 4.6 | Fonte: Bristol Hotels + Website + Google Maps | Website: www.bristolhoteis.com.br', 'R. Hans Oersted', '115', '', 'São Paulo', 'SP', 'Bristol The Time Hotel', '551155041600', 'saopaulo@bristolhoteis.com.br', '551155041600', 'saopaulo@bristolhoteis.com.br', 'Não', NULL, 1.00, 'Cidade Monções', NULL, -23.6088798, -46.6949347, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:35:37', 1),
(46, 'Golden Tower Express Berrini', 12, 'Tipo: Hotel (salas até 20p) | Rating: 4.3 | Fonte: Fênix Hotéis + Google Maps | Website: www.fenixhoteis.com.br', 'R. Miguel Sutil, 577', 'Vila Cordeiro', '', 'São Paulo', 'SP', 'Golden Tower Express Berrini', '551130146277', 'berrini@fenixhoteis.com.br', '551130146277', 'berrini@fenixhoteis.com.br', 'Não', NULL, 1.00, 'Vila Cordeiro', NULL, NULL, NULL, 'ativo', NULL, NULL, NULL, NULL, 0, '2025-12-29 15:20:12', '2025-12-29 15:20:12', 1),
(47, 'INNSiDE by Meliá Itaim', 16, 'Tipo: Hotel (salas até 20p) | Rating: 4.6 | Fonte: Meliá Hotels + Website (Centro de Conferências) | Website: www.melia.com/pt/hoteis/brasil/sao-paulo', 'R. Jesuíno Arruda, 806', 'Itaim Bibi', '', 'São Paulo', 'SP', 'INNSiDE by Meliá Itaim', '551137044400', 'innside.itaim@melia.com', '551137044400', 'innside.itaim@melia.com', 'Não', NULL, 1.00, 'Itaim Bibi', NULL, -23.5832044, -46.6788041, 'desativada', NULL, NULL, '2026-01-07', 'img/rooms/47/room_47_695bcc2cd39782.08567842.jpeg', 0, '2025-12-29 15:20:12', '2025-12-29 15:33:39', 1),
(48, 'INNSiDE by Meliá Iguatemi', 16, 'Tipo: Hotel (salas até 20p) | Rating: 4.4 | Fonte: Meliá Hotels + Website (Centro de Conferências) | Website: www.melia.com/pt/hoteis/brasil/sao-paulo', 'R. Iguatemi, 150', 'Itaim Bibi', '', 'São Paulo', 'SP', 'INNSiDE by Meliá Iguatemi', '551137045100', 'innside.iguatemi@melia.com', '551137045100', 'innside.iguatemi@melia.com', 'Não', NULL, 1.00, 'Itaim Bibi', 'workshop', -23.5850117, -46.6816399, 'ativo', NULL, NULL, NULL, 'img/rooms/48/room_48_695e9de3cfa1c5.52566884.jpg', 0, '2025-12-29 15:20:12', '2025-12-29 15:33:29', 1),
(49, 'DoubleTree by Hilton Itaim', 14, 'Tipo: Hotel (salas até 20p) | Rating: 4.3 | Fonte: Hilton Hotels + Website (Convention Center) | Website: www.hilton.com', 'R. Manuel Guedes, 320', 'Itaim Bibi', '', 'São Paulo', 'SP', 'DoubleTree by Hilton Itaim', '551130662699', 'saopaulo.itaim@hilton.com', '551130662699', 'saopaulo.itaim@hilton.com', 'Não', NULL, 1.00, 'Itaim Bibi', 'reuniao', -23.5833267, -46.6793872, 'ativo', NULL, NULL, NULL, 'img/rooms/49/room_49_695e9dffd01923.13403452.jpeg', 0, '2025-12-29 15:20:12', '2025-12-29 15:33:14', 1),
(50, 'Radisson Vila Olimpia', 18, 'Tipo: Hotel (salas até 20p) | Rating: 4.5 | Fonte: Radisson Hotels + Website | Website: www.radisson.com/pt-br', 'R. Fidêncio Ramos, 420', 'Vila Olímpia', '', 'São Paulo', 'SP', 'Radisson Vila Olimpia', '551143953279', 'saopaulo.vilaolimpia@radisson.com', '551143953279', 'saopaulo.vilaolimpia@radisson.com', 'Não', NULL, 1500.00, 'Vila Olímpia', 'reuniao,workshop', -23.5950688, -46.6877514, 'ativo', NULL, NULL, NULL, 'img/rooms/50/room_50_695e9e44f38a07.64126798.jpeg', 0, '2025-12-29 15:20:12', '2025-12-29 15:32:53', 1);

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
(6, 1),
(49, 1),
(6, 2),
(6, 3),
(48, 3),
(6, 4),
(50, 4);

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
-- Estrutura para tabela `room_policies`
--

CREATE TABLE `room_policies` (
  `id` bigint(20) NOT NULL,
  `room_id` bigint(20) NOT NULL,
  `option_key` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cancel_days` int(11) DEFAULT NULL,
  `cancel_fee_pct` decimal(5,2) DEFAULT NULL,
  `charge_timing` enum('confirm','cancel_window','day_before') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'confirm',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `base_price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `room_policies`
--

INSERT INTO `room_policies` (`id`, `room_id`, `option_key`, `label`, `cancel_days`, `cancel_fee_pct`, `charge_timing`, `active`, `created_at`, `updated_at`, `base_price`) VALUES
(6, 46, 'immediate', 'Pagamento no momento da Reserva (Sem cancelamento)', NULL, NULL, 'confirm', 1, '2025-12-29 15:33:51', '2025-12-29 15:33:51', 1.00),
(7, 45, 'immediate', 'Pagamento no momento da Reserva (Sem cancelamento)', NULL, NULL, 'confirm', 1, '2025-12-29 15:35:38', '2025-12-29 15:35:38', 1.00),
(29, 6, 'immediate', 'Pagamento no momento da Reserva (Sem cancelamento)', NULL, NULL, 'confirm', 1, '2026-01-05 15:27:01', '2026-01-05 15:27:01', 1200.00),
(30, 47, 'immediate', 'Pagamento no momento da Reserva (Sem cancelamento)', NULL, NULL, 'confirm', 1, '2026-01-07 14:53:32', '2026-01-07 14:53:32', 1.00),
(31, 48, 'immediate', 'Pagamento no momento da Reserva (Sem cancelamento)', NULL, NULL, 'confirm', 1, '2026-01-07 14:54:44', '2026-01-07 14:54:44', 1.00),
(33, 49, 'immediate', 'Pagamento no momento da Reserva (Sem cancelamento)', NULL, NULL, 'confirm', 1, '2026-01-07 14:55:12', '2026-01-07 14:55:12', 1.00),
(34, 50, 'immediate', 'Pagamento no momento da Reserva (Sem cancelamento)', NULL, NULL, 'confirm', 1, '2026-01-07 14:56:21', '2026-01-07 14:56:21', 1500.00);

-- --------------------------------------------------------

--
-- Estrutura para tabela `room_policy_prices`
--

CREATE TABLE `room_policy_prices` (
  `id` bigint(20) NOT NULL,
  `policy_id` bigint(20) NOT NULL,
  `date` date NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Estrutura para tabela `room_views`
--

CREATE TABLE `room_views` (
  `id` bigint(20) NOT NULL,
  `room_id` bigint(20) NOT NULL,
  `session_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `viewed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `room_views`
--

INSERT INTO `room_views` (`id`, `room_id`, `session_id`, `user_agent`, `ip`, `viewed_at`) VALUES
(1, 6, 'rv_j0asokoqoa9_mjrbcrlz', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '186.249.142.155', '2025-12-29 12:28:52'),
(2, 44, 'rv_ftf9abj6hm_mjri64fn', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '186.249.142.155', '2025-12-29 15:39:40'),
(3, 50, 'rv_ftf9abj6hm_mjri64fn', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '201.95.205.173', '2026-01-04 09:18:39'),
(4, 49, 'rv_ftf9abj6hm_mjri64fn', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '201.95.205.173', '2026-01-04 09:51:32'),
(5, 49, 'rv_6fqfm4ocich_mk19nnvo', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '2804:18:18b5:e06f:75eb:142b:b297:996f', '2026-01-05 11:39:04'),
(6, 6, 'rv_ftf9abj6hm_mjri64fn', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '201.95.205.173', '2026-01-05 15:27:35'),
(7, 7, 'rv_ftf9abj6hm_mjri64fn', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '201.95.205.173', '2026-01-05 15:28:10'),
(8, 6, 'rv_ftf9abj6hm_mjri64fn', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '201.95.205.173', '2026-01-05 15:28:25'),
(9, 6, 'rv_ftf9abj6hm_mjri64fn', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '201.95.205.173', '2026-01-05 16:01:23'),
(10, 50, 'rv_ftf9abj6hm_mjri64fn', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '201.95.205.173', '2026-01-05 16:04:41'),
(11, 50, 'rv_ftf9abj6hm_mjri64fn', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '201.95.205.173', '2026-01-05 17:14:29'),
(12, 6, 'rv_ftf9abj6hm_mjri64fn', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '201.95.205.173', '2026-01-05 17:14:56'),
(13, 9, 'rv_ftf9abj6hm_mjri64fn', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '201.95.205.173', '2026-01-05 17:15:26'),
(14, 49, 'rv_ftf9abj6hm_mjri64fn', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '201.95.205.173', '2026-01-05 17:15:51'),
(15, 50, 'rv_ftf9abj6hm_mjri64fn', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '201.95.205.173', '2026-01-05 17:16:47'),
(16, 11, 'rv_x8w4gnd55i_mkabgtc8', 'Mozilla/5.0 (Android 16; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0', '2a02:6ea0:c041:6648::18', '2026-01-11 19:39:40');

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

--
-- Despejando dados para a tabela `visitors`
--

INSERT INTO `visitors` (`id`, `client_id`, `company_id`, `name`, `rg`, `cpf`, `email`, `invite_token`, `invite_status`, `phone`, `whatsapp`, `status`, `observations`, `created_at`, `updated_at`) VALUES
(5, 27, NULL, 'Rafael Elkabetz', '', '37333590895', '', NULL, 'pendente', '', '', 'ativo', NULL, NULL, NULL);

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
(3, NULL, 1, 1, 'Evento teste 2', NULL, 'teste', 'Saúde e bem-estar', '2025-12-31', '06:00:00', '08:00:00', 1.00, 5, 1, 'publicado', 'img/workshops/3/ws_3_692b44a506d0c9.81676450.webp', '2025-11-29 16:07:34', '2025-12-01 08:01:39'),
(4, NULL, 1, 6, 'Workshop Teste', 'Teste subtitulo', NULL, 'Desenvolvimento pessoal', '2026-03-31', '08:00:00', '19:00:00', 100.00, 10, 1, 'publicado', 'img/workshops/4/ws_4_695ea10a93c650.83115939.png', '2025-12-30 09:51:35', '2026-01-07 15:08:10'),
(5, NULL, 1, 6, 'Workshop Teste 2', NULL, 'Teste Workshop', 'Desenvolvimento pessoal', '2026-04-30', '07:00:00', '19:00:00', 150.00, 2, 0, 'publicado', 'img/workshops/5/ws_5_695ea136503414.10049803.png', '2025-12-30 12:04:51', '2026-01-07 15:08:54'),
(6, NULL, 1, 6, 'Lançamento Plataforma', 'Evento de Lançamento da plataforma', NULL, 'Desenvolvimento pessoal', '2026-07-01', '19:00:00', '22:00:00', 150.00, 12, 1, 'publicado', 'img/workshops/6/ws_6_695ea0bf34c301.19542013.jpg', '2026-01-07 15:06:55', '2026-01-07 15:06:55');

-- --------------------------------------------------------

--
-- Estrutura para tabela `workshop_enrollments`
--

CREATE TABLE `workshop_enrollments` (
  `id` int(11) NOT NULL,
  `workshop_id` int(11) NOT NULL,
  `participant_id` int(11) NOT NULL,
  `client_id` bigint(20) DEFAULT NULL,
  `public_code` varchar(64) NOT NULL,
  `payment_status` enum('pendente','pago','cancelado') NOT NULL DEFAULT 'pendente',
  `voucher_code` varchar(64) DEFAULT NULL,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `amount_due` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stripe_customer_id` varchar(80) DEFAULT NULL,
  `stripe_payment_method_id` varchar(80) DEFAULT NULL,
  `stripe_payment_intent_id` varchar(80) DEFAULT NULL,
  `stripe_charge_id` varchar(80) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `payment_failure_message` varchar(255) DEFAULT NULL,
  `checkin_status` enum('nao_lido','lido','cancelado') NOT NULL DEFAULT 'nao_lido',
  `checked_in_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Despejando dados para a tabela `workshop_enrollments`
--

INSERT INTO `workshop_enrollments` (`id`, `workshop_id`, `participant_id`, `client_id`, `public_code`, `payment_status`, `voucher_code`, `discount_amount`, `amount_due`, `stripe_customer_id`, `stripe_payment_method_id`, `stripe_payment_intent_id`, `stripe_charge_id`, `paid_at`, `payment_failure_message`, `checkin_status`, `checked_in_at`, `created_at`, `updated_at`) VALUES
(25, 4, 1, NULL, 'W212586b3d0', 'pendente', NULL, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'nao_lido', NULL, '2025-12-30 09:56:25', NULL),
(26, 5, 1, 27, 'W064255eaa3', 'cancelado', NULL, 0.00, 150.00, 'cus_TgQBcUNKCm1KcV', 'pm_1Sk2SjRGALXK8tGEIsrafR74', 'pi_3Sk5NVRGALXK8tGE1mgs9cdL', NULL, '2025-12-30 13:02:34', NULL, 'cancelado', '2025-12-30 21:08:34', '2025-12-30 13:02:33', '2025-12-31 19:22:26'),
(27, 5, 2, 26, 'W7f62210537', 'cancelado', NULL, 0.00, 150.00, 'cus_TfzrwBc3nbZUrt', 'pm_1SjzcqRGALXK8tGELGfbr1rz', 'pi_3SkXltRGALXK8tGE1RvaCIkC', NULL, '2025-12-31 19:21:38', NULL, 'cancelado', '2025-12-31 19:22:05', '2025-12-31 19:21:36', '2025-12-31 19:22:26');

-- --------------------------------------------------------

--
-- Estrutura para tabela `workshop_feedback`
--

CREATE TABLE `workshop_feedback` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `workshop_id` int(11) NOT NULL,
  `participant_id` int(11) NOT NULL,
  `participant_name` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating_event` tinyint(4) NOT NULL,
  `rating_platform` tinyint(4) NOT NULL,
  `comments_event` text COLLATE utf8mb4_unicode_ci,
  `comments_platform` text COLLATE utf8mb4_unicode_ci,
  `is_public` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(1, 'Mira', 'benyfink@gmail.com', '41836484836', NULL, NULL, 'ativo', '2025-11-22 22:45:15', '2025-12-30 09:56:25'),
(2, 'Beny Finkelstein', 'benyfink@zeefe.com.br', '37333590895', NULL, NULL, 'ativo', '2025-12-31 19:21:36', NULL);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_admins_profile_id` (`profile_id`);

--
-- Índices de tabela `admin_profiles`
--
ALTER TABLE `admin_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_admin_profiles_name` (`name`);

--
-- Índices de tabela `admin_remember_tokens`
--
ALTER TABLE `admin_remember_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_remember_token` (`token_hash`),
  ADD KEY `idx_admin_remember_admin` (`admin_id`);

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
-- Índices de tabela `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `qr_token` (`qr_token`);

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
-- Índices de tabela `post_categories`
--
ALTER TABLE `post_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_post_categories_name` (`name`);

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
-- Índices de tabela `room_policies`
--
ALTER TABLE `room_policies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_room_policies_room` (`room_id`);

--
-- Índices de tabela `room_policy_prices`
--
ALTER TABLE `room_policy_prices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_policy_date` (`policy_id`,`date`),
  ADD KEY `idx_policy_prices_policy` (`policy_id`);

--
-- Índices de tabela `room_ratings`
--
ALTER TABLE `room_ratings`
  ADD PRIMARY KEY (`room_id`);

--
-- Índices de tabela `room_views`
--
ALTER TABLE `room_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_room_views_room` (`room_id`),
  ADD KEY `idx_room_views_date` (`viewed_at`);

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
  ADD KEY `idx_workshop_enrollment_payment` (`payment_status`),
  ADD KEY `idx_workshop_enrollment_client` (`client_id`);

--
-- Índices de tabela `workshop_feedback`
--
ALTER TABLE `workshop_feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_feedback_workshop` (`workshop_id`),
  ADD KEY `idx_feedback_participant` (`participant_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `admin_profiles`
--
ALTER TABLE `admin_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `admin_remember_tokens`
--
ALTER TABLE `admin_remember_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `advertisers`
--
ALTER TABLE `advertisers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `advertiser_remember_tokens`
--
ALTER TABLE `advertiser_remember_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de tabela `amenities`
--
ALTER TABLE `amenities`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `clients`
--
ALTER TABLE `clients`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de tabela `client_remember_tokens`
--
ALTER TABLE `client_remember_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `customer_cards`
--
ALTER TABLE `customer_cards`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

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
-- AUTO_INCREMENT de tabela `inventory_items`
--
ALTER TABLE `inventory_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `ledger_entries`
--
ALTER TABLE `ledger_entries`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de tabela `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
-- AUTO_INCREMENT de tabela `post_categories`
--
ALTER TABLE `post_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `pre_reservations`
--
ALTER TABLE `pre_reservations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT de tabela `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de tabela `room_photos`
--
ALTER TABLE `room_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `room_policies`
--
ALTER TABLE `room_policies`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de tabela `room_policy_prices`
--
ALTER TABLE `room_policy_prices`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `room_views`
--
ALTER TABLE `room_views`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de tabela `stripe_events`
--
ALTER TABLE `stripe_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `visitors`
--
ALTER TABLE `visitors`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `workshop_enrollments`
--
ALTER TABLE `workshop_enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de tabela `workshop_feedback`
--
ALTER TABLE `workshop_feedback`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `workshop_media`
--
ALTER TABLE `workshop_media`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `workshop_participants`
--
ALTER TABLE `workshop_participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
-- Restrições para tabelas `room_policy_prices`
--
ALTER TABLE `room_policy_prices`
  ADD CONSTRAINT `fk_policy_prices_policy` FOREIGN KEY (`policy_id`) REFERENCES `room_policies` (`id`) ON DELETE CASCADE;

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

-- Estrutura para tabela `surveys`
CREATE TABLE `surveys` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `status` varchar(20) DEFAULT 'ativo',
  `thank_you_message` text,
  `token` varchar(64) DEFAULT NULL,
  `public_link` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estrutura para tabela `survey_questions`
CREATE TABLE `survey_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_id` int NOT NULL,
  `question_text` text NOT NULL,
  `type` varchar(40) NOT NULL,
  `required` tinyint(1) DEFAULT '0',
  `order_index` int DEFAULT '0',
  `scale_min` int DEFAULT '1',
  `scale_max` int DEFAULT '5',
  `number_min` decimal(10,2) DEFAULT NULL,
  `number_max` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `survey_id` (`survey_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estrutura para tabela `survey_options`
CREATE TABLE `survey_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `label` varchar(255) NOT NULL,
  `value` varchar(120) DEFAULT NULL,
  `order_index` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estrutura para tabela `survey_responses`
CREATE TABLE `survey_responses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_id` int NOT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(64) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `survey_id` (`survey_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estrutura para tabela `survey_answers`
CREATE TABLE `survey_answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `response_id` int NOT NULL,
  `question_id` int NOT NULL,
  `answer_text` text,
  `answer_number` decimal(10,2) DEFAULT NULL,
  `answer_option_id` int DEFAULT NULL,
  `answer_options_json` text,
  PRIMARY KEY (`id`),
  KEY `response_id` (`response_id`),
  KEY `question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estrutura para tabela `survey_branch_rules`
CREATE TABLE `survey_branch_rules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_id` int NOT NULL,
  `question_id` int NOT NULL,
  `option_id` int NOT NULL,
  `target_question_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `survey_id` (`survey_id`),
  KEY `question_id` (`question_id`),
  KEY `option_id` (`option_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
