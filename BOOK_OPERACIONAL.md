# Book Operacional — Ze.EFE

## 1) Visao geral
**Objetivo:** conectar clientes a salas e workshops, com fluxo de reserva, pagamento e repasse.

**Perfis:**
- Cliente (PF/PJ)
- Anunciante
- Admin

**Glossario rapido:**
- Reserva: locacao de sala
- Workshop: evento com inscricoes
- Politica: regra de pagamento/cancelamento
- Check-in: validacao presencial com QR
- Repasse D+30: saldo liberado 30 dias apos pagamento

## 2) Home (site publico)
**Objetivo:** apresentar salas e workshops e iniciar a jornada.

**Fluxo:**
1. Busca por salas
2. Filtros por local, data, capacidade
3. Detalhe da sala
4. CTA para reservar

**Regras:**
- Dados publicos apenas
- Workshops podem aparecer em destaque quando associados a sala

**Telas:**
- Home
- Lista de salas
- Detalhe da sala
- Workshops (agenda publica)

**Checklist:**
- Cards de salas carregando
- CTA de reserva visivel
- Workshops com datas futuras

## 3) Cliente

### 3.1 Login e cadastro
**Objetivo:** autenticar PF/PJ, com verificacao de email.

**Fluxo:**
1. Login com email/login/CPF
2. Cadastro PF ou PJ
3. Verificacao de email
4. Recuperacao de senha

**Regras:**
- Sem email verificado: bloqueia login
- PJ exibe empresa somente se associada

**Checklist:**
- Mensagens de erro claras
- Email de verificacao enviado

### 3.2 Reservar sala
**Objetivo:** criar reserva e capturar pagamento conforme politica.

**Fluxo:**
1. Selecionar sala e data
2. Escolher politica de pagamento/cancelamento
3. Informar cartao
4. Confirmar reserva

**Regras:**
- Pagamento imediato: cobra na confirmacao
- Cancelamento por janela: cobra quando janela expira
- Sem taxa de cancelamento: cobra no dia anterior ao check-in
- Pagamento sempre ate 24h antes do check-in

**Checklist:**
- Politicas aparecem conforme anuncio
- Cartao obrigatorio
- Reserva valida salva

### 3.3 Minhas reservas
**Objetivo:** visualizar e administrar reservas.

**Acoes:**
- Ver detalhes
- Cancelar (2 etapas)
- Editar quando permitido
- Mensagens com anunciante

**Regras:**
- Cancelamento sempre com confirmacao dupla
- Aviso de bloqueio por cancelamentos recorrentes

### 3.4 Workshops (cliente)
**Objetivo:** inscrever-se e receber ingresso.

**Fluxo:**
1. Escolher workshop
2. Selecionar cartao
3. Inscricao registrada
4. Pagamento executado quando minimo atingido
5. Envio de ingresso com QR

**Regras:**
- Pagamento so quando minimo de participantes
- QR valido apenas com pagamento confirmado
- Envio de email de avaliacao apos evento

### 3.5 Meu perfil
**Objetivo:** gerenciar dados e cartoes.

**Regras:**
- Cartoes multiplos permitidos
- Cartao com apelido
- Empresa aparece apenas se associada

## 4) Anunciante (desktop)

### 4.1 Visao geral
**Objetivo:** resumo de desempenho.

**Itens:**
- Visualizacoes
- Reservas futuras
- Saldo disponivel

### 4.2 Minhas salas
**Objetivo:** cadastrar e manter salas.

**Campos principais:**
- Dados da sala
- Fotos com miniaturas (primeira = capa)
- Endereco com geocodificacao automatica
- Politicas de pagamento/cancelamento
- Descricao com formatacao

**Regras:**
- Pelo menos uma politica ativa
- Valor diario calculado pelo menor valor das opcoes
- Status em manutencao/desativada controla datas

### 4.3 Reservas
**Objetivo:** aprovar ou recusar reservas.

**Regras:**
- Recusar some apos confirmacao
- Cancelamento com 2 etapas + aviso de recorrencia
- Email para cliente e notificar admin

### 4.4 Financeiro (extrato)
**Objetivo:** acompanhar repasses.

**Itens:**
- Lançamentos de reservas e eventos
- Status pendente/disponivel/pago
- Disponivel em (D+30) com contagem regressiva

**Acoes:**
- Exportar CSV
- Transferir (placeholder)

### 4.5 Workshops
**Objetivo:** criar e gerir eventos.

**Acoes:**
- Criar/editar
- Inscritos
- Link (envia por email ao anunciante)

### 4.6 Avaliacoes
**Objetivo:** visualizar feedback.

**Regras:**
- Feedback sala e plataforma
- Publicar feedback na pagina da sala

## 5) Anunciante (mobile — eventos)

### 5.1 Login mobile
**Objetivo:** acesso rapido para operacao do evento.

### 5.2 Gestao de convidados
**Objetivo:** listar inscritos.

**Recursos:**
- Busca por nome
- Filtros de pagamento e check-in
- Check-in manual
- Cancelar workshop
- Enviar link de gestao

### 5.3 Check-in (QR)
**Objetivo:** validar ingresso presencial.

**Fluxo:**
1. Ler QR ou digitar codigo
2. Redireciona para carteirinha
3. Validar documento com foto
4. Confirmar ou negar participacao

## 6) Admin

**Anunciantes:**
- Fee locacao
- Fee workshop

**Empresas:**
- Desconto (%)
- Gerente de conta (admin)

## 7) Regras de negocio (resumo)
**Reserva:**
- Pagamento conforme politica
- Cancelamento com duas etapas

**Workshop:**
- Pagamento quando minimo atingido
- Estorno integral em cancelamento apos minimo
- Email de avaliacao apos evento

**Financeiro:**
- Repasse D+30

## 8) E-mails e notificacoes
**Reserva:**
- Confirmacao
- Cancelamento
- Falha de pagamento

**Workshop:**
- Inscricao pendente
- Ingresso/QR
- Cancelamento
- Avaliacao

## 9) Troubleshooting
- QR nao lido: use codigo manual ou foto
- Camera bloqueada: precisa HTTPS e permissao
- Empresa nao aparece: cliente sem associacao
- Extrato vazio: ledger nao preenchido

## 10) Checklist operacional
**Diario:**
- Conferir reservas pendentes
- Conferir workshops perto do minimo
- Verificar repasses a liberar

**Evento:**
- Abrir gestao de convidados
- Validar documento com foto
- Confirmar check-ins
