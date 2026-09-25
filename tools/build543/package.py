"""Build a reviewable delta from a complete Build542 baseline; no saved game data."""
from pathlib import Path
import argparse, hashlib, json, zipfile

parser = argparse.ArgumentParser()
parser.add_argument('--baseline', required=True)
parser.add_argument('--output', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
base = Path(args.baseline).resolve()
out = Path(args.output).resolve()
files = []
for p in sorted(root.rglob('*')):
    if not p.is_file() or ('docs/build543/' in str(p) and p.suffix=='.png'):
        continue
    rel = p.relative_to(root)
    if any(part in {'node_modules', '__pycache__', '.git'} for part in rel.parts):
        continue
    if str(rel).startswith('online-server/data/') or p.name.startswith('debug543') or p.name == 'luck-qa.mjs' or p.name == 'BUILD543_MANIFEST.json':
        continue
    original = base / rel
    if not original.exists() or p.read_bytes() != original.read_bytes():
        files.append(p)
manifest = {'build':543, 'version':'3.1.222', 'baseBuild':542, 'type':'patch', 'requiredServerRestart':True,
            'files':[{'path':str(p.relative_to(root)), 'size':p.stat().st_size, 'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]}
manifest_path = root / 'BUILD543_MANIFEST.json'
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
out.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in [*files, manifest_path]:
        z.write(p, str(p.relative_to(root)))
with zipfile.ZipFile(out) as z:
    assert z.testzip() is None
    for entry in manifest['files']:
        assert hashlib.sha256(z.read(entry['path'])).hexdigest() == entry['sha256']
print(json.dumps({'file':str(out), 'bytes':out.stat().st_size, 'files':len(files)+1, 'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}))
