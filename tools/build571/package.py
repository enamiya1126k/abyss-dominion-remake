"""Cumulative Build571 patch. Never include live server data."""
from pathlib import Path
import hashlib,json,subprocess,sys,zipfile
root=Path(__file__).resolve().parents[2]
files={x['path'] for x in json.loads((root/'BUILD570_MANIFEST.json').read_text())['files']}
files.update(subprocess.check_output(['git','diff','--name-only','HEAD'],cwd=root,text=True).splitlines())
for folder in ['tools/build571','assets/luck571','docs/build571']:
 files.update(str(p.relative_to(root)) for p in (root/folder).iterdir() if p.is_file() and p.suffix not in ['.png'])
files.update(str(p.relative_to(root)) for p in (root/'tests').glob('build571-*.test.mjs'))
files.update(['README_BUILD571.md','src/luck/Buffs571.js','src/luck/Items571.js','src/luck/Presentation571.js','src/Styles/build571-luck.css','world-raid-offline570-assets.json','world-raid-offline570-sw.js','world-raid-offline571-assets.json','world-raid-offline571-sw.js'])
files.discard('BUILD571_MANIFEST.json')
for name in files:
 assert not name.startswith('online-server/data/'),name
 assert (root/name).is_file(),name
 if name.endswith(('.js','.mjs')):subprocess.run(['node','--check',str(root/name)],check=True,capture_output=True)
tap=(root/'docs/build571/tests.tap').read_text();assert '# tests 148\n' in tap and '# pass 148\n' in tap and '# fail 0\n' in tap
browser=json.loads((root/'docs/build571/chromium-browser.json').read_text());assert len(browser['sizes'])==2 and not browser['errors'] and not browser['failed']
manifest={'build':571,'version':'3.1.250','type':'cumulative-patch','baseBuilds':[563,564,565,566,567,568,569,570],'requiredServerRestart':True,'tests':{'node':148,'aiSeeds':20,'webSocketClients':4,'viewportCases':2,'nativeIPhone':False},'files':[{'path':p,'size':(root/p).stat().st_size,'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest()} for p in sorted(files)]}
(root/'BUILD571_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
out=Path(sys.argv[1]);out.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(files|{'BUILD571_MANIFEST.json'}):z.write(root/p,p)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for f in manifest['files']:assert hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256']
print(json.dumps({'path':str(out),'files':len(files)+1,'bytes':out.stat().st_size}))
