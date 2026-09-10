#!/usr/bin/env python3
"""
Trendyol ürünlerini COGO site veri formatına senkronize eder.
- Önce Trendyol API çekimini tetiklemeyi dener.
- Başarısızsa mevcut CSV yedeğinden devam eder.
- Site ürün veri dosyasını (data/products.json) günceller.
- İstenirse commit/push adımlarını da otomatik çalıştırır.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import json
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path
from typing import Dict, List, Tuple, Any
from difflib import SequenceMatcher

REPO_ROOT = Path(__file__).resolve().parents[1]
TRENDYOL_SCRIPT = Path('/home/ubuntu/trendyol_urunler/trendyol_urun_cekil.py')
TRENDYOL_CSV = Path('/home/ubuntu/trendyol_urunler/trendyol_urunler.csv')
SITE_PRODUCTS_JSON = REPO_ROOT / 'data' / 'products.json'
REPORT_JSON = REPO_ROOT / 'reports' / 'son_senkron_raporu.json'
REPORT_MD = REPO_ROOT / 'reports' / 'son_senkron_raporu.md'
SECRETS_PATH = Path('/home/ubuntu/.config/abacusai_auth_secrets.json')


def normalize_text(value: str) -> str:
    value = (value or '').strip().lower()
    value = ''.join(c for c in unicodedata.normalize('NFKD', value) if not unicodedata.combining(c))
    value = re.sub(r'[^a-z0-9]+', '-', value).strip('-')
    return re.sub(r'-{2,}', '-', value)


def to_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        s = str(value).strip().replace(',', '.')
        return float(s) if s else default
    except Exception:
        return default


def to_int(value: Any, default: int = 0) -> int:
    try:
        if value is None:
            return default
        s = str(value).strip()
        if not s:
            return default
        return int(float(s.replace(',', '.')))
    except Exception:
        return default


def split_images(raw: str) -> List[str]:
    if not raw:
        return []
    parts = [p.strip() for p in re.split(r'\s*\|\s*', raw) if p.strip()]
    return parts


def map_category(name: str, title: str, desc: str) -> str:
    blob = f"{name or ''} {title or ''} {desc or ''}".lower()
    checks = [
        (['kupa', 'fincan', 'bardak', 'yunomi', 'espresso'], 'kupalar'),
        (['duvar', 'nazarlik', 'nazarlık', 'dekorasyon urunu'], 'duvar'),
        (['buhur', 'tutsu', 'tütsü', 'tutsuluk', 'tütsülük'], 'buhurdan'),
        (['mumluk', 'mum ', 'cand'], 'mumluk'),
        (['taki', 'takı', 'kupe', 'küpe', 'kolye', 'yuzuk', 'yüzük', 'bijuteri'], 'taki'),
        (['koku', 'difuzor', 'difüzör'], 'koku'),
        (['kalemlik', 'fircalik', 'fırçalık', 'ofis'], 'kalemlik'),
        (['aski', 'askı'], 'askilik'),
        (['palet', 'saksi', 'saksi', 'sunumluk', 'tepsi', 'tabak', 'kase', 'kase', 'banyo'], 'palet'),
    ]
    for keywords, cat in checks:
        if any(k in blob for k in keywords):
            return cat
    return 'dekor'


def trendyol_key(row: Dict[str, str]) -> str:
    stok = (row.get('Stok Kodu') or '').strip()
    barkod = (row.get('Barkod') or '').strip()
    name = (row.get('Ürün Adı') or '').strip()
    if stok:
        return f'stok:{stok.lower()}'
    if barkod:
        return f'barkod:{barkod.lower()}'
    return f'ad:{normalize_text(name)}'



def name_similarity(a: str, b: str) -> float:
    na = normalize_text(a).replace('-', ' ')
    nb = normalize_text(b).replace('-', ' ')
    if not na or not nb:
        return 0.0
    return SequenceMatcher(None, na, nb).ratio()


def find_name_match(site_products: List[Dict[str, Any]], trendyol_name: str, used_ids: set[str]) -> Dict[str, Any] | None:
    best = None
    best_score = 0.0
    for p in site_products:
        pid = p.get('id')
        if pid in used_ids:
            continue
        score = name_similarity(str(p.get('name', '')), trendyol_name)
        if score > best_score:
            best_score = score
            best = p
    if best is not None and best_score >= 0.72:
        return best
    return None

def site_keys(product: Dict[str, Any]) -> List[str]:
    keys = []
    for k in ('stokKodu', 'stok_kodu', 'barcode', 'barkod'):
        val = str(product.get(k, '')).strip().lower()
        if val:
            keys.append(f"{'stok' if 'stok' in k else 'barkod'}:{val}")
    name = str(product.get('name', '')).strip()
    if name:
        keys.append(f"ad:{normalize_text(name)}")
    return keys


def parse_legacy_products_from_appjs(app_js: Path) -> List[Dict[str, Any]]:
    text = app_js.read_text(encoding='utf-8')
    m = re.search(r"const\s+products\s*=\s*(\[[\s\S]*?\n\s*\]);", text)
    if not m:
        return []
    array_src = m.group(1)

    node_script = f"""
