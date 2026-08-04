import os
import json
import sys
from python_calamine import CalamineWorkbook

def clean_str(val):
    if val is None:
        return ""
    s = str(val).strip()
    if s.endswith('.0'):
        s = s[:-2]
    return s

def format_khoa(val):
    s = clean_str(val)
    if not s:
        return ""
    if s.lower().startswith('khóa'):
        s = s[4:].strip()
    elif s.lower().startswith('k'):
        s = s[1:].strip()
    if len(s) == 4 and s.isdigit():
        return f"D{s[2:]}"
    if len(s) == 2 and s.isdigit():
        return f"D{s}"
    if s.upper().startswith('D'):
        return s.upper()
    return f"D{s}"

def parse_file(excel_path):
    if not os.path.exists(excel_path):
        return []

    wb = CalamineWorkbook.from_path(excel_path)
    sheet = wb.get_sheet_by_name(wb.sheet_names[0])
    rows = sheet.to_python()
    
    subjects = []
    for idx, r in enumerate(rows[4:]):
        if not r or len(r) < 3 or not r[1] or str(r[1]).startswith('#') or r[1] == 'Mã môn học':
            continue
        
        ma_mon = clean_str(r[1])
        ten_mon = clean_str(r[2])
        if not ma_mon or not ten_mon:
            continue

        khoa = format_khoa(r[3]) if len(r) > 3 else ""
        he = clean_str(r[4]) if len(r) > 4 else ""
        nganh = clean_str(r[5]) if len(r) > 5 else ""
        
        try:
            sy_so = int(r[6]) if len(r) > 6 and r[6] is not None else 40
        except:
            sy_so = 40

        nhom = clean_str(r[7]) if len(r) > 7 else ""
        to_hap = clean_str(r[8]) if len(r) > 8 else ""
        to_th = clean_str(r[9]) if len(r) > 9 else ""
        thu = clean_str(r[10]) if len(r) > 10 else ""
        kip = clean_str(r[11]) if len(r) > 11 else ""
        tiet_bd = clean_str(r[13]) if len(r) > 13 else ""
        so_tiet = clean_str(r[14]) if len(r) > 14 else ""
        phong = clean_str(r[15]) if len(r) > 15 else ""
        nha = clean_str(r[16]) if len(r) > 16 else ""
        gv = clean_str(r[18]) if len(r) > 18 else ""
        
        tuan_list = []
        for c_idx in range(22, min(40, len(r))):
            val = r[c_idx]
            if val is not None and str(val).strip() != '':
                tuan_list.append(str(c_idx - 21))
        tuan_hoc = " ".join(tuan_list) if tuan_list else "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15"

        ma_lop = clean_str(r[39]) if len(r) > 39 and r[39] else (clean_str(r[41]) if len(r) > 41 and r[41] else f"{ma_mon}_{nhom}")
        
        try:
            so_tc = int(r[42]) if len(r) > 42 and r[42] is not None and str(r[42]).isdigit() else 3
        except:
            so_tc = 3

        subjects.append({
            "maMon": ma_mon,
            "tenMon": ten_mon,
            "khoa": khoa,
            "he": he,
            "nganh": nganh,
            "sySo": sy_so,
            "nhom": nhom,
            "toHap": to_hap,
            "toTH": to_th,
            "thu": thu,
            "kip": kip,
            "tietBD": tiet_bd,
            "soTiet": so_tiet,
            "phong": phong,
            "nha": nha,
            "giangVien": gv,
            "tuanHoc": tuan_hoc,
            "maLop": ma_lop,
            "soTC": so_tc,
            "daDangKyCount": min(sy_so, abs(hash(ma_lop)) % max(1, sy_so))
        })

    return subjects

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    excel_path = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('EXCEL_PATH', 'E:/downloads/ZALO/3007_DKGD hoc ky 1 nam hoc 2026_2027 Open.xlsx')
    out_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), 'subjects_seed.json')

    subjects = parse_file(excel_path)
    print(f"[Parse Excel] Extracted {len(subjects)} subjects with PTIT Khoa format (D23, D24, D25).")

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(subjects, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    main()
