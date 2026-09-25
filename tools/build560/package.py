from pathlib import Path
import hashlib,json,zipfile,re,subprocess
root=Path(__file__).resolve().parents[2];base=root.parent/'baseline559';out=root.parent/'output/ABYSS_DOMINION_Build560_patch.zip'
changed=[]
for f in sorted(root.rglob('*')):
 if not f.is_file():continue
 rel=str(f.relative_to(root))
 if any(x in {'.git','node_modules','__pycache__'} for x in f.relative_to(root).parts) or rel.startswith('online-server/data/') or rel=='BUILD560_MANIFEST.json':continue
 if not (base/rel).exists() or f.read_bytes()!=(base/rel).read_bytes():changed.append(rel)
assert not any(x.startswith(('online-server/','assets/','src/hide/','src/cart/','src/ricochet550/','src/Styles/')) for x in changed)
for x in changed:
 if x.endswith(('.js','.mjs')):subprocess.run(['node','--check',str(root/x)],check=True,capture_output=True)
mapping=json.loads(re.search(r'<script type="importmap">(.*?)</script>',(root/'index.html').read_text(),re.S).group(1))['imports']
old=json.loads(re.search(r'<script type="importmap">(.*?)</script>',(base/'index.html').read_text(),re.S).group(1))['imports']
assert set(old).issubset(mapping)
for key in ['./src/core/AudioSystem.js','./src/core/AudioSystem.js?v=3.1.1-build311']:
 assert mapping[key]=='./src/core/AudioSystem.js?v=3.1.239-build560'
assets=json.loads((root/'world-raid-offline560-assets.json').read_text());assert './src/core/AudioSystem.js?v=3.1.239-build560' in assets
assert 'world-raid-offline560-sw.js' in (root/'index.html').read_text()
assert (root/'index.html').read_text().count('<link rel="stylesheet" href="./src/Styles/build559-hide.css')==1
assert 'APP_VERSION="3.1.239"' in (root/'src/core/config.js').read_text()
assert 'offline560' in (root/'src/worldRaid/WorldRaidOfflineCache430.js').read_text()
manifest={'build':560,'version':'3.1.239','baseBuild':559,'type':'patch','requiredServerRestart':False,'files':[{'path':n,'size':(root/n).stat().st_size,'sha256':hashlib.sha256((root/n).read_bytes()).hexdigest()} for n in changed]}
(root/'BUILD560_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for n in [*changed,'BUILD560_MANIFEST.json']:z.write(root/n,n)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for f in manifest['files']:assert hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256']
print(json.dumps({'file':str(out),'files':len(changed)+1,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}))
