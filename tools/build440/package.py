from pathlib import Path
import json,zipfile,hashlib,shutil
root=Path(__file__).resolve().parents[2]
previous=root.parent/'recovered/ABYSS_Build439_integrated.zip'
out=root.parent/'deliverables/ABYSS_Build440_integrated.zip'
with zipfile.ZipFile(previous) as z:
 old={i.filename:z.read(i) for i in z.infolist() if not i.is_dir()}
assert hashlib.sha256(previous.read_bytes()).hexdigest()=='c7cfcf162e84a6108a08cd1193b4d34643aa718269013ff22a99914cafd0ad73'
new={'README_Build440.md','src/ui/components/AttributeVisual.js','src/worldRaid/WorldRaidBalance440.js','online-server/src/WorldRaidCoordinator440.js','src/Styles/build440-visual.css','world-raid-offline440-sw.js','world-raid-offline440-assets.json','tests/build440-raid.test.mjs'}
for folder in ['assets/ui/build440','docs/build440','tools/build440']:
 new.update(p.relative_to(root).as_posix() for p in (root/folder).rglob('*') if p.is_file() and not p.name.startswith('probe'))
new.discard('docs/build440/patch-manifest.json')
entries=set(old)|new
assert not any('/node_modules/' in p or p.startswith(('online-server/data/','.git/')) for p in entries)
for p,b in old.items():
 if '/runtime430/' in p:assert (root/p).read_bytes()==b,p
files={p:(root/p).read_bytes() for p in sorted(entries)}
updated=[p for p,b in files.items() if p not in old or b!=old[p]]
manifest={'build':440,'version':'3.1.119','baseline_build':424,'kind':'cumulative-overwrite','save_schema':84,'data_files_included':False,'removed':[],'previous_archive_sha256':hashlib.sha256(previous.read_bytes()).hexdigest(),'source_base_commit':'53b7e195e0138f72f8b131ec3b185d2c736d438d','updated_in_440':updated,'files':[{'path':p,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()} for p,b in files.items()]}
manifest_path=root/'docs/build440/patch-manifest.json';manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');files['docs/build440/patch-manifest.json']=manifest_path.read_bytes()
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=8) as z:
 for p,b in sorted(files.items()):z.writestr(p,b)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 assert len(z.namelist())==len(set(z.namelist()))
 for p,b in files.items():assert z.read(p)==b
 assert set(old)<=set(z.namelist())
assert out.stat().st_size<50*1024*1024
shutil.copyfile(root/'docs/build440/memory-393.png',out.parent/'ABYSS_Build440_preview.png')
result={'archive':str(out),'files':len(files),'new_or_updated':len(updated),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'preserved_439_files':len(old),'frozen_runtime_preserved':True}
(root.parent/'package440-result.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
