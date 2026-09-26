from pathlib import Path
import hashlib,json,zipfile,re,subprocess
root=Path(__file__).resolve().parents[2];base=root.parent/'baseline561';out=root.parent/'output/ABYSS_DOMINION_Build562_patch.zip'
runtime={'index.html','src/core/config.js','src/worldRaid/WorldRaidOfflineCache430.js','world-raid-offline562-sw.js','world-raid-offline562-assets.json','src/luck/Rules509.js','src/luck/Items509.js','src/luck/Rules511.js','src/luck/Items511.js','src/luck/Descriptions562.js','src/luck/Equipment562.js','src/luck/View511.js','src/luck/Presentation511.js','src/party/PartyGames462.js','src/race/RaceClient451.js','online-server/src/PartyCoordinator462.js','online-server/src/LuckCoordinator511.js'}
# Runtime files from the previous BGM hotfix are unchanged, allowing upgrades from560 too.
audio={'src/core/AudioRecovery561.js','src/core/AudioSystem.js','src/ui/screens/SettingsScreen.js'}
for n in audio:assert (root/n).read_bytes()==(base/n).read_bytes()
changed=[]
for f in sorted(root.rglob('*')):
 if not f.is_file():continue
 rel=str(f.relative_to(root))
 if any(x in {'.git','node_modules','__pycache__'} for x in f.relative_to(root).parts) or rel.startswith('online-server/data/') or rel=='BUILD562_MANIFEST.json':continue
 if not (base/rel).exists() or f.read_bytes()!=(base/rel).read_bytes():
  assert rel in runtime or rel=='README_BUILD562.md' or rel.startswith(('docs/build562/','tools/build562/','tests/build562-')),rel
  changed.append(rel)
assert runtime.issubset(changed)
files=sorted(set(changed)|audio)
for n in files:
 if n.endswith(('.js','.mjs')):subprocess.run(['node','--check',str(root/n)],check=True,capture_output=True)
html=(root/'index.html').read_text();oldhtml=(base/'index.html').read_text()
mapping=json.loads(re.search(r'<script type="importmap">(.*?)</script>',html,re.S).group(1))['imports']
old=json.loads(re.search(r'<script type="importmap">(.*?)</script>',oldhtml,re.S).group(1))['imports']
assert set(old).issubset(mapping)
modules=[x for x in runtime if x.startswith('src/') and x.endswith('.js')]
assets=json.loads((root/'world-raid-offline562-assets.json').read_text())
for n in modules:
 canonical='./'+n;target=canonical+'?v=3.1.241-build562';assert mapping[canonical]==target
 for k,v in mapping.items():
  if k.split('?')[0]==canonical:assert v==target
 assert target in assets
for k,v in old.items():
 if v.split('?')[0] not in {'./'+n for n in modules}:assert mapping[k]==v
assert (root/'world-raid-offline562-sw.js').read_text()==(base/'world-raid-offline561-sw.js').read_text().replace('build561','build562')
assert 'register("./world-raid-offline562-sw.js"' in html
assert 'endsWith("/world-raid-offline562-sw.js")' in html
assert 'const ASSET_VERSION = "3.1.241"' in html and 'const ASSET_BUILD = "build562"' in html
assert 'APP_VERSION="3.1.241"' in (root/'src/core/config.js').read_text()
assert 'offline562' in (root/'src/worldRaid/WorldRaidOfflineCache430.js').read_text()
assert re.findall(r'<link[^>]+rel="stylesheet"[^>]*>',html)==re.findall(r'<link[^>]+rel="stylesheet"[^>]*>',oldhtml)
report=json.loads((root/'docs/build562/browser.json').read_text());assert not report['errors'] and not report['failedResources'];assert len(report['sizes'])==2
tap=(root/'docs/build562/tests.tap').read_text();assert 'tests 113' in tap and 'pass 113' in tap and 'fail 0' in tap
repro=json.loads((root/'docs/build562/reproduction.json').read_text());assert all(v['after']==v['expected'] and v['before']!=v['expected'] for v in repro.values())
manifest={'build':562,'version':'3.1.241','baseBuilds':[560,561],'type':'patch','requiredServerRestart':True,'includesBgmFix561':True,'sourceCommit':'e337da23473b732b9dac667dcb75fb7235e86bba','tests':{'node':113,'diceConditions':6048,'mobileWidths':[390,320]},'files':[{'path':n,'size':(root/n).stat().st_size,'sha256':hashlib.sha256((root/n).read_bytes()).hexdigest()} for n in files]}
(root/'BUILD562_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for n in [*files,'BUILD562_MANIFEST.json']:z.write(root/n,n)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for f in manifest['files']:assert hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256']
print(json.dumps({'file':str(out),'files':len(files)+1,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}))
