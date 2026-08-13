"""
Extract Karnataka district outlines from the read-only vantis repo into a
standalone data file. Run once:  python scripts/extract_map.py

Strips every risk/project field on the way through — this repo's map carries
no risk colouring, only neutral district outlines. See CLAUDE.md rule 6.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = r"C:\vantis\components\shared\KarnatakaMap.tsx"
OUT = os.path.join(ROOT, "data", "karnataka-districts.json")

VIEWBOX = "0 0 1633.9257 2366.7335"


def main():
    if not os.path.isfile(SRC):
        sys.exit(f"source not found: {SRC}")

    text = open(SRC, encoding="utf-8-sig").read()

    paths = dict(re.findall(r"'([a-z-]+)':\s*'((?:[^'\\]|\\.)*)'", text))
    labels = dict(
        (m[0], m[1])
        for m in re.findall(
            r"\{\s*id:\s*'([a-z-]+)',\s*label:\s*'([^']+)',\s*lx:\s*(\d+),\s*ly:\s*(\d+)", text
        )
    )
    anchors = dict(
        (m[0], (int(m[2]), int(m[3])))
        for m in re.findall(
            r"\{\s*id:\s*'([a-z-]+)',\s*label:\s*'([^']+)',\s*lx:\s*(\d+),\s*ly:\s*(\d+)", text
        )
    )

    districts = []
    for did, label in labels.items():
        d = paths.get(did)
        if not d:
            print(f"   no path for {did} — skipped")
            continue
        lx, ly = anchors[did]
        districts.append({"id": did, "label": label, "d": d, "lx": lx, "ly": ly})

    districts.sort(key=lambda x: x["id"])

    out = {
        "note": "Karnataka district outlines. Neutral geometry only — no risk, "
                "status or project association is carried in this file.",
        "viewBox": VIEWBOX,
        "districts": districts,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"))

    print(f"wrote {len(districts)} districts -> {os.path.relpath(OUT, ROOT)} "
          f"({os.path.getsize(OUT)//1024} KB)")


if __name__ == "__main__":
    main()
