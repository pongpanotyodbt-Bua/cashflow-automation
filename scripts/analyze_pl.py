import csv

with open("data/COA_from_TB.csv", encoding="utf-8-sig") as f:
    rows = list(csv.DictReader(f))

# Show PL accounts and their code prefixes
pl_rows = [r for r in rows if r["bs_class"] == "PL"]
prefixes = {}
for r in pl_rows:
    p = r["account_code"][:4]
    if p not in prefixes:
        prefixes[p] = {"count": 0, "sample_name": r["account_name_th"][:40], "fs_cap": r["fs_caption_th"][:40]}
    prefixes[p]["count"] += 1

print("PL account prefixes (4 digits):")
for p, v in sorted(prefixes.items()):
    print(f"  {p} ({v['count']:3d} accts) | FS: {v['fs_cap']}")

print()
# Show all unique FS Captions in PL
fs_caps = {}
for r in pl_rows:
    cap = r["fs_caption_th"]
    if cap not in fs_caps:
        fs_caps[cap] = {"count": 0, "prefix_example": r["account_code"][:4]}
    fs_caps[cap]["count"] += 1

print("Unique FS Captions in PL (P&L line items):")
for cap, v in sorted(fs_caps.items(), key=lambda x: -x[1]["count"]):
    print(f"  {v['count']:3d} accts | prefix: {v['prefix_example']} | {cap}")
