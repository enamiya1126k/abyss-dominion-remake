from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import hashlib,json,re,subprocess
root=Path(__file__).resolve().parents[2];basepath=root.parent/'source/ABYSS_Build462_integrated.zip';base=ZipFile(basepath);original={n:base.read(n) for n in base.namelist() if not n.endswith('/')}
def sha(b):return hashlib.sha256(b).hexdigest()
changed=[]
for name,content in original.items():
 p=root/name
 assert p.is_file(),f'Missing baseline file: {name}'
 if p.read_bytes()!=content:changed.append(name)
frozen=['src/main.js','src/services/SaveService.js','src/race/RaceSimulation456.js','src/race/RaceWorld461.js','src/race/RaceView452.js','src/race/RaceOverview462.js','src/race/RaceWallet451.js','src/race/RaceRules462.js','src/race/RaceCourse459.js']
for name in frozen:assert original[name]==(root/name).read_bytes(),f'Unexpected regression change: {name}'
assert 'SAVE_SCHEMA_VERSION=84' in (root/'src/core/config.js').read_text()
files=[p for p in root.rglob('*') if p.is_file() and not any(part in ['node_modules','.git','__pycache__'] or part.startswith('.openai-download') for part in p.relative_to(root).parts)]
# Never add any testing-only old baseline file to the cumulative patch.
allowed_new=('assets/sugoroku463/','src/sugoroku/','src/Styles/build463-sugoroku.css','online-server/src/SugorokuCoordinator463.js','docs/build463/','tests/build463-sugoroku.test.mjs','tools/build463/','README_BUILD463.md','world-raid-offline463-')
new=[str(p.relative_to(root)) for p in files if str(p.relative_to(root)) not in original]
assert all(n.startswith(allowed_new) for n in new),[n for n in new if not n.startswith(allowed_new)]
for name in changed+new:
 if name.endswith(('.js','.mjs')):subprocess.run(['node','--check',str(root/name)],check=True,capture_output=True)
html=(root/'index.html').read_text();mapping=json.loads(re.search(r'<script type="importmap">([\s\S]*?)</script>',html).group(1))['imports'];assets=json.loads((root/'world-raid-offline463-assets.json').read_text())
for name in changed+new:
 if name.startswith('src/') and name.endswith('.js'):
  assert mapping.get('./'+name)=='./'+name+'?v=3.1.142-build463',name
  assert './'+name in assets,name
for name in ['cover.png','atlas.png','board.png']:assert './assets/sugoroku463/'+name in assets
assert 'world-raid-offline463-sw.js' in html and 'world-raid-offline463-sw.js' in (root/'src/worldRaid/WorldRaidOfflineCache430.js').read_text()
report={'baseline':basepath.name,'baselineSha256':sha(basepath.read_bytes()),'baselineFiles':len(original),'preservedFiles':len(original)-len(changed),'changedFiles':changed,'addedFiles':new,'frozenFiles':{n:sha(original[n]) for n in frozen},'checks':['all baseline files retained','only expected Build463 files added','frozen race/main/save/wallet files unchanged','syntax checks for changed and new JavaScript','new module versions mapped','new modules and art in offline list'],'limits':'Cumulative update; unchanged files not present in Build462 update remain prerequisites.'}
(root/'docs/build463/patch-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
files=[p for p in root.rglob('*') if p.is_file() and not any(part in ['node_modules','.git','__pycache__'] or part.startswith('.openai-download') for part in p.relative_to(root).parts)]
out=root.parent/'deliverables';out.mkdir(exist_ok=True);target=out/'ABYSS_Build463_integrated.zip'
with ZipFile(target,'w',ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(files):z.write(p,str(p.relative_to(root)))
with ZipFile(target) as z:assert z.testzip() is None;assert all(n in z.namelist() for n in original)
result={'path':str(target),'bytes':target.stat().st_size,'sha256':sha(target.read_bytes()),'files':len(files),'changed':len(changed),'added':len(new),'baseline':len(original)}
print(json.dumps(result))
