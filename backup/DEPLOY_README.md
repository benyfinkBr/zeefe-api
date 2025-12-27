# Deploy automático via Git no cPanel (Ze.EFE)

Este projeto foi preparado para funcionar com **Auto-Deploy** no cPanel usando o recurso de **Deployment via Git**.

## Como funciona o deploy via Git no cPanel

1. **Repositório Git no cPanel**
   - No cPanel, acesse **Git Version Control** (ou “Controle de Versão Git”).
   - Crie/aponte um repositório para o diretório `public_html` (ou para o diretório raiz desejado do site).
   - Este projeto já está estruturado para ser usado diretamente em `public_html`, então não é necessário copiar/mover arquivos em etapas de deploy.

2. **Hook de deploy do cPanel**
   - O cPanel pode executar tarefas automáticas sempre que você der um **Deploy HEAD Commit** pelo painel ou quando um webhook do Git (por exemplo, GitHub) disparar um `git pull` no servidor.
   - Essas tarefas são definidas no arquivo `.cpanel.yml` na raiz do repositório.

3. **Arquivo `.cpanel.yml`**
   - O arquivo `.cpanel.yml` é **obrigatório** para que o cPanel saiba o que executar ao aplicar o deploy.
   - Neste projeto, o arquivo é bem simples:

     ```yaml
     ---
     deployment:
       tasks:
         - /bin/echo "Deploying Ze.EFE..."
     ```

   - Como o repositório já aponta diretamente para `public_html`, não há etapa de cópia de arquivos. O comando acima serve apenas como validação de que o deploy foi disparado com sucesso (você pode consultar os logs de deploy no cPanel).

## Fluxo típico com GitHub + cPanel

1. **Repositório remoto (GitHub)**
   - Você mantém o código em um repositório no GitHub (por exemplo, branch `main`).

2. **Repositório no servidor**
   - No cPanel, configure um repositório Git (clonado a partir do GitHub) apontando para `public_html`.

3. **Webhook no GitHub**
   - No repositório do GitHub, crie um **Webhook** apontando para a URL de auto-deploy do cPanel (fornecida pelo próprio cPanel ao configurar o repositório).
   - Configure o webhook para disparar em eventos de `push`.

4. **Deploy automático**
   - Sempre que você fizer `git push` para o branch `main`, o GitHub acionará o webhook.
   - O cPanel fará `git pull` no repositório e, em seguida, executará as tarefas definidas em `.cpanel.yml`.
   - Como neste projeto não há etapas adicionais de build/cópia, o código atualizado já estará ativo em `public_html`.

## Personalizando o `.cpanel.yml`

Se no futuro você precisar rodar comandos extras no deploy (por exemplo, limpar cache, gerar assets ou rodar migrações), basta editar o `.cpanel.yml` e adicionar mais comandos na lista `tasks`, por exemplo:

```yaml
---
deployment:
  tasks:
    - /bin/echo "Deploying Ze.EFE..."
    - /usr/bin/php -d detect_unicode=0 artisan migrate --force
```

Lembre-se de manter a sintaxe YAML correta (indentação por espaços, sem tabs) para que o cPanel consiga interpretar o arquivo e executar o deploy corretamente.

