<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Nova solicitação de reserva - Ze.EFE</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E9;font-family:'Inter',Arial,sans-serif;color:#1D413A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E9;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:24px;box-shadow:0 12px 32px rgba(29,65,58,0.12);overflow:hidden;">
          <tr>
            <td style="background:#1D413A;padding:32px;text-align:center;">
              <img src="https://zeefe.com.br/img/logo-mail.png" alt="Ze.EFE" width="120" style="display:block;margin:0 auto 12px;">
              <p style="margin:0;font-size:16px;letter-spacing:0.12em;color:#E6DED4;text-transform:uppercase;">Nova solicitação</p>
              <h1 style="margin:12px 0 0;font-size:26px;color:#F5F0E9;">Olá, {{anunciante_nome}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin-top:0;font-size:16px;line-height:1.6;">Você recebeu uma nova solicitação de reserva. Confira o resumo e confirme o quanto antes para que possamos processar o pagamento.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #E6DED4;width:40%;font-weight:600;">Sala</td>
                  <td style="padding:10px 0;border-bottom:1px solid #E6DED4;">{{sala_nome}}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #E6DED4;font-weight:600;">Data</td>
                  <td style="padding:10px 0;border-bottom:1px solid #E6DED4;">{{data_formatada}}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #E6DED4;font-weight:600;">Horário</td>
                  <td style="padding:10px 0;border-bottom:1px solid #E6DED4;">{{hora_inicio}} - {{hora_fim}}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #E6DED4;font-weight:600;">Cliente</td>
                  <td style="padding:10px 0;border-bottom:1px solid #E6DED4;">{{cliente_nome}}</td>
                </tr>
              </table>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.5;">Acesse o Portal do Anunciante para confirmar, recusar ou conversar com o cliente.</p>
              <div style="text-align:center;margin:26px 0;">
                <a href="{{link_portal}}" style="display:inline-block;background:#1D413A;color:#F5F0E9;text-decoration:none;padding:14px 26px;border-radius:12px;font-weight:600;">Abrir Portal do Anunciante</a>
              </div>
              <p style="margin:0;font-size:14px;color:#8A7766;">Dúvidas? Fale com a Ze.EFE pelo contato@zeefe.com.br.</p>
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
