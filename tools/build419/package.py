from pathlib import Path
import hashlib,json,zipfile
root=Path(__file__).resolve().parents[2]
files={root/'README_Build419.md'}
files.update(root/r['path'] for r in json.loads((root/'docs/build419/runtime-manifest.json').read_text()))
for pattern in ['tests/*.mjs','tests/helpers/*.mjs','tools/build419/*','docs/build415/changed-runtime.json','docs/build415/protected-baseline.json','docs/build419/*.txt','docs/build419/*.json','docs/build419/*.md','docs/build419/*.diff']:
 files.update(root.glob(pattern))
files={p for p in files if p.is_file() and p.name!='package-checks.json'}
out=root.parent/'output/ABYSS_Build419_battle_display_hp_audit.zip';out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(files):z.write(p,p.relative_to(root).as_posix())
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 assert all(not n.startswith('/') and '..' not in Path(n).parts for n in z.namelist())
 result={'file':str(out),'entries':len(z.namelist()),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
print(json.dumps(result,indent=2));(root/'docs/build419/package-checks.json').write_text(json.dumps(result,indent=2))