const vm = require('vm');
const src = {json.dumps(array_src)};
const sandbox = {{ products: null }};
vm.runInNewContext('products = ' + src, sandbox);
process.stdout.write(JSON.stringify(sandbox.products || []));
"""
    out = subprocess.check_output(['node', '-e', node_script], text=True)
    data = json.loads(out)
    normalized = []
    for p in data:
        if not isinstance(p, dict):
            continue
        normalized.append({
            'id': p.get('id') or normalize_text(p.get('name', 'urun')),
            'name': p.get('name') or 'Ürün',
            'price': to_float(p.get('price')),
            'cat': p.get('cat') or 'dekor',
            'desc': p.get('desc') or '',
            'size': p.get('size') or '',
            'slug': p.get('slug') or normalize_text(p.get('name', 'urun')),
            'stock': int(p.get('stock', 1) or 1),
            'inStock': bool(int(p.get('stock', 1) or 1) > 0),
            'images': p.get('images') if isinstance(p.get('images'), list) else [],
            'source': 'site',
        })
    return normalized


def load_site_products() -> List[Dict[str, Any]]:
    if SITE_PRODUCTS_JSON.exists():
        with SITE_PRODUCTS_JSON.open('r', encoding='utf-8') as f:
            data = json.load(f)
        if isinstance(data, list):
            return data
    return parse_legacy_products_from_appjs(REPO_ROOT / 'app.js')


def load_trendyol_rows() -> List[Dict[str, str]]:
    if TRENDYOL_SCRIPT.exists():
        try:
            subprocess.run(['python3', str(TRENDYOL_SCRIPT)], check=True, cwd=TRENDYOL_SCRIPT.parent)
        except Exception:
            pass
    if not TRENDYOL_CSV.exists():
        raise FileNotFoundError(f'CSV bulunamadı: {TRENDYOL_CSV}')

    rows: List[Dict[str, str]] = []
    with TRENDYOL_CSV.open('r', encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            rows.append(row)
    return rows


def build_product_from_trendyol(row: Dict[str, str], existing: Dict[str, Any] | None = None) -> Dict[str, Any]:
    name = (row.get('Ürün Adı') or '').strip() or (existing or {}).get('name') or 'Ürün'
    stok_kodu = (row.get('Stok Kodu') or '').strip()
    barkod = (row.get('Barkod') or '').strip()
    cat = map_category(row.get('Kategori', ''), name, row.get('Açıklama', ''))
    sale_price = to_float(row.get('Satış Fiyatı') or row.get('Liste Fiyatı'))
    stock = to_int(row.get('Stok Adedi'))
    images = split_images(row.get('Tüm Görseller') or '')
    main = (row.get('Ana Görsel') or '').strip()
    if main and main not in images:
        images.insert(0, main)

    base_slug = normalize_text(stok_kodu or barkod or name) or hashlib.sha1(name.encode('utf-8')).hexdigest()[:10]
    product_id = f"ty-{base_slug}"

    result = {
        'id': (existing or {}).get('id') or product_id,
        'name': name,
        'price': round(sale_price, 2),
        'cat': (existing or {}).get('cat') or cat,
        'desc': (row.get('Açıklama') or '').strip() or (existing or {}).get('desc', ''),
        'size': (existing or {}).get('size', ''),
        'slug': (existing or {}).get('slug') or base_slug,
        'barcode': barkod,
        'stokKodu': stok_kodu,
        'trendyolProductId': (row.get('Ürün ID') or '').strip(),
        'trendyolCategory': (row.get('Kategori') or '').strip(),
        'stock': stock,
        'inStock': stock > 0,
        'currency': (row.get('Para Birimi') or 'TRY').strip() or 'TRY',
        'images': images,
        'mainImage': images[0] if images else '',
        'source': 'trendyol',
        'updatedAt': dt.datetime.utcnow().replace(microsecond=0).isoformat() + 'Z',
    }
    return result


def merge_products(site_products: List[Dict[str, Any]], trendyol_rows: List[Dict[str, str]]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    site_index: Dict[str, Dict[str, Any]] = {}
    for p in site_products:
        for k in site_keys(p):
            site_index[k] = p

    merged: List[Dict[str, Any]] = []
    seen_site_ids = set()

    trendyol_seen_keys = set()
    added_count = 0
    updated_count = 0

    for row in trendyol_rows:
        key = trendyol_key(row)
        trendyol_seen_keys.add(key)
        existing = site_index.get(key)

        if not existing:
            existing = find_name_match(site_products, row.get('Ürün Adı', ''), seen_site_ids)

        new_product = build_product_from_trendyol(row, existing=existing)

        if existing:
            old_price = to_float(existing.get('price'))
            old_stock = to_int(existing.get('stock', 0))
            if round(old_price, 2) != round(new_product['price'], 2) or old_stock != new_product['stock']:
                updated_count += 1
            seen_site_ids.add(existing.get('id'))
        else:
            added_count += 1

        merged.append(new_product)

    site_only: List[Dict[str, Any]] = []
    for p in site_products:
        if p.get('id') in seen_site_ids:
            continue
        pkeys = site_keys(p)
        if any(k in trendyol_seen_keys for k in pkeys):
            continue
        retained = dict(p)
        retained['source'] = retained.get('source') or 'site_only'
        if 'stock' not in retained:
            retained['stock'] = 1
        if 'inStock' not in retained:
            retained['inStock'] = to_int(retained.get('stock', 0), 0) > 0
        if 'images' not in retained:
            retained['images'] = []
        if 'mainImage' not in retained:
            retained['mainImage'] = retained['images'][0] if retained['images'] else ''
        site_only.append(retained)

    full_list = merged + site_only

    report = {
        'sync_time_utc': dt.datetime.utcnow().replace(microsecond=0).isoformat() + 'Z',
        'site_product_total': len(full_list),
        'trendyol_product_total': len(trendyol_rows),
        'price_or_stock_updated_count': updated_count,
        'newly_added_from_trendyol_count': added_count,
        'site_only_count': len(site_only),
        'site_only_products': [
            {
                'id': p.get('id'),
                'name': p.get('name'),
                'stokKodu': p.get('stokKodu') or p.get('stok_kodu') or '',
                'barcode': p.get('barcode') or p.get('barkod') or '',
            }
            for p in site_only
        ],
    }

    return full_list, report


def write_outputs(products: List[Dict[str, Any]], report: Dict[str, Any]) -> None:
    SITE_PRODUCTS_JSON.parent.mkdir(parents=True, exist_ok=True)
    REPORT_JSON.parent.mkdir(parents=True, exist_ok=True)

    products_sorted = sorted(products, key=lambda p: ((p.get('cat') or 'zzz'), (p.get('name') or '').lower()))
    SITE_PRODUCTS_JSON.write_text(json.dumps(products_sorted, ensure_ascii=False, indent=2), encoding='utf-8')
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')

    md = [
        '# Trendyol → Site Ürün Senkron Raporu',
        '',
        f"- Senkron zamanı (UTC): {report['sync_time_utc']}",
        f"- Trendyol ürün adedi: {report['trendyol_product_total']}",
        f"- Site toplam ürün adedi: {report['site_product_total']}",
        f"- Fiyat/stok güncellenen ürün: {report['price_or_stock_updated_count']}",
        f"- Yeni eklenen ürün: {report['newly_added_from_trendyol_count']}",
        f"- Sitede kalıp Trendyol'da olmayan ürün: {report['site_only_count']}",
        '',
    ]
    if report['site_only_products']:
        md.append('## Sitede Kalıp Trendyol Listesinde Olmayan Ürünler')
        for p in report['site_only_products']:
            md.append(f"- {p.get('name','Adsız')} (id: {p.get('id')}, stokKodu: {p.get('stokKodu') or '-'}, barkod: {p.get('barcode') or '-'})")
    REPORT_MD.write_text('\n'.join(md) + '\n', encoding='utf-8')


def git_run(args: List[str], cwd: Path) -> subprocess.CompletedProcess:
    return subprocess.run(['git', *args], cwd=cwd, check=True, text=True, capture_output=True)


def maybe_git_commit_push(do_commit: bool, do_push: bool, commit_message: str) -> None:
    if not do_commit and not do_push:
        return

    git_run(['add', 'data/products.json', 'reports/son_senkron_raporu.json', 'reports/son_senkron_raporu.md'], REPO_ROOT)

    if do_commit:
        try:
            git_run(['commit', '-m', commit_message], REPO_ROOT)
        except subprocess.CalledProcessError as e:
            if 'nothing to commit' not in (e.stderr or '').lower():
                raise

    if do_push:
        headers = []
        token = os.environ.get('GITHUB_TOKEN')
        if not token and SECRETS_PATH.exists():
            try:
                data = json.loads(SECRETS_PATH.read_text(encoding='utf-8'))
                for k, v in data.items():
                    if k.lower() == 'githubuser':
                        token = v.get('secrets', {}).get('access_token', {}).get('value')
                        break
            except Exception:
                token = None
        cmd = ['git']
        if token:
            import base64
            cred = base64.b64encode(f"x-access-token:{token}".encode()).decode()
            cmd += ['-c', f'http.https://github.com/.extraheader=AUTHORIZATION: basic {cred}']
        cmd += ['push', 'origin', 'HEAD']
        subprocess.run(cmd, cwd=REPO_ROOT, check=True, text=True, capture_output=True)


def main() -> int:
    parser = argparse.ArgumentParser(description='Trendyol ürünlerini site ürün listesiyle senkronize eder.')
    parser.add_argument('--commit', action='store_true', help='Değişiklikleri commit eder.')
    parser.add_argument('--push', action='store_true', help='Commit sonrası origin remoteuna push eder.')
    parser.add_argument('--message', default='chore: trendyol urunlerini senkronize et', help='Commit mesajı')
    args = parser.parse_args()

    site_products = load_site_products()
    trendyol_rows = load_trendyol_rows()
    merged_products, report = merge_products(site_products, trendyol_rows)
    write_outputs(merged_products, report)
    maybe_git_commit_push(args.commit, args.push, args.message)

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    sys.exit(main())
