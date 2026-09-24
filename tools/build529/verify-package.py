"""Verify extracted Build529 file integrity without changing any game data."""
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[2]
manifest=json.loads((root/'BUILD529_MANIFEST.json').read_text())
for row in manifest['files']:
 p=root/row['path'];data=p.read_bytes()
 assert len(data)==row['bytes'],row['path']
 assert hashlib.sha256(data).hexdigest()==row['sha256'],row['path']
print(f"Build529: {len(manifest['files'])} files verified")
