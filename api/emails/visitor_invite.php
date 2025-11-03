<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Convite Ze.EFE</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E9;font-family:'Inter',Arial,sans-serif;color:#1D413A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E9;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:24px;box-shadow:0 12px 32px rgba(29,65,58,0.12);overflow:hidden;">
          <tr>
            <td style="background:#1D413A;padding:32px;text-align:center;">
              <img src="https://zeefe.com.br/img/logo-mail.png" alt="Ze.EFE" width="120" style="display:block;margin:0 auto 12px;">
              <h1 style="margin:12px 0 0;font-size:26px;color:#F5F0E9;">Você foi convidado!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin-top:0;font-size:16px;line-height:1.6;">Olá {{visitante_nome}}, {{cliente_nome}} convidou você para participar de uma reunião na Ze.EFE.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #E6DED4;width:35%;font-weight:600;">Sala</td>
                  <td style="padding:12px 0;border-bottom:1px solid #E6DED4;">{{sala_nome}}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #E6DED4;font-weight:600;">Data</td>
                  <td style="padding:12px 0;border-bottom:1px solid #E6DED4;">{{data_formatada}}</td>
                </tr>
              </table>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">Para agilizar sua entrada, complete ou confirme seus dados clicando no botão abaixo.</p>
              <div style="text-align:center;margin:32px 0;">
                <a href="{{link_confirmacao}}" style="display:inline-block;background:#1D413A;color:#F5F0E9;text-decoration:none;padding:14px 26px;border-radius:12px;font-weight:600;">Confirmar presença</a>
              </div>
              <p style="margin:0;font-size:14px;color:#8A7766;">Se não puder comparecer, avise o organizador respondendo a este e-mail.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>