<?php
// Gera um XLSX (Office Open XML) simples em memória com 3 colunas: Nome, E-mail, CPF
// Sem dependências externas

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="modelo_membros_empresa.xlsx"');

if (!class_exists('ZipArchive')) {
  echo 'Servidor sem suporte a ZipArchive';
  exit;
}

$tmp = tempnam(sys_get_temp_dir(), 'xlsx_');
$zip = new ZipArchive();
$zip->open($tmp, ZipArchive::OVERWRITE);

// [Content_Types].xml
$contentTypes = '<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>';

// _rels/.rels
$rels = '<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="/xl/workbook.xml"/>
</Relationships>';

// xl/_rels/workbook.xml.rels
$wbRels = '<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>';

// xl/workbook.xml
$workbook = '<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="membros" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>';

// xl/styles.xml (mínimo)
$styles = '<?xml version="1.0" encoding="UTF-8"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border/></borders>
  <cellStyleXfs count="1"><xf/></cellStyleXfs>
  <cellXfs count="1"><xf xfId="0"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>';

// xl/worksheets/sheet1.xml (usa inlineStr para simplificar)
$sheet = '<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1" t="inlineStr"><is><t>Nome</t></is></c>
      <c r="B1" t="inlineStr"><is><t>E-mail</t></is></c>
      <c r="C1" t="inlineStr"><is><t>CPF</t></is></c>
    </row>
    <row r="2">
      <c r="A2" t="inlineStr"><is><t>Fulano da Silva</t></is></c>
      <c r="B2" t="inlineStr"><is><t>fulano@example.com</t></is></c>
      <c r="C2" t="inlineStr"><is><t>123.456.789-09</t></is></c>
    </row>
    <row r="3">
      <c r="A3" t="inlineStr"><is><t>Beltrana Souza</t></is></c>
      <c r="B3" t="inlineStr"><is><t>beltrana@example.com</t></is></c>
      <c r="C3" t="inlineStr"><is><t>987.654.321-00</t></is></c>
    </row>
  </sheetData>
</worksheet>';

// docProps mínimos (alguns leitores exigem)
$core = '<?xml version="1.0" encoding="UTF-8"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Modelo membros empresa</dc:title>
  <dc:creator>Ze.EFE</dc:creator>
  <cp:lastModifiedBy>Ze.EFE</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">'.gmdate('Y-m-d\TH:i:s\Z').'</dcterms:created>
</cp:coreProperties>';

$app = '<?xml version="1.0" encoding="UTF-8"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Ze.EFE</Application>
</Properties>';

$zip->addFromString('[Content_Types].xml', $contentTypes);
$zip->addFromString('_rels/.rels', $rels);
$zip->addFromString('xl/_rels/workbook.xml.rels', $wbRels);
$zip->addFromString('xl/workbook.xml', $workbook);
$zip->addFromString('xl/styles.xml', $styles);
$zip->addFromString('xl/worksheets/sheet1.xml', $sheet);
$zip->addFromString('docProps/core.xml', $core);
$zip->addFromString('docProps/app.xml', $app);
$zip->close();

readfile($tmp);
@unlink($tmp);
exit;

