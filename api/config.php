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
  'pagarme' => [
    'account_id' => 'acc_W695O0gUESAg4EyZ',
    'public_key' => 'pk_test_RNoa2omHrUnZlGzK',
    // Use a secret key válida do Pagar.me (mantém a que já estava configurada para testes)
    'secret_key' => 'sk_test_bcb214be5bd6476b80f4e5cdefa61078',
    'webhook_user' => 'teste123',
    'webhook_password' => '321teste',
    'accepted_payment_methods' => ['credit_card', 'pix', 'boleto'],
    'checkout_expiration_seconds' => 60 * 60 * 24, // 24h
    'debug' => true
  ]
];
