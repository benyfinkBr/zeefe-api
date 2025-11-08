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

  $dtStart = ics_format_dt($opts['start'] ?? null);
  $dtEnd = ics_format_dt($opts['end'] ?? null);
  $dtStamp = gmdate('Ymd\THis\Z');

  $lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ze.EFE//Reservas//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' . $uid,
    'DTSTAMP:' . $dtStamp,
    $dtStart ? ('DTSTART:' . $dtStart) : null,
    $dtEnd ? ('DTEND:' . $dtEnd) : null,
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

