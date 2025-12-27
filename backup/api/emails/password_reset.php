<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Nova senha - Ze.EFE</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E9;font-family:'Inter',Arial,sans-serif;color:#1D413A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E9;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:24px;box-shadow:0 12px 32px rgba(29,65,58,0.12);overflow:hidden;">
          <tr>
            <td style="background:#1D413A;padding:32px;text-align:center;">
              <img src="https://zeefe.com.br/img/logo-mail.png" alt="Ze.EFE" width="120" style="display:block;margin:0 auto 12px;">
              <h1 style="margin:12px 0 0;font-size:26px;color:#F5F0E9;">Nova senha temporária</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin-top:0;font-size:16px;line-height:1.6;">Olá {{cliente_nome}}, geramos uma nova senha para a sua conta.</p>
              <div style="background:#F5F0E9;border-radius:16px;padding:18px 24px;font-size:18px;font-weight:600;text-align:center;margin:24px 0;color:#1D413A;">
                {{senha_temporaria}}
              </div>
              <p style="margin:0;font-size:14px;color:#8A7766;">Por segurança, recomendamos alterar a senha após o primeiro acesso. Caso não tenha solicitado a troca, ignore este e-mail.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>