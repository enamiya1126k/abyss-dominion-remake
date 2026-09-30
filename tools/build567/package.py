"""Cumulative Build567 patch on top of the reviewed Build566 file manifest."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import zipfile
root=Path(__file__).resolve().parents[2]
previous=json.loads((root/'BUILD566_MANIFEST.json').read_text())
files={f['path'] for f in previous['files']}
changed=subprocess.check_output(['git','diff','--name-only','d4ad1402cb6966825e178e15b20de612455e039e'],cwd=root,text=True).splitlines()
files.update(f for f in changed if f=='index.html' or f.startswith(('src/','online-server/','tests/')))
files.update(['src/cabbage/Swipe567.js','src/cabbage/Scene567.js','src/cabbage/Debris567.js','src/Styles/build567-cabbage-swipe.css','README_BUILD567.md','world-raid-offline567-sw.js','world-raid-offline567-assets.json'])
for folder in ['tools/build567','docs/build567']:
 files.update(str(p.relative_to(root)) for p in (root/folder).iterdir() if p.is_file() and p.suffix!='.log' and not p.name.startswith('initial-'))
files.update(str(p.relative_to(root)) for p in (root/'tests').glob('build567-*.test.mjs'))
for name in files:
 assert (root/name).is_file(),name
 if name.endswith(('.js','.mjs')):subprocess.run(['node','--check',str(root/name)],check=True,capture_output=True)
 if name.endswith(('.js','.mjs','.md','.json','.py')):assert not re.search(r'/workspace/scratch/[0-9a-z]+/',(root/name).read_text()),name
for f,n in [('tests.tap',93),('legacy-tests.tap',81)]:
 tap=(root/'docs/build567'/f).read_text();assert f'# tests {n}\n' in tap and f'# pass {n}\n' in tap and '# fail 0\n' in tap
browser=json.loads((root/'docs/build567/chromium-browser.json').read_text());assert not browser['errors'] and not browser['failed'] and len(browser['sizes'])==3
manifest={'build':567,'version':'3.1.246','type':'cumulative-patch','baseBuilds':[563,564,565,566],
 'sourceMain':'72c63563787f2ab5b2e519e86551065da7830ff4','previousRemoteCommit':'aef69887bb84e89b573f960beb2b55336c7d331f','requiredServerRestart':True,
 'tests':{'node':174,'webSocketClients':4,'viewports':[[390,740],[320,568],[740,390]],'cpuSlowdown':4,'debrisLimit':40,'nativeIPhoneTested':False},
 'files':[{'path':name,'size':(root/name).stat().st_size,'sha256':hashlib.sha256((root/name).read_bytes()).hexdigest()} for name in sorted(files)]}
(root/'BUILD567_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
out=root.parent/'output/ABYSS_DOMINION_Build567_patch.zip';out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for name in [*sorted(files),'BUILD567_MANIFEST.json']:z.write(root/name,name)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for f in manifest['files']:assert hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256']
print(json.dumps({'file':str(out),'files':len(files)+1,'bytes':out.stat().st_size}))
