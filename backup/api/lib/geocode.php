<?php
// Geocoding helpers (Nominatim / OpenStreetMap)

function geocode_address(string $address): ?array {
  $url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' . urlencode($address);
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 8,
    CURLOPT_USERAGENT => 'Ze.EFE/1.0 (contato@zeefe.com.br)'
  ]);
  $resp = curl_exec($ch);
  if ($resp === false) { curl_close($ch); return null; }
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($code !== 200) return null;
  $arr = json_decode($resp, true);
  if (!is_array($arr) || empty($arr)) return null;
  $lat = isset($arr[0]['lat']) ? (float)$arr[0]['lat'] : null;
  $lon = isset($arr[0]['lon']) ? (float)$arr[0]['lon'] : null;
  if (!$lat || !$lon) return null;
  return ['lat' => $lat, 'lon' => $lon];
}

function build_room_address(array $row): string {
  $parts = [];
  foreach (['street','complement'] as $k) { if (!empty($row[$k])) $parts[] = $row[$k]; }
  $local = trim(($row['city'] ?? '') . ' ' . ($row['state'] ?? ''));
  if ($local) $parts[] = $local;
  if (!empty($row['cep'])) $parts[] = preg_replace('/\D/','',$row['cep']);
  $parts[] = 'Brasil';
  return implode(', ', array_filter($parts));
}

function attempt_room_geocode(PDO $pdo, int $roomId, ?array $row = null): bool {
  if (!$row) {
    $s = $pdo->prepare('SELECT street, complement, city, state, cep, lat, lon FROM rooms WHERE id = ?');
    $s->execute([$roomId]);
    $row = $s->fetch(PDO::FETCH_ASSOC);
    if (!$row) return false;
  }
  if (!empty($row['lat']) && !empty($row['lon'])) return true;
  // Requer ao menos cidade/estado ou CEP
  $hasBasic = (!empty($row['cep']) || (!empty($row['city']) && !empty($row['state'])));
  if (!$hasBasic) return false;
  $address = build_room_address($row);
  $pos = geocode_address($address);
  if (!$pos) return false;
  $u = $pdo->prepare('UPDATE rooms SET lat = :lat, lon = :lon, updated_at = NOW() WHERE id = :id');
  $u->execute([':lat'=>$pos['lat'], ':lon'=>$pos['lon'], ':id'=>$roomId]);
  return true;
}

