<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método inválido']);
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

  // Shared strings
  $shared = [];
  $siContent = $zip->getFromName('xl/sharedStrings.xml');
  if ($siContent !== false) {
    $xml = @simplexml_load_string($siContent);
    if ($xml && isset($xml->si)) {
      foreach ($xml->si as $i => $si) {
        $text = '';
        if (isset($si->t)) $text .= (string)$si->t;
        if (isset($si->r)) foreach ($si->r as $r) { $text .= (string)$r->t; }
        $shared[(int)$i] = trim($text);
      }
    }
  }

  // Sheet 1 (fallback 1..3)
  $sheet = $zip->getFromName('xl/worksheets/sheet1.xml');
  if ($sheet === false) {
    for ($i=1;$i<=3;$i++) { $alt = $zip->getFromName("xl/worksheets/sheet{$i}.xml"); if ($alt!==false) { $sheet=$alt; break; } }
  }
  $zip->close();
  if ($sheet === false) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Planilha não encontrada (sheet1)']);
    exit;
  }

  $xml = @simplexml_load_string($sheet);
  if (!$xml) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Não foi possível ler a planilha']);
    exit;
  }

  // Helpers
  $toIndex = function($letters) {
    if ($letters === '') return null;
    $letters = strtoupper($letters);
    $n = 0; for ($i=0;$i<strlen($letters);$i++){ $n = $n*26 + (ord($letters[$i]) - 64); }
    return $n-1;
  };
  $normalize = function($s) {
    $s = mb_strtolower(trim((string)$s));
    $s = preg_replace('/[\x{2010}-\x{2015}]/u','-',$s);
    if (function_exists('iconv')) { $c = @iconv('UTF-8','ASCII//TRANSLIT',$s); if ($c!==false) $s=$c; }
    $s = preg_replace('/[^a-z\-]/','',$s);
    return str_replace('-','',$s);
  };

  // Parse rows
  $rowsRaw = [];
  if (isset($xml->sheetData->row)) {
    foreach ($xml->sheetData->row as $row) {
      $cells = ['A'=>'','B'=>'','C'=>''];
      $colIndex = 0;
      foreach ($row->c as $c) {
        $r = (string)$c['r'];
        $letters = preg_replace('/\d+/','',$r);
        $idx = $toIndex($letters);
        if ($idx === null) { $idx = $colIndex; }
        $colIndex = $idx + 1;
        if ($idx < 0 || $idx > 2) continue;
        $col = $idx===0?'A':($idx===1?'B':'C');
        $t = (string)$c['t'];
        $val='';
        if ($t==='s') { $idxS=(int)$c->v; $val=$shared[$idxS]??''; }
        elseif ($t==='inlineStr') {
          if (isset($c->is->t)) $val=(string)$c->is->t; else { $tmp=''; foreach ($c->is->children() as $child) { if ($child->getName()==='t') $tmp.=(string)$child; if ($child->getName()==='r'&&isset($child->t)) $tmp.=(string)$child->t; } $val=$tmp; }
        } else { $val=(string)$c->v; }
        $cells[$col]=trim($val);
      }
      if ($cells['A']==='' && $cells['B']==='' && $cells['C']==='') continue;
      $rowsRaw[] = [$cells['A'],$cells['B'],$cells['C']];
    }
  }
  if (!count($rowsRaw)) { echo json_encode(['success'=>false,'error'=>'Planilha vazia']); exit; }

  // Header detection
  $header = array_map('mb_strtolower', array_map('trim',$rowsRaw[0]));
  $start = 1;
  $norm = array_map($normalize,$header);
  $hOk = in_array('nome',$norm,true) && in_array('email',$norm,true) && in_array('cpf',$norm,true);
  if (!$hOk) $start = 0;

  $rows = [];
  $max = 50; $count=0;
  for ($i=$start; $i<count($rowsRaw) && $count < $max; $i++) {
    [$name,$email,$cpfRaw] = $rowsRaw[$i];
    // defensive: if this line is actually a header, skip
    $maybeHeader = ($normalize($name)==='nome' && $normalize($email)==='email' && $normalize($cpfRaw)==='cpf');
    if ($maybeHeader) continue;
    $name = trim((string)$name);
    $email = trim((string)$email);
    $cpfDigits = preg_replace('/\D/','',(string)$cpfRaw);
    $valid = true; $reasons=[];
    if ($name==='') { $valid=false; $reasons[]='nome vazio'; }
    if ($email==='' || !filter_var($email, FILTER_VALIDATE_EMAIL)) { $valid=false; $reasons[]='e‑mail inválido'; }
    if (strlen($cpfDigits)!==11) { $valid=false; $reasons[]='CPF inválido'; }
    $rows[] = [
      'pos' => $i,
      'excel_row' => $i+1,
      'name' => $name,
      'email' => $email,
      'cpf_raw' => $cpfRaw,
      'cpf_digits' => $cpfDigits,
      'valid' => $valid,
      'reasons' => $reasons
    ];
    $count++;
  }

  echo json_encode(['success'=>true,'headerDetected'=>$hOk,'rows'=>$rows]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}

