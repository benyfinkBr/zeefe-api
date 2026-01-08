<?php
require_once __DIR__ . '/../PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../PHPMailer/src/SMTP.php';
require_once __DIR__ . '/../PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function mailer_strip_quotes(string $value): string {
  $value = trim($value);
  $len = strlen($value);
  if ($len >= 2) {
    $first = $value[0];
    $last = $value[$len - 1];
    if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
      return substr($value, 1, -1);
    }
  }
  return $value;
}

function mailer_get_config(string $key, string $fallback = ''): string {
  $iniKey = 'zeefe_' . $key;
  $iniVal = ini_get($iniKey);
  if (is_string($iniVal) && $iniVal !== '') {
    return mailer_strip_quotes($iniVal);
  }
  $envVal = getenv(strtoupper($iniKey));
  if (is_string($envVal) && $envVal !== '') {
    return mailer_strip_quotes($envVal);
  }
  return $fallback;
}

if (!defined('MAIL_HOST')) {
  define('MAIL_HOST', mailer_get_config('mail_host', 'smtp.titan.email'));
}
if (!defined('MAIL_USERNAME')) {
  define('MAIL_USERNAME', mailer_get_config('mail_username', 'contato@zeefe.com.br'));
}
if (!defined('MAIL_PASSWORD')) {
  define('MAIL_PASSWORD', mailer_get_config('mail_password', 'Gafin123!'));
}
if (!defined('MAIL_FROM_ADDRESS')) {
  define('MAIL_FROM_ADDRESS', mailer_get_config('mail_from_address', 'contato@zeefe.com.br'));
}
if (!defined('MAIL_FROM_NAME')) {
  define('MAIL_FROM_NAME', mailer_get_config('mail_from_name', 'Ze.EFE'));
}

function mailer_render(string $template, array $placeholders = []): string {
  $path = __DIR__ . '/../emails/' . $template;
  if (!is_file($path)) {
    throw new RuntimeException('Template de e-mail não encontrado: ' . $template);
  }
  $html = file_get_contents($path);
  if ($html === false) {
    throw new RuntimeException('Falha ao carregar o template de e-mail.');
  }
  foreach ($placeholders as $key => $value) {
    $html = str_replace('{{' . $key . '}}', (string) $value, $html);
  }
  return preg_replace('/\{\{[^}]+\}\}/', '', $html);
}

function mailer_send($recipients, string $subject, string $htmlBody, string $textBody = '', array $attachments = []): bool {
  $mail = new PHPMailer(true);
  try {
    $mail->isSMTP();
    $mail->Host = MAIL_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = MAIL_USERNAME;
    $mail->Password = MAIL_PASSWORD;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->CharSet = 'UTF-8';

    $mail->setFrom(MAIL_FROM_ADDRESS, MAIL_FROM_NAME);

    $list = [];
    if (is_array($recipients)) {
      $list = $recipients;
    } else {
      $list = [['email' => $recipients]];
    }

    foreach ($list as $item) {
      if (is_array($item)) {
        $mail->addAddress($item['email'], $item['name'] ?? '');
      } else {
        $mail->addAddress($item);
      }
    }

    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $htmlBody;
    $mail->AltBody = $textBody ?: strip_tags($htmlBody);

    // Optional attachments
    if (!empty($attachments) && is_array($attachments)) {
      foreach ($attachments as $att) {
        $data = $att['data'] ?? '';
        $name = $att['name'] ?? 'anexo.dat';
        $type = $att['type'] ?? 'application/octet-stream';
        if ($data !== '') {
          $mail->addStringAttachment($data, $name, 'base64', $type);
        }
      }
    }

    $mail->send();
    return true;
  } catch (Exception $e) {
    error_log('Erro ao enviar e-mail: ' . $e->getMessage());
    return false;
  }
}
