"""Generate a WOFF2 subset from local UI copy. Requires fonttools and brotli.

Run again when adding copy; names returned by Twitch outside this subset use
the existing system-font fallback. Original font files remain untouched.
"""

import json
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
source = ROOT / "public/fonts/jf-openhuninn-2.1.ttf"
characters = set(chr(code) for code in range(32, 127))
for file in (ROOT / "src").rglob("*"):
    if file.suffix in {".tsx", ".json"}:
        characters.update(file.read_text(encoding="utf-8"))

options = subset.Options()
options.flavor = "woff2"
options.recalc_timestamp = False
font = subset.load_font(str(source), options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text="".join(sorted(characters)))
subsetter.subset(font)
output = ROOT / "public/fonts/jf-openhuninn-ui.woff2"
subset.save_font(font, str(output), options)
print(json.dumps({"sourceBytes": source.stat().st_size, "subsetBytes": output.stat().st_size}))

for name in ("Insomnia", "Valorant"):
    font = TTFont(ROOT / f"public/fonts/{name}.ttf", recalcTimestamp=False)
    font.flavor = "woff2"
    font.save(ROOT / f"public/fonts/{name}.woff2")
