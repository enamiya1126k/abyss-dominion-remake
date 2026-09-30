"""Cumulative Build570 patch. Never include live server data."""
from pathlib import Path
import hashlib,json,subprocess,sys,zipfile
root=Path(__file__).resolve().parents[2]
files={x['path'] for x in json.loads((root/'BUILD569_MANIFEST.json').read_text())['files']}
files.update(['index.html', 'online-server/src/PartyCoordinator462.js', 'online-server/src/RaceCoordinator451.js', 'online-server/src/TetraCoordinator539.js', 'src/core/config.js', 'src/party/PartyView462.js', 'src/race/RaceClient451.js', 'src/tetra/Rules539.js', 'src/tetra/View539.js', 'src/worldRaid/WorldRaidOfflineCache430.js', 'tests/build563-wire.test.mjs', 'tools/build563/wire-fixture.mjs'])
files.update(str(p.relative_to(root)) for p in (root/'tools/build570').iterdir() if p.is_file())
files.update(str(p.relative_to(root)) for p in (root/'tests').glob('build570-*.test.mjs'))
files.update(['README_BUILD570.md','world-raid-offline569-assets.json','world-raid-offline569-sw.js'])
files.update(str(p.relative_to(root)) for p in (root/'docs/build570').iterdir() if p.suffix in ['.md','.json','.tap','.webp'])
for name in files:
 assert not name.startswith('online-server/data/'),name
 assert (root/name).is_file(),name
 if name.endswith(('.js','.mjs')):subprocess.run(['node','--check',str(root/name)],check=True,capture_output=True)
tap=(root/'docs/build570/tests.tap').read_text();assert '# tests 44\n' in tap and '# pass 44\n' in tap and '# fail 0\n' in tap
browser=json.loads((root/'docs/build570/chromium-browser.json').read_text());assert len(browser['sizes'])==2 and not browser['errors'] and not browser['failed']
manifest={'build':570,'version':'3.1.249','type':'cumulative-patch','baseBuilds':[563,564,565,566,567,568,569],'requiredServerRestart':True,'tests':{'node':44,'aiSeeds':20,'webSocketClients':4,'viewportCases':2,'nativeIPhone':False},'files':[{'path':p,'size':(root/p).stat().st_size,'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest()} for p in sorted(files)]}
(root/'BUILD570_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
out=Path(sys.argv[1]);out.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(files|{'BUILD570_MANIFEST.json'}):z.write(root/p,p)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for f in manifest['files']:assert hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256']
print(json.dumps({'path':str(out),'files':len(files)+1,'bytes':out.stat().st_size}))
