<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
header('Content-Type: application/json');

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método inválido']);
    exit;
  }

  $companyId = isset($_POST['company_id']) ? (int)$_POST['company_id'] : 0;
  $role = isset($_POST['role']) ? strtolower(trim($_POST['role'])) : 'membro';
  if (!in_array($role, ['admin','gestor','membro','leitor'], true)) $role = 'membro';

  if ($companyId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Empresa inválida']);
    exit;
  }

  if (!isset($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Arquivo .xlsx não enviado']);
    exit;
  }

  $tmp = $_FILES['file']['tmp_name'];
  $name = $_FILES['file']['name'];
  if (!preg_match('/\.xlsx$/i', $name)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Envie um arquivo .xlsx']);
    exit;
  }

  if (!class_exists('ZipArchive')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'ZipArchive indisponível no servidor']);
    exit;
  }

  $zip = new ZipArchive();
  if ($zip->open($tmp) !== true) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Não foi possível abrir o XLSX']);
    exit;
  }

  // Lê sharedStrings (opcional)
  $shared = [];
  $siContent = $zip->getFromName('xl/sharedStrings.xml');
  if ($siContent !== false) {
    $xml = @simplexml_load_string($siContent);
    if ($xml && isset($xml->si)) {
      foreach ($xml->si as $i => $si) {
        // Concatena t e r/t (strings ricas)
        $text = '';
        if (isset($si->t)) $text .= (string)$si->t;
        if (isset($si->r)) {
          foreach ($si->r as $r) { $text .= (string)$r->t; }
        }
        $shared[(int)$i] = trim($text);
      }
    }
  }

  // Lê primeira planilha
  $sheet = $zip->getFromName('xl/worksheets/sheet1.xml');
  if ($sheet === false) {
    // tenta sheet1.xml com caminho alternativo
    for ($i = 1; $i <= 3; $i++) {
      $alt = $zip->getFromName("xl/worksheets/sheet{$i}.xml");
      if ($alt !== false) { $sheet = $alt; break; }
    }
  }
  if ($sheet === false) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Planilha não encontrada (sheet1)']);
    exit;
  }
  $zip->close();

  $xml = @simplexml_load_string($sheet);
  if (!$xml) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Não foi possível ler a planilha']);
    exit;
  }

  $rows = [];
  if (isset($xml->sheetData->row)) {
    foreach ($xml->sheetData->row as $row) {
      $cells = ['A'=>'','B'=>'','C'=>''];
      foreach ($row->c as $c) {
        $r = (string)$c['r']; // ex: A1
        $col = preg_replace('/\d+/', '', $r);
        if (!isset($cells[$col])) continue; // ignora colunas > C
        $t = (string)$c['t'];
        $val = '';
        if ($t === 's') {
          // Shared string table
          $idx = (int) ((string)$c->v);
          $val = $shared[$idx] ?? '';
        } elseif ($t === 'inlineStr') {
          // Inline string
          if (isset($c->is->t)) {
            $val = (string)$c->is->t;
          } elseif (isset($c->is)) {
            // Concatena runs formatados, se existirem
            $tmp = '';
            foreach ($c->is->children() as $child) {
              if ($child->getName() === 't') $tmp .= (string)$child;
              if ($child->getName() === 'r' && isset($child->t)) $tmp .= (string)$child->t;
            }
            $val = $tmp;
          } else {
            $val = '';
          }
        } else {
          // number, str, b, etc
          $val = (string)$c->v;
        }
        $cells[$col] = trim($val);
      }
      // Se todas colunas vazias, ignora a linha
      if ($cells['A']==='' && $cells['B']==='' && $cells['C']==='') continue;
      $rows[] = [$cells['A'], $cells['B'], $cells['C']];
    }
  }

  if (!count($rows)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Planilha vazia']);
    exit;
  }

  // Cabeçalho esperado
  $header = array_map('mb_strtolower', array_map('trim', $rows[0]));
  $start = 1;
  $hOk = in_array('nome', $header, true) && (in_array('e-mail', $header, true) || in_array('email', $header, true)) && in_array('cpf', $header, true);
  if (!$hOk) { $start = 0; } // não reconheceu cabeçalho, assume dados já a partir da primeira

  $max = 50; $sent = 0; $failed = 0; $errors = [];
  for ($i = $start; $i < count($rows) && $sent + $failed < $max; $i++) {
    [$name, $email, $cpf] = $rows[$i];
    $name = trim((string)$name); $email = trim((string)$email); $cpfDigits = preg_replace('/\D/','', (string)$cpf);
    if ($name === '' || $email === '' || strlen($cpfDigits) !== 11) { $failed++; $errors[] = "Linha ".($i+1).": dados inválidos"; continue; }

    try {
      // LOCALIZA/CRIA CLIENTE (mesma lógica que no convite unitário)
      $stmt = $pdo->prepare('SELECT id, name, email, login, company_id FROM clients WHERE REPLACE(REPLACE(REPLACE(cpf, ".", ""), "-", ""), " ", "") = :cpf OR email = :email LIMIT 1');
      $stmt->execute([':cpf'=>$cpfDigits, ':email'=>$email]);
      $client = $stmt->fetch(PDO::FETCH_ASSOC);
      if (!$client) {
        $login = $email;
        $insCli = $pdo->prepare('INSERT INTO clients (name, email, login, cpf, password_hash, status, created_at, updated_at) VALUES (:name,:email,:login,:cpf, :hash, :status, NOW(), NOW())');
        $insCli->execute([':name'=>$name, ':email'=>$email, ':login'=>$login, ':cpf'=>$cpfDigits, ':hash'=>'', ':status'=>'ativo']);
        $client = [ 'id'=>(int)$pdo->lastInsertId(), 'name'=>$name, 'email'=>$email, 'login'=>$login, 'company_id'=>null ];
      }

      $token = bin2hex(random_bytes(24));
      $expires = (new DateTime('+48 hours'))->format('Y-m-d H:i:s');
      $now = (new DateTime())->format('Y-m-d H:i:s');
      // Garante tabela
      try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS company_invitations (id BIGINT AUTO_INCREMENT PRIMARY KEY, company_id BIGINT NOT NULL, client_id BIGINT NOT NULL, cpf VARCHAR(14) NOT NULL, role ENUM('admin','gestor','membro','leitor') NOT NULL DEFAULT 'membro', token VARCHAR(128) NOT NULL, status ENUM('pendente','aceito','cancelado','expirado') NOT NULL DEFAULT 'pendente', expires_at DATETIME NOT NULL, created_at DATETIME NOT NULL, accepted_at DATETIME NULL, INDEX idx_inv_company (company_id), UNIQUE KEY uk_inv_token (token)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
      } catch (Throwable $e) {}

      $ins = $pdo->prepare('INSERT INTO company_invitations (company_id, client_id, cpf, role, token, status, expires_at, created_at) VALUES (:company_id,:client_id,:cpf,:role,:token, "pendente", :expires, :created)');
      $ins->execute([':company_id'=>$companyId, ':client_id'=>(int)$client['id'], ':cpf'=>$cpfDigits, ':role'=>$role, ':token'=>$token, ':expires'=>$expires, ':created'=>$now]);

      // Nome fantasia
      $cstmt = $pdo->prepare('SELECT nome_fantasia, razao_social FROM companies WHERE id = :id LIMIT 1');
      $cstmt->execute([':id'=>$companyId]);
      $company = $cstmt->fetch(PDO::FETCH_ASSOC) ?: [];
      $companyName = $company['nome_fantasia'] ?? $company['razao_social'] ?? 'sua empresa';
      $host = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost');
      $acceptUrl = $host . '/api/company_accept_invite.php?token=' . urlencode($token);
      $html = mailer_render('company_user_invite', ['company_name'=>$companyName, 'accept_url'=>$acceptUrl, 'client_name'=>$client['name'] ?? $name]);
      mailer_send([$client['email'] ?: $email], 'Convite para acessar empresa no portal Ze.EFE', $html);

      $sent++;
    } catch (Throwable $ie) {
      $failed++; $errors[] = "Linha ".($i+1).": " . $ie->getMessage();
    }
  }

  echo json_encode(['success'=> true, 'sent'=>$sent, 'failed'=>$failed, 'errors'=>$errors]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}
