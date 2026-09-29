"""Pack the brand site into brandci-html.tar for /opt/brandci/html on the Docker host.

Run after editing the brand book:  python brand/deploy/pack.py
The tar holds a single top-level folder `html/`, extracted into /opt/brandci.
"""
import io
import tarfile
import time
from pathlib import Path

BRAND = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent / "brandci-html.tar"
FOLDERS = ["logo", "illustration", "icons", "icons/social", "fonts", "tokens",
           "motion", "motion/export", "templates/documents", "templates/documents/samples", "templates/office"]


def add(tar, arcname, data, mode=0o644):
    info = tarfile.TarInfo(arcname)
    info.size = len(data)
    info.mode = mode
    info.mtime = int(time.time())
    tar.addfile(info, io.BytesIO(data))


with tarfile.open(OUT, "w") as tar:
    dirs = sorted({"/".join(f.split("/")[:i]) for f in FOLDERS for i in range(1, f.count("/") + 2)})
    for d in ["html"] + [f"html/{f}" for f in dirs]:
        info = tarfile.TarInfo(d)
        info.type = tarfile.DIRTYPE
        info.mode = 0o755
        info.mtime = int(time.time())
        tar.addfile(info)
    add(tar, "html/index.html", (BRAND / "k8-brand-guidelines.html").read_bytes())
    count = 1
    for f in FOLDERS:
        for p in sorted((BRAND / f).iterdir()):
            if p.is_file():
                add(tar, f"html/{f}/{p.name}", p.read_bytes())
                count += 1

print(f"wrote {OUT.name}: {count} files, {OUT.stat().st_size / 1024:.0f} KB")
