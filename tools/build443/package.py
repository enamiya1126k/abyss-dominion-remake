from pathlib import Path
import json,zipfile,hashlib
root=Path(__file__).resolve().parents[2]
previous=root.parent/'deliverables/ABYSS_Build442_integrated.zip'
out=root.parent/'deliverables/ABYSS_Build443_integrated.zip'
assert hashlib.sha256(previous.read_bytes()).hexdigest()=='47689f41b832a93fe7a64121dfac74dfbacd262d451267df430c79899fb005f7'
with zipfile.ZipFile(previous) as z:old={i.filename:z.read(i) for i in z.infolist() if not i.is_dir()}
new={'README_Build443.md','world-raid-offline443-sw.js','world-raid-offline443-assets.json','tests/build443-circles.test.mjs','tests/build443-offline.test.mjs',*json.loads((root/'docs/build443/changed-runtime.json').read_text())}
for folder in ['docs/build443','tools/build443','src/worldRaid/runtime443']:
 new.update(p.relative_to(root).as_posix() for p in(root/folder).rglob('*') if p.is_file() and p.suffix!='.png' and p.name not in ['implement.py','implement-native.py','implement-online.py','browser-run.txt','targeted-tests.txt','regression-tests.txt','offline-tests.txt'])
new.discard('docs/build443/patch-manifest.json')
entries=set(old)|new
assert not any('/node_modules/' in p or p.startswith(('online-server/data/','.git/')) for p in entries)
for p,b in old.items():
 if '/runtime430/' in p:assert(root/p).read_bytes()==b,p
files={p:(root/p).read_bytes() for p in sorted(entries)}
updated=[p for p,b in files.items() if p not in old or b!=old[p]]
manifest={'build':443,'version':'3.1.122','baseline_build':424,'kind':'cumulative-overwrite','save_schema':84,'data_files_included':False,'removed':[],'previous_archive_sha256':hashlib.sha256(previous.read_bytes()).hexdigest(),'source_base_commit':'53b7e195e0138f72f8b131ec3b185d2c736d438d','updated_in_443':updated,'files':[{'path':p,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()} for p,b in files.items()]}
p=root/'docs/build443/patch-manifest.json';p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');files[p.relative_to(root).as_posix()]=p.read_bytes()
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=8) as z:
 for p,b in sorted(files.items()):z.writestr(p,b)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None;assert len(z.namelist())==len(set(z.namelist()));assert set(old)<=set(z.namelist())
 for p,b in files.items():assert z.read(p)==b
assert out.stat().st_size<50*1024*1024
print(json.dumps({'archive':str(out),'files':len(files),'new_or_updated':len(updated),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'preserved_442_files':len(old),'frozen_runtime_preserved':True}))
