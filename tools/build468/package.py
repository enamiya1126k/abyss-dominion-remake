from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import hashlib,json,re,subprocess
root=Path(__file__).resolve().parents[2];basepath=root.parent/'baseline467/ABYSS_Build467_integrated.zip'
with ZipFile(basepath) as base: original={n:base.read(n) for n in base.namelist() if not n.endswith('/')}
def sha(b):return hashlib.sha256(b).hexdigest()
changed=[]
for name,content in original.items():
 p=root/name
 assert p.is_file(),f'Missing baseline file: {name}'
 if p.read_bytes()!=content:changed.append(name)
allowed_changed={'index.html','src/core/config.js','src/worldRaid/WorldRaidOfflineCache430.js','src/sugoroku/View463.js','src/sugoroku/Presentation464.js','src/sugoroku/Catalog463.js','src/sugoroku/HandOrder466.js'}
assert set(changed)<=allowed_changed,changed
(root/'docs/build468/patch-manifest.json').touch(exist_ok=True)
def allfiles():return [p for p in root.rglob('*') if p.is_file() and not any(x in ['node_modules','.git','__pycache__'] or x.startswith('.openai-download') for x in p.relative_to(root).parts)]
files=allfiles();new=[str(p.relative_to(root)) for p in files if str(p.relative_to(root)) not in original]
allowed_new=('src/sugoroku/PhotoArt468.js','src/sugoroku/Series468.js','src/Styles/build468-sugoroku.css','assets/sugoroku468/','docs/build468/','tools/build468/','tests/build468-','README_BUILD468.md','world-raid-offline468-')
assert all(n.startswith(allowed_new) for n in new),[n for n in new if not n.startswith(allowed_new)]
for n in changed+new:
 if n.endswith(('.js','.mjs')):subprocess.run(['node','--check',str(root/n)],check=True,capture_output=True)
html=(root/'index.html').read_text();mapping=json.loads(re.search(r'<script type="importmap">([\s\S]*?)</script>',html).group(1))['imports'];assets=json.loads((root/'world-raid-offline468-assets.json').read_text())
for n in changed+new:
 if n.startswith('src/') and n.endswith('.js'):
  assert mapping.get('./'+n)=='./'+n+'?v=3.1.147-build468',n
  assert './'+n in assets,n
assert './src/Styles/build468-sugoroku.css' in assets
photos=json.loads((root/'docs/build468/photo-sources.json').read_text());assert len(photos)==43
for row in photos:
 assert sha((root/row['asset']).read_bytes())==row['sha256'],row['asset']
 assert './'+row['asset'] in assets,row['asset']
assert 'world-raid-offline468-sw.js' in html
assert 'world-raid-offline468-sw.js' in (root/'src/worldRaid/WorldRaidOfflineCache430.js').read_text()
assert 'SAVE_SCHEMA_VERSION=84' in (root/'src/core/config.js').read_text()
frozen=['src/main.js','src/services/SaveService.js','src/sugoroku/Engine463.js','src/sugoroku/Board463.js','src/race/RaceSimulation456.js','src/race/RaceWorld461.js','src/race/RaceView452.js','src/race/RaceOverview462.js','src/race/RaceWallet451.js','src/race/RaceRules462.js','src/race/RaceCourse459.js']
for n in frozen:assert original[n]==(root/n).read_bytes()
report={'baseline':basepath.name,'baselineSha256':sha(basepath.read_bytes()),'baselineFiles':len(original),'preservedFiles':len(original)-len(changed),'changedFiles':changed,'addedFiles':new,'frozenFiles':{n:sha(original[n]) for n in frozen},'checks':['all baseline files retained','only allowed changes and additions','engine, board, RPG, race, save unchanged','all 43 original photo hashes match','source syntax','import aliases and offline assets updated'],'limits':'Cumulative update requires unchanged base dependencies. Physical Safari and live production not verified.'}
(root/'docs/build468/patch-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
files=allfiles();out=root.parent/'deliverables';out.mkdir(exist_ok=True);target=out/'ABYSS_Build468_integrated.zip'
with ZipFile(target,'w',ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(files):z.write(p,str(p.relative_to(root)))
with ZipFile(target) as z:assert z.testzip() is None;assert all(n in z.namelist() for n in original)
print(json.dumps({'path':str(target),'bytes':target.stat().st_size,'sha256':sha(target.read_bytes()),'files':len(files),'changed':changed,'added':len(new)}))
