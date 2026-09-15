from pathlib import Path
import json,zipfile,hashlib
root=Path(__file__).resolve().parents[2]
previous=root.parent/'deliverables/ABYSS_Build441_integrated.zip'
out=root.parent/'deliverables/ABYSS_Build442_integrated.zip'
assert hashlib.sha256(previous.read_bytes()).hexdigest()=='17bafe351a9294a9cc9e9e668312dc7b0a231f4f7dc6ab349ccf17fda44bcf59'
with zipfile.ZipFile(previous) as z:old={i.filename:z.read(i) for i in z.infolist() if not i.is_dir()}
new={'README_Build442.md','world-raid-offline442-sw.js','world-raid-offline442-assets.json','tests/build442-attack.test.mjs',*json.loads((root/'docs/build442/changed-runtime.json').read_text())}
for folder in ['docs/build442','tools/build442']:
 new.update(p.relative_to(root).as_posix() for p in(root/folder).rglob('*') if p.is_file())
new.discard('docs/build442/patch-manifest.json')
entries=set(old)|new
assert not any('/node_modules/' in p or p.startswith(('online-server/data/','.git/')) for p in entries)
for p,b in old.items():
 if '/runtime430/' in p:assert(root/p).read_bytes()==b,p
files={p:(root/p).read_bytes() for p in sorted(entries)}
updated=[p for p,b in files.items() if p not in old or b!=old[p]]
manifest={'build':442,'version':'3.1.121','baseline_build':424,'kind':'cumulative-overwrite','save_schema':84,'data_files_included':False,'removed':[],'previous_archive_sha256':hashlib.sha256(previous.read_bytes()).hexdigest(),'source_base_commit':'53b7e195e0138f72f8b131ec3b185d2c736d438d','updated_in_442':updated,'files':[{'path':p,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()} for p,b in files.items()]}
p=root/'docs/build442/patch-manifest.json';p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');files[p.relative_to(root).as_posix()]=p.read_bytes()
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=8) as z:
 for p,b in sorted(files.items()):z.writestr(p,b)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None;assert len(z.namelist())==len(set(z.namelist()));assert set(old)<=set(z.namelist())
 for p,b in files.items():assert z.read(p)==b
assert out.stat().st_size<50*1024*1024
print(json.dumps({'archive':str(out),'files':len(files),'new_or_updated':len(updated),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'preserved_441_files':len(old),'frozen_runtime_preserved':True}))
