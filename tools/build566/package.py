"""Build a cumulative patch from the reviewed Build565 manifest plus Build566 changes."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import zipfile

root=Path(__file__).resolve().parents[2]
previous=json.loads((root/'BUILD565_MANIFEST.json').read_text())
files={f['path'] for f in previous['files']}
changed=subprocess.check_output(['git','diff','--name-only','ab84a60f308a47f8066cd836ac7337132956781c'],cwd=root,text=True).splitlines()
files.update(f for f in changed if f=='index.html' or f.startswith(('src/','online-server/')))
for folder in ['src/crane566','assets/crane566','tools/build566','docs/build566']:
 files.update(str(p.relative_to(root)) for p in (root/folder).iterdir() if p.is_file() and p.suffix!='.log' and not p.name.startswith('initial-'))
files.update(['README_BUILD566.md','online-server/src/CraneCoordinator566.js','src/Styles/build566-crane.css','world-raid-offline566-sw.js','world-raid-offline566-assets.json'])
files.update(str(p.relative_to(root)) for p in (root/'tests').glob('build566-*.test.mjs'))
files.add('tests/build557-cart-regression.test.mjs')
for name in files:
 assert (root/name).is_file(),name
 if name.endswith(('.js','.mjs')):subprocess.run(['node','--check',str(root/name)],check=True,capture_output=True)
 if name.endswith(('.js','.mjs','.md','.json','.py')):assert not re.search(r'/workspace/scratch/[0-9a-z]+/',(root/name).read_text()),name
tap=(root/'docs/build566/tests.tap').read_text()
assert '# tests 79\n' in tap and '# pass 79\n' in tap and '# fail 0\n' in tap
browser=json.loads((root/'docs/build566/chromium-browser.json').read_text())
assert not browser['errors'] and not browser['failed'] and len(browser['sizes'])==12
manifest={'build':566,'version':'3.1.245','type':'cumulative-patch','baseBuilds':[563,564,565],
 'sourceMain':'72c63563787f2ab5b2e519e86551065da7830ff4','previousRemoteCommit':'54ac0c64c09cb96f6808df334128ee7372a6928c','requiredServerRestart':True,
 'tests':{'node':79,'craneAIMatches':64,'craneSteals':2496,'craneMimicBites':445,'webSocketClients':4,'viewports':[[390,740],[320,568],[740,390]],'allFourSeats':True,'nativeIPhoneTested':False},
 'files':[{'path':name,'size':(root/name).stat().st_size,'sha256':hashlib.sha256((root/name).read_bytes()).hexdigest()} for name in sorted(files)]}
(root/'BUILD566_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
out=root.parent/'output/ABYSS_DOMINION_Build566_patch.zip';out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for name in [*sorted(files),'BUILD566_MANIFEST.json']:z.write(root/name,name)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for f in manifest['files']:assert hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256']
print(json.dumps({'file':str(out),'files':len(files)+1,'bytes':out.stat().st_size}))
