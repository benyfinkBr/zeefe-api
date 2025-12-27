<?php
// Variables expected in $placeholders:
// company_name, accept_url, client_name
?>
<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;background:#F5F0E9;padding:24px 0;color:#1D413A">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,.08)">
        <tr>
          <td style="padding:24px 28px;border-bottom:1px solid #EFE9E1">
            <img src="https://zeefe.com.br/img/logo-mail.png" width="120" alt="Ze.EFE" style="display:block" />
          </td>
        </tr>
        <tr>
          <td style="padding:28px">
            <h2 style="margin:0 0 12px;font-size:20px;color:#1D413A">Convite para acessar a empresa</h2>
            <p style="margin:0 0 16px;line-height:1.6">Olá<?= isset($placeholders['client_name']) ? ', ' . htmlspecialchars($placeholders['client_name']) : '' ?>,</p>
            <p style="margin:0 0 16px;line-height:1.6">Você foi convidado(a) para se vincular à empresa <strong><?= htmlspecialchars($placeholders['company_name'] ?? 'sua empresa') ?></strong> no portal Ze.EFE.</p>
            <p style="margin:0 0 16px;line-height:1.6">Para aceitar o convite e concluir o vínculo, clique no botão abaixo:</p>
            <p style="margin:20px 0" align="center">
              <a href="<?= htmlspecialchars($placeholders['accept_url'] ?? '#') ?>" style="background:#1D413A;color:#F5F0E9;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block;font-weight:600">Aceitar convite</a>
            </p>
            <p style="font-size:13px;color:#666;line-height:1.5">Se o botão não funcionar, copie e cole esta URL no navegador:<br><?= htmlspecialchars($placeholders['accept_url'] ?? '') ?></p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #EFE9E1;font-size:12px;color:#6b6b6b">&copy; <?= date('Y') ?> Ze.EFE</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

