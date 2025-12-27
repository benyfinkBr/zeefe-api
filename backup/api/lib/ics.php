<?php
// Minimal ICS generator for calendar invites/attachments

function ics_escape($text) {
  return str_replace(["\\", ";", ",", "\n"], ["\\\\", "\;", "\,", "\\n"], $text ?? '');
}

/**
 * Generates a simple ICS content string.
 * $start/$end in UTC (Y-m-d H:i:s) or timestamps; $uid unique string.
 */
function ics_generate(array $opts): string {
  $summary = ics_escape($opts['summary'] ?? 'Reserva Ze.EFE');
  $description = ics_escape($opts['description'] ?? '');
  $location = ics_escape($opts['location'] ?? 'Ze.EFE');
  $uid = $opts['uid'] ?? (uniqid('zeefe-', true));

  $tz = $opts['tz'] ?? null; // e.g., 'America/Sao_Paulo'
  if ($tz && !@timezone_open($tz)) { $tz = null; }

  if ($tz) {
    $dtStart = ics_format_dt_local($opts['start'] ?? null, $tz);
    $dtEnd = ics_format_dt_local($opts['end'] ?? null, $tz);
  } else {
    $dtStart = ics_format_dt($opts['start'] ?? null);
    $dtEnd = ics_format_dt($opts['end'] ?? null);
  }
  $dtStamp = gmdate('Ymd\THis\Z');

  $lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ze.EFE//Reservas//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    // Timezone block (simplificado, sem DST)
    $tz ? 'BEGIN:VTIMEZONE' : null,
    $tz ? 'TZID:' . $tz : null,
    $tz ? 'X-LIC-LOCATION:' . $tz : null,
    $tz ? 'BEGIN:STANDARD' : null,
    $tz ? 'TZOFFSETFROM:-0300' : null,
    $tz ? 'TZOFFSETTO:-0300' : null,
    $tz ? 'TZNAME:BRT' : null,
    $tz ? 'DTSTART:19700101T000000' : null,
    $tz ? 'END:STANDARD' : null,
    $tz ? 'END:VTIMEZONE' : null,
    'BEGIN:VEVENT',
    'UID:' . $uid,
    'DTSTAMP:' . $dtStamp,
    $dtStart ? ('DTSTART' . ($tz ? ';TZID=' . $tz : '') . ':' . $dtStart) : null,
    $dtEnd ? ('DTEND' . ($tz ? ';TZID=' . $tz : '') . ':' . $dtEnd) : null,
    'SUMMARY:' . $summary,
    'DESCRIPTION:' . $description,
    'LOCATION:' . $location,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return implode("\r\n", array_values(array_filter($lines, fn($l) => $l !== null))) . "\r\n";
}

function ics_format_dt($value): ?string {
  if (!$value) return null;
  if (is_numeric($value)) {
    return gmdate('Ymd\THis\Z', (int)$value);
  }
  if (is_string($value)) {
    // Try to parse as "Y-m-d H:i:s" or "Y-m-d"
    $ts = strtotime($value . ' UTC');
    if ($ts !== false) return gmdate('Ymd\THis\Z', $ts);
  }
  return null;
}

function ics_format_dt_local($value, string $tz): ?string {
  if (!$value) return null;
  try {
    $zone = new DateTimeZone($tz);
    if (is_numeric($value)) {
      $dt = new DateTime('@' . (int)$value); // epoch in UTC
      $dt->setTimezone($zone);
      return $dt->format('Ymd\THis');
    }
    if (is_string($value)) {
      $dt = new DateTime($value, $zone);
      return $dt->format('Ymd\THis');
    }
  } catch (Throwable $e) {
    return null;
  }
  return null;
}
