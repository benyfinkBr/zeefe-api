<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Status diário de workshops — Ze.EFE</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E9;font-family:'Inter',Arial,sans-serif;color:#1D413A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E9;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:24px;box-shadow:0 12px 32px rgba(29,65,58,0.12);overflow:hidden;">
          <tr>
            <td style="background:#1D413A;padding:32px;text-align:center;">
              <img src="https://zeefe.com.br/img/logo-mail.png" alt="Ze.EFE" width="120" style="display:block;margin:0 auto 12px;">
              <p style="margin:0;font-size:15px;letter-spacing:0.1em;color:#E6DED4;text-transform:uppercase;">Resumo diário</p>
              <h1 style="margin:12px 0 0;font-size:26px;color:#F5F0E9;">Workshops do dia</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin-top:0;font-size:16px;line-height:1.6;">Olá, {{advertiser_name}}! Confira o status dos seus workshops:</p>
              {{report_rows}}
              <p style="margin:18px 0 0;font-size:14px;color:#8A7766;">Use a coluna "Gestao" para abrir o painel de convidados de cada workshop.</p>
              <div style="text-align:center;margin:24px 0;">
                <a href="{{portal_url}}" style="display:inline-block;background:#1D413A;color:#F5F0E9;text-decoration:none;padding:14px 26px;border-radius:12px;font-weight:600;">Gestão do evento</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#F5F0E9;padding:24px;text-align:center;color:#8A7766;font-size:13px;">
              Ze.EFE · Moema · São Paulo/SP<br>
              <a href="https://zeefe.com.br" style="color:#1D413A;text-decoration:none;font-weight:600;">www.zeefe.com.br</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
