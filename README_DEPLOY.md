# Deploy Ze.EFE API

1. Instale as dependências PHP antes do deploy:

   ```bash
   composer install --no-dev --optimize-autoloader
   ```

2. No servidor (ou pipeline CI/CD) execute o mesmo comando para garantir que o diretório `vendor/` seja reconstruído com base no `composer.lock`.

3. Configure variáveis de ambiente (ex.: no painel de hospedagem, `.env` não versionado ou serviço de secrets) com:
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

4. Após instalar dependências e configurar as variáveis, limpe o cache da aplicação/webserver se aplicável e reinicie o serviço PHP-FPM/Apache para carregar os novos valores.
