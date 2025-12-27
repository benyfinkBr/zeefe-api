<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Reserva cancelada - Ze.EFE</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E9;font-family:'Inter',Arial,sans-serif;color:#1D413A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E9;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:24px;box-shadow:0 12px 32px rgba(29,65,58,0.12);overflow:hidden;">
          <tr>
            <td style="background:#B54A3A;padding:32px;text-align:center;">
              <img src="https://zeefe.com.br/img/logo-mail.png" alt="Ze.EFE" width="120" style="display:block;margin:0 auto 12px;filter:brightness(0) invert(1);">
              <p style="margin:0;font-size:16px;letter-spacing:0.12em;color:#FFEDE8;text-transform:uppercase;">Reserva cancelada</p>
              <h1 style="margin:12px 0 0;font-size:26px;color:#FFFFFF;">Olá, {{cliente_nome}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin-top:0;font-size:16px;line-height:1.6;">A reserva abaixo foi cancelada:</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #F2D5CE;width:35%;font-weight:600;">Sala</td>
                  <td style="padding:12px 0;border-bottom:1px solid #F2D5CE;">{{sala_nome}}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #F2D5CE;font-weight:600;">Data</td>
                  <td style="padding:12px 0;border-bottom:1px solid #F2D5CE;">{{data_formatada}}</td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Motivo: {{motivo}}</p>
              <p style="margin:0;font-size:14px;color:#8A7766;">Se desejar reagendar, basta acessar o portal ou responder este e-mail.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#F5F0E9;padding:24px;text-align:center;color:#8A7766;font-size:13px;">
              Ze.EFE · Moema · São Paulo/SP
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>