"""Build a cumulative overwrite ZIP. Usage: python tools/build431/package.py BASE OUTPUT"""
from pathlib import Path
import hashlib
import json
import sys
import zipfile

root = Path(__file__).resolve().parents[2]
baseline = Path(sys.argv[1]).resolve()
output = Path(sys.argv[2]).resolve()
manifest_path = Path('docs/build431/patch-manifest.json')
def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

files = []
for source in sorted(root.rglob('*')):
    if not source.is_file():
        continue
    name = source.relative_to(root)
    if name == manifest_path or source == output:
        continue
    if 'data' in name.parts and name.parts[0] == 'online-server':
        raise RuntimeError('Runtime server data must not be distributed: ' + str(name))
    if source.name.startswith('.env') or source.suffix == '.zip':
        raise RuntimeError('Unexpected distribution file: ' + str(name))
    old = baseline / name
    if not old.is_file() or digest(source) != digest(old):
        files.append({'path': name.as_posix(), 'bytes': source.stat().st_size, 'sha256': digest(source)})
removed = [p.relative_to(baseline).as_posix() for p in baseline.rglob('*') if p.is_file() and not (root / p.relative_to(baseline)).exists()]
if removed:
    raise RuntimeError('An overwrite ZIP cannot apply deletions: ' + repr(removed))
manifest = {'build': 431, 'version': '3.1.110', 'baseline_build': 424,
            'kind': 'cumulative-overwrite', 'includes_steps': [1, 2, 3, 4, 5, 6, 7],
            'save_schema': 84, 'data_files_included': False, 'removed': [], 'files': files}
(root / manifest_path).write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
output.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for item in files:
        archive.write(root / item['path'], item['path'])
    archive.write(root / manifest_path, manifest_path.as_posix())
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
print(json.dumps({'zip': str(output), 'files': len(files) + 1, 'bytes': output.stat().st_size,
                  'sha256': digest(output)}, ensure_ascii=False))
