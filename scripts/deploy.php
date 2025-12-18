<?php
/**
 * GitHub → cPanel deploy webhook
 * Purpose: automatically update the working tree on each push to main
 * Always return HTTP 200 to GitHub.
 */

date_default_timezone_set('America/Sao_Paulo');

// --- CONFIG ---
$repo_path = '/home/benyfi15/public_html';
$git_bin   = '/usr/local/cpanel/3rdparty/bin/git';
$log_file  = $repo_path . '/deploy.log';

// --- SAFETY: always respond 200 ---
http_response_code(200);
header('Content-Type: application/json; charset=utf-8');

// --- EXECUTE DEPLOY ---
$cmd = "cd {$repo_path} "
     . "&& {$git_bin} fetch origin main 2>&1 "
     . "&& {$git_bin} reset --hard origin/main 2>&1 "
     . "&& {$git_bin} clean -fd 2>&1";

$output = shell_exec($cmd);

// --- LOG ---
file_put_contents(
  $log_file,
  "=== DEPLOY ===\n"
  . "Date: " . date('Y-m-d H:i:s') . "\n"
  . ($output ?: '[no output]') . "\n\n",
  FILE_APPEND
);

// --- RESPONSE ---
echo json_encode([
  'success' => true,
  'message' => 'Deploy executed',
]);
exit;
