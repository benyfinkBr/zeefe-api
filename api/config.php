<?php
// api/config.php
// Centralized configuration. Replace placeholders with real values.
// IMPORTANT: do NOT commit real credentials to a public repo.

return [
  'db' => [
    'host' => 'localhost',        // change if different (ex: 127.0.0.1 or mysql.hosting.com)
    'dbname' => 'benyfi15_zeefe_db',
    'user' => 'benyfi15_zeefe_user',
    'pass' => 'Gafin123!',
    'charset' => 'utf8mb4'
  ],
  'allowed_origins' => [
    'https://www.zeefe.com.br',
    'https://zeefe.com.br',
    'http://localhost:8000'
  ],
  // Pagamentos desativados: bloco mantido apenas para referência.
  'pagarme' => [
    'enabled' => false
  ]
];
