<?php
$token = isset($_GET['token']) ? htmlspecialchars($_GET['token'], ENT_QUOTES, 'UTF-8') : '';
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Inventário — Item</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .inventory-item{max-width:980px;margin:40px auto;padding:24px;background:#fff;border-radius:18px;border:1px solid rgba(29,65,58,.08);box-shadow:var(--shadow-soft)}
    .inventory-item h1{margin:0 0 6px;color:var(--brand-green)}
    .inventory-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
    .inventory-grid .form-row{margin:0}
    .inventory-meta{display:flex;gap:12px;flex-wrap:wrap;color:var(--brand-muted);font-size:.9rem;margin-bottom:16px}
    .inventory-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:16px}
  </style>
</head>
<body>
  <main class="inventory-item">
    <h1>Inventário</h1>
    <div class="inventory-meta">
      <span id="inventoryItemName">Carregando...</span>
      <span id="inventoryItemUpdated"></span>
    </div>
    <?php if (!$token): ?>
      <div class="rooms-message">Token inválido. Verifique o QR Code.</div>
    <?php else: ?>
      <form id="inventoryItemForm">
        <div class="inventory-grid">
          <div class="form-row">
            <label>Código Patrimônio</label>
            <input type="text" name="codigo_patrimonio">
          </div>
          <div class="form-row">
            <label>Descrição</label>
            <input type="text" name="descricao">
          </div>
          <div class="form-row">
            <label>Categoria</label>
            <input type="text" name="categoria">
          </div>
          <div class="form-row">
            <label>Marca</label>
            <input type="text" name="marca">
          </div>
          <div class="form-row">
            <label>Modelo</label>
            <input type="text" name="modelo">
          </div>
          <div class="form-row">
            <label>Número de série</label>
            <input type="text" name="numero_serie">
          </div>
          <div class="form-row">
            <label>Data de aquisição</label>
            <input type="date" name="data_aquisicao">
          </div>
          <div class="form-row">
            <label>Fornecedor</label>
            <input type="text" name="fornecedor">
          </div>
          <div class="form-row">
            <label>Nota fiscal</label>
            <input type="text" name="nota_fiscal">
          </div>
          <div class="form-row">
            <label>Valor de aquisição</label>
            <input type="number" name="valor_aquisicao" step="0.01">
          </div>
          <div class="form-row">
            <label>Forma de aquisição</label>
            <input type="text" name="forma_aquisicao">
          </div>
          <div class="form-row">
            <label>Unidade</label>
            <input type="text" name="unidade">
          </div>
          <div class="form-row">
            <label>Setor</label>
            <input type="text" name="setor">
          </div>
          <div class="form-row">
            <label>Endereço</label>
            <input type="text" name="localizacao_endereco">
          </div>
          <div class="form-row">
            <label>CEP</label>
            <input type="text" name="localizacao_cep">
          </div>
          <div class="form-row">
            <label>Local físico</label>
            <input type="text" name="localizacao_complemento">
          </div>
          <div class="form-row">
            <label>Responsável</label>
            <input type="text" name="responsavel">
          </div>
          <div class="form-row">
            <label>Status</label>
            <input type="text" name="status">
          </div>
          <div class="form-row">
            <label>Condição</label>
            <input type="text" name="condicao">
          </div>
          <div class="form-row">
            <label>Último inventário</label>
            <input type="date" name="data_ultimo_inventario">
          </div>
          <div class="form-row">
            <label>Vida útil (anos)</label>
            <input type="number" name="vida_util_anos">
          </div>
          <div class="form-row">
            <label>Taxa de depreciação (%)</label>
            <input type="number" name="taxa_depreciacao" step="0.01">
          </div>
          <div class="form-row">
            <label>Valor contábil</label>
            <input type="number" name="valor_contabil" step="0.01">
          </div>
          <div class="form-row">
            <label>Centro de custo</label>
            <input type="text" name="centro_custo">
          </div>
          <div class="form-row">
            <label>Garantia até</label>
            <input type="date" name="garantia_ate">
          </div>
          <div class="form-row" style="grid-column:1/-1">
            <label>Histórico de manutenção</label>
            <textarea name="historico_manutencao" rows="3"></textarea>
          </div>
          <div class="form-row">
            <label>Custo manutenção</label>
            <input type="number" name="custo_manutencao" step="0.01">
          </div>
          <div class="form-row">
            <label>Data de baixa</label>
            <input type="date" name="data_baixa">
          </div>
          <div class="form-row">
            <label>Motivo da baixa</label>
            <input type="text" name="motivo_baixa">
          </div>
          <div class="form-row">
            <label>Valor de baixa</label>
            <input type="number" name="valor_baixa" step="0.01">
          </div>
        </div>
        <div class="inventory-actions">
          <button type="submit" class="btn btn-primary">Salvar alterações</button>
        </div>
        <div id="inventoryItemMessage" class="rooms-message"></div>
      </form>
    <?php endif; ?>
  </main>

  <?php if ($token): ?>
  <script>
    window.INVENTORY_TOKEN = "<?php echo $token; ?>";
  </script>
  <script src="scripts/inventario.js" defer></script>
  <?php endif; ?>
</body>
</html>
