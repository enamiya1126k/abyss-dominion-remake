from pathlib import Path
import hashlib,json,zipfile
root=Path(__file__).resolve().parents[2]
files={root/'README_Build418.md'}
files.update(root/r['path'] for r in json.loads((root/'docs/build418/runtime-manifest.json').read_text()))
for pattern in ['tests/*.mjs','tests/helpers/*.mjs','tools/build418/*','docs/build415/changed-runtime.json','docs/build415/protected-baseline.json','docs/build418/*.txt','docs/build418/*.json','docs/build418/*.md','docs/build418/*.diff']:
 files.update(root.glob(pattern))
files={p for p in files if p.is_file() and p.name!='package-checks.json'}
out=root.parent/'output/ABYSS_Build418_explore_formation_fix.zip';out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(files):z.write(p,p.relative_to(root).as_posix())
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 assert all(not n.startswith('/') and '..' not in Path(n).parts for n in z.namelist())
 result={'file':str(out),'entries':len(z.namelist()),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
print(json.dumps(result,indent=2));(root/'docs/build418/package-checks.json').write_text(json.dumps(result,indent=2))
