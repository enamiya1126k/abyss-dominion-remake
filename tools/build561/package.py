from pathlib import Path
import hashlib,json,zipfile,re,subprocess
root=Path(__file__).resolve().parents[2];base=root.parent/'baseline560';out=root.parent/'output/ABYSS_DOMINION_Build561_patch.zip'
changed=[]
for f in sorted(root.rglob('*')):
 if not f.is_file():continue
 rel=str(f.relative_to(root))
 if any(x in {'.git','node_modules','__pycache__'} for x in f.relative_to(root).parts) or rel.startswith('online-server/data/') or rel=='BUILD561_MANIFEST.json':continue
 if not (base/rel).exists() or f.read_bytes()!=(base/rel).read_bytes():changed.append(rel)
assert not any(x.startswith(('online-server/','assets/','src/hide/','src/cart/','src/ricochet550/','src/Styles/')) for x in changed)
for x in changed:
 if x.endswith(('.js','.mjs')):subprocess.run(['node','--check',str(root/x)],check=True,capture_output=True)
html=(root/'index.html').read_text()
mapping=json.loads(re.search(r'<script type="importmap">(.*?)</script>',html,re.S).group(1))['imports']
old=json.loads(re.search(r'<script type="importmap">(.*?)</script>',(base/'index.html').read_text(),re.S).group(1))['imports']
assert set(old).issubset(mapping)
modules=[x for x in changed if x.startswith('src/') and x.endswith('.js')]
for path in modules:
 canonical='./'+path;target=canonical+'?v=3.1.240-build561'
 assert mapping[canonical]==target
 for key,value in mapping.items():
  if key.split('?')[0]==canonical:assert value==target
for key in ['./src/core/AudioSystem.js?v=3.1.1-build311','./src/ui/screens/SettingsScreen.js?v=3.1.87-build407']:
 assert mapping[key]==key.split('?')[0]+'?v=3.1.240-build561'
assets=json.loads((root/'world-raid-offline561-assets.json').read_text())
for path in modules:assert './'+path+'?v=3.1.240-build561' in assets
assert 'register("./world-raid-offline561-sw.js"' in html
assert 'endsWith("/world-raid-offline561-sw.js")' in html
assert 'const ASSET_VERSION = "3.1.240"' in html
assert 'const ASSET_BUILD = "build561"' in html
assert re.findall(r'<link[^>]+rel="stylesheet"[^>]*>',html)==re.findall(r'<link[^>]+rel="stylesheet"[^>]*>',(base/'index.html').read_text())
assert 'APP_VERSION="3.1.240"' in (root/'src/core/config.js').read_text()
assert 'offline561' in (root/'src/worldRaid/WorldRaidOfflineCache430.js').read_text()
assert (root/'src/core/AudioSystem.js').read_text().split(' sfx(kind=')[1]==(base/'src/core/AudioSystem.js').read_text().split(' sfx(kind=')[1]
report=json.loads((root/'docs/build561/browser.json').read_text());assert len(report['tracks'])==7
assert report['before']['coldRange']['error']=='TypeError'
assert report['before']['media']['time']==0
assert report['after']['coldRange']['status']==206
assert report['after']['networkErrorRecovery'] and report['after']['offlineModuleCache']
manifest={'build':561,'version':'3.1.240','baseBuild':560,'type':'patch','requiredServerRestart':False,'files':[{'path':n,'size':(root/n).stat().st_size,'sha256':hashlib.sha256((root/n).read_bytes()).hexdigest()} for n in changed]}
(root/'BUILD561_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for n in [*changed,'BUILD561_MANIFEST.json']:z.write(root/n,n)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for f in manifest['files']:assert hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256']
print(json.dumps({'file':str(out),'files':len(changed)+1,'paths':changed,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}))
