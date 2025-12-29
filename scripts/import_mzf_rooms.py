#!/usr/bin/env python3
"""Generate SQL inserts for rooms from zeefe_coworks_hoteis_sao_paulo.xlsx."""
import re
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
XLSX_PATH = BASE_DIR / 'zeefe_coworks_hoteis_sao_paulo.xlsx'
OUT_SQL = BASE_DIR / 'scripts' / 'import_mzf_rooms.sql'

NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def col_to_index(col):
    idx = 0
    for ch in col:
        idx = idx * 26 + (ord(ch) - ord('A') + 1)
    return idx


def parse_sheet(xml_data, shared_strings):
    root = ET.fromstring(xml_data)
    rows = []
    for row in root.findall('.//s:row', NS):
        cells = {}
        for c in row.findall('s:c', NS):
            r = c.attrib.get('r')
            t = c.attrib.get('t')
            val = ''
            if t == 'inlineStr':
                is_el = c.find('s:is', NS)
                if is_el is not None:
                    text_parts = [t_el.text or '' for t_el in is_el.findall('.//s:t', NS)]
                    val = ''.join(text_parts)
            else:
                v = c.find('s:v', NS)
                if v is None:
                    continue
                val = v.text or ''
                if t == 's':
                    try:
                        val = shared_strings[int(val)]
                    except Exception:
                        pass
            cells[r] = val
        rows.append(cells)

    max_col = 0
    for row in rows:
        for cell in row.keys():
            m = re.match(r'([A-Z]+)', cell)
            if m:
                max_col = max(max_col, col_to_index(m.group(1)))

    ordered = []
    for row in rows:
        arr = [''] * max_col
        for cell, val in row.items():
            m = re.match(r'([A-Z]+)(\d+)', cell)
            if not m:
                continue
            col = col_to_index(m.group(1))
            arr[col - 1] = val
        ordered.append(arr)

    trimmed = [r for r in ordered if any(x != '' for x in r)]
    return trimmed


def parse_capacity(value):
    if not value:
        return 10
    nums = [int(n) for n in re.findall(r'\d+', str(value))]
    if not nums:
        return 10
    return max(nums)


def parse_price(value):
    if not value:
        return 0.0
    text = str(value)
    nums = [int(n) for n in re.findall(r'\d+', text)]
    if not nums:
        return 0.0
    return float(min(nums))


def sql_escape(val):
    if val is None:
        return 'NULL'
    return "'" + str(val).replace("'", "''") + "'"


def main():
    if not XLSX_PATH.exists():
        raise SystemExit(f'Arquivo nao encontrado: {XLSX_PATH}')

    with zipfile.ZipFile(XLSX_PATH) as z:
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            root = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in root.findall('s:si', NS):
                text_parts = [t_el.text or '' for t_el in si.findall('.//s:t', NS)]
                shared_strings.append(''.join(text_parts))
        rows = parse_sheet(z.read('xl/worksheets/sheet1.xml'), shared_strings)

    header = rows[0]
    data_rows = rows[1:]

    def idx(name):
        try:
            return header.index(name)
        except ValueError:
            return None

    col_name = idx('Nome do Local')
    col_bairro = idx('Bairro')
    col_end = idx('Endereço')
    col_tel = idx('Telefone')
    col_email = idx('Email')
    col_site = idx('Website')
    col_rating = idx('Rating')
    col_tipo = idx('Tipo')
    col_cap = idx('Cap. (pessoas)')
    col_price = idx('Preço estimado')
    col_source = idx('Fonte de referência')

    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    lines = []
    lines.append('-- Importacao de salas para MZF (teste)')
    lines.append("SET @adv_id := (SELECT id FROM advertisers WHERE display_name = 'MZF' OR login_email = 'benyfinkelstein@gmail.com' LIMIT 1);")
    lines.append('SET @adv_id := IFNULL(@adv_id, 1);')
    lines.append('')

    for row in data_rows:
        name = row[col_name] if col_name is not None else ''
        if not name:
            continue
        bairro = row[col_bairro] if col_bairro is not None else ''
        endereco = row[col_end] if col_end is not None else ''
        telefone = row[col_tel] if col_tel is not None else ''
        email = row[col_email] if col_email is not None else ''
        site = row[col_site] if col_site is not None else ''
        rating = row[col_rating] if col_rating is not None else ''
        tipo = row[col_tipo] if col_tipo is not None else ''
        cap_raw = row[col_cap] if col_cap is not None else ''
        price_raw = row[col_price] if col_price is not None else ''
        source = row[col_source] if col_source is not None else ''

        capacity = parse_capacity(cap_raw)
        daily_rate = parse_price(price_raw)

        desc_parts = []
        if tipo:
            desc_parts.append(f'Tipo: {tipo}')
        if rating:
            desc_parts.append(f'Rating: {rating}')
        if source:
            desc_parts.append(f'Fonte: {source}')
        if site:
            desc_parts.append(f'Website: {site}')
        description = ' | '.join(desc_parts)

        sql = (
            'INSERT INTO rooms '
            '(name, capacity, description, street, complement, cep, city, state, '
            'responsavel_nome, responsavel_telefone, responsavel_email, '
            'portaria_telefone, portaria_email, portaria_inteligente, '
            'daily_rate, location, status, facilitated_access, created_at, updated_at, advertiser_id) '
            'VALUES ('
            f"{sql_escape(name)}, {capacity}, {sql_escape(description)}, {sql_escape(endereco)}, {sql_escape(bairro)}, NULL, 'São Paulo', 'SP', "
            f"{sql_escape(name)}, {sql_escape(telefone)}, {sql_escape(email)}, {sql_escape(telefone)}, {sql_escape(email)}, 'Não', "
            f"{daily_rate:.2f}, {sql_escape(bairro)}, 'ativo', 0, {sql_escape(now)}, {sql_escape(now)}, @adv_id);")
        lines.append(sql)

    OUT_SQL.write_text('\n'.join(lines), encoding='utf-8')
    print(f'Gerado: {OUT_SQL} ({len(lines)-3} inserts)')


if __name__ == '__main__':
    main()
