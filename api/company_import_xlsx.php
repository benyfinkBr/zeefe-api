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

  // Se veio JSON com linhas editadas/manuais
  $raw = file_get_contents('php://input');
  $asJson = json_decode($raw, true);
  if (is_array($asJson) && isset($asJson['rows'])) {
    $companyId = isset($asJson['company_id']) ? (int)$asJson['company_id'] : 0;
    $role = isset($asJson['role']) ? strtolower(trim($asJson['role'])) : 'membro';
    if (!in_array($role, ['admin','gestor','membro','leitor'], true)) $role = 'membro';
    if ($companyId <= 0) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Empresa inválida']); exit; }
    $rowsIn = is_array($asJson['rows']) ? $asJson['rows'] : [];
    $sent=0; $failed=0; $errors=[];
    foreach ($rowsIn as $idx => $r) {
      $name = trim((string)($r['name'] ?? ''));
      $email = trim((string)($r['email'] ?? ''));
      $cpfDigits = preg_replace('/\D/','', (string)($r['cpf'] ?? ''));
      if ($name==='' || $email==='' || !filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($cpfDigits)!==11) { $failed++; $errors[]='Linha '.($idx+1).': dados inválidos'; continue; }
      try {
        try { $pdo->exec("CREATE TABLE IF NOT EXISTS company_invitations (id BIGINT AUTO_INCREMENT PRIMARY KEY, company_id BIGINT NOT NULL, client_id BIGINT NULL, invite_email VARCHAR(255) NULL, invite_name VARCHAR(255) NULL, cpf VARCHAR(14) NOT NULL, role ENUM('admin','gestor','membro','leitor') NOT NULL DEFAULT 'membro', token VARCHAR(128) NOT NULL, status ENUM('pendente','aceito','cancelado','expirado') NOT NULL DEFAULT 'pendente', expires_at DATETIME NOT NULL, created_at DATETIME NOT NULL, accepted_at DATETIME NULL, INDEX idx_inv_company (company_id), UNIQUE KEY uk_inv_token (token)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"); } catch (Throwable $e) {}
        $token = bin2hex(random_bytes(24)); $expires=(new DateTime('+48 hours'))->format('Y-m-d H:i:s'); $now=(new DateTime())->format('Y-m-d H:i:s');
        $ins=$pdo->prepare('INSERT INTO company_invitations (company_id, client_id, invite_email, invite_name, cpf, role, token, status, expires_at, created_at) VALUES (:company_id, NULL, :invite_email, :invite_name, :cpf, :role, :token, "pendente", :expires, :created)');
        $ins->execute([':company_id'=>$companyId, ':invite_email'=>$email, ':invite_name'=>$name, ':cpf'=>$cpfDigits, ':role'=>$role, ':token'=>$token, ':expires'=>$expires, ':created'=>$now]);
        $cstmt=$pdo->prepare('SELECT nome_fantasia, razao_social FROM companies WHERE id = :id LIMIT 1'); $cstmt->execute([':id'=>$companyId]); $company=$cstmt->fetch(PDO::FETCH_ASSOC)?:[]; $companyName=$company['nome_fantasia']??$company['razao_social']??'sua empresa';
        $host=(isset($_SERVER['HTTPS'])&&$_SERVER['HTTPS']==='on'?'https://':'http://').($_SERVER['HTTP_HOST']??'localhost'); $acceptUrl=$host.'/api/company_accept_invite.php?token='.urlencode($token);
        $html=mailer_render('company_user_invite.php',['company_name'=>$companyName,'accept_url'=>$acceptUrl,'client_name'=>$name]); mailer_send([$email],'Convite para acessar empresa no portal Ze.EFE',$html);
        $sent++;
      } catch (Throwable $e) { $failed++; $errors[]='Linha '.($idx+1).': '.$e->getMessage(); }
    }
    echo json_encode(['success'=>true,'sent'=>$sent,'failed'=>$failed,'errors'=>$errors]);
    exit;
  }

  $companyId = isset($_POST['company_id']) ? (int)$_POST['company_id'] : 0;
  $selectedJson = $_POST['selected'] ?? '';
  $selectedPositions = [];
  if ($selectedJson) {
    $tmpSel = json_decode($selectedJson, true);
    if (is_array($tmpSel)) { $selectedPositions = array_values(array_filter($tmpSel, 'is_numeric')); }
  }
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
      $colIndex = 0; // 0=>A,1=>B,2=>C

      // helper para converter letras em índice (A=0, B=1, ...)
      $toIndex = function($letters) {
        if ($letters === '') return null;
        $letters = strtoupper($letters);
        $n = 0;
        for ($i = 0; $i < strlen($letters); $i++) {
          $n = $n * 26 + (ord($letters[$i]) - 64);
        }
        return $n - 1; // zero-based
      };

      foreach ($row->c as $c) {
        $r = (string)$c['r']; // ex: A1
        $letters = preg_replace('/\d+/', '', $r);
        $idx = $toIndex($letters);
        if ($idx === null) { $idx = $colIndex; } // fallback sequencial quando 'r' não vem
        // Atualiza colIndex para próxima célula
        $colIndex = $idx + 1;
        if ($idx < 0 || $idx > 2) continue; // só A/B/C
        $col = $idx === 0 ? 'A' : ($idx === 1 ? 'B' : 'C');

        $t = (string)$c['t'];
        $val = '';
        if ($t === 's') {
          // Shared string table
          $idxS = (int) ((string)$c->v);
          $val = $shared[$idxS] ?? '';
        } elseif ($t === 'inlineStr') {
          // Inline string
          if (isset($c->is->t)) {
            $val = (string)$c->is->t;
          } elseif (isset($c->is)) {
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
  // Normaliza cabeçalho para tolerar variações (espaços, hífens, acentuação)
  $normalize = function($s) {
    $s = mb_strtolower(trim((string)$s));
    $s = preg_replace('/[\x{2010}-\x{2015}]/u', '-', $s); // diferentes hífens
    if (function_exists('iconv')) {
      $conv = @iconv('UTF-8','ASCII//TRANSLIT',$s);
      if ($conv !== false) $s = $conv;
    }
    $s = preg_replace('/[^a-z\-]/','', $s);
    $s = str_replace('-', '', $s); // e-mail -> email
    return $s;
  };
  $norm = array_map($normalize, $header);
  $hOk = in_array('nome', $norm, true) && in_array('email', $norm, true) && in_array('cpf', $norm, true);
  if (!$hOk) { $start = 0; } // não reconheceu cabeçalho, assume dados já a partir da primeira

  $max = 50; $sent = 0; $failed = 0; $errors = [];
  $selectedMap = [];
  foreach ($selectedPositions as $p) { $selectedMap[(int)$p] = true; }
  // Heurística igual a do parse
  $mapHeuristic = function($tuple){
    $vals = array_map(function($v){ return trim((string)$v); }, (array)$tuple);
    $email=''; $cpfRaw=''; $name='';
    foreach ($vals as $v) { if ($email==='' && filter_var($v, FILTER_VALIDATE_EMAIL)) { $email=$v; } }
    foreach ($vals as $v) { if ($cpfRaw==='' && preg_match('/\d{3}[\. ]?\d{3}[\. ]?\d{3}[- ]?\d{2}/', $v)) { $cpfRaw=$v; } }
    foreach ($vals as $v) {
      $isEmail = filter_var($v, FILTER_VALIDATE_EMAIL);
      $isCpfLike = preg_match('/\d{3}[\. ]?\d{3}[\. ]?\d{3}[- ]?\d{2}/', $v);
      if (!$isEmail && !$isCpfLike && $v!=='') { $name=$v; break; }
    }
    if ($name==='' && isset($vals[0]) && $vals[0]!=='' && !$email) $name=$vals[0];
    if ($email==='' && isset($vals[1]) && filter_var($vals[1], FILTER_VALIDATE_EMAIL)) $email=$vals[1];
    if ($cpfRaw==='' && isset($vals[2])) $cpfRaw=$vals[2];
    return [$name,$email,$cpfRaw];
  };

  for ($i = $start; $i < count($rows) && $sent + $failed < $max; $i++) {
    if (!empty($selectedMap) && !isset($selectedMap[$i])) { continue; }
    [$name0, $email0, $cpf0] = $rows[$i];
    [$name, $email, $cpf] = $mapHeuristic([$name0,$email0,$cpf0]);
    $name = trim((string)$name); $email = trim((string)$email); $cpfDigits = preg_replace('/\D/','', (string)$cpf);
    // Se por qualquer razão a primeira linha de dados ainda for um cabeçalho, ignore
    try {
      $isHeaderRow = false;
      if (isset($normalize)) {
        $nn = $normalize($name);
        $ne = $normalize($email);
        $nc = $normalize($cpf);
        if ($nn === 'nome' && $ne === 'email' && $nc === 'cpf') {
          $isHeaderRow = true;
        }
      }
      if ($isHeaderRow) { continue; }
    } catch (Throwable $e) { /* ignore */ }
    if ($name === '' || $email === '' || strlen($cpfDigits) !== 11) { $failed++; $errors[] = "Linha ".($i+1).": dados inválidos"; continue; }

    try {
      // Garante tabela com colunas para pré-cadastro (sem criar usuário)
      try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS company_invitations (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          company_id BIGINT NOT NULL,
          client_id BIGINT NULL,
          invite_email VARCHAR(255) NULL,
          invite_name VARCHAR(255) NULL,
          cpf VARCHAR(14) NOT NULL,
          role ENUM('admin','gestor','membro','leitor') NOT NULL DEFAULT 'membro',
          token VARCHAR(128) NOT NULL,
          status ENUM('pendente','aceito','cancelado','expirado') NOT NULL DEFAULT 'pendente',
          expires_at DATETIME NOT NULL,
          created_at DATETIME NOT NULL,
          accepted_at DATETIME NULL,
          INDEX idx_inv_company (company_id),
          UNIQUE KEY uk_inv_token (token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        @$pdo->exec("ALTER TABLE company_invitations MODIFY client_id BIGINT NULL");
        @$pdo->exec("ALTER TABLE company_invitations ADD COLUMN invite_email VARCHAR(255) NULL");
        @$pdo->exec("ALTER TABLE company_invitations ADD COLUMN invite_name VARCHAR(255) NULL");
      } catch (Throwable $e) {}

      $token = bin2hex(random_bytes(24));
      $expires = (new DateTime('+48 hours'))->format('Y-m-d H:i:s');
      $now = (new DateTime())->format('Y-m-d H:i:s');

      $ins = $pdo->prepare('INSERT INTO company_invitations (company_id, client_id, invite_email, invite_name, cpf, role, token, status, expires_at, created_at) VALUES (:company_id, NULL, :invite_email, :invite_name, :cpf, :role, :token, "pendente", :expires, :created)');
      $ins->execute([':company_id'=>$companyId, ':invite_email'=>$email, ':invite_name'=>$name, ':cpf'=>$cpfDigits, ':role'=>$role, ':token'=>$token, ':expires'=>$expires, ':created'=>$now]);

      // E‑mail
      $cstmt = $pdo->prepare('SELECT nome_fantasia, razao_social FROM companies WHERE id = :id LIMIT 1');
      $cstmt->execute([':id'=>$companyId]);
      $company = $cstmt->fetch(PDO::FETCH_ASSOC) ?: [];
      $companyName = $company['nome_fantasia'] ?? $company['razao_social'] ?? 'sua empresa';
      $host = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost');
      $acceptUrl = $host . '/api/company_accept_invite.php?token=' . urlencode($token);
      $html = mailer_render('company_user_invite.php', ['company_name'=>$companyName, 'accept_url'=>$acceptUrl, 'client_name'=>$name]);
      mailer_send([$email], 'Convite para acessar empresa no portal Ze.EFE', $html);

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
