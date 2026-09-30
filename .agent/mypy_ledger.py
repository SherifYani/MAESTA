import re
import subprocess
import sys
from collections import Counter

BASE = r"C:\Users\aboam\Documents\MAESTA-chat-bot"
MODS = ["models", "repositories"]

counts: Counter[str] = Counter()
detail: Counter[str] = Counter()
raw_lines: list[str] = []

for mod in MODS:
    proc = subprocess.run(
        [sys.executable, "-m", "mypy", mod, "--ignore-missing-imports"],
        cwd=BASE,
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=300,
    )
    raw_lines.extend(proc.stdout.splitlines())

for line in raw_lines:
    if "error:" not in line:
        continue
    m = re.search(r"\[([a-z-]+)\]", line)
    code = m.group(1) if m else "?"
    line_lower = line.lower()
    if "override" in line_lower:
        code = "override"
    counts[code] += 1
    # collect filename
    fm = re.match(r"^(\S+):\d+:", line)
    if fm:
        detail[fm.group(1)] += 1

print("=== by error code ===")
for c, n in counts.most_common():
    print(f"{c}: {n}")
print()
print("=== by file (override excluded) ===")
for f, n in detail.most_common():
    print(f"{f}: {n}")
